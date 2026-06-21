import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Truck, Users, CalendarCheck, ShieldAlert, FileSpreadsheet, Plus, HelpCircle, 
  MapPin, CheckCircle, RefreshCcw, Landmark, Clipboard 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Operator, Bus, Route, Trip, SupportTicket } from "../types";

interface OperatorDashboardProps {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

export default function OperatorDashboard({ currentUser, setCurrentUser }: OperatorDashboardProps) {
  const [operatorProfile, setOperatorProfile] = useState<Operator | null>(null);
  const [stats, setStats] = useState<any>({
    revenue: 0,
    fleetCount: 0,
    activeTripsCount: 0,
    bookingsCount: 0,
    bookings: []
  });

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // Form states - Add Bus
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [busPlateNumber, setBusPlateNumber] = useState("");
  const [busTypeSelection, setBusTypeSelection] = useState<any>("VIP_SOFA");
  const [busTotalSeats, setBusTotalSeats] = useState(30);
  const [busAmenities, setBusAmenities] = useState<string>("A/C, WiFi, USB Charging");

  // Form states - Schedule Trip
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleBusId, setScheduleBusId] = useState("");
  const [scheduleRouteId, setScheduleRouteId] = useState("");
  const [scheduleBasePrice, setScheduleBasePrice] = useState(1200);
  const [scheduleDepartureTime, setScheduleDepartureTime] = useState("2026-06-22T08:00");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [activeSegment, setActiveSegment] = useState<"insights" | "fleet" | "schedule" | "tickets">("insights");

  useEffect(() => {
    if (currentUser && currentUser.role === "OPERATOR") {
      loadOperatorProfile();
    }
  }, [currentUser]);

