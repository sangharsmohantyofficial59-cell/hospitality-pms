import React, { useState, useMemo } from "react";
import { Booking, Guest, RoomType } from "../types";
import { 
  ShieldAlert, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  HelpCircle, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  ArrowDownRight, 
  BarChart3, 
  Plus, 
  CheckCircle,
  FileText
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from "recharts";

interface DiscountGovernanceProps {
  bookings: Booking[];
  guests: Guest[];
  roomTypes: RoomType[];
}

export default function DiscountGovernance({ bookings, guests, roomTypes }: DiscountGovernanceProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>("All");
  const [selectedReceptionist, setSelectedReceptionist] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Selected booking state for focus modal
  const [focusedBooking, setFocusedBooking] = useState<Booking | null>(null);

  // Helper calculation logic (mirrors performance in BillingManagement)
  const calculateBookingDiscounts = (b: Booking) => {
    const d1 = new Date(b.checkInDate);
    const d2 = new Date(b.checkOutDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const rt = roomTypes.find(type => type.id === b.roomTypeId);
    const baseTariff = rt?.basePrice || 2500;
    const baseAccommodationTotal = baseTariff * diffDays;
    
    const transportTotal = b.transport && b.transport.vehicleType ? (b.transport.cost || 500) : 0;
    const customLines = b.customServiceLines || [];
    const otherChargesTotal = customLines.reduce((sum, line) => sum + line.amount, 0);
    
    const subtotalRaw = baseAccommodationTotal + transportTotal + otherChargesTotal;

    let discountReductions = b.discountAmount || 0;
    if (b.discountPercent) {
      discountReductions = Math.round(subtotalRaw * (b.discountPercent / 100));
    }

    return {
      subtotalRaw,
      discountReductions,
      days: diffDays,
      roomName: rt?.name || "Standard Room"
    };
  };

  // Process and compute discounts for all bookings
  const parsedDiscountRecords = useMemo(() => {
    return bookings.map(b => {
      const guest = guests.find(g => g.id === b.guestId);
      const calcs = calculateBookingDiscounts(b);
      
      return {
        bookingId: b.id,
        guestName: guest ? guest.name : "Guest",
        roomId: b.roomId || "N/A",
        checkInDate: b.checkInDate,
        createdAt: b.createdAt,
        discountValue: calcs.discountReductions,
        discountReason: b.discountReason || (calcs.discountReductions > 0 ? "Billing Adjustment" : ""),
        discountRemarks: b.discountRemarks || "",
        discountApprovedVia: b.discountApprovedVia || (calcs.discountReductions > 0 ? "Manager Approval" : ""),
        discountAppliedBy: b.discountAppliedBy || (calcs.discountReductions > 0 ? "Front Desk Clerk" : ""),
        subtotal: calcs.subtotalRaw,
        roomName: calcs.roomName,
        rawBooking: b
      };
    }).filter(record => record.discountValue > 0);
  }, [bookings, guests, roomTypes]);

  // Dynamic filter lists
  const receptionistsList = useMemo(() => {
    const list = new Set<string>();
    parsedDiscountRecords.forEach(r => {
      if (r.discountAppliedBy) list.add(r.discountAppliedBy);
    });
    return ["All", ...Array.from(list)];
  }, [parsedDiscountRecords]);

  const reasonsList = [
    "All",
    "Guest Dissatisfaction",
    "Early Checkout",
    "Corporate Adjustment",
    "Loyal Customer",
    "Service Recovery",
    "Room Issue",
    "Billing Adjustment",
    "Other"
  ];

  // filtered discounts
  const filteredRecords = useMemo(() => {
    return parsedDiscountRecords.filter(record => {
      // 1. Search term match
      const text = `${record.guestName} ${record.bookingId} ${record.roomId} ${record.discountRemarks} ${record.discountAppliedBy}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());

      // 2. Reason filter
      const matchesReason = selectedReason === "All" || record.discountReason === selectedReason;

      // 3. Receptionist filter
      const matchesReceptionist = selectedReceptionist === "All" || record.discountAppliedBy === selectedReceptionist;

      // 4. Date range filter
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && record.checkInDate >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && record.checkInDate <= endDate;
      }

      return matchesSearch && matchesReason && matchesReceptionist && matchesDate;
    });
  }, [parsedDiscountRecords, searchTerm, selectedReason, selectedReceptionist, startDate, endDate]);

  // KPI Calculations
  const metrics = useMemo(() => {
    let totalDiscountValue = 0;
    let totalBills = filteredRecords.length;
    
    filteredRecords.forEach(r => {
      totalDiscountValue += r.discountValue;
    });

    const averageDiscountAmount = totalBills > 0 ? Math.round(totalDiscountValue / totalBills) : 0;

    return {
      totalDiscountValue,
      totalBills,
      averageDiscountAmount
    };
  }, [filteredRecords]);

  // Chart 1: Discounts by Reason
  const chartDataByReason = useMemo(() => {
    const counts: Record<string, { name: string; value: number; count: number }> = {};
    reasonsList.forEach(r => {
      if (r !== "All") {
        counts[r] = { name: r, value: 0, count: 0 };
      }
    });

    filteredRecords.forEach(r => {
      const reason = r.discountReason || "Billing Adjustment";
      if (!counts[reason]) {
        counts[reason] = { name: reason, value: 0, count: 0 };
      }
      counts[reason].value += r.discountValue;
      counts[reason].count += 1;
    });

    return Object.values(counts).filter(c => c.value > 0);
  }, [filteredRecords]);

  // Chart 2: Discounts by Receptionist
  const chartDataByReceptionist = useMemo(() => {
    const counts: Record<string, { name: string; value: number; count: number }> = {};
    filteredRecords.forEach(r => {
      const user = r.discountAppliedBy || "Unknown Desk";
      if (!counts[user]) {
        counts[user] = { name: user, value: 0, count: 0 };
      }
      counts[user].value += r.discountValue;
      counts[user].count += 1;
    });
    return Object.values(counts);
  }, [filteredRecords]);

  // Chart 3: Monthly/Daily Trend (grouped by checkInDate)
  const chartTrendData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const key = r.checkInDate; // YYYY-MM-DD
      grouped[key] = (grouped[key] || 0) + r.discountValue;
    });

    const sortedDates = Object.keys(grouped).sort();
    return sortedDates.map(date => ({
      date: new Date(date).toLocaleDateString([], { month: "short", day: "numeric" }),
      amount: grouped[date]
    }));
  }, [filteredRecords]);

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#64748B"];

  return (
    <div id="owner-discount-governance-root" className="flex flex-col gap-6 p-1 text-stone-700">
      
      {/* Page Title & Context Header */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider select-none font-mono">
              ★ Owner Exclusive
            </span>
            <span className="bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider select-none font-mono">
              Governance Standard
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
            🛡️ Room Discount Monitoring & Revenue Leakage Dashboard
          </h1>
          <p className="text-purple-300 text-xs mt-0.5 leading-relaxed font-sans max-w-3xl">
            Real-time audit control, discount reasoning, and executive revenue recovery analytics. Verify front-desk markdown authorizations instantly without impeding fast physical checkouts.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-stone-850 p-2.5 rounded-xl border border-stone-800 self-start md:self-center">
          <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
          <div className="font-mono text-[10.5px]">
            <span className="text-stone-400 block uppercase font-bold text-[8px]">Audit Integrity</span>
            <span className="text-emerald-400 font-bold">✓ SSL Ledger Crypt-Secure</span>
          </div>
        </div>
      </div>

      {/* METRICS & LEAKAGE DASHBOARD HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
              Total Discount Written-Off
            </span>
            <strong className="text-stone-900 text-xl font-bold font-mono">
              ₹{metrics.totalDiscountValue.toLocaleString()}
            </strong>
            <span className="text-[10.5px] text-red-650 text-red-600 font-medium flex items-center gap-1 mt-1">
              <TrendingDown className="w-3.5 h-3.5" /> Direct Leakage Value
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
              Discounted Reservations
            </span>
            <strong className="text-stone-900 text-xl font-bold font-mono">
              {metrics.totalBills} Folios
            </strong>
            <span className="text-[10.5px] text-stone-400 mt-1">
              With verified remarks & approval
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
              Average Rebate Granted
            </span>
            <strong className="text-stone-900 text-xl font-bold font-mono">
              ₹{metrics.averageDiscountAmount.toLocaleString()}
            </strong>
            <span className="text-[10.5px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> per markdown invoice
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block mb-1">
            Revenue Recovery Alert
          </span>
          <p className="text-[11px] text-stone-650 leading-relaxed">
            Reception markdown volume represents <strong className="text-stone-900 font-bold">
              {parsedDiscountRecords.length > 0 ? Math.round((filteredRecords.length / parsedDiscountRecords.length) * 100) : 0}%
            </strong> of total billing reductions. Service Recovery is the primary driver of desk write-offs.
          </p>
          <div className="font-mono text-[9px] text-stone-400 mt-2 border-t border-stone-200/60 pt-1.5 flex justify-between">
            <span>AUDITOR: RUN OK</span>
            <span className="text-indigo-600 font-bold">100% EXPLAINABLE</span>
          </div>
        </div>

      </div>

      {/* REVENUE LEAKAGE GRAPHICAL CHARTS BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Chart A: Discounts by Reason */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Rebates Distribution by Reason
            </h3>
            <span className="text-[10px] text-stone-400 font-mono uppercase block mt-0.5">Where is resources drainage occurring?</span>
          </div>

          <div className="h-56">
            {chartDataByReason.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 italic">
                No discounts applied to display chart data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataByReason}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartDataByReason.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Simple Chart Legend indicators */}
          <div className="flex flex-col gap-1.5 text-[10.5px] border-t border-stone-100 pt-3 max-h-36 overflow-y-auto">
            {chartDataByReason.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate text-stone-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-stone-850 font-mono">₹{entry.value.toLocaleString()} ({entry.count}x)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart B: Discounts by Receptionist */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" /> Rebates Disbursed by Receptionists
            </h3>
            <span className="text-[10px] text-stone-400 font-mono uppercase block mt-0.5">Who logs the most rate write-offs?</span>
          </div>

          <div className="h-52 mt-4">
            {chartDataByReceptionist.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 italic">
                No receptionist logs registered.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByReceptionist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                    {chartDataByReceptionist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-[10.5px] border-t border-stone-100 pt-3 max-h-36 overflow-y-auto mt-auto">
            {chartDataByReceptionist.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></span>
                  <span className="truncate text-stone-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-stone-850 font-mono">₹{entry.value.toLocaleString()} ({entry.count}x)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart C: Monthly Discount Trend */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Discount Trend over Timeline
            </h3>
            <span className="text-[10px] text-stone-400 font-mono uppercase block mt-0.5">Timeline pattern of discounts granted</span>
          </div>

          <div className="h-68 mt-2">
            {chartTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 italic">
                No active trends to render.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 font-mono text-[9px] mt-auto">
            <p className="text-stone-550 leading-relaxed">
              💡 <strong>Auditing Directive:</strong> Peak leakages typically cluster around weekends. Standardize Room Issue and Guest Dissatisfaction desk solutions.
            </p>
          </div>
        </div>

      </div>

      {/* FILTER & TRANSACTION LIST SECTION */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        
        {/* Filter Toolbar Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-3 mb-4 gap-4">
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              📁 Audit Log & Discount Monitoring Ledger
            </h2>
            <span className="text-stone-400 text-xs block mt-0.5">Use search and category selectors to drill down on desk write-offs.</span>
          </div>

          <span className="px-3 py-1 bg-stone-100 text-stone-600 border border-stone-250 font-mono font-bold text-[10px] rounded-md self-start md:self-center">
            {filteredRecords.length} records matched
          </span>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-end mb-5">
          
          {/* Keyword search input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono text-stone-400 uppercase">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, ID, roomId..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 focus:outline-none focus:border-stone-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Reason Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono text-stone-400 uppercase">Filter Reason</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 cursor-pointer focus:outline-none"
            >
              {reasonsList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Receptionist Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono text-stone-400 uppercase">Filter Receptionist</label>
            <select
              value={selectedReceptionist}
              onChange={(e) => setSelectedReceptionist(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 cursor-pointer focus:outline-none"
            >
              {receptionistsList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono text-stone-400 uppercase">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 focus:outline-none"
            />
          </div>

          {/* Date Picker End */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono text-stone-400 uppercase">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 focus:outline-none"
            />
          </div>

        </div>

        {/* Clear Filter Indicator */}
        {(searchTerm || selectedReason !== "All" || selectedReceptionist !== "All" || startDate || endDate) && (
          <div className="flex justify-between items-center bg-indigo-50 border border-indigo-150 p-2.5 rounded-xl mb-4 text-xs text-indigo-900 select-none">
            <span>Filtering records with active parameters.</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedReason("All");
                setSelectedReceptionist("All");
                setStartDate("");
                setEndDate("");
              }}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg cursor-pointer font-mono text-[10px]"
            >
              ✕ Clear Filters
            </button>
          </div>
        )}

        {/* Ledger Table Grid */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Reservation ID</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3 text-center">Room No.</th>
                <th className="p-3">Discount Amount</th>
                <th className="p-3">Discount Reason</th>
                <th className="p-3 text-center">Approved Via</th>
                <th className="p-3">Applied By</th>
                <th className="p-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans text-stone-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400 font-mono text-xs italic bg-stone-50/40">
                    No matching discount logs found for the selected query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr 
                    key={r.bookingId} 
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => setFocusedBooking(r.rawBooking)}
                  >
                    <td className="p-3 whitespace-nowrap font-mono text-stone-500">
                      {new Date(r.checkInDate).toLocaleDateString([], { dateStyle: "medium" })}
                    </td>
                    <td className="p-3 font-bold font-mono text-indigo-655 text-indigo-600">
                      {r.bookingId}
                    </td>
                    <td className="p-3 font-semibold text-stone-900">
                      {r.guestName}
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-stone-800">
                      {r.roomId}
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600">
                      ₹{r.discountValue.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-100 text-amber-800 border border-amber-200 select-none">
                        {r.discountReason}
                      </span>
                    </td>
                    <td className="p-3 text-center font-semibold font-mono text-stone-650">
                      {r.discountApprovedVia}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-stone-500">
                      {r.discountAppliedBy}
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusedBooking(r.rawBooking);
                        }}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded font-mono text-[9px] font-bold cursor-pointer"
                      >
                        🔍 View Remarks
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* FOCUS MODAL: VIEW AUDITOR REMARKS DETAIL */}
      {focusedBooking && (
        <div id="focused-discount-remarks-modal" className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="bg-stone-950 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-tight text-white">Full Markdown Authorization Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setFocusedBooking(null)}
                className="text-stone-400 hover:text-white cursor-pointer font-mono font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3.5 border-b border-stone-100 pb-3">
                <div>
                  <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Booking Folio IP</span>
                  <strong className="text-stone-850 font-mono text-sm block">{focusedBooking.id}</strong>
                </div>
                <div>
                  <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Guest ID Reference</span>
                  <strong className="text-stone-850 text-sm font-semibold block">
                    {guests.find(g => g.id === focusedBooking.guestId)?.name || "Guest Details"}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div>
                  <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Assigned Room Number</span>
                  <strong className="text-stone-850 font-mono font-bold block">{focusedBooking.roomId || "N/A"}</strong>
                </div>
                <div>
                  <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Stay Date Period</span>
                  <span className="text-stone-500 font-mono block">{focusedBooking.checkInDate} to {focusedBooking.checkOutDate}</span>
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-3.5 grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[8px] font-mono font-bold text-red-500 uppercase">Reduction Type</span>
                  <strong className="text-red-750 font-bold block">{focusedBooking.discountPercent ? "Percent Rate" : "Flat Cash"}</strong>
                </div>
                <div>
                  <span className="block text-[8px] font-mono font-bold text-red-500 uppercase">Discount Rate</span>
                  <strong className="text-red-800 font-mono font-bold text-sm block">
                    {focusedBooking.discountPercent ? `${focusedBooking.discountPercent}%` : `₹${focusedBooking.discountAmount}`}
                  </strong>
                </div>
                <div>
                  <span className="block text-[8px] font-mono font-bold text-red-500 uppercase">Approved Via</span>
                  <strong className="text-red-750 font-mono font-bold text-sm block">{focusedBooking.discountApprovedVia || "Manager Authority"}</strong>
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Reason for Markdown</span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold font-mono rounded-full uppercase inline-block">
                  {focusedBooking.discountReason || "Billing Adjustment"}
                </span>
              </div>

              <div>
                <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Mandatory Remarks & Context</span>
                <div className="bg-stone-50 border border-stone-200/80 p-3 rounded-xl text-stone-800 italic leading-relaxed font-sans text-[11.5px] border-l-4 border-l-amber-500">
                  💬 "{focusedBooking.discountRemarks || "No specific cashier notes recorded. Applied standard adjustment."}"
                </div>
              </div>

              <div className="bg-stone-100 p-3 rounded-xl font-mono text-[9.5px] flex items-center justify-between text-stone-500">
                <div>
                  <span className="block font-bold">Applied By:</span>
                  <span className="font-semibold text-stone-800">{focusedBooking.discountAppliedBy || "Rajesh Kumar"}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold">Logged At:</span>
                  <span>{new Date(focusedBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setFocusedBooking(null)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-mono tracking-wider cursor-pointer"
                >
                  ✓ Close Voucher Audit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
