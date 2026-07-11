/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { RoomStatus, BookingStatus, PaymentStatus, BookingSource, Booking, Room, Guest, Payment, Notification, UploadedDocument } from "./src/types";
import { INITIAL_ROOMS, INITIAL_ROOM_TYPES, INITIAL_GUESTS, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS } from "./src/data/initialData";
import { ROOM_TYPES as HOTEL_ROOM_TYPES } from "./src/config/hotel";
import { messageLogs, setMessageLogs, sendNotificationEvents } from "./src/services/notificationService";
import { sendBookingConfirmation as sendWhatsAppBookingConfirmation } from "./src/services/whatsappService";
import { HOTEL } from "./src/config/hotel/hotel";
import { ActivityLogService } from "./server/services/ActivityLogService";
import { GuestService } from "./server/services/GuestService";
import { RoomService } from "./server/services/RoomService";
import { BookingService } from "./server/services/BookingService";
import { PaymentService } from "./server/services/PaymentService";

// --- [Prisma Migration - Booking Creation Only] ---
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// --- [/Prisma Migration - Booking Creation Only] ---



const PORT = Number(process.env.PORT) || 3000;
const STORE_FILE = path.join(process.cwd(), "pms_store.json");

// Startup logging (production hardening)
console.log("===============================");
console.log("PMS STARTUP");
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`STORE_FILE: ${STORE_FILE}`);
console.log(`STORE EXISTS: ${fs.existsSync(STORE_FILE)}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "Present" : "Missing"}`);
try {
  console.log(`RAILWAY_PUBLIC_DOMAIN: ${process.env.PUBLIC_DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || "Missing"}`);
} catch {
  // ignore
}
console.log("===============================");


// Dynamic state structures
let rooms: Room[] = [...INITIAL_ROOMS];
let guests: Guest[] = [...INITIAL_GUESTS];
let bookings: Booking[] = [...INITIAL_BOOKINGS];
let payments: Payment[] = [...INITIAL_PAYMENTS];
let notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
let documents: UploadedDocument[] = [];
let activityLogs: any[] = [];


// Guest services, tourism concierge and smart feedback collections
let serviceRequests: any[] = [];

let tourismInquiries: any[] = [];

let feedbacks: any[] = [];


// Load state from file if exists
function reconcileSettlementPayments() {
  let modified = false;
  bookings.forEach(booking => {
    // 1. Reconcile Checkout Settlement Payments
    if ((booking.status === "Closed" || booking.status === "Paid" || booking.paymentStatus === "Paid") && booking.status !== "Cancelled") {
      // Calculate how much was paid WITHOUT including any auto-generated reconciliation/refund payments
      const alreadyPaidWithoutRC = payments
        .filter(p => p.bookingId === booking.id && p.status === PaymentStatus.PAID && !p.id.startsWith("PAY-RC-") && !p.id.startsWith("PAY-REF-"))
        .reduce((sum, p) => sum + p.amount, 0);

      const outstanding = booking.totalPrice - alreadyPaidWithoutRC;

      // Check if we have an existing PAY-RC checkout settlement payment for this booking
      const rcPaymentIdx = payments.findIndex(p => p.bookingId === booking.id && p.id.startsWith("PAY-RC-") && !p.id.includes("-REF-") && !p.id.includes("-MISSING-"));
      
      if (outstanding > 0) {
        const amt = outstanding;
        const ref = booking.closedBillDetails?.refNumber || `pay_settle_${booking.id}`;
        const method = booking.closedBillDetails?.paymentMethod || "UPI";
        const closedAt = booking.closedBillDetails?.closedAt || booking.checkedOutAt || new Date().toISOString();

        if (rcPaymentIdx !== -1) {
          if (payments[rcPaymentIdx].amount !== amt) {
            payments[rcPaymentIdx].amount = amt;
            console.log(`Updated existing reconciled payment for ${booking.id} to correct outstanding: ₹${amt}`);
            modified = true;
          }
        } else {
          const paymentId = `PAY-RC-${Date.now().toString().slice(-4)}-${booking.id.replace("BK-", "")}`;
          const newPayment: Payment = {
            id: paymentId,
            bookingId: booking.id,
            amount: amt,
            method: method,
            status: PaymentStatus.PAID,
            transactionId: ref,
            createdAt: closedAt,
            notes: `Checkout Settlement Revenue: Settle and Close Folio ${booking.id}`
          };
          payments.push(newPayment);
          console.log(`Reconciled missing checkout payment for ${booking.id}: ₹${amt} via ${method}`);
          modified = true;
        }
      } else {
        // Outstanding <= 0. No positive settlement payment is needed.
        // If there's an existing PAY-RC payment, remove it because no positive settlement payment should exist!
        if (rcPaymentIdx !== -1) {
          console.log(`Removed redundant settlement payment ${payments[rcPaymentIdx].id} for ${booking.id} (Outstanding: ${outstanding})`);
          payments.splice(rcPaymentIdx, 1);
          modified = true;
        }

        // If outstanding is negative, record credit/refund if one doesn't exist yet
        if (outstanding < 0) {
          const creditRefundAmt = Math.abs(outstanding);
          const hasRefundPayment = payments.some(p => p.bookingId === booking.id && (p.amount < 0 || p.method === "Refund" || p.id.startsWith("PAY-REF-")));
          if (!hasRefundPayment) {
            const paymentId = `PAY-REF-${Date.now().toString().slice(-4)}-${booking.id.replace("BK-", "")}`;
            const newPayment: Payment = {
              id: paymentId,
              bookingId: booking.id,
              amount: -creditRefundAmt,
              method: "Refund",
              status: PaymentStatus.PAID,
              transactionId: `ref_${booking.id}`,
              createdAt: booking.closedBillDetails?.closedAt || booking.checkedOutAt || new Date().toISOString(),
              notes: `Credit Balance Refund for Folio ${booking.id}`
            };
            payments.push(newPayment);
            console.log(`Recorded credit refund of ₹${creditRefundAmt} for booking ${booking.id}`);
            modified = true;
          }
        }
      }

      // Reconcile missing payments for bookings marked Paid but having absolutely 0 payments
      const totalPaidIncludingAll = payments
        .filter(p => p.bookingId === booking.id && p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaidIncludingAll === 0 && booking.totalPrice > 0) {
        const paymentId = `PAY-RC-MISSING-${booking.id.replace("BK-", "")}`;
        const newPayment: Payment = {
          id: paymentId,
          bookingId: booking.id,
          amount: booking.totalPrice,
          method: booking.closedBillDetails?.paymentMethod || "Cash",
          status: PaymentStatus.PAID,
          transactionId: booking.closedBillDetails?.refNumber || `pay_missing_${booking.id}`,
          createdAt: booking.closedBillDetails?.closedAt || booking.checkedInAt || booking.createdAt || new Date().toISOString(),
          notes: `Reconciled Missing Payment record for Paid Folio ${booking.id}`
        };
        payments.push(newPayment);
        console.log(`Reconciled missing payment of ₹${booking.totalPrice} for paid booking ${booking.id}`);
        modified = true;
      }
    }

    // 2. Reconcile Transport Service Payments
    if (booking.transport?.cost !== undefined && booking.transport.cost > 0 && booking.transport.vehicleType && booking.status !== "Cancelled") {
      const amt = Number(booking.transport.cost);
      const vehicle = booking.transport.vehicleType;
      const tDate = booking.checkedInAt || booking.createdAt || new Date().toISOString();

      const hasTransportPayment = payments.some(p => 
        p.bookingId === booking.id && 
        p.amount === amt && 
        p.notes?.toLowerCase().includes("transport")
      );

      if (!hasTransportPayment) {
        const paymentId = `PAY-TR-${Date.now().toString().slice(-4)}-${booking.id.replace("BK-", "")}`;
        const newPayment: Payment = {
          id: paymentId,
          bookingId: booking.id,
          amount: amt,
          method: "Cash",
          status: PaymentStatus.PAID,
          transactionId: `pay_tr_${booking.id}`,
          createdAt: tDate,
          notes: `Transport Service Revenue: Linked ${vehicle} pickup/drop logistics`
        };
        payments.push(newPayment);
        console.log(`Reconciled missing transport payment for ${booking.id}: ₹${amt}`);
        modified = true;
      }
    }
  });

  if (modified) {
    saveState();
  }
}