  const loadOperatorProfile = async () => {
    setLoading(true);
    try {
      // Find operator profile
      const res = await fetch("/api/admin/operators");
      const list = await res.json();
      const profile = list.find((o: any) => o.userId === currentUser?.id);
      
      if (profile) {
        setOperatorProfile(profile);
        loadStats(profile.id);
        loadBuses(profile.id);
        loadRoutes();
        loadSupportTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (opId: string) => {
    try {
      const res = await fetch(`/api/operator/stats/${opId}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBuses = async (opId: string) => {
    try {
      const res = await fetch(`/api/operator/buses/${opId}`);
      const list = await res.json();
      setBuses(list);
      if (list.length > 0) {
        setScheduleBusId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRoutes = async () => {
    try {
      const res = await fetch("/api/routes");
      const list = await res.json();
      setRoutes(list);
      if (list.length > 0) {
        setScheduleRouteId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSupportTickets = async () => {
    try {
      const res = await fetch("/api/support/tickets");
      const list = await res.json();
      setSupportTickets(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorProfile || !busPlateNumber) return;

    try {
      const res = await fetch("/api/operator/buses-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId: operatorProfile.id,
          companyName: operatorProfile.companyName,
          plateNumber: busPlateNumber,
          busType: busTypeSelection,
          amenities: busAmenities.split(",").map(a => a.trim()),
          totalSeats: busTotalSeats
        })
      });
      if (res.ok) {
        setSuccessMessage("Bus carrier successfully registered onto fleet list.");
        setShowAddBusModal(false);
        setBusPlateNumber("");
        loadBuses(operatorProfile.id);
        loadStats(operatorProfile.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorProfile || !scheduleBusId || !scheduleRouteId) return;

    try {
      const res = await fetch("/api/operator/trips-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: scheduleBusId,
          routeId: scheduleRouteId,
          departureTime: new Date(scheduleDepartureTime).toISOString(),
          basePrice: scheduleBasePrice,
          driverId: "dr_1" // assign master verified driver
        })
      });
      if (res.ok) {
        setSuccessMessage("Route Daily schedule Published live onto Passenger search results!");
        setShowScheduleModal(false);
        loadStats(operatorProfile.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Exporting data to local sheet client
  const triggerCsvExport = () => {
    if (stats.bookings.length === 0) {
      alert("No active passenger bookings recorded on your carriers to extract.");
      return;
    }
    const headers = "BookingID,PassengerName,PhoneNumber,FareCollectible,PaymentGateway,SeatsAllocated\n";
    const rows = stats.bookings.map((b: any) => `${b.id},${b.fullName},${b.phoneNumber},${b.totalFare},${b.paymentMethod},"${b.seatNumbers.join("-")}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `YatraNepal_${operatorProfile?.companyName.replace(/\s+/g, '')}_ReceiptLogs.csv`;
    link.click();
  };

  if (!currentUser || currentUser.role !== "OPERATOR") {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-6 shadow-xl border border-gray-105">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-slate-900 rounded-full flex items-center justify-center text-white font-bold mx-auto">
            🏢
          </div>
          <h3 className="text-xl font-bold text-gray-900">Yatra Operator Gatehouse</h3>
          <p className="text-xs text-gray-500">Sign in with Operator credentials to manage vehicle scheduling</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          // Simulate simple verification
          loadOperatorProfile();
        }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Operator Phone Number (registered)</label>
            <input
              type="text"
              required
              defaultValue="9801122334"
              className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm w-full font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              To login instantly, keep pre-seeded operator phone: <b>9801122334</b> (OTP: <b>123456</b>)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-900 text-white py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
          >
            Acknowledge Operator Auth
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white min-h-[500px]">
      
      {/* Header telemetry and statuses */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Carrier operator board
          </span>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-1">
            {operatorProfile ? operatorProfile.companyName : "Yatra Travels Pvt Ltd"}
            {operatorProfile?.isApproved ? (
              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                ✓ Official Operator Approvals
              </span>
            ) : (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold animate-pulse">
                ⏳ Koshi Fleet Verification Pending
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500">Government Registry of Nepal PAN No: {operatorProfile?.panNumber || "N/A"}</p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddBusModal(true)}
            className="bg-slate-900 hover:bg-slate-950 text-white rounded-xl py-2 px-3.5 text-xs font-semibold flex items-center gap-1 leading-none shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-red-656 hover:bg-red-700 text-white bg-red-600 rounded-xl py-2 px-3.5 text-xs font-semibold flex items-center gap-1 leading-none shadow-sm cursor-pointer"
          >
            <CalendarCheck className="h-4 w-4" /> Schedule Trip
          </button>
          
          <button
            onClick={() => setCurrentUser(null)}
            className="text-xs text-gray-400 hover:text-black border px-3 py-2 rounded-xl"
          >
            Log Out Operator
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs mb-6 flex justify-between items-center whitespace-pre-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Analytics Bento Grid Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total revenue */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Carrier Revenue Collectible</p>
            <h4 className="text-2xl font-extrabold text-slate-900">Nrs {stats.revenue}</h4>
            <p className="text-[10px] text-emerald-600 font-semibold">Net collected payouts (8% system comm deducted)</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Fleet capacity count */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fleet vehicles active</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{stats.fleetCount} Carriers</h4>
            <p className="text-[10px] text-gray-500">Sleepers, VIP Sofa & Deluxe fleets</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center font-bold">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        {/* Dynamic passenger counts */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acquired bookings</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{stats.bookingsCount} Tickets</h4>
            <p className="text-[10px] text-gray-500">Seat selections confirmed on boards</p>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Commission saving highlights */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active departures</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{stats.activeTripsCount} Scheduled</h4>
            <p className="text-[10px] text-gray-500">Published live on customer searches</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main body split layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Left index list */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveSegment("insights")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              activeSegment === "insights" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Clipboard className="h-4.5 w-4.5" /> Bookings & Financial Manifest
          </button>
          
          <button
            onClick={() => setActiveSegment("fleet")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              activeSegment === "fleet" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Truck className="h-4.5 w-4.5" /> Fleet Management ({buses.length})
          </button>

          <button
            onClick={() => setActiveSegment("tickets")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              activeSegment === "tickets" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <HelpCircle className="h-4.5 w-4.5" /> Support Queries ({supportTickets.length})
          </button>
        </div>

        {/* Right Segment Displays */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Segment: Bookings list */}
          {activeSegment === "insights" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-sm">Operator Passenger Logs Ledger</h4>
                
                <button
                  onClick={triggerCsvExport}
                  className="text-xs text-slate-800 border border-gray-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 bg-white cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Receipts CSV
                </button>
              </div>

              {stats.bookings.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">No active booking receipts linked to your fleet yet today.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 font-bold bg-slate-50/50">
                        <th className="py-2.5 px-3">Booking ID</th>
                        <th className="py-2.5 px-3">Traveler Name</th>
                        <th className="py-2.5 px-3">Route Path</th>
                        <th className="py-2.5 px-3">Seats</th>
                        <th className="py-2.5 px-3">Fare Charge</th>
                        <th className="py-2.5 px-3">Gateway</th>
                        <th className="py-2.5 px-3">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.bookings.map((bk: any) => (
                        <tr key={bk.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{bk.id}</td>
                          <td className="py-2.5 px-3">{bk.fullName}</td>
                          <td className="py-2.5 px-3">{bk.tripDetails.fromCity} ➔ {bk.tripDetails.toCity}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold">{bk.seatNumbers.join(", ")}</td>
                          <td className="py-2.5 px-3 font-bold text-red-600">Nrs {bk.totalFare}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-500">{bk.paymentMethod}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                              bk.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            }`}>
                              {bk.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Segment: Fleet list */}
          {activeSegment === "fleet" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Active vehicle profiles listed</h4>

              {buses.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No fleet vehicle registrations. Add standard buses using form.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buses.map((bus) => (
                    <div key={bus.id} className="border border-gray-150 rounded-xl p-4 flex gap-4 bg-white hover:border-slate-350">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img 
                          referrerPolicy="no-referrer"
                          src={bus.photos[0]} 
                          className="w-full h-full object-cover" 
                          alt="bus" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] bg-red-50 text-red-656 font-bold px-1.5 rounded uppercase">
                          {bus.busType}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm font-mono">{bus.plateNumber}</h5>
                        <p className="text-[11px] text-gray-500 font-semibold">{bus.totalSeats} seats capacity</p>
                        <div className="flex gap-1 flex-wrap pt-1">
                          {bus.amenities.map((am, ai) => (
                            <span key={ai} className="text-[8px] bg-gray-100 text-gray-600 px-1 rounded">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Segment: Support Queries */}
          {activeSegment === "tickets" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Raised Traveler Support Logs list</h4>
              
              {supportTickets.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No open customer support logs raised.</p>
              ) : (
                <div className="space-y-3">
                  {supportTickets.map((t) => (
                    <div key={t.id} className="border border-gray-200 bg-white rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-2">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">{t.id}</span>
                          <h5 className="font-bold text-gray-800 text-sm">{t.subject}</h5>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                          t.status === "OPEN" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-656 leading-relaxed font-normal italic">
                        "{t.message}"
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                        <span>LODGED BY: {t.senderName} ({t.senderPhone})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Operator Add Bus Modal */}
      <AnimatePresence>
        {showAddBusModal && operatorProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-bold text-gray-900 text-sm">Add New Fleet Vehicle</h4>
                <button onClick={() => setShowAddBusModal(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <form onSubmit={handleAddBus} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">State plate registration number</label>
                  <input
                    type="text"
                    required
                    placeholder="Ba 3 Kha 1234"
                    value={busPlateNumber}
                    onChange={(e) => setBusPlateNumber(e.target.value)}
                    className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full text-slate-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold mb-1">Bus type</label>
                    <select
                      value={busTypeSelection}
                      onChange={(e) => setBusTypeSelection(e.target.value)}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full focus:outline-none"
                    >
                      <option value="VIP_SOFA">VIP SOFA (28 seats)</option>
                      <option value="SLEEPER">SLEEPER (24 seats)</option>
                      <option value="AC_DELUXE">AC DELUXE (30 seats)</option>
                      <option value="DELUXE">DELUXE (35 seats)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold mb-1">Seat cap</label>
                    <input
                      type="number"
                      required
                      value={busTotalSeats}
                      onChange={(e) => setBusTotalSeats(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full text-slate-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Amenities listed (commas)</label>
                  <input
                    type="text"
                    value={busAmenities}
                    onChange={(e) => setBusAmenities(e.target.value)}
                    placeholder="A/C, WiFi, USB, Water bottle"
                    className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Register Bus Profile to Fleet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Operator Schedule Trip Modal */}
      <AnimatePresence>
        {showScheduleModal && operatorProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-bold text-gray-900 text-sm">Schedule Daily Transit Route</h4>
                <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              <form onSubmit={handleScheduleTrip} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Assign carrier vehicle</label>
                  <select
                    value={scheduleBusId}
                    onChange={(e) => setScheduleBusId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full focus:outline-none"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.plateNumber} ({b.busType.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Nepal route link path</label>
                  <select
                    value={scheduleRouteId}
                    onChange={(e) => setScheduleRouteId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full focus:outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fromCity} ➔ {r.toCity} ({r.distanceKm} km, {r.estimatedHrs} hrs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold mb-1">Base Price (Nrs)</label>
                    <input
                      type="number"
                      required
                      value={scheduleBasePrice}
                      onChange={(e) => setScheduleBasePrice(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold mb-1">Date & Hour</label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduleDepartureTime}
                      onChange={(e) => setScheduleDepartureTime(e.target.value)}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Publish Schedule Route live
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
