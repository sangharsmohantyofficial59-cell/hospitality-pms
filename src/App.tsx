/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerFooter from "./components/CustomerFooter";
import CustomerWebsite from "./components/CustomerWebsite";
import BookingLookupPortal from "./components/BookingLookupPortal";
import ECheckInPortal from "./components/ECheckInPortal";
import AdminLogin from "./components/AdminLogin";
import DashboardOverview from "./components/DashboardOverview";
import RoomManagement from "./components/RoomManagement";
import BookingManagement from "./components/BookingManagement";
import GuestProfileList from "./components/GuestProfileList";
import DevDocsViewer from "./components/DevDocsViewer";
import ShiftManagement from "./components/ShiftManagement";
import TransportManagement from "./components/TransportManagement";
import BillingManagement from "./components/BillingManagement";
import MessageTemplates from "./components/MessageTemplates";
import AuditTimeline from "./components/AuditTimeline";
import DiscountGovernance from "./components/DiscountGovernance";
import OwnerControlCenter from "./components/OwnerControlCenter";
import GuestServicePortal from "./components/GuestServicePortal";
import SubdomainSimulator from "./components/SubdomainSimulator";
import UnifiedGuestPortal from "./components/UnifiedGuestPortal";
import HousekeepingManagement from "./components/HousekeepingManagement";
import LiveServiceCenter from "./components/LiveServiceCenter";
import { Room, RoomStatus, Booking, Guest, Payment, Notification, UploadedDocument, RoomType } from "./types";
import { Hotel, KeyRound, ArrowRight, Library, RefreshCw, X, FolderGit, Layout, Database, Bell, Check } from "lucide-react";
import { api } from "./services/api";
import { AUTH_CONFIG, type AuthRole } from "./config/authConfig";
import { ROUTES, STAFF_SESSION_KEYS, USER_ROLES, STAFF_TAB_IDS } from "./config/constants";