function loadState() {
  // Ensure in-memory arrays are always initialized even if store is missing/malformed.
  rooms = Array.isArray(rooms) ? rooms : [];
  guests = Array.isArray(guests) ? guests : [];
  bookings = Array.isArray(bookings) ? bookings : [];
  payments = Array.isArray(payments) ? payments : [];
  notifications = Array.isArray(notifications) ? notifications : [];
  documents = Array.isArray(documents) ? documents : [];
  activityLogs = Array.isArray(activityLogs) ? activityLogs : [];
  serviceRequests = Array.isArray(serviceRequests) ? serviceRequests : [];
  tourismInquiries = Array.isArray(tourismInquiries) ? tourismInquiries : [];
  feedbacks = Array.isArray(feedbacks) ? feedbacks : [];

  try {
    if (!fs.existsSync(STORE_FILE)) {
      console.log("PMS store file not found; starting with defaults.");
      return;
    }

    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);

    rooms = Array.isArray(parsed.rooms) ? parsed.rooms : rooms;
    guests = Array.isArray(parsed.guests) ? parsed.guests : guests;
    bookings = Array.isArray(parsed.bookings) ? parsed.bookings : bookings;
    payments = Array.isArray(parsed.payments) ? parsed.payments : payments;
    notifications = Array.isArray(parsed.notifications) ? parsed.notifications : notifications;
    documents = Array.isArray(parsed.documents) ? parsed.documents : documents;
    activityLogs = Array.isArray(parsed.activityLogs) ? parsed.activityLogs : activityLogs;
    serviceRequests = Array.isArray(parsed.serviceRequests) ? parsed.serviceRequests : serviceRequests;
    tourismInquiries = Array.isArray(parsed.tourismInquiries) ? parsed.tourismInquiries : tourismInquiries;
    feedbacks = Array.isArray(parsed.feedbacks) ? parsed.feedbacks : feedbacks;

    if (parsed.messageLogs !== undefined) {
      if (Array.isArray(parsed.messageLogs)) {
        setMessageLogs(parsed.messageLogs);
      } else {
        setMessageLogs([]);
      }
    } else {
      setMessageLogs([]);
    }

    // Self-heal/reconcile payments
    if (!Array.isArray(bookings)) bookings = [];
    if (!Array.isArray(payments)) payments = [];
    reconcileSettlementPayments();

    console.log("Loaded existing PMS state from store.");
  } catch (error) {
    console.error("Failed to load state, starting with defaults:", error);
    setMessageLogs([]);
    // Keep defaults in-memory arrays
  }
}