export default function App() {
  const DEV_MODE = false;

  // Guard: session restoration runs only once at startup, not on every fetchState() refresh
  const hasInitializedSession = useRef(false);
  // Guard: isLoading is only relevant for the very first data load
  const isFirstLoad = useRef(true);

  // Subdomain & Path routing states
  const [route, setRoute] = useState<string>(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    if (hostname.startsWith("guest.") || pathname === "/guest") {
      return "guest";
    }
    if (hostname.startsWith("ops.") || pathname === "/ops") {
      return "ops";
    }
    if (hostname.startsWith("owner.") || pathname === "/owner") {
      return "owner";
    }
    return "home";
  });

  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [adminTab, setAdminTab] = useState<string>("dashboard");
  
  // Authentication states
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffUser, setStaffUser] = useState<any>(null);
  const [showStaffLogin, setShowStaffLogin] = useState(false);

  const ROLE_ROUTES = {
    reception: "/ops",
    owner: "/owner",
  } as const;


  type StoredStaffSession = {
    isLoggedIn: true;
    username: string;
    role: keyof typeof ROLE_ROUTES;
  };

  const SESSION_KEY = STAFF_SESSION_KEYS.storageKey;


  const getStoredSession = (): StoredStaffSession | null => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredStaffSession;
      if (parsed?.isLoggedIn && parsed?.username && parsed?.role) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const [preselectedBookingId, setPreselectedBookingId] = useState("");

  // Developer Guides state
  const [showDevDocs, setShowDevDocs] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Dynamic PMS States (Loaded from Backend)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Theme support & mail ledger tracking
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("pms-theme");
    return (saved as "light" | "dark") || "light";
  });
  const [messageLogs, setMessageLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  // Dynamic Owner, Guest Experience and Concierge States
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [tourismInquiries, setTourismInquiries] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("pms-theme", next);
      return next;
    });
  };

  // Fetch full hotel state on mount
  const fetchState = async () => {
    try {
      const data = await api.system.getState();
      setRooms(data.rooms || []);
      setRoomTypes(data.roomTypes || []);
      setGuests(data.guests || []);
      setBookings(data.bookings || []);
      setPayments(data.payments || []);
      setNotifications(data.notifications || []);
      setDocuments(data.documents || []);
      setMessageLogs(data.messageLogs || []);
      setActivityLogs(data.activityLogs || []);
      setServiceRequests(data.serviceRequests || []);
      setTourismInquiries(data.tourismInquiries || []);
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error("Connect error in fetching state:", err);
    } finally {
      // Only mark loading done on the very first fetch.
      // Subsequent calls (after mutations) must NOT touch isLoading —
      // otherwise the session useEffect re-fires and resets adminTab.
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Load full hotel state only once on app start.
    fetchState();
  }, []);


  // API Callbacks

  const refreshStateAfterMutation = async () => {
    // business logic is unchanged; just re-fetch after successful write operations
    await fetchState();
  };

  const handleNewBooking = async (formData: any) => {
    try {
      const data = await api.booking.createBooking(formData);
      if (data?.success) {
        await fetchState();
        return data;
      }
      return { success: false, error: data?.error };
    } catch (err) {
      return { success: false, error: "Network transport error" };
    }
  };

  const handleUpdateBooking = async (id: string, payload: any) => {
    try {
      const data = await api.booking.updateBooking(id, payload);
      if (data?.success) {
        await fetchState();
        return data;
      }
      return { success: false, error: data?.error };
    } catch (err) {
      return { success: false, error: "Network update error" };
    }
  };

  const handleUpdateRoomStatus = async (id: string, status: RoomStatus) => {
    try {
      const data = await api.room.updateRoomStatus(id, status);
      if (data?.success) {
        await fetchState();
        return data;
      }
      return { success: false, error: data?.error };
    } catch (err) {
      return { success: false, error: "Network room update error" };
    }
  };

  const handleUploadCheckin = async (bookingId: string, payload: any) => {
    try {
      const data = await api.checkin.uploadCheckin(bookingId, payload);
      if (data?.success) {
        await fetchState();
        return data;
      }
      return { success: false, error: data?.error };
    } catch (err) {
      return { success: false, error: "Network check-in upload error" };
    }
  };

  const handleRoomUpgrade = async (bookingId: string, payload: any) => {
    try {
      const data = await api.checkin.upgradeRoom(bookingId, payload);
      if (data?.success) {
        await fetchState();
        return data;
      }
      return { success: false, error: data?.error };
    } catch (err) {
      return { success: false, error: "Network room upgrade error" };
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.system.markNotificationsRead();
      await fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPMS = async () => {
    if (!window.confirm("Are you sure you want to restore the hotel database back to clean, default seeds? Any custom bookings you made will be wiped.")) return;
    try {
      const res = await api.system.resetPMS();
      await fetchState();
      alert("PMS database successfully reseeded!");
      return res;
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRequest = async (payload: any) => {
    try {
      await api.guest.addServiceRequest(payload);
      await fetchState();
    } catch (err) {
      console.error("Error creating service request:", err);
    }
  };

  const handleUpdateServiceRequest = async (id: string, payload: any) => {
    try {
      await api.guest.updateServiceRequest(id, payload);
      await fetchState();
    } catch (err) {
      console.error("Error updating service request:", err);
    }
  };

  const handleAddInquiry = async (payload: any) => {
    try {
      await api.guest.addTourismInquiry(payload);
      await fetchState();
    } catch (err) {
      console.error("Error creating tourism inquiry:", err);
    }
  };

  const handleAddFeedback = async (payload: any) => {
    try {
      await api.guest.addFeedback(payload);
      await fetchState();
    } catch (err) {
      console.error("Error creating feedback:", err);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    try {
      await api.guest.updateFeedbackStatus(id, status);
      await fetchState();
    } catch (err) {
      console.error("Error updating feedback status:", err);
    }
  };

  const handleLoginSuccess = (payload: { username: string; role: AuthRole }) => {
    const session: StoredStaffSession = {
      isLoggedIn: true,
      username: payload.username,
      role: payload.role,
    };

    // store only (username, role, login status)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    setStaffUser({ username: session.username, role: session.role });
    setIsStaffLoggedIn(true);
    setShowStaffLogin(false);

    const targetPath = ROLE_ROUTES[session.role];
    setRoute(session.role === "reception" ? "ops" : "owner");
    window.history.pushState({}, "", targetPath);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setStaffUser(null);
    setIsStaffLoggedIn(false);
    setShowStaffLogin(false);
    setRoute("home");
    window.history.pushState({}, "", "/");
  };


  // Keep route in sync with current URL (no business logic changes)
  useEffect(() => {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    if (hostname.startsWith("guest.") || pathname === "/guest") {
      setRoute("guest");
    } else if (hostname.startsWith("ops.") || pathname === "/ops") {
      setRoute("ops");
    } else if (hostname.startsWith("owner.") || pathname === "/owner") {
      setRoute("owner");
    } else {
      setRoute("home");
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const hostname = window.location.hostname;
      if (hostname.startsWith("guest.") || pathname === "/guest") {
        setRoute("guest");
      } else if (hostname.startsWith("ops.") || pathname === "/ops") {
        setRoute("ops");
      } else if (hostname.startsWith("owner.") || pathname === "/owner") {
        setRoute("owner");
      } else {
        setRoute("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);


  // On App startup: restore session and protect /ops and /owner.
  // IMPORTANT: This effect must ONLY run once at startup (guarded by hasInitializedSession).
  // It must NOT re-run on every fetchState() call, otherwise adminTab gets reset to the
  // default landing tab after every booking / payment / room-assignment action.
  useEffect(() => {
    if (isLoading) return;
    // Already initialized — do not re-run session logic on subsequent data refreshes.
    if (hasInitializedSession.current) return;
    hasInitializedSession.current = true;

    const stored = getStoredSession();
    const isProtectedRoute = route === "ops" || route === "owner";

    if (stored) {
      setIsStaffLoggedIn(true);
      setStaffUser({ username: stored.username, role: stored.role });

      // Set default landing tab only on the very first app boot, not on data refresh.
      setAdminTab(route === "ops" ? "serviceCenter" : "ownerDashboard");

      // If user is on public landing but has an active session, open correct protected route.
      if (!isProtectedRoute) {
        const targetPath = ROLE_ROUTES[stored.role];
        window.history.pushState({}, "", targetPath);
        setRoute(stored.role === "reception" ? "ops" : "owner");
      }

      return;
    }

    // No valid session
    setIsStaffLoggedIn(false);
    setStaffUser(null);

    if (isProtectedRoute) {
      setShowStaffLogin(true);
    }
  }, [route, isLoading]);



  const handleNavigate = (newRoute: string) => {
    setRoute(newRoute);
    const targetPath = newRoute === "home" ? "/" : `/${newRoute}`;
    window.history.pushState({}, "", targetPath);
  };

  const selectBookingForCheckin = (id: string) => {
    setPreselectedBookingId(id);
    setCurrentTab("echeckin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans text-slate-900">
        <Hotel className="w-12 h-12 text-indigo-600 animate-bounce mb-3" />
        <h3 className="font-bold text-lg">Booting Property Management System...</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Spinning up Express controllers & loading state locks</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-indigo-600/20 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 0. DYNAMIC DNS MULTI-DOMAIN ROUTING SIMU-BAR (dev-only) */}
      {DEV_MODE && (
        <SubdomainSimulator currentRoute={route} onNavigate={handleNavigate} />
      )}


      {/* PERSISTENT FLOATING DOCUMENTATION TOGGLE (dev-only) */}
      {DEV_MODE && (
        <button
          type="button"
          onClick={() => setShowDevDocs(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow-xl font-bold text-xs flex items-center gap-2 cursor-pointer border border-indigo-500/20"
        >
          <Database className="w-4 h-4" />
          <span>View SQL & Schemas</span>
        </button>
      )}


      {/* 1. SEPARATED SUBDOMAINS OR PATHS ROUTER */}
      {route === "guest" ? (

        /* GUEST EXPERIENCES PORTAL ENGINE */
        <div id="hotel-guest-landscape" className="flex flex-col min-h-screen justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          <UnifiedGuestPortal
            bookings={bookings}
            guests={guests}
            rooms={rooms}
            roomTypes={roomTypes}
            serviceRequests={serviceRequests}
            tourismInquiries={tourismInquiries}
            feedbacks={feedbacks}
            onAddRequest={handleAddRequest}
            onAddInquiry={handleAddInquiry}
            onAddFeedback={handleAddFeedback}
            onUploadCheckin={handleUploadCheckin}
            onRoomUpgrade={handleRoomUpgrade}
          />
          <CustomerFooter />
        </div>
        ) : route === "ops" || route === "owner" ? (
          /* STAFF PMS CONSOLE WITH RESTRICTED ROLE VIEWS */
          isStaffLoggedIn ? (

          <div id="staff-admin-environment" className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Staff Top Nav */}
            <header className="bg-slate-900 text-white border-b border-slate-850 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold font-sans text-sm tracking-tight text-white block">
                        {route === "ops" ? "Operations Control (ops.)" : "Owner Dashboard (owner.)"}
                      </span>
                      <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-widest leading-none block mt-0.5">
                        {route === "ops" ? "Front Desk Operator Terminal" : "Executive Level Audit"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end text-xs font-mono">
                      <span className="font-bold text-slate-200">Hello, {staffUser?.name}</span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase">{staffUser?.role} operator</span>
                    </div>

                    {/* Real-time Notification Center */}
                    <div className="relative">
                      <button
                        onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                        title="View active notifications feed"
                        className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 relative transition-colors cursor-pointer flex items-center justify-center animate-pulse"
                      >
                        <Bell className="w-4 h-4 text-slate-200" />
                        {notifications.some((n) => !n.isRead) && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white animate-pulse">
                            {notifications.filter((n) => !n.isRead).length}
                          </span>
                        )}
                      </button>

                      {showNotificationCenter && (
                        <div className="absolute right-0 mt-3.5 w-80 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50 text-xs">
                          <div className="p-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
                            <span className="font-bold text-slate-200 uppercase font-mono tracking-wider text-[9px]">
                              🔔 Active Notification Stream
                            </span>
                            {notifications.some((n) => !n.isRead) && (
                              <button
                                onClick={() => {
                                  handleMarkNotificationsRead();
                                  setShowNotificationCenter(false);
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-transparent border-none cursor-pointer"
                              >
                                Mark all Read
                              </button>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-slate-850/60">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-slate-500 font-mono text-[10px] italic">
                                Zero unread alerts currently.
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className={`p-3.5 hover:bg-slate-850/50 transition-colors ${
                                    !n.isRead ? "bg-indigo-950/20 border-l-2 border-indigo-500 pl-3" : "opacity-60"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1 overflow-hidden">
                                    <span className="font-bold text-slate-100 text-[11px] leading-tight pr-2">
                                      {n.title}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">
                                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-[10.5px] leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleResetPMS}
                      title="Wipe custom entries and restore pre-populated guests, bookings and occupied rooms indicators"
                      className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />Reseed DB
                    </button>

                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Logout Desk
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff role-restricted tabs strip */}
              <div className="bg-slate-950 border-t border-slate-800 py-1.5 px-4 overflow-x-auto">
                <div className="max-w-7xl mx-auto flex gap-1.5">
                  {(route === "ops"
                    ? [
                        { id: "serviceCenter", label: "🚨 Live Service Center" },
                        { id: "rooms", label: "🔑 Reception Dashboard" },
                        { id: "bookings", label: "📬 Reservations" },
                        { id: "housekeeping", label: "🧹 Housekeeping" },
                        { id: "billing", label: "🧾 Billing & GST" },
                        { id: "transport", label: "🚕 Transport Logistics" },
                        { id: "guests", label: "🛎&nbsp; Guest Management" }
                      ]
                    : [
                        { id: "ownerDashboard", label: "👑 Owner Revenue Dashboard" },
                        { id: "dashboard", label: "📊 Operations Analytics" },
                        { id: "discountAuditor", label: "🛡️ Discount Monitoring" },
                        { id: "shifts", label: "⏰ Shift Management" },
                        { id: "auditLogs", label: "📜 System Activity Logs" }
                      ]
                  ).map((st) => (

                    <button
                      key={st.id}
                      onClick={() => setAdminTab(st.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        adminTab === st.id
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      dangerouslySetInnerHTML={{ __html: st.label }}
                    />
                  ))}
                </div>
              </div>
            </header>

            {/* Staff Content workspace */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {adminTab === "ownerDashboard" && (
                <OwnerControlCenter
                  bookings={bookings}
                  guests={guests}
                  rooms={rooms}
                  roomTypes={roomTypes}
                  payments={payments}
                  serviceRequests={serviceRequests}
                  tourismInquiries={tourismInquiries}
                  feedbacks={feedbacks}
                  onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                />
              )}

              {adminTab === "dashboard" && (
                <DashboardOverview
                  rooms={rooms}
                  bookings={bookings}
                  guests={guests}
                  payments={payments}
                  notifications={notifications}
                  onMarkNotificationsRead={handleMarkNotificationsRead}
                  setAdminSubTab={setAdminTab}
                  staffRole={staffUser?.role}
                />
              )}

              {adminTab === "serviceCenter" && (
                <LiveServiceCenter
                  serviceRequests={serviceRequests}
                  onUpdateServiceRequest={handleUpdateServiceRequest}
                  onRefresh={fetchState}
                />
              )}
              
              {adminTab === "rooms" && (
                <RoomManagement
                  rooms={rooms}
                  roomTypes={roomTypes}
                  bookings={bookings}
                  guests={guests}
                  onUpdateRoomStatus={handleUpdateRoomStatus}
                />
              )}

              {adminTab === "bookings" && (
                <BookingManagement
                  bookings={bookings}
                  guests={guests}
                  rooms={rooms}
                  roomTypes={roomTypes}
                  onNewBooking={handleNewBooking}
                  onUpdateBooking={handleUpdateBooking}
                  onNavigateToTab={setAdminTab}
                />
              )}

              {adminTab === "housekeeping" && (
                <HousekeepingManagement
                  rooms={rooms}
                  roomTypes={roomTypes}
                  bookings={bookings}
                  guests={guests}
                  onUpdateRoomStatus={handleUpdateRoomStatus}
                />
              )}

              {adminTab === "transport" && (
                <TransportManagement
                  bookings={bookings}
                  guests={guests}
                  onUpdateBooking={handleUpdateBooking}
                />
              )}

              {adminTab === "billing" && (
                <BillingManagement
                  bookings={bookings}
                  guests={guests}
                  rooms={rooms}
                  roomTypes={roomTypes}
                  payments={payments}
                  staffUser={staffUser}
                  onUpdateBooking={handleUpdateBooking}
                />
              )}

              {adminTab === "guests" && (
                <GuestProfileList
                  guests={guests}
                  bookings={bookings}
                  documents={documents}
                />
              )}

              {adminTab === "shifts" && (
                <ShiftManagement
                  bookings={bookings}
                  guests={guests}
                  payments={payments}
                  staffUser={staffUser}
                />
              )}

              {adminTab === "discountAuditor" && (
                <DiscountGovernance
                  bookings={bookings}
                  guests={guests}
                  roomTypes={roomTypes}
                />
              )}

              {adminTab === "auditLogs" && (
                <AuditTimeline
                  activityLogs={activityLogs}
                />
              )}
            </main>

            <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-slate-500 text-[10px] font-mono leading-none">
              <span>Authorized hotel terminal logged to Grand Crest 18 Park St. Work session active. Secure environment.</span>
            </footer>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-12 bg-slate-950 text-center text-slate-350 min-h-[450px]">
            <div className="max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <span className="text-4xl">🔐</span>
              <h3 className="text-xl font-bold font-sans text-white">Session Cleared</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                You have logged out of the staff database terminal. Please select either the <strong className="font-mono text-indigo-400">ops</strong> or <strong className="font-mono text-purple-400">owner</strong> subdomain bar above to reset, or trigger manual sign-ins.
              </p>
              <button
                onClick={() => setShowStaffLogin(true)}
                className="px-6 py-2.5 bg-indigo-650 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Sign In Manually
              </button>
            </div>
          </div>
        )
      ) : (
        /* 2. REGULAR GUEST PUBLIC WEBSITE & BOOKING PORTAL */
        <div id="hotel-guest-landscape" className="flex flex-col min-h-screen justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          
          <CustomerHeader
            currentTab={currentTab}
            setTab={setCurrentTab}
            onAdminClick={() => setShowStaffLogin(true)}
            onMyStayClick={() => handleNavigate("guest")}
            bookingCounts={bookings.length}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          <main className="flex-grow pb-24 md:pb-0">
            {["home", "rooms", "explore", "dining", "locality", "gallery", "offers", "contact", "booking"].includes(currentTab) && (
              <CustomerWebsite
                roomTypes={roomTypes}
                rooms={rooms}
                bookings={bookings}
                currentTab={currentTab}
                setTab={setCurrentTab}
                onNewBooking={handleNewBooking}
              />
            )}

            {currentTab === "lookup" && (
              <BookingLookupPortal
                bookings={bookings}
                guests={guests}
                roomTypes={roomTypes}
                messageLogs={messageLogs}
                setTab={setCurrentTab}
                onSelectBookingForCheckin={selectBookingForCheckin}
              />
            )}

            {currentTab === "echeckin" && (
              <ECheckInPortal
                bookings={bookings}
                guests={guests}
                onUploadCheckin={handleUploadCheckin}
                preselectedBookingId={preselectedBookingId}
              />
            )}

            {currentTab === "portal" && (
              <GuestServicePortal
                bookings={bookings}
                guests={guests}
                onAddRequest={handleAddRequest}
                onAddInquiry={handleAddInquiry}
                onAddFeedback={handleAddFeedback}
                activeRequests={serviceRequests}
                activeInquiries={tourismInquiries}
              />
            )}
          </main>

          <CustomerFooter />
        </div>
      )}

      {/* STAFF SSO AUTHENTICATION POPUP OVERLAY */}
      {showStaffLogin && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowStaffLogin(false)}
        />
      )}

      {/* DYNAMIC SCANNED DEV DATABASE DOCUMENTATION MODAL DRAWER (dev-only) */}
      {DEV_MODE && showDevDocs && (
        <div id="floating-developer-drawer-overlay" className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-stone-850">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-stone-200">

            {/* Header controls */}
            <div className="bg-stone-900 text-stone-100 p-5 flex justify-between items-center border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <div>
                  <h2 className="font-extrabold text-white text-base">Developer Spec Console</h2>
                  <p className="text-[10px] text-stone-400 font-mono">SUPABASE DDL SCHEMA • PROJECT FOLDERS • DIRECTORY SCHEMAS</p>
                </div>
              </div>
              <button
                onClick={() => setShowDevDocs(false)}
                className="p-1 px-3 bg-red-800 hover:bg-red-900 transition-colors text-white font-bold text-xs font-mono rounded"
              >
                ✕ Close Console
              </button>
            </div>

            {/* Embedded Docs viewer */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {/* <DevDocsViewer /> */}
            </div>

            {/* Footer warning */}
            <div className="bg-stone-50 p-4 border-t border-stone-250 text-center text-[10px] text-stone-500 font-mono">
              <span>This console can be toggled via the floating bottom-right corner action button anytime. Full-stack PMS active.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