// Save state to file
function saveState() {
  try {
    const data = { 
      rooms, 
      guests, 
      bookings, 
      payments, 
      notifications, 
      documents, 
      messageLogs, 
      activityLogs,
      serviceRequests,
      tourismInquiries,
      feedbacks
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

loadState();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Routes
  
  // Get all state
  app.get("/api/pms/state", (req, res) => {
    try {
      // Ensure arrays are safe inside handler (store may be partially missing)
      if (!Array.isArray(serviceRequests)) serviceRequests = [];
      if (!Array.isArray(tourismInquiries)) tourismInquiries = [];
      if (!Array.isArray(feedbacks)) feedbacks = [];
      if (!Array.isArray(messageLogs)) setMessageLogs([]);
      if (!Array.isArray(rooms)) rooms = [];
      if (!Array.isArray(guests)) guests = [];
      if (!Array.isArray(bookings)) bookings = [];
      if (!Array.isArray(payments)) payments = [];
      if (!Array.isArray(notifications)) notifications = [];
      if (!Array.isArray(documents)) documents = [];
      if (!Array.isArray(activityLogs)) activityLogs = [];

      // Map categories and priorities if missing
      (Array.isArray(serviceRequests) ? serviceRequests : []).forEach(r => {
        if (!r.category) {
          const typeLower = (r.requestType || "").toLowerCase();

        const commentsLower = (r.comments || "").toLowerCase();
        
        if (typeLower.includes("water") || typeLower.includes("towel") || typeLower.includes("housekeeping") || typeLower.includes("linen") || typeLower.includes("cleaning") || commentsLower.includes("cleaning") || commentsLower.includes("towel")) {
          r.category = "Housekeeping";
        } else if (typeLower.includes("laundry") || typeLower.includes("garment") || typeLower.includes("ironing") || commentsLower.includes("laundry") || commentsLower.includes("iron")) {
          r.category = "Laundry";
        } else if (typeLower.includes("maintenance") || typeLower.includes("ac ") || typeLower.includes("air conditioning") || typeLower.includes("wifi") || typeLower.includes("leak") || typeLower.includes("hot water") || commentsLower.includes("ac ") || commentsLower.includes("leak") || commentsLower.includes("wifi")) {
          r.category = "Maintenance";
        } else if (typeLower.includes("taxi") || typeLower.includes("airport") || typeLower.includes("railway") || typeLower.includes("pickup") || typeLower.includes("shuttle") || typeLower.includes("transport") || commentsLower.includes("pickup") || commentsLower.includes("taxi")) {
          r.category = "Transport";
        } else if (typeLower.includes("early check-in") || typeLower.includes("early checkin") || commentsLower.includes("early check-in") || commentsLower.includes("early checkin")) {
          r.category = "Early Check-In";
        } else if (typeLower.includes("late check-out") || typeLower.includes("late checkout") || commentsLower.includes("late check-out") || commentsLower.includes("late checkout")) {
          r.category = "Late Check-Out";
        } else if (typeLower.includes("wake-up") || typeLower.includes("wakeup") || commentsLower.includes("wake-up") || commentsLower.includes("wakeup")) {
          r.category = "Wake-Up Call";
        } else if (typeLower.includes("food") || typeLower.includes("beverage") || typeLower.includes("dining") || typeLower.includes("thali") || typeLower.includes("fish") || typeLower.includes("crab") || typeLower.includes("sweet") || typeLower.includes("order") || typeLower.includes("restaurant") || typeLower.includes("meal") || commentsLower.includes("order") || commentsLower.includes("restaurant") || commentsLower.includes("thali") || commentsLower.includes("food")) {
          r.category = "Food & Beverage";
        } else if (typeLower.includes("guide") || typeLower.includes("visit") || typeLower.includes("temple") || typeLower.includes("tour") || typeLower.includes("konark") || typeLower.includes("lake") || typeLower.includes("sightseeing") || typeLower.includes("beach") || typeLower.includes("excursion") || typeLower.includes("pandas") || commentsLower.includes("tour") || commentsLower.includes("temple")) {
          r.category = "Concierge";
        } else {
          r.category = "Custom Guest Requests";
        }
      }
      if (!r.priority) {
        if (r.category === "Maintenance" || r.category === "Late Check-Out" || r.category === "Early Check-In") {
          r.priority = "High";
        } else if (r.category === "Wake-Up Call") {
          r.priority = "Urgent";
        } else if (r.category === "Food & Beverage" || r.category === "Housekeeping" || r.category === "Transport") {
          r.priority = "Medium";
        } else {
          r.priority = "Low";
        }
      }
      if (!r.assignedStaff) {
        r.assignedStaff = "Unassigned";
      }
      if (!r.createdTime) {
        r.createdTime = r.timestamp;
      }
    });

    res.json({
      success: true,
      rooms: rooms ?? [],
roomTypes: (HOTEL_ROOM_TYPES ?? []).map((rt) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        basePrice: rt.baseRateINR,
        maxGuests: rt.occupancy.max,
        amenities: [] as string[],
        imageUrl: "",
      })),
      guests: guests ?? [],
      bookings: bookings ?? [],
      payments: payments ?? [],
      notifications: notifications ?? [],
      documents: documents ?? [],
      messageLogs: messageLogs ?? [],
      activityLogs: activityLogs ?? [],
      serviceRequests: serviceRequests ?? [],
      tourismInquiries: tourismInquiries ?? [],
      feedbacks: feedbacks ?? []
    });
  } catch (err) {
    console.error("========== API ERROR ==========");
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : ""
    });
  }
});



  // Create Guest Service Request
  app.post("/api/pms/service-requests", (req, res) => {
    const { bookingId, guestName, roomId, requestType, comments } = req.body;
    
    if (!requestType) {
      return res.status(400).json({ error: "requestType is mandatory" });
    }

    // Auto map requestType to category
    let category = req.body.category;
    if (!category) {
      const typeLower = (requestType || "").toLowerCase();
      const commentsLower = (comments || "").toLowerCase();
      
      if (typeLower.includes("water") || typeLower.includes("towel") || typeLower.includes("housekeeping") || typeLower.includes("linen") || typeLower.includes("cleaning") || commentsLower.includes("cleaning") || commentsLower.includes("towel")) {
        category = "Housekeeping";
      } else if (typeLower.includes("laundry") || typeLower.includes("garment") || typeLower.includes("ironing") || commentsLower.includes("laundry") || commentsLower.includes("iron")) {
        category = "Laundry";
      } else if (typeLower.includes("maintenance") || typeLower.includes("ac ") || typeLower.includes("air conditioning") || typeLower.includes("wifi") || typeLower.includes("leak") || typeLower.includes("hot water") || commentsLower.includes("ac ") || commentsLower.includes("leak") || commentsLower.includes("wifi")) {
        category = "Maintenance";
      } else if (typeLower.includes("taxi") || typeLower.includes("airport") || typeLower.includes("railway") || typeLower.includes("pickup") || typeLower.includes("shuttle") || typeLower.includes("transport") || commentsLower.includes("pickup") || commentsLower.includes("taxi")) {
        category = "Transport";
      } else if (typeLower.includes("early check-in") || typeLower.includes("early checkin") || commentsLower.includes("early check-in") || commentsLower.includes("early checkin")) {
        category = "Early Check-In";
      } else if (typeLower.includes("late check-out") || typeLower.includes("late checkout") || commentsLower.includes("late check-out") || commentsLower.includes("late checkout")) {
        category = "Late Check-Out";
      } else if (typeLower.includes("wake-up") || typeLower.includes("wakeup") || commentsLower.includes("wake-up") || commentsLower.includes("wakeup")) {
        category = "Wake-Up Call";
      } else if (typeLower.includes("food") || typeLower.includes("beverage") || typeLower.includes("dining") || typeLower.includes("thali") || typeLower.includes("fish") || typeLower.includes("crab") || typeLower.includes("sweet") || typeLower.includes("order") || typeLower.includes("restaurant") || typeLower.includes("meal") || commentsLower.includes("order") || commentsLower.includes("restaurant") || commentsLower.includes("thali") || commentsLower.includes("food")) {
        category = "Food & Beverage";
      } else if (typeLower.includes("guide") || typeLower.includes("visit") || typeLower.includes("temple") || typeLower.includes("tour") || typeLower.includes("konark") || typeLower.includes("lake") || typeLower.includes("sightseeing") || typeLower.includes("beach") || typeLower.includes("excursion") || typeLower.includes("pandas") || commentsLower.includes("tour") || commentsLower.includes("temple")) {
        category = "Concierge";
      } else {
        category = "Custom Guest Requests";
      }
    }

    // Set priority based on category or requestType
    let priority = req.body.priority;
    if (!priority) {
      if (category === "Maintenance" || category === "Late Check-Out" || category === "Early Check-In") {
        priority = "High";
      } else if (category === "Wake-Up Call") {
        priority = "Urgent";
      } else if (category === "Food & Beverage" || category === "Housekeeping" || category === "Transport") {
        priority = "Medium";
      } else {
        priority = "Low";
      }
    }

    // SLA Timer text (in minutes)
    let slaTimer = req.body.slaTimer;
    if (!slaTimer) {
      if (category === "Wake-Up Call") slaTimer = "5 Mins";
      else if (category === "Early Check-In") slaTimer = "10 Mins";
      else if (category === "Housekeeping") slaTimer = "15 Mins";
      else if (category === "Late Check-Out") slaTimer = "15 Mins";
      else if (category === "Transport") slaTimer = "15 Mins";
      else if (category === "Maintenance") slaTimer = "15 Mins";
      else if (category === "Food & Beverage") slaTimer = "20 Mins";
      else if (category === "Concierge") slaTimer = "30 Mins";
      else if (category === "Custom Guest Requests") slaTimer = "30 Mins";
      else if (category === "Laundry") slaTimer = "120 Mins";
    }

    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      bookingId: bookingId || "Walk-In",
      guestName: guestName || "Guest",
      roomId: roomId || "N/A",
      requestType,
      category,
      priority,
      status: req.body.status || "Pending",
      timestamp: new Date().toISOString(),
      createdTime: new Date().toISOString(),
      slaTimer,
      assignedStaff: req.body.assignedStaff || "Unassigned",
      description: comments || "",
      comments: comments || ""
    };

    serviceRequests.unshift(newRequest);

    // Auto create an activity log entry
    ActivityLogService.log(activityLogs, {
      action: "Service Request Created",
      user: guestName || "Guest Portal",
      details: `New request logged for Room ${roomId || "N/A"}: ${requestType}. Comments: ${comments || "None"}`,
      icon: "service"
    });

    saveState();
    res.json({ success: true, serviceRequest: newRequest });
  });

  // Update Guest Service Request Status
  app.put("/api/pms/service-requests/:id", (req, res) => {
    const { status, operatorName, assignedStaff, priority, category, comments, description } = req.body;
    const request = serviceRequests.find(r => r.id === req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (status !== undefined) {
      request.status = status;
      if (status === "Completed") {
        request.completionTime = new Date().toISOString();
      }
    }
    if (assignedStaff !== undefined) request.assignedStaff = assignedStaff;
    if (priority !== undefined) request.priority = priority;
    if (category !== undefined) request.category = category;
    if (comments !== undefined) request.comments = comments;
    if (description !== undefined) request.description = description;

    // Log the update
    ActivityLogService.log(activityLogs, {
      action: "Service Request Updated",
      user: operatorName || "Front Desk",
      details: `Service request ${request.id} (${request.requestType}) status updated to ${request.status || "Updated"}. Assigned: ${request.assignedStaff || "N/A"}`,
      icon: "service"
    });

    saveState();
    res.json({ success: true, serviceRequest: request });
  });

  // Create Puri Tourism Concierge Inquiry
  app.post("/api/pms/tourism-inquiries", (req, res) => {
    const { guestId, guestName, tourType, notes, date } = req.body;

    if (!tourType) {
      return res.status(400).json({ error: "tourType is mandatory" });
    }

    const newInquiry = {
      id: `TOU-${Date.now().toString().slice(-4)}`,
      guestId: guestId || "Walk-In",
      guestName: guestName || "Puri Explorer",
      tourType,
      status: "Requested",
      timestamp: new Date().toISOString(),
      notes: notes || "",
      date: date || new Date().toISOString().split('T')[0]
    };

    tourismInquiries.unshift(newInquiry);

    // Auto create an activity log entry
    ActivityLogService.log(activityLogs, {
      action: "Tourism Inquiry Logged",
      user: guestName || "Puri Explorer",
      details: `Puri Concierge inquiry received for ${tourType} on ${date}. Notes: ${notes || "None"}`,
      icon: "explore"
    });

    saveState();
    res.json({ success: true, tourismInquiry: newInquiry });
  });

  // Update Puri Tourism Concierge Inquiry Status
  app.put("/api/pms/tourism-inquiries/:id", (req, res) => {
    const { status, operatorName } = req.body;
    const inquiry = tourismInquiries.find(i => i.id === req.params.id);

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    if (status) inquiry.status = status;

    // Log status update
    ActivityLogService.log(activityLogs, {
      action: "Tourism Inquiry Updated",
      user: operatorName || "Front Desk",
      details: `Tourism inquiry ${inquiry.id} (${inquiry.tourType}) status updated to ${status}.`,
      icon: "explore"
    });

    saveState();
    res.json({ success: true, tourismInquiry: inquiry });
  });

  // Submit Smart Feedback & Checkout Review
  app.post("/api/pms/feedbacks", (req, res) => {
    const { bookingId, guestName, roomId, rating, comments, issueCategory, stayDates } = req.body;

    if (rating === undefined) {
      return res.status(400).json({ error: "rating is mandatory" });
    }

    const isServiceRecovery = rating <= 3;
    const newFeedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      bookingId: bookingId || "Walk-In",
      guestName: guestName || "Guest",
      roomId: roomId || "N/A",
      rating: Number(rating),
      comments: comments || "",
      isServiceRecovery,
      serviceRecoveryStatus: isServiceRecovery ? "Pending" : "Resolved",
      issueCategory: isServiceRecovery ? (issueCategory || "Room Issue") : undefined,
      stayDates: stayDates || "",
      timestamp: new Date().toISOString()
    };

    feedbacks.unshift(newFeedback);

    // Add activity log
    ActivityLogService.log(activityLogs, {
      action: isServiceRecovery ? "Service Recovery Ticket Created" : "Guest Feedback Received",
      user: guestName || "Checkout System",
      details: isServiceRecovery 
        ? `ALERT: Low Rating (${rating} Stars) by ${guestName} for Room ${roomId}. Issue: ${comments}`
        : `Verified ${rating}-Stars review rating by ${guestName}. Comments: ${comments}`,
      icon: isServiceRecovery ? "alert" : "feedback"
    });

    saveState();
    res.json({ success: true, feedback: newFeedback });
  });

  // Update Service Recovery Ticket Status
  app.put("/api/pms/feedbacks/:id", (req, res) => {
    const { serviceRecoveryStatus, operatorName } = req.body;
    const feedback = feedbacks.find(f => f.id === req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    if (serviceRecoveryStatus) feedback.serviceRecoveryStatus = serviceRecoveryStatus;

    ActivityLogService.log(activityLogs, {
      action: "Service Recovery Ticket Action",
      user: operatorName || "Owner Command Center",
      details: `Service recovery ticket for ${feedback.guestName} has been marked as ${serviceRecoveryStatus}.`,
      icon: "alert"
    });

    saveState();
    res.json({ success: true, feedback });
  });

  // Reset state to initial data
  app.post("/api/pms/reset", (req, res) => {
    rooms = [...INITIAL_ROOMS];
    guests = [...INITIAL_GUESTS];
    bookings = [...INITIAL_BOOKINGS];
    payments = [...INITIAL_PAYMENTS];
    notifications = [...INITIAL_NOTIFICATIONS];
    documents = [];
    setMessageLogs([]);
    serviceRequests = [];
    tourismInquiries = [];
    feedbacks = [];
    activityLogs = [];
    saveState();
    res.json({ success: true, message: "PMS state restored successfully." });
  });

  // Post new custom activity log
  app.post("/api/pms/activity-logs", (req, res) => {
    const { action, user, details, icon } = req.body;
    if (!action || !user || !details) {
      return res.status(400).json({ error: "Missing required properties" });
    }
    const logEntry = ActivityLogService.log(activityLogs, {
      action,
      user,
      details,
      icon: icon || "info"
    });
    saveState();
    res.json({ success: true, log: logEntry });
  });

  // Create booking (Customer booking or Admin manual)
  app.post("/api/pms/bookings", async (req, res) => {

    const {
      guestName,
      guestEmail,
      guestPhone,
      roomTypeId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      source, // Website, Phone, Walk-in etc.
      notes,
      paymentMethod,
      transactionId,
      paymentStatus
    } = req.body;

    // Delegate booking creation to BookingService
    const createResult = BookingService.createBooking({
      body: req.body,
      guests,
      bookings,
      rooms,
      activityLogs,
initialRoomTypes: [...HOTEL_ROOM_TYPES] as any[]
    });

    if (createResult.error) {
      return res.status(createResult.statusCode || 400).json({ error: createResult.error });
    }

    const newBooking: Booking = createResult.booking as Booking;
    const guest = createResult.guest as any;
    const bookingId = newBooking.id;

    // 3. Create payment record if any payment mode was triggered
    if (paymentMethod) {
      const paymentValidation = PaymentService.validatePayment(paymentMethod, transactionId);
      if (!paymentValidation.valid) {
        return res.status(400).json({ error: paymentValidation.reason });
      }

      const paymentId = `PAY-${Date.now().toString().slice(-4)}`;
      const payAmount = PaymentService.calculateAdvancePayment(Number(totalPrice), newBooking.paymentOption, newBooking.advancePaid);
      const newPayment: Payment = {
        id: paymentId,
        bookingId: bookingId,
        amount: payAmount,
        method: paymentMethod,
        status: paymentStatus || PaymentStatus.PAID,
        transactionId: transactionId || `pay_mock_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      payments.push(newPayment);
      newBooking.paymentStatus = newPayment.status;

      // Add a payment notification
      notifications.unshift({
        id: `NT-${Date.now()}-pay`,
        type: "payment_confirmation",
        title: "Payment Confirmed",
        message: `${paymentMethod} transaction of ₹${payAmount.toLocaleString()} received for booking ${bookingId}.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Add a booking notification
    notifications.unshift({
      id: `NT-${Date.now()}-bk`,
      type: "new_booking",
      title: `New Reservation (${newBooking.source})`,
      message: `${guest.name} booked a room for ${checkInDate} to ${checkOutDate}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    const roomType = INITIAL_ROOM_TYPES.find(rt => rt.id === roomTypeId);
    const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";

    // Dispatch background confirmation alert notifications (email + legacy WhatsApp via notificationService)
    sendNotificationEvents("booking_confirmation", newBooking, guest, roomTypeName)
      .then(() => {
        saveState();
        console.log(`[NotificationTrigger] Sent booking confirmation for ${bookingId}`);
      })
      .catch(err => {
        saveState();
        console.error("Error dispatching booking confirmation notifications:", err);
      });

    // ── Sprint 7 Module 1: Meta WhatsApp Cloud API confirmation ──────────────
    // Fires after booking is confirmed. Failure is logged — booking NOT rolled back.
    if (guest?.phone) {
      const hotelAddress = `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}`;
      const googleMapsUrl = `https://maps.google.com/?q=${HOTEL.coordinates.lat},${HOTEL.coordinates.lng}`;

      sendWhatsAppBookingConfirmation({
        bookingId: bookingId,
        guestName: guest.name ?? guestName,
        toPhone: guest.phone,
        vars: {
          hotelName: process.env.HOTEL_NAME ?? HOTEL.general.hotelName,
          guestName: guest.name ?? guestName,
          bookingId: bookingId,
          roomType: roomTypeName,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount: numberOfGuests ?? 1,
          paymentStatus: newBooking.paymentStatus ?? "Pending",
          hotelPhone: process.env.HOTEL_PHONE ?? "+91-6752-223344",
          hotelAddress,
          googleMapsUrl,
        },
      })
        .then(result => {
          console.log(
            `[WhatsApp] Confirmation dispatched | Booking: ${bookingId} | Phone: ${result.phone} | Status: ${result.status}` +
            (result.metaMessageId ? ` | Meta MsgID: ${result.metaMessageId}` : "")
          );
          saveState();
        })
        .catch(err => {
          // WhatsApp failure must NEVER affect booking outcome
          console.error(`[WhatsApp] Dispatch error for ${bookingId} — booking unaffected:`, err);
        });
    } else {
      console.warn(`[WhatsApp] Skipping confirmation for ${bookingId} — guest phone missing.`);
    }
    // ── End Sprint 7 Module 1 ────────────────────────────────────────────────

    // ------------------------------------------------------------
    // [Dual-write Phase 2] Prisma write AFTER legacy JSON creation
    // TODO: Remove JSON persistence after Sprint 5.1-C verification and make Prisma the source of truth.
    // ------------------------------------------------------------
    try {
      // Minimal mapping: use bookingId + legacy fields; do NOT persist BookingRoom records.
      // Notes: Room assignment, check-in/out, payments remain JSON-only (no BookingRoom/other relations created).


      // Prefer using deterministic IDs already generated by legacy JSON.
      // NOTE: Prisma schema requires hotelId/tenant relations; use env as the mapping source.
      // If env is missing, the write will fail and we will still return legacy JSON.

      const hotelId = process.env.PRISMA_HOTEL_ID as string | undefined;
      if (!hotelId) {
        throw new Error("Missing PRISMA_HOTEL_ID env var; cannot dual-write booking.");
      }

      // Guest upsert by id (legacy guest.id) to avoid schema mismatch.
      await prisma.guest.upsert({
        where: { id: guest.id },
        update: {
          firstName: guestName.split(" ")[0] || guestName,
          lastName: guestName.split(" ").slice(1).join(" ") || "",
          email: guest.email,
          phone: guestPhone || null,
        },
        create: {
          id: guest.id,
          hotelId,
          firstName: guestName.split(" ")[0] || guestName,
          lastName: guestName.split(" ").slice(1).join(" ") || "",
          email: guest.email,
          phone: guestPhone || null,
          nationality: null,
        },
      });

      // Booking create: persist core booking row only (NO BookingRoom records).
      await prisma.booking.create({
        data: {
          id: bookingId,
          hotelId,
          status: "CONFIRMED" as any,
          bookingType: (newBooking as any).bookingType || null,
          bookingNumber: bookingId,
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          totalAmount: Number(totalPrice),
          currency: "INR",
          notes: notes || null,
          // Do not create related bookingRooms/room assignment/invoices/payments.
        },
      });

      console.log(`[PrismaDualWrite] Prisma booking created for ${bookingId}`);

    } catch (prismaErr) {
      console.error(`[PrismaDualWrite] Prisma booking write failed for ${bookingId}. Returning legacy JSON response.`, prismaErr);
      // Explicitly do not throw: preserve booking flow and response.
    }

    res.json({ success: true, booking: newBooking, guest });

  });

  // Edit booking details (Admin updates, check-in, check-out, assignment, cancellation)
  app.put("/api/pms/bookings/:id", (req, res) => {
    const bookingId = req.params.id;
    const { status, roomId, paymentStatus, notes } = req.body;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const previousStatus = booking.status;
    const previousRoomId = booking.roomId;

    // Detect modifications for Activity Logging
    if (roomId !== undefined && roomId !== previousRoomId) {
      ActivityLogService.log(activityLogs, {
        action: "Room Assignment",
        user: req.body.operatorName || "Rajesh Kumar (Front Desk)",
        details: `Room ${roomId || "unassigned"} assigned to guest reservation ${bookingId}.`,
        icon: "room"
      });
    }

    if ((req.body.discountAmount !== undefined && Number(req.body.discountAmount) !== (booking.discountAmount || 0)) ||
        (req.body.discountPercent !== undefined && Number(req.body.discountPercent) !== (booking.discountPercent || 0)) ||
        (req.body.discountReason !== undefined && req.body.discountReason !== booking.discountReason)) {
      const guestObj = guests.find(g => g.id === booking.guestId);
      const guestName = guestObj ? guestObj.name : "Guest";
      const amtLog = req.body.discountAmount !== undefined ? Number(req.body.discountAmount) : (booking.discountAmount || 0);
      const pctLog = req.body.discountPercent !== undefined ? Number(req.body.discountPercent) : (booking.discountPercent || 0);
      const appliedBy = req.body.discountAppliedBy || req.body.operatorName || "Rajesh Kumar (Front Desk)";
      const reason = req.body.discountReason || "Billing Adjustment";
      const remarks = req.body.discountRemarks || "N/A";
      const approvedVia = req.body.discountApprovedVia || "Manager Approval";

      ActivityLogService.log(activityLogs, {
        action: "Discount Applied",
        user: appliedBy,
        details: `Discount Applied\n\nGuest: ${guestName}\nAmount: ₹${amtLog || (pctLog ? `${pctLog}%` : "0")}\nReason: ${reason}\nRemarks: ${remarks}\nApproved Via: ${approvedVia}\nApplied By: ${appliedBy}`,
        icon: "discount"
      });
    }

    if (status !== undefined && status !== previousStatus) {
      if (status === "Invoice Generated") {
        ActivityLogService.log(activityLogs, {
          action: "Invoice Generation",
          user: "System Ledger",
          details: `Tax invoice generated successfully for Booking ${bookingId}. Total grand due: ₹${(booking.totalPrice - (booking.discountAmount || 0)).toLocaleString()}`,
          icon: "invoice"
        });
      }
      if ((status === "Paid" || status === "Closed") && (previousStatus !== "Paid" && previousStatus !== "Closed")) {
        const pm = req.body.closedBillDetails?.paymentMethod || req.body.paymentMethod || "UPI";
        const amt = req.body.closedBillDetails?.amountReceived || req.body.amount || booking.totalPrice;
        ActivityLogService.log(activityLogs, {
          action: "Payment Collection",
          user: req.body.operatorName || "Rajesh Kumar (Front Desk)",
          details: `Paid ledger collection of ₹${Number(amt).toLocaleString()} via ${pm} for folio ${bookingId}. Status: ${status}.`,
          icon: "payment"
        });
      }
      if (status === BookingStatus.CHECKED_OUT) {
        ActivityLogService.log(activityLogs, {
          action: "Checkout Events",
          user: req.body.operatorName || "Rajesh Kumar (Front Desk)",
          details: `Checked out guest from Room ${booking.roomId || "N/A"} for Booking ${bookingId}.`,
          icon: "checkout"
        });
      }
    }

    // Apply updates
    if (status !== undefined) booking.status = status as BookingStatus;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus as PaymentStatus;
    if (notes !== undefined) booking.notes = notes;

    // ----------------------------------------------------
    // BUSINESS RULE: Prevent Check-in Without Room Assignment
    // ----------------------------------------------------
    // If Reception attempts to transition booking to CHECKED_IN,
    // ensure a valid physical room has been assigned.
    if (status === BookingStatus.CHECKED_IN) {
      const hasRoomId = booking.roomId !== undefined && booking.roomId !== null && String(booking.roomId).trim() !== "";
      const isRoomValid = hasRoomId && rooms.some(r => String(r.id) === String(booking.roomId));

      if (!hasRoomId || !isRoomValid) {
        return res.status(400).json({
          error: "Guest cannot be checked in until a room has been assigned."
        });
      }

      // Extra integrity check: ensure the room is not in a conflicting state.
      const targetRoom = rooms.find(r => String(r.id) === String(booking.roomId));
      if (!targetRoom || (targetRoom.status !== RoomStatus.RESERVED && targetRoom.status !== RoomStatus.AVAILABLE && targetRoom.status !== RoomStatus.OCCUPIED)) {
        return res.status(400).json({
          error: "Guest cannot be checked in until a physical room has been assigned."
        });
      }
    }


    // Save extra demo properties transparently
    Object.keys(req.body).forEach(key => {
      if (key !== "id" && key !== "guestId" && key !== "createdAt") {
        (booking as any)[key] = req.body[key];
      }
    });

    // ----------------------------------------------------
    // RECALCULATE BOOKING TOTAL PRICE TO PRESERVE CONSISTENCY
    // ----------------------------------------------------
    try {
      const rt = INITIAL_ROOM_TYPES.find(type => type.id === booking.roomTypeId);
      const diffTime = Math.abs(new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      const baseTariff = rt?.basePrice || 2500;
      const baseAccommodationTotal = baseTariff * diffDays;

      const transportTotal = booking.transport && booking.transport.vehicleType ? (booking.transport.cost || 500) : 0;

      const customLines = booking.customServiceLines || [];
      const otherChargesTotal = customLines.reduce((sum: number, line: any) => sum + Number(line.amount || 0), 0);

      const subtotalRaw = baseAccommodationTotal + transportTotal + otherChargesTotal;
      const finalAmounts = PaymentService.calculateFinalAmount({
        subtotalRaw,
        discountAmount: booking.discountAmount,
        discountPercent: booking.discountPercent,
        gstRate: booking.gstRate
      });
      booking.totalPrice = finalAmounts.totalPrice;
    } catch (err) {
      console.error("Error recalculating booking total price:", err);
    }

    // ----------------------------------------------------
    // AUTOMATIC TRANSPORT REVENUE LEDGER
    // ----------------------------------------------------
    if (req.body.transport && req.body.transport.cost && (!booking.transport || booking.transport.cost !== req.body.transport.cost)) {
      const transportCost = Number(req.body.transport.cost);
      const vehicleType = req.body.transport.vehicleType || "Shuttle";
      
      // Check if there is already a transport payment for this booking
      const hasTransportPayment = payments.some(p => p.bookingId === bookingId && p.notes?.toLowerCase().includes("transport"));
      
      if (!hasTransportPayment && transportCost > 0) {
        const paymentId = `PAY-TR-${Date.now().toString().slice(-4)}`;
        const newPayment: Payment = {
          id: paymentId,
          bookingId: bookingId,
          amount: transportCost,
          method: "Cash", // Default method for logistics settlement
          status: PaymentStatus.PAID,
          transactionId: `pay_tr_${Date.now()}`,
          createdAt: new Date().toISOString(),
          notes: `Transport Service Revenue: Linked ${vehicleType} pickup/drop logistics`
        };
        payments.push(newPayment);
        
        // Add a notification
        notifications.unshift({
          id: `NT-${Date.now()}-trpay`,
          type: "payment_confirmation",
          title: "Transport Payment Ledged",
          message: `Invoiced transport shuttle charge of ₹${transportCost.toLocaleString()} logged into ledger for booking ${bookingId}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // ----------------------------------------------------
    // AUTOMATIC CHECKOUT SETTLEMENT LEDGER & VALIDATION ENGINE
    // ----------------------------------------------------
    const wasClosedOrPaid = previousStatus === "Closed" || previousStatus === "Paid";
    const isNowClosedOrPaid = booking.status === "Closed" || booking.status === "Paid" || booking.paymentStatus === "Paid";

    if (isNowClosedOrPaid) {
      const closingMethod = req.body.closedBillDetails?.paymentMethod || req.body.paymentMethod || "UPI";
      
      const alreadyPaid = payments
        .filter(p => p.bookingId === bookingId && p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const outstanding = booking.totalPrice - alreadyPaid;

      // Settlement payment should only equal remaining balance.
      // If remaining balance <= 0: Do not create settlement payment.
      // Instead: Mark folio as settled, Record credit/refund if applicable.
      if (outstanding > 0 && !wasClosedOrPaid) {
        const amt = outstanding;
        const paymentId = `PAY-${Date.now().toString().slice(-4)}`;
        const newPayment: Payment = {
          id: paymentId,
          bookingId: bookingId,
          amount: amt,
          method: closingMethod,
          status: PaymentStatus.PAID,
          transactionId: req.body.closedBillDetails?.refNumber || `pay_settle_${Date.now()}`,
          createdAt: new Date().toISOString(),
          notes: `Checkout Settlement Revenue: Settle and Close Folio ${bookingId}`
        };
        payments.push(newPayment);

        booking.paymentStatus = PaymentStatus.PAID;

        // Add a payment notification
        notifications.unshift({
          id: `NT-${Date.now()}-settle`,
          type: "payment_confirmation",
          title: "Settle and Close Payment Recorded",
          message: `${closingMethod} checkout settlement of ₹${amt.toLocaleString()} received for booking ${bookingId}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (outstanding < 0 && !wasClosedOrPaid) {
        // Record credit/refund if applicable
        const creditRefundAmt = Math.abs(outstanding);
        const hasRefund = payments.some(p => p.bookingId === bookingId && (p.amount < 0 || p.method === "Refund" || p.id.startsWith("PAY-REF-")));
        if (!hasRefund) {
          const paymentId = `PAY-REF-${Date.now().toString().slice(-4)}-${bookingId.replace("BK-", "")}`;
          const newPayment: Payment = {
            id: paymentId,
            bookingId: bookingId,
            amount: -creditRefundAmt,
            method: "Refund",
            status: PaymentStatus.PAID,
            transactionId: req.body.closedBillDetails?.refNumber || `ref_${Date.now()}`,
            createdAt: new Date().toISOString(),
            notes: `Credit Balance Refund for Folio ${bookingId}`
          };
          payments.push(newPayment);
          booking.paymentStatus = PaymentStatus.PAID;

          notifications.unshift({
            id: `NT-${Date.now()}-refund`,
            type: "payment_confirmation",
            title: "Credit Balance Refund Recorded",
            message: `Credit refund of ₹${creditRefundAmt.toLocaleString()} applied to guest account for folio ${bookingId}.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // outstanding === 0, mark payment status as Paid
        booking.paymentStatus = PaymentStatus.PAID;
      }

      // ----------------------------------------------------
      // LEDGER VALIDATION ENGINE
      // ----------------------------------------------------
      const finalPayments = payments
        .filter(p => p.bookingId === bookingId && p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const finalOutstanding = booking.totalPrice - finalPayments;
      if (finalOutstanding > 0) {
        // Reject transition to Paid or Closed state if outstanding > 0
        booking.status = previousStatus;
        booking.paymentStatus = booking.paymentStatus === "Paid" ? previousStatus as any : booking.paymentStatus;
        booking.roomId = previousRoomId;
        return res.status(400).json({
          error: `Ledger Validation Error: Cannot transition booking to Paid or Closed state. There is an outstanding balance of ₹${finalOutstanding.toLocaleString()}.`
        });
      }
    }

    // Handle room assignment change
    if (roomId !== undefined) {
      const nextRoomId = roomId;
      if (nextRoomId) {
        const newCheckIn = new Date(booking.checkInDate);
        const newCheckOut = new Date(booking.checkOutDate);
        const conflictingBooking = RoomService.detectRoomConflict(bookings, nextRoomId, newCheckIn, newCheckOut, booking.id);
        if (conflictingBooking) {
          return res.status(409).json({
            error: "This room is already assigned to another active booking for the selected dates."
          });
        }
      }

      booking.roomId = roomId;

      // Sync bookingRooms entries if multi-room booking
      if (booking.bookingRooms && booking.bookingRooms.length > 0) {
        if (roomId) {
          const assignedRoomObj = rooms.find(r => String(r.id) === String(roomId));
          if (assignedRoomObj) {
            let slot = booking.bookingRooms.find(r => String(r.roomTypeId) === String(assignedRoomObj.roomTypeId) && (!r.roomId || String(r.roomId) === String(previousRoomId)));
            if (!slot) {
              slot = booking.bookingRooms.find(r => String(r.roomTypeId) === String(assignedRoomObj.roomTypeId));
            }
            if (slot) {
              slot.roomId = roomId;
            }
          }
        } else {
          const slot = booking.bookingRooms.find(r => String(r.roomId) === String(previousRoomId));
          if (slot) {
            slot.roomId = null;
          }
        }
      }

      // If prior room was allocated, revert it to Available if it was Reserved/Occupied
      if (previousRoomId && previousRoomId !== roomId) {
        RoomService.releaseRoom(rooms, previousRoomId);
      }

      // Sync new room's status to reflect assignment
      if (roomId) {
        RoomService.assignRoom(rooms, roomId, booking.status);

        // Notify room assignment
        notifications.unshift({
          id: `NT-${Date.now()}-room`,
          type: "room_assignment",
          title: "Room Assigned",
          message: `Room ${roomId} assigned to booking ${bookingId}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Smart automations when booking status is updated
    if (status !== undefined && status !== previousStatus) {
      const activeRoomId = booking.roomId;

      if (status === BookingStatus.CHECKED_IN) {
        booking.checkedInAt = new Date().toISOString();
        if (activeRoomId) {
          RoomService.assignRoom(rooms, activeRoomId, BookingStatus.CHECKED_IN);
        }
        if (booking.bookingRooms) {
          booking.bookingRooms.forEach((r: any) => {
            if (r.roomId) {
              RoomService.assignRoom(rooms, r.roomId, BookingStatus.CHECKED_IN);
            }
          });
        }
        notifications.unshift({
          id: `NT-${Date.now()}-cin`,
          type: "check_in",
          title: "Guest Checked In",
          message: `Booking ${bookingId} has checked in. Assigned Room ${activeRoomId || "unassigned"}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        const targetGuest = GuestService.findGuestById(guests, booking.guestId);
        const roomType = INITIAL_ROOM_TYPES.find(rt => rt.id === booking.roomTypeId);
        const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";
        if (targetGuest) {
          sendNotificationEvents("check_in_reminder", booking, targetGuest, roomTypeName)
            .then(() => {
              saveState();
              console.log(`[NotificationTrigger] Sent check-in reminder for ${bookingId}`);
            })
            .catch(err => console.error("Error dispatching check-in reminder:", err));
        }
      }

      if (status === BookingStatus.CHECKED_OUT || status === BookingStatus.MOVED_TO_BILLING) {
        booking.checkedOutAt = new Date().toISOString();
        if (activeRoomId) {
          RoomService.updateRoomStatus(rooms, activeRoomId, RoomStatus.CLEANING);
        }
        if (booking.bookingRooms) {
          booking.bookingRooms.forEach((r: any) => {
            if (r.roomId) {
              RoomService.updateRoomStatus(rooms, r.roomId, RoomStatus.CLEANING);
            }
          });
        }
        notifications.unshift({
          id: `NT-${Date.now()}-cout`,
          type: "check_in",
          title: "Guest Checked Out & Moved to Billing",
          message: `Booking ${bookingId} has checked out. Assigned Room ${activeRoomId || "N/A"} flagged for cleaning. Billing queue updated.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        const targetGuest = GuestService.findGuestById(guests, booking.guestId);
        const roomType = INITIAL_ROOM_TYPES.find(rt => rt.id === booking.roomTypeId);
        const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";
        if (targetGuest) {
          sendNotificationEvents("check_out_confirmation", booking, targetGuest, roomTypeName)
            .then(() => {
              saveState();
              console.log(`[NotificationTrigger] Sent check-out confirmation / billing transfer for ${bookingId}`);
            })
            .catch(err => console.error("Error dispatching check-out confirmation:", err));
        }
      }

      if (status === BookingStatus.CANCELLED) {
        if (activeRoomId) {
          RoomService.releaseRoom(rooms, activeRoomId);
        }
        if (booking.bookingRooms) {
          booking.bookingRooms.forEach((r: any) => {
            if (r.roomId) {
              RoomService.releaseRoom(rooms, r.roomId);
            }
            r.roomId = null;
          });
        }
        booking.roomId = null;
      }
    }

    saveState();
    res.json({ success: true, booking });
  });

  // Admin updates individual room status (Available, Maintenance, Cleaning, etc.)
  app.put("/api/pms/rooms/:id", (req, res) => {
    const roomId = req.params.id;
    const { status } = req.body;

    const room = RoomService.updateRoomStatus(rooms, roomId, status as RoomStatus);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    saveState();
    res.json({ success: true, room });
  });

  // Post guest checkin document upload (e-check-in portal)
  app.post("/api/pms/checkin/:id", (req, res) => {
    const bookingId = req.params.id;
    const { 
      idType, 
      idNumber, 
      guestName, 
      guestPhone, 
      idProofBase64, 
      idProofName,
      arrivalMode,
      arrivalDetails,
      coGuests,
      eta
    } = req.body;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking booking ID not found" });
    }

    const guest = GuestService.findGuestById(guests, booking.guestId);
    if (!guest) {
      return res.status(440).json({ error: "Guest profile not found" });
    }

    GuestService.updateGuest(guest, {
      name: guestName,
      phone: guestPhone,
      idType,
      idNumber,
      idProofUrl: idProofBase64 ? `/uploads/simulated_${Date.now()}_id.jpg` : "/uploads/placeholder_id.jpg"
    });

    const simulatedDocUrl = guest.idProofUrl || "/uploads/placeholder_id.jpg";

    // Save arrival intelligence and checkin metadata
    if (arrivalMode) (booking as any).arrivalMode = arrivalMode;
    if (arrivalDetails) (booking as any).arrivalDetails = arrivalDetails;
    if (coGuests) (booking as any).coGuests = coGuests;
    if (eta) (booking as any).eta = eta;
    (booking as any).webCheckInStatus = "Pending Verification";

    // Track document
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    const newDoc: UploadedDocument = {
      id: docId,
      guestId: guest.id,
      bookingId: bookingId,
      documentType: idType || "ID Document",
      documentUrl: simulatedDocUrl,
      fileName: idProofName || "ID_Card.png",
      createdAt: new Date().toISOString()
    };
    documents.push(newDoc);

    // Update booking status to Confirmed (if it was Booked) when they complete e-check-in
    if (booking.status === BookingStatus.BOOKED) {
      booking.status = BookingStatus.CONFIRMED;
    }

    // Auto-create a service request for Web Check-In verification
    const webCheckinRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      bookingId: bookingId,
      guestName: guest.name,
      roomId: booking.roomId || "N/A",
      requestType: "Verify Web Check-In & ID Proof",
      category: "Early Check-In",
      priority: "High",
      status: "Pending",
      timestamp: new Date().toISOString(),
      createdTime: new Date().toISOString(),
      slaTimer: "10 Mins",
      assignedStaff: "Unassigned",
      description: `Verify uploaded ${idType || "ID Document"} (Number: ${idNumber || "N/A"}). ETA: ${eta || "N/A"}. Arrival: ${arrivalMode || "N/A"}. Co-guests: ${coGuests || "None"}`,
      comments: `Verify uploaded ${idType || "ID Document"} (Number: ${idNumber || "N/A"}). ETA: ${eta || "N/A"}.`
    };
    serviceRequests.unshift(webCheckinRequest);

    // Notify receptionist
    notifications.unshift({
      id: `NT-${Date.now()}-echeck`,
      type: "check_in",
      title: "Online Check-In Complete",
      message: `${guest.name} completed standard E-Check-In and uploaded ${idType || "ID documentation"} for booking ${bookingId}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    const roomType = INITIAL_ROOM_TYPES.find(rt => rt.id === booking.roomTypeId);
    const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";

    // Dispatch background E-Check-In confirmation notifications
    sendNotificationEvents("check_in_reminder", booking, guest, roomTypeName)
      .then(() => {
        saveState();
        console.log(`[NotificationTrigger] Sent E-Check-In confirmation for ${bookingId}`);
      })
      .catch(err => {
        saveState();
        console.error("Error dispatching E-Check-In confirmation:", err);
      });

    res.json({ success: true, booking, guest, document: newDoc });
  });

  // Post guest room upgrade request
  app.post("/api/pms/upgrade/:id", (req, res) => {
    const bookingId = req.params.id;
    const { newRoomTypeId, upgradeCost } = req.body;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const previousRoomTypeId = booking.roomTypeId;
    booking.roomTypeId = newRoomTypeId;

    // Recalculate duration
    const d1 = new Date(booking.checkInDate);
    const d2 = new Date(booking.checkOutDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const totalUpgradeCharge = upgradeCost * diffDays;

    // Add custom service line
    const currentLines = booking.customServiceLines || [];
    booking.customServiceLines = [
      ...currentLines,
      { 
        id: `SRV-${Date.now()}-upgrade`,
        description: `Room Upgrade: Room Type ${previousRoomTypeId.toUpperCase()} to ${newRoomTypeId.toUpperCase()}`, 
        amount: totalUpgradeCharge
      }
    ];

    // Log audit
    booking.auditLogs = [
      ...(booking.auditLogs || []),
      { 
        timestamp: new Date().toISOString(), 
        action: "Room Upgraded", 
        user: "Self-Service Portal", 
        notes: `Upgraded room tier from ${previousRoomTypeId.toUpperCase()} to ${newRoomTypeId.toUpperCase()}. Applied upgrade charges: ₹${totalUpgradeCharge}` 
      }
    ];

    // Notify receptionist
    notifications.unshift({
      id: `NT-${Date.now()}-upgrade`,
      type: "room_assignment",
      title: "Room Upgraded Online",
      message: `Booking ${bookingId} has been upgraded to ${newRoomTypeId.toUpperCase()} via Guest Portal. Extra cost: ₹${totalUpgradeCharge}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Recalculate price
    try {
      const rt = INITIAL_ROOM_TYPES.find(type => type.id === booking.roomTypeId);
      const baseTariff = rt?.basePrice || 2500;
      const baseAccommodationTotal = baseTariff * diffDays;

      const transportTotal = booking.transport && booking.transport.vehicleType ? (booking.transport.cost || 500) : 0;
      const customLines = booking.customServiceLines || [];
      const otherChargesTotal = customLines.reduce((sum: number, line: any) => sum + Number(line.amount || 0), 0);

      const subtotalRaw = baseAccommodationTotal + transportTotal + otherChargesTotal;
      const finalAmounts = PaymentService.calculateFinalAmount({
        subtotalRaw,
        discountAmount: booking.discountAmount,
        discountPercent: booking.discountPercent,
        gstRate: booking.gstRate
      });
      booking.totalPrice = finalAmounts.totalPrice;
    } catch (err) {
      console.error("Error recalculating booking total price on upgrade:", err);
    }

    // Auto-create a service request for room upgrade key delivery / room preparation
    const targetGuest = GuestService.findGuestById(guests, booking.guestId);
    const upgradeRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      bookingId: bookingId,
      guestName: targetGuest ? targetGuest.name : "Guest",
      roomId: booking.roomId || "N/A",
      requestType: "Room Upgrade Key & Set Preparation",
      category: "Custom Guest Requests",
      priority: "High",
      status: "Pending",
      timestamp: new Date().toISOString(),
      createdTime: new Date().toISOString(),
      slaTimer: "15 Mins",
      assignedStaff: "Unassigned",
      description: `Prepare room keys and amenities for upgraded class: ${newRoomTypeId.toUpperCase()}. Applied upgrade charges: ₹${totalUpgradeCharge}`,
      comments: `Prepare room keys and amenities for upgraded class: ${newRoomTypeId.toUpperCase()}.`
    };
    serviceRequests.unshift(upgradeRequest);

    saveState();
    res.json({ success: true, booking });
  });

  // Read all notifications
  app.post("/api/pms/notifications/read", (req, res) => {
    notifications.forEach(n => n.isRead = true);
    saveState();
    res.json({ success: true, count: notifications.length });
  });

  // Manual notification dispatch endpoint
  app.post("/api/pms/bookings/:id/send-message", (req, res) => {
    const bookingId = req.params.id;
    const { event } = req.body; // "booking_confirmation" | "check_in_reminder" | "check_out_confirmation"

    if (!event) {
      return res.status(400).json({ error: "Missing event parameter" });
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const guest = GuestService.findGuestById(guests, booking.guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    const roomType = INITIAL_ROOM_TYPES.find(rt => rt.id === booking.roomTypeId);
    const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";

    sendNotificationEvents(event, booking, guest, roomTypeName)
      .then(() => {
        saveState();
        res.json({ success: true, message: `Sent ${event.replace(/_/g, " ")} notification successfully.` });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Failed to dispatch notification" });
      });
  });

  // Serve static UI assets and handle dev/prod builds
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });
}

startServer();
