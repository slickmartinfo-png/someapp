import React, { useState, useEffect } from "react";
import { 
  Search, Calendar, Users, MapPin, Bus, Heart, Bell, BellOff, User as UserIcon, Ticket, History, 
  Settings, ArrowLeft, ShieldCheck, CreditCard, Sparkles, CheckCircle2, AlertCircle, RefreshCcw, 
  Info, QrCode, ArrowRight, ArrowRightLeft, Smile, Phone, FileText, Send, Car, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Trip, Booking, Coupon } from "../types";
import YatraAI from "./YatraAI";

const ROUTE_DATA = [
  { from: "Kathmandu", to: "Pokhara", type: "Premium Coach", price: "Nrs 1,200", icon: "🏔️" },
  { from: "Kathmandu", to: "Chitwan", type: "Safari Executive", price: "Nrs 950", icon: "🐊" },
  { from: "Kathmandu", to: "Lumbini", type: "Peace Aircon", price: "Nrs 1,150", icon: "🪷" },
  { from: "Kathmandu", to: "Beni", type: "Annapurna Route", price: "Nrs 1,300", icon: "🏔️" },
  { from: "Kathmandu", to: "Biratnagar", type: "Eastern Highway", price: "Nrs 1,500", icon: "🌾" },
  { from: "Pokhara", to: "Lumbini", type: "Hills Highway", price: "Nrs 900", icon: "🌴" },
  { from: "Kathmandu", to: "Gorakhpur", type: "Commercial SUV", price: "Nrs 14,500", icon: "🚕" },
  { from: "Kathmandu", to: "Siliguri", type: "Direct Scorpio", price: "Nrs 16,000", icon: "🚕" },
  { from: "Pokhara", to: "Varanasi", type: "Ganges Transit", price: "Nrs 3,200", icon: "🛕" },
  { from: "Kakarbhitta", to: "Darjeeling", type: "Tea Garden Cab", price: "Nrs 5,500", icon: "🌲" },
];

function InfiniteRouteSlider({ 
  onClickRoute, 
  isTaxi = false 
}: { 
  onClickRoute: (from: string, to: string) => void;
  isTaxi?: boolean;
}) {
  const filteredRoutes = isTaxi 
    ? ROUTE_DATA.filter(r => r.from === "Kathmandu" && ["Gorakhpur", "Siliguri", "Birgunj"].includes(r.to) || r.to === "Varanasi" || r.to === "Darjeeling")
    : ROUTE_DATA.filter(r => !["Gorakhpur", "Siliguri", "Varanasi", "Darjeeling"].includes(r.to));

  // Multiple duplicates to allow smooth loop on all screens
  const duplicatedList = [...filteredRoutes, ...filteredRoutes, ...filteredRoutes, ...filteredRoutes];

  return (
    <div className="space-y-2 pt-2 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          💡 Quick Book Popular Direct Routes
        </span>
        <span className="text-[9px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded font-mono animate-pulse">
          Click to load & search
        </span>
      </div>
      
      <div className="w-full overflow-hidden relative bg-slate-50 border border-slate-200/60 rounded-2xl py-3.5">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
        
        <div className="relative flex overflow-x-hidden">
          <motion.div 
            className="flex gap-4 pr-4 py-1"
            animate={{ x: [0, -480] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              duration: 25
            }}
          >
            {duplicatedList.map((route, i) => (
              <button
                key={`${route.from}-${route.to}-${i}`}
                type="button"
                onClick={() => onClickRoute(route.from, route.to)}
                className="bg-white border border-slate-200 hover:border-red-500 hover:ring-1 hover:ring-red-500/20 p-2.5 rounded-xl flex items-center gap-3 shadow-2xs hover:shadow-sm transition-all text-left shrink-0 cursor-pointer select-none group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                  {route.icon}
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-900 group-hover:text-red-656 group-hover:text-red-600 transition-colors">
                    {route.from} ➔ {route.to}
                  </p>
                  <div className="flex gap-1.5 items-center text-[10px] text-slate-400 mt-0.5 font-sans">
                    <span className="font-medium">{route.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-black text-slate-700">{route.price}</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface PassengerAppProps {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  onSelectWorkspace: (workspace: string) => void;
}

export default function PassengerApp({ currentUser, setCurrentUser, onSelectWorkspace }: PassengerAppProps) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"search" | "history" | "profile" | "ai">("search");
  const [passengerSubTab, setPassengerSubTab] = useState<"bus" | "taxi" | "hotels">("bus");
  const [womenOnlyToggle, setWomenOnlyToggle] = useState(false);
  const [offerFilter, setOfferFilter] = useState<"All" | "Bus" | "Taxi" | "HOTEL">("All");
  const [hotelDestination, setHotelDestination] = useState("Pokhara");
  const [hotelSearchActive, setHotelSearchActive] = useState(false);
  const [taxiFromCity, setTaxiFromCity] = useState("Kathmandu");
  const [taxiToCity, setTaxiToCity] = useState("Gorakhpur");
  const [taxiPassengerCount, setTaxiPassengerCount] = useState(1);
  const [taxiLuggageCount, setTaxiLuggageCount] = useState(2);
  const [taxiSearchActive, setTaxiSearchActive] = useState(false);
  const [taxiTypeFilter, setTaxiTypeFilter] = useState<"All" | "Private SUV" | "Private Sedan" | "Shared Cab">("All");
  const [taxiTrips, setTaxiTrips] = useState<Trip[]>([]);
  const [loadingTaxis, setLoadingTaxis] = useState(false);
  
  // Authentication local states
  const [phoneInput, setPhoneInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Search local states
  const [fromCity, setFromCity] = useState("Kathmandu");
  const [toCity, setToCity] = useState("Pokhara");
  const [selectedDate, setSelectedDate] = useState("2026-06-22");
  const [passengerCount, setPassengerCount] = useState(1);
  const [searchedTrips, setSearchedTrips] = useState<Trip[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Booking details simulation
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [bookedSeatsFromDB, setBookedSeatsFromDB] = useState<string[]>([]);
  const [lockedSeatsFromDB, setLockedSeatsFromDB] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>("eSewa");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // History / Logs
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundTargetId, setRefundTargetId] = useState<string | null>(null);
  const [refundStatusMessage, setRefundStatusMessage] = useState("");

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(["rt_1", "rt_2"]);

  // Notifications
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotifsDropdown, setShowNotifsDropdown] = useState(false);

  // Load Trips in Search
  useEffect(() => {
    fetchTrips();
    if (currentUser) {
      loadHistory();
      loadNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    if (passengerSubTab === "taxi") {
      fetchTaxis();
    }
  }, [passengerSubTab]);

  const fetchTaxis = async () => {
    setLoadingTaxis(true);
    try {
      const res = await fetch(`/api/trips`);
      const data = await res.json();
      const taxis = data.filter((t: any) => t.id.startsWith("tx_") || t.busType.includes("PRIVATE") || t.busType.includes("SHARED_CAB"));
      setTaxiTrips(taxis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTaxis(false);
    }
  };

  const fetchTrips = async () => {
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/trips?from=${fromCity}&to=${toCity}&date=${selectedDate}`);
      const data = await res.json();
      setSearchedTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTripSelect = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");

    // Fetch dynamic seat availability live
    try {
      const res = await fetch(`/api/trips/${trip.id}`);
      const data = await res.json();
      setBookedSeatsFromDB(data.bookedSeats || []);
      setLockedSeatsFromDB(data.lockedSeats || []);
    } catch (err) {
      console.error("Failed to load seat availability", err);
    }
  };

  const handleSeatClick = (seat: string) => {
    if (bookedSeatsFromDB.includes(seat) || lockedSeatsFromDB.includes(seat)) return;
    
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats can be locked in a single reservation");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const loadHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/bookings/history/${currentUser.id}`);
      const data = await res.json();
      setUserBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    if (!currentUser) return;
    // Just mock/custom loading standard
    setNotifs([
      { id: "1", title: "Welcome to Yatra Nepal", content: "Namaste! Apply code YATRA200 for Nrs 200 discount.", isRead: false, createdAt: new Date().toISOString() }
    ]);
  };

  // OTP Login triggers
  const triggerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!phoneInput || phoneInput.length < 10) {
      setAuthError("Please input a valid 10-digit Nepalese mobile number");
      return;
    }
    try {
      const res = await fetch("/api/auth/otp-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneInput })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError("Network server configuration unavailable");
    }
  };

  const triggerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneInput,
          otpCode,
          fullName: fullNameInput,
          role: isRegisterMode ? "PASSENGER" : "PASSENGER"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setOtpSent(false);
        setPhoneInput("");
        setFullNameInput("");
        setOtpCode("");
      } else {
        setAuthError(data.error || "Incorrect OTP Code");
      }
    } catch (err) {
      setAuthError("Verification system network exception");
    }
  };

  const requestSeatLock = async () => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    try {
      const res = await fetch("/api/seats/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          seatNumbers: selectedSeats
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowPaymentModal(true);
      } else {
        alert(data.error || "Seat locking failed. Please reload seat layout.");
        // Reload seat map
        handleTripSelect(selectedTrip);
      }
    } catch (err) {
      setShowPaymentModal(true); // Fallback to direct flow
    }
  };

  const applyPromoCode = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/admin/coupons");
      const coupons = await res.json();
      const code = coupons.find((c: any) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (code) {
        setAppliedCoupon(code);
      } else {
        setCouponError("Invalid or Expired promo code code");
      }
    } catch (e) {
      setCouponError("Could not verify coupons.");
    }
  };

  const finalizeBooking = async () => {
    if (!currentUser || !selectedTrip || selectedSeats.length === 0) return;
    setBookingLoading(true);
    try {
      const res = await fetch("/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          tripId: selectedTrip.id,
          seatNumbers: selectedSeats,
          paymentMethod: selectedPaymentGateway,
          couponCode: appliedCoupon?.code || ""
        })
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmedBooking(data.booking);
        setShowPaymentModal(false);
        setSelectedTrip(null);
        setSelectedSeats([]);
        loadHistory();
      } else {
        alert(data.error || "Failed to complete checkout");
      }
    } catch (e) {
      alert("A system error occurred during checkout transaction dispatching");
    } finally {
      setBookingLoading(false);
    }
  };

  // Passenger requests ticket cancellation and refund
  const submitRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetId || !refundReason.trim()) return;
    try {
      const res = await fetch("/api/bookings/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: refundTargetId,
          refundReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRefundStatusMessage("Cancellation request successfully dispatched. Fully approved refund within 12 hours.");
        setRefundReason("");
        setRefundTargetId(null);
        loadHistory();
      } else {
        setRefundStatusMessage(data.error);
      }
    } catch (err) {
      setRefundStatusMessage("Database link exception.");
    }
  };

  const toggleFavorite = (routeId: string) => {
    if (favorites.includes(routeId)) {
      setFavorites(favorites.filter(f => f !== routeId));
    } else {
      setFavorites([...favorites, routeId]);
    }
  };

  const switchCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // Quick select trip recommendation from Yatra AI
  const handleSelectTripIdFromAI = async (tripId: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/trips`);
      const all: Trip[] = await res.json();
      const match = all.find(t => t.id === tripId);
      if (match) {
        handleTripSelect(match);
        setActiveTab("search");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 bg-slate-50 min-h-[550px] font-sans">
      {/* redBus Branded Top Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:px-8 md:py-5 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Logo - customized like redBus */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setPassengerSubTab("bus"); setActiveTab("search"); setSelectedTrip(null); }}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-red-200">
            🚍
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-red-600 flex items-center gap-0.5">
              yatra<span className="text-slate-900">nepal</span>
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">No. 1 Booking Portal</p>
          </div>
        </div>

        {/* Central redBus signature navigation tabs */}
        <div className="flex items-center border border-slate-100 bg-slate-50 shadow-xs rounded-2xl p-1 gap-1 w-full md:w-auto overflow-x-auto justify-between md:justify-start">
          <button
            onClick={() => { setPassengerSubTab("bus"); setActiveTab("search"); setSelectedTrip(null); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
              passengerSubTab === "bus" && activeTab === "search" && !selectedTrip
                ? "bg-red-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-150"
            }`}
          >
            <Bus className="h-4 w-4" /> Bus Tickets
          </button>
          
          <button
            onClick={() => { setPassengerSubTab("taxi"); setActiveTab("search"); setSelectedTrip(null); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
              passengerSubTab === "taxi" && activeTab === "search" && !selectedTrip
                ? "bg-red-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-150"
            }`}
          >
            <Car className="h-4 w-4" /> Inter-Country Cabs
            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Nepal ➔ India</span>
          </button>

          <button
            onClick={() => { setPassengerSubTab("hotels"); setActiveTab("search"); setSelectedTrip(null); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
              passengerSubTab === "hotels" && activeTab === "search" && !selectedTrip
                ? "bg-red-600 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-150"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" /> Hotels
            <span className="text-[8px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Budget</span>
          </button>
        </div>

        {/* Right navigation actions */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={() => {
              if (!currentUser) {
                alert("Please sign in to view booking history");
                return;
              }
              setActiveTab("history");
              loadHistory();
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Bookings</span>
            {userBookings.length > 0 && (
              <span className="bg-red-600 text-white text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center font-extrabold ml-1">
                {userBookings.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab("ai"); }}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ai" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100 opacity-90 hover:opacity-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-500" /> <span className="hidden sm:inline">Help</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 font-sans border-l border-slate-200 pl-3">
              <button
                onClick={() => { setActiveTab("profile"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                  activeTab === "profile" ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-red-656 bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.fullName[0].toUpperCase()}
                </div>
                <span className="max-w-[75px] truncate hidden md:inline">{currentUser.fullName.split(" ")[0]}</span>
              </button>
              <button 
                onClick={() => setCurrentUser(null)} 
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsRegisterMode(false);
                setOtpSent(false);
                setPhoneInput("");
                setActiveTab("profile");
              }}
              className="text-xs font-bold bg-slate-950 text-white rounded-xl py-2 px-4 shadow-sm hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <UserIcon className="h-3.5 w-3.5" /> Account
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: split with Chat / Search panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Booking & Search Platform */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Contents: Search Panel */}
          {activeTab === "search" && (
            <AnimatePresence mode="wait">
              {!selectedTrip ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* ====== BUS MODULE (DEFAULT) ====== */}
                  {passengerSubTab === "bus" && (
                    <div className="space-y-6">
                      {/* Scenic Hero Banner Inspired by redBus */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-650 to-rose-600 rounded-3xl p-6 md:p-8 text-white min-h-[140px] md:min-h-[180px] flex flex-col justify-center shadow-lg text-left">
                        <div className="absolute right-4 bottom-2 text-white/15 text-[7rem] leading-none pointer-events-none hidden md:block select-none font-bold">
                          🏔️
                        </div>
                        <div className="relative z-10 max-w-lg space-y-1.55">
                          <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/25">
                            Safe & Trusted Travels
                          </span>
                          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                            Nepal's No. 1 Online Bus Ticket Booking Platform!
                          </h1>
                          <p className="text-xs text-red-55/85 leading-relaxed font-semibold">
                            Lock real-time seat tickets instantly with Nepal's premier bus operators. Save up to Nrs 250 with verified wallet coupons.
                          </p>
                        </div>
                      </div>

                      {/* Floating Search Form Widget */}
                      <div className="bg-white border border-slate-200/85 rounded-3xl p-5 md:p-6 shadow-md space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                            <Bus className="h-4 w-4 text-red-600" /> Plan Your Bus Journey in Nepal
                          </h3>
                          
                          {/* Women's toggle switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider hidden sm:inline">👩 Women Choice</span>
                            <button
                              type="button"
                              onClick={() => setWomenOnlyToggle(!womenOnlyToggle)}
                              className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                womenOnlyToggle ? "bg-red-600" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                  womenOnlyToggle ? "translate-x-4.5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className={`text-[10px] font-black uppercase ${womenOnlyToggle ? "text-red-600" : "text-slate-400"}`}>
                              {womenOnlyToggle ? "On" : "Off"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* From City */}
                          <div className="md:col-span-4 relative text-left">
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">From City (Origin)</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <select 
                                value={fromCity} 
                                onChange={(e) => setFromCity(e.target.value)} 
                                className="bg-transparent text-sm font-bold text-slate-800 w-full focus:outline-none"
                              >
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Chitwan">Chitwan</option>
                                <option value="Butwal">Butwal</option>
                                <option value="Biratnagar">Biratnagar</option>
                                <option value="Lumbini">Lumbini</option>
                              </select>
                            </div>
                          </div>

                          {/* Swap City button */}
                          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
                            <button 
                              type="button"
                              onClick={switchCities}
                              className="p-2 border border-slate-200 rounded-full bg-white hover:bg-slate-50 hover:text-red-600 transition-colors shadow-xs cursor-pointer"
                              title="Swap Places"
                            >
                              <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>

                          {/* To City */}
                          <div className="md:col-span-4 relative text-left">
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">To City (Destination)</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                              <MapPin className="h-4 w-4 text-emerald-600" />
                              <select 
                                value={toCity} 
                                onChange={(e) => setToCity(e.target.value)} 
                                className="bg-transparent text-sm font-bold text-slate-800 w-full focus:outline-none"
                              >
                                <option value="Pokhara">Pokhara</option>
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Chitwan">Chitwan</option>
                                <option value="Butwal">Butwal</option>
                                <option value="Biratnagar">Biratnagar</option>
                                <option value="Lumbini">Lumbini</option>
                              </select>
                            </div>
                          </div>

                          {/* Travel Date */}
                          <div className="md:col-span-3 text-left">
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Date of Journey</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                              <Calendar className="h-4 w-4 text-red-600" />
                              <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min="2026-06-21"
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
                          {/* Quick shortcuts for dates */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400 font-bold">Suggestions:</span>
                            <button 
                              type="button"
                              onClick={() => { setFromCity("Kathmandu"); setToCity("Pokhara"); }} 
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-bold transition-all cursor-pointer"
                            >
                              KTM → PKR
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setFromCity("Kathmandu"); setToCity("Chitwan"); }} 
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-bold transition-all cursor-pointer"
                            >
                              KTM → NT
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setSelectedDate("2026-06-21"); }}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${
                                selectedDate === "2026-06-21" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 border-slate-200"
                              }`}
                            >
                              Today
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setSelectedDate("2026-06-22"); }}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${
                                selectedDate === "2026-06-22" ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 border-slate-200"
                              }`}
                            >
                              Tomorrow
                            </button>
                          </div>

                          {/* Find available buses dispatch button */}
                          <button
                            onClick={() => { setHasSearched(true); fetchTrips(); }}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs md:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-200 shrink-0 transition-all cursor-pointer w-full sm:w-auto"
                          >
                            <Search className="h-4 w-4" /> Find Available Buses
                          </button>
                        </div>
                      </div>

                      {/* Infinite Route Slider - Bus Search Home Screen */}
                      {!hasSearched && (
                        <InfiniteRouteSlider 
                          isTaxi={false}
                          onClickRoute={(from, to) => {
                            setFromCity(from);
                            setToCity(to);
                            setHasSearched(true);
                            // brief delay for React to register the origin/dest input state change before fetching
                            setTimeout(() => {
                              fetchTrips();
                            }, 50);
                          }}
                        />
                      )}

                      {/* Book trains for festivals - Promo Banner card */}
                      {!hasSearched && (
                        <div className="bg-gradient-to-r from-emerald-500/5 via-emerald-25 to-emerald-500/10 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1 text-left">
                            <span className="text-[8px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">CROSS-BORDER DISPATCH</span>
                            <h4 className="font-extrabold text-slate-900 text-xs">Direct Commercial Nepal-India Taxis with Verified Green-Plates!</h4>
                            <p className="text-[10px] text-slate-500">Includes guaranteed custom clearance assistance and absolute pre-paid rates without hidden fuel charges.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => { setPassengerSubTab("taxi"); setSelectedTrip(null); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
                          >
                            Find Cabs
                          </button>
                        </div>
                      )}

                      {/* Offers For You Slider section */}
                      {!hasSearched && (
                        <div className="space-y-3 pt-2 text-left">
                          <div className="flex justify-between items-center">
                            <h3 className="font-extrabold text-slate-800 text-base tracking-tight">Offers for you</h3>
                            <button className="text-xs text-red-656 font-bold text-red-600 hover:underline">View All</button>
                          </div>
                          <div className="flex gap-1.5 border-b border-slate-100 pb-2">
                            {(["All", "Bus", "Taxi", "HOTEL"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => setOfferFilter(t)}
                                className={`text-[11px] font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  offerFilter === t ? "bg-red-600 text-white border-red-600 shadow-xs" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(offerFilter === "All" || offerFilter === "Bus") && (
                              <>
                                <div className="bg-gradient-to-br from-red-600 to-rose-500 text-white rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                  <div>
                                    <span className="bg-white/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono">CODE: YATRA250</span>
                                    <h4 className="font-black text-sm mt-1">Save up to Nrs 250 on Sofa Sleeper lines</h4>
                                  </div>
                                  <p className="text-[9px] text-red-100/90 font-medium font-sans">Valid on eSewa and Khalti transfers till June 30.</p>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                  <div>
                                    <span className="bg-white/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono">NABIL CARD SPECIAL</span>
                                    <h4 className="font-black text-sm mt-1">Flat 10% Discount on Himalayan Tourist lines</h4>
                                  </div>
                                  <p className="text-[9px] text-slate-300 font-medium font-sans">Save up to Nrs 500 via Nepalese bank Credit cards.</p>
                                </div>
                              </>
                            )}
                            {(offerFilter === "All" || offerFilter === "Taxi") && (
                              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <span className="bg-white/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono">CROSSBORDER</span>
                                  <h4 className="font-black text-sm mt-1">Flat Nrs 500 discount on Inter-Country Scorpio SUVs</h4>
                                </div>
                                <p className="text-[9px] text-emerald-100/90 font-medium font-sans">Applicable on private rentals to Varanasi, Gorakhpur, or Siliguri.</p>
                              </div>
                            )}
                            {(offerFilter === "All" || offerFilter === "HOTEL") && (
                              <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <span className="bg-white/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono">LAKESIDEVIP</span>
                                  <h4 className="font-black text-sm mt-1">Save 35% on Lakeview Stays in Pokhara</h4>
                                </div>
                                <p className="text-[9px] text-emerald-100/90 font-medium font-sans">Applicable to selected budget clean home accommodations.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== TAXI MODULE ====== */}
                  {passengerSubTab === "taxi" && (
                    <div className="space-y-6 text-left animate-in fade-in duration-200">
                      {/* Taxi hero header */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-505 rounded-3xl p-6 text-white min-h-[130px] flex flex-col justify-center shadow-lg w-full">
                        <div className="relative z-10 space-y-1.5">
                          <span className="bg-white/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded font-sans">
                            Nepal ➔ India Cross-Border Cabs
                          </span>
                          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                            Pre-book Cross-Border Green Plate Taxis!
                          </h1>
                          <p className="text-xs text-emerald-50/90 leading-relaxed font-semibold">
                            Hassle-free custom checks, commercial permits, sanitization, and professional door-to-door transit to major Indian hubs.
                          </p>
                        </div>
                      </div>

                      {/* Interactive Taxi Search Form */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                        <h3 className="font-black text-slate-800 text-sm">Find Comfortable Cross-Border Rides</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Origin Hub (Nepal)</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <MapPin className="h-4 w-4 text-emerald-600" />
                              <select 
                                value={taxiFromCity} 
                                onChange={(e) => {
                                  setTaxiFromCity(e.target.value);
                                  setTaxiSearchActive(false);
                                }} 
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                              >
                                <option value="Kathmandu">Kathmandu Valley</option>
                                <option value="Pokhara">Pokhara Lakeside</option>
                                <option value="Birgunj">Birgunj City</option>
                                <option value="Kakarbhitta">Kakarbhitta Hub</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Destination Hub (India)</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <MapPin className="h-4 w-4 text-rose-500" />
                              <select 
                                value={taxiToCity} 
                                onChange={(e) => {
                                  setTaxiToCity(e.target.value);
                                  setTaxiSearchActive(false);
                                }} 
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                              >
                                <option value="Gorakhpur">Gorakhpur Junction (UP)</option>
                                <option value="Siliguri">Siliguri Terminal (WB)</option>
                                <option value="Varanasi">Varanasi Junction (UP)</option>
                                <option value="Darjeeling">Darjeeling Hills (WB)</option>
                                <option value="Patna">Patna Junction (Bihar)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Travel Passengers</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <Users className="h-4 w-4 text-slate-500" />
                              <select 
                                value={taxiPassengerCount} 
                                onChange={(e) => setTaxiPassengerCount(Number(e.target.value))} 
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                  <option key={n} value={n}>{n} Pax</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Luggage Bags</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <Car className="h-4 w-4 text-slate-500" />
                              <select 
                                value={taxiLuggageCount} 
                                onChange={(e) => setTaxiLuggageCount(Number(e.target.value))} 
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                              >
                                {[0, 1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>{n} Heavy Bags</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-3 flex-wrap pt-2">
                          <p className="text-[11px] text-slate-500 font-sans flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 inline shrink-0" /> Fully approved green-plate taxis. Direct border gate passage assistance included.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTaxiSearchActive(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Find Available Taxis
                          </button>
                        </div>
                      </div>

                      {/* Infinite Route Slider - Taxi Cross-Border Home Screen */}
                      {!taxiSearchActive && (
                        <InfiniteRouteSlider 
                          isTaxi={true}
                          onClickRoute={(from, to) => {
                            setTaxiFromCity(from);
                            setTaxiToCity(to);
                            setTaxiSearchActive(true);
                          }}
                        />
                      )}

                      {/* Interactive Taxi results list */}
                      {taxiSearchActive && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                            <h4 className="font-extrabold text-slate-800 text-sm">Available Commercial Cabs matching "{taxiFromCity} to {taxiToCity}"</h4>
                            
                            {/* Filter options */}
                            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                              {(["All", "Private SUV", "Private Sedan", "Shared Cab"] as const).map((filter) => (
                                <button
                                  key={filter}
                                  type="button"
                                  onClick={() => setTaxiTypeFilter(filter)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                                    taxiTypeFilter === filter
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </div>

                          {loadingTaxis ? (
                            <div className="py-8 text-center space-y-2">
                              <RefreshCcw className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                              <p className="text-xs text-slate-500">Querying live cross-border commercial registers...</p>
                            </div>
                          ) : (() => {
                            const matchingCabs = taxiTrips.filter(t => {
                              const matchCity = t.fromCity.toLowerCase() === taxiFromCity.toLowerCase() && t.toCity.toLowerCase() === taxiToCity.toLowerCase();
                              if (!matchCity) return false;
                              
                              if (taxiTypeFilter === "Private SUV") return t.busType === "PRIVATE_SUV";
                              if (taxiTypeFilter === "Private Sedan") return t.busType === "PRIVATE_SEDAN";
                              if (taxiTypeFilter === "Shared Cab") return t.busType === "SHARED_CAB";
                              return true;
                            });

                            if (matchingCabs.length === 0) {
                              return (
                                <div className="border border-slate-200 bg-slate-50 rounded-2xl p-8 text-center space-y-2 font-sans">
                                  <Car className="h-8 w-8 text-slate-300 mx-auto" />
                                  <h4 className="font-extrabold text-slate-800 text-xs">No Scheduled Cabs Found</h4>
                                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                    There are currently no active departures from {taxiFromCity} to {taxiToCity} for the selected options. Please change origin/destination or select another taxi filter category.
                                  </p>
                                </div>
                              );
                            }

                            return matchingCabs.map((cab) => (
                              <div 
                                key={cab.id}
                                className="border border-emerald-100 bg-white rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-300 transition-colors shadow-xs"
                              >
                                <div className="space-y-1 text-left">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-sans ${
                                      cab.busType.startsWith("PRIVATE") ? "bg-emerald-100 text-emerald-850 text-emerald-800 border border-emerald-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                                    }`}>
                                      {cab.busType.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5 font-bold font-sans">
                                      Commercial Permit: {cab.plateNumber}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-900 text-sm">
                                    {cab.operatorName} (Driver: {cab.driverName || "Dinesh Thapa"})
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium font-sans">
                                    Departure Scheduled: Today 06:00 AM | Estimated 10.5 Hours door-to-door transit
                                  </p>
                                  <div className="flex gap-1.5 flex-wrap pt-1">
                                    {cab.amenities.map((am) => (
                                      <span key={am} className="text-[9px] text-slate-500 bg-slate-100 py-0.5 px-1.5 rounded font-bold font-sans">
                                        {am}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-end gap-3 sm:gap-1.5 justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                                  <div className="text-left sm:text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">PREPAID FIXED RATE</p>
                                    <p className="text-base font-black text-emerald-600">
                                      Nrs {cab.basePrice} {cab.busType === "SHARED_CAB" ? "/ seat" : "/ entire cab"}
                                    </p>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => handleTripSelect(cab)}
                                    className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-black py-2 px-4 rounded-xl cursor-pointer"
                                  >
                                    Book Ride
                                  </button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== HOTELS MODULE (matches Screenshot 2/3 style) ====== */}
                  {passengerSubTab === "hotels" && (
                    <div className="space-y-6 text-left">
                      {/* Hotels search form banner */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-rose-600 to-red-500 rounded-3xl p-6 text-white min-h-[140px] flex flex-col justify-center shadow-lg">
                        <div className="relative z-10 space-y-1.5">
                          <span className="bg-white/20 text-[9px] text-white font-extrabold uppercase tracking-widest px-2 py-0.5 rounded font-sans">
                            The Budget Collection by redBus
                          </span>
                          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none">
                            Book Budget & Premium Hotels in Nepal
                          </h1>
                          <p className="text-xs text-red-50/90 leading-relaxed font-semibold font-sans">
                            Get verified, clean, budget lake-view stays in Pokhara, Thamel & Chitwan. Rest easy with free cancellation!
                          </p>
                        </div>
                      </div>

                      {/* Hotels Search Bar */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                        <h3 className="font-extrabold text-slate-800 text-sm">Find Lakeview Stays & Hostels</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1 text-left">Destination town</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <select 
                                value={hotelDestination} 
                                onChange={(e) => setHotelDestination(e.target.value)} 
                                className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full"
                              >
                                <option value="Pokhara">Pokhara Lakeside</option>
                                <option value="Kathmandu">Thamel, Kathmandu</option>
                                <option value="Chitwan">Sauraha, Chitwan National Park</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1 text-left">Guests & Room Count</label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <UserIcon className="h-4 w-4 text-emerald-600" />
                              <select className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full" defaultValue="2">
                                <option value="1">1 Room, 1 Guest</option>
                                <option value="2">1 Room, 2 Guests</option>
                                <option value="4">2 Rooms, 4 Guests</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center flex-wrap pt-1 gap-2">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase shrink font-sans">✨ 100% Verified properties by redBus</p>
                          <button
                            type="button"
                            onClick={() => { setHotelSearchActive(true); }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2 px-5 rounded-lg shadow-md shrink-0 cursor-pointer"
                          >
                            Find Hotels
                          </button>
                        </div>
                      </div>

                      {/* --- THE BUDGET COLLECTION (matches Screenshot 2 style) --- */}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight mb-3">The Budget Collection</h3>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                          {/* Card Under Nrs 999 */}
                          <div className="bg-gradient-to-b from-rose-50 to-white border border-rose-100 rounded-2xl p-4 text-center cursor-pointer hover:border-red-400 transition-all shadow-xs flex flex-col justify-between min-h-[140px]">
                            <div className="mx-auto w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-lg">
                              🏠
                            </div>
                            <div>
                              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest leading-none">Rooms under</h5>
                              <h4 className="font-black text-rose-600 text-sm md:text-xl mt-1">Nrs 999</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 py-0.5 rounded-full inline-block font-sans">Book now</span>
                          </div>

                          {/* Card Under Nrs 799 */}
                          <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between min-h-[140px]">
                            <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg">
                              🛌
                            </div>
                            <div>
                              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest leading-none">Dorms under</h5>
                              <h4 className="font-black text-blue-600 text-sm md:text-xl mt-1">Nrs 799</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 py-0.5 rounded-full inline-block font-sans">Book now</span>
                          </div>

                          {/* Card Under Nrs 499 */}
                          <div className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 text-center cursor-pointer hover:border-emerald-400 transition-all shadow-xs flex flex-col justify-between min-h-[140px]">
                            <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-lg">
                              ⛺
                            </div>
                            <div>
                              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest leading-none">Hostels under</h5>
                              <h4 className="font-black text-emerald-600 text-sm md:text-xl mt-1">Nrs 499</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 py-0.5 rounded-full inline-block font-sans">Book now</span>
                          </div>
                        </div>
                      </div>

                      {/* Value Stays in Pokhara/Kathmandu */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Value Stays in {hotelDestination}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Stay 1 */}
                          <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-2 hover:border-slate-400 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono font-bold">35% INSTANT OFF</span>
                                <h4 className="font-extrabold text-slate-900 text-sm">Hotel Lakeside Retreat & Spa</h4>
                              </div>
                              <span className="text-slate-900 font-black text-xs font-sans">Nrs 1,800/night</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium font-sans">Free WiFi | Hot streams | 50m to boating dock | 4.6 ★ Highly rated</p>
                            <button
                              type="button"
                              onClick={() => alert("Hotel accommodation selection simulated! Standard bus workspace tickets can be compiled below.")}
                              className="w-full bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-1.5 rounded-lg cursor-pointer"
                            >
                              Reserve room
                            </button>
                          </div>

                          {/* Stay 2 */}
                          <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-2 hover:border-slate-400 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] bg-red-100 text-red-080 text-red-800 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono font-bold">40% FAMILY DISCOUNT</span>
                                <h4 className="font-extrabold text-slate-900 text-sm">Thamel Central Backpackers Hostel</h4>
                              </div>
                              <span className="text-slate-900 font-black text-xs font-sans">Nrs 650/night</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium font-sans">Common locker | Rooftop garden dinner | Trekking advice depot | 4.8 ★</p>
                            <button
                              type="button"
                              onClick={() => alert("Hotel accommodation selection simulated! Standard bus workspace tickets can be compiled below.")}
                              className="w-full bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-1.5 rounded-lg cursor-pointer font-sans"
                            >
                              Reserve room
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* --- TOP HOTEL BRANDS --- */}
                      <div className="pt-2">
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">Top Hotel Brands Available</h4>
                        <div className="flex flex-wrap gap-2.5">
                          {["OYO Stays", "FabHotels", "Treebo Comfort", "bloom Rooms", "goSTOPS Hostel", "The Hosteller"].map((brand) => (
                            <span 
                              key={brand}
                              className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap inline-block"
                            >
                              🏨 {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search results & listings (for Bus ticket search only) */}
                  {passengerSubTab === "bus" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight text-left">
                          {hasSearched ? `Schedules matching "${fromCity} to ${toCity}"` : "Featured Nepal Bus Daily Schedules"}
                        </h4>
                        {searchLoading && <RefreshCcw className="h-4 w-4 text-red-500 animate-spin" />}
                      </div>

                      {searchedTrips.length === 0 ? (
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-4">
                          <Smile className="h-8 w-8 text-slate-400 mx-auto" />
                          <h4 className="font-bold text-slate-700 text-sm tracking-tight text-left">No direct buses scheduled for today</h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            Our operators usually run schedules early morning (6:00 AM) and night sleepers (8:00 PM). Search different Nepal hubs, or ask **Yatra AI** on the right side for alternative options!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {searchedTrips.map((trip) => {
                            const routeFavKey = `rt_${trip.id}`;
                            const isFav = favorites.includes(routeFavKey);
                            return (
                              <div 
                                key={trip.id}
                                className="border border-slate-200 bg-white rounded-3xl p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group text-left"
                              >
                                <div className="space-y-2.5 flex-1 w-full">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-extrabold px-2 py-1 bg-red-50 text-red-656 text-red-600 rounded-md border border-red-150 uppercase tracking-widest leading-none">
                                      {trip.busType.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono font-medium text-left">
                                      {trip.plateNumber}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5 font-bold">
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Approved Operator
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-slate-900 group-hover:text-red-656 group-hover:text-red-600 transition-colors text-base md:text-lg tracking-tight">
                                      {trip.operatorName}
                                    </h3>
                                    <button 
                                      onClick={() => toggleFavorite(routeFavKey)}
                                      className={`p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer ${isFav ? "text-red-500" : "text-slate-300"}`}
                                    >
                                      <Heart className="h-4 w-4 fill-current" />
                                    </button>
                                  </div>

                                  {/* Amenities list */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {trip.amenities.map((am, ai) => (
                                      <span key={ai} className="text-[10px] text-slate-500 font-bold px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 whitespace-nowrap">
                                        {am}
                                      </span>
                                    ))}
                                  </div>

                                {/* Journey specifics */}
                                <div className="flex items-center gap-6 pt-1 text-xs text-slate-600">
                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Departure {fromCity}</p>
                                    <p className="font-extrabold text-slate-800 text-sm">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>

                                  <div className="flex flex-col items-center px-1">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">6 Hours</span>
                                    <div className="w-16 h-0.5 bg-slate-200 relative my-0.5">
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold">Daily Direct</span>
                                  </div>

                                  <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Arrival {toCity}</p>
                                    <p className="font-extrabold text-slate-800 text-sm">{new Date(trip.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Right column prices & selection */}
                              <div className="flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t border-slate-200 md:border-0 shrink-0">
                                <div className="text-left md:text-right">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">One-way fare</p>
                                  <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight mt-0.5">
                                    Nrs {trip.basePrice}
                                  </h4>
                                  <p className="text-xs text-emerald-600 font-bold mt-1">{trip.availableSeats} Seats left</p>
                                </div>

                                <button
                                  onClick={() => handleTripSelect(trip)}
                                  className="mt-3.5 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  Select Seats <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Select Seats interactive view */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedTrip(null)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black py-1.5 px-3 bg-gray-50 border border-gray-150 rounded-xl"
                    >
                      <ArrowLeft className="h-4 w-4" /> Change Bus Choice
                    </button>
                    <span className="text-xs text-gray-500">Live Seat Booking Terminal</span>
                  </div>

                  {/* Bus details summary card */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Selected Carrier</p>
                      <h4 className="font-bold text-gray-900 text-base">{selectedTrip.operatorName}</h4>
                      <p className="text-xs text-gray-600">{selectedTrip.fromCity} → {selectedTrip.toCity}</p>
                      <p className="text-xs text-gray-500">
                        Departure: {new Date(selectedTrip.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex md:justify-end md:text-right flex-col gap-1">
                      <span className="text-xs font-semibold bg-white border border-gray-200 rounded px-2.5 py-1 w-max md:ml-auto">
                        Category: {selectedTrip.busType}
                      </span>
                      <p className="text-sm font-semibold text-gray-800">Fare: Nrs {selectedTrip.basePrice} per Seat</p>
                    </div>
                  </div>

                  {/* Seating Layout & Reservation Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* The Bus Seat Grid */}
                    <div className="md:col-span-7 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
                      {selectedTrip.id.startsWith("tx_") || selectedTrip.busType.includes("PRIVATE") || selectedTrip.busType.includes("SHARED_CAB") ? (
                        /* Beautiful Cab Layout */
                        <div className="space-y-6">
                          <div className="text-center pb-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Car className="h-5 w-5 text-emerald-600" />
                              <span className="font-bold text-sm text-slate-800">
                                {selectedTrip.busType === "PRIVATE_SUV" ? "Premium Scorpio SUV Layout" : selectedTrip.busType === "PRIVATE_SEDAN" ? "Comfort Swift/Etios Sedan Layout" : "Shared Cross-Border Cab Seats"}
                              </span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded font-sans uppercase tracking-widest">
                              Custom Gate Assist Included
                            </span>
                          </div>

                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-sans text-xs text-slate-600 leading-relaxed space-y-1">
                            <p className="font-extrabold text-slate-800 flex items-center gap-1 text-left">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Nepal-India Transit Commercial Cover
                            </p>
                            <p className="text-left">This is a certified green-plate inter-country commercial cab. Selected rate includes cross-border route permit taxes, driver allowance, toll fees, and personalized customs gate clearance assistance.</p>
                          </div>

                          {selectedTrip.busType.includes("PRIVATE") ? (
                            /* Private Cab Block */
                            <div className="space-y-4 py-2">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">Private Charter Selection</p>
                              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 text-center space-y-3">
                                <Car className="h-10 w-10 text-emerald-600 mx-auto" />
                                <div className="space-y-1">
                                  <h4 className="font-black text-slate-900 text-sm">Full Private Vehicle Charter</h4>
                                  <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
                                    You are reserving the entire private vehicle ({selectedTrip.busType === "PRIVATE_SUV" ? "up to 6 passengers" : "up to 4 passengers"}) with driver. Zero external co-passengers. Door-to-door comfort.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedSeats.includes("Full Vehicle")) {
                                      setSelectedSeats([]);
                                    } else {
                                      setSelectedSeats(["Full Vehicle"]);
                                    }
                                  }}
                                  className={`py-2.5 px-6 rounded-xl font-extrabold text-xs cursor-pointer transition-all ${
                                    selectedSeats.includes("Full Vehicle")
                                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                      : "bg-slate-900 text-white hover:bg-slate-950 shadow-sm"
                                  }`}
                                >
                                  {selectedSeats.includes("Full Vehicle") ? "✓ Private Cab Selected (Click to change)" : "Charter Private Vehicle & Proceed"}
                                </button>
                              </div>

                              {/* Sedan/SUV illustration mapping */}
                              <div className="border border-slate-200 rounded-2xl p-4 flex justify-around items-center gap-2 bg-slate-50/60 text-center font-sans">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">Front Row</span>
                                  <div className="w-14 h-11 bg-slate-200 rounded-md border border-slate-300 text-[10px] flex flex-col justify-center items-center">
                                    <span className="font-bold text-slate-700">Driver</span>
                                    <span className="text-[8px] text-slate-400">(Regular)</span>
                                  </div>
                                </div>
                                <div className="text-slate-400 font-bold">&#10137;</div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">Pass Cabin</span>
                                  <div className="w-24 h-11 bg-emerald-100 text-emerald-800 rounded-md border-2 border-emerald-300 text-[10px] font-black flex items-center justify-center">
                                    {selectedTrip.busType === "PRIVATE_SUV" ? "6 Pass Seats" : "4 Pass Seats"}
                                  </div>
                                </div>
                                <div className="text-slate-400 font-bold">&#10137;</div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">Boot Bay</span>
                                  <div className="w-16 h-11 bg-slate-100 text-slate-500 rounded-md border border-slate-200 text-[10px] font-bold flex items-center justify-center font-sans">
                                    {selectedTrip.busType === "PRIVATE_SUV" ? "Large Suite" : "Medium Bay"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Shared Cab Block */
                            <div className="space-y-4 py-2">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">Please select your shared seats</p>
                              
                              <div className="border border-slate-250 bg-slate-50 rounded-2xl p-5 max-w-[280px] mx-auto space-y-4">
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black uppercase font-mono tracking-wider block mx-auto w-max">Windshield (Front)</span>
                                
                                {/* Front passenger row */}
                                <div className="flex justify-between items-center px-4">
                                  <div className="w-16 h-12 bg-slate-200 text-slate-400 border border-slate-300 rounded-lg text-[9px] font-semibold flex flex-col justify-center items-center">
                                    <span>Steering</span>
                                    <span>(Driver)</span>
                                  </div>
                                  
                                  {(() => {
                                    const seatNum = "Shared-FrontPassenger";
                                    const isBooked = bookedSeatsFromDB.includes(seatNum);
                                    const isLocked = lockedSeatsFromDB.includes(seatNum);
                                    const isSelected = selectedSeats.includes(seatNum);
                                    return (
                                      <button
                                        type="button"
                                        disabled={isBooked || isLocked}
                                        onClick={() => handleSeatClick(seatNum)}
                                        className={`w-16 h-12 rounded-lg border text-[10px] font-black flex flex-col justify-center items-center cursor-pointer transition-all ${
                                          isBooked 
                                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
                                            : isLocked 
                                              ? "bg-amber-100 text-amber-600 border-amber-300 cursor-not-allowed"
                                              : isSelected 
                                                ? "bg-red-50 text-red-600 border-red-500 shadow-sm" 
                                                : "bg-white text-gray-700 border-gray-200 hover:border-slate-800"
                                        }`}
                                      >
                                        <span>Co-Passenger</span>
                                        <span className="text-[8px] opacity-75 font-sans font-normal">(Front Seat)</span>
                                      </button>
                                    );
                                  })()}
                                </div>

                                <div className="h-0.5 border-b border-dashed border-slate-200 w-full" />

                                {/* Rear passenger row */}
                                <div className="flex justify-between items-center gap-2">
                                  {["Rear-LeftWindow", "Rear-Center", "Rear-RightWindow"].map((seatNum, idx) => {
                                    const label = idx === 0 ? "Rear Left" : idx === 1 ? "Rear Middle" : "Rear Right";
                                    const isBooked = bookedSeatsFromDB.includes(seatNum);
                                    const isLocked = lockedSeatsFromDB.includes(seatNum);
                                    const isSelected = selectedSeats.includes(seatNum);
                                    return (
                                      <button
                                        key={seatNum}
                                        type="button"
                                        disabled={isBooked || isLocked}
                                        onClick={() => handleSeatClick(seatNum)}
                                        className={`w-16 h-12 rounded-lg border text-[9px] font-black flex flex-col justify-center items-center cursor-pointer transition-all ${
                                          isBooked 
                                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
                                            : isLocked 
                                              ? "bg-amber-100 text-amber-600 border-amber-300 cursor-not-allowed"
                                              : isSelected 
                                                ? "bg-red-50 text-red-600 border-red-500 shadow-sm" 
                                                : "bg-white text-gray-700 border-gray-200 hover:border-slate-800"
                                        }`}
                                      >
                                        <span>{label}</span>
                                        <span className="text-[8px] opacity-75 font-sans font-normal">Rear seat</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <p className="text-[10px] text-center text-slate-400 font-sans">
                                Back seats accommodate up to 3 passengers. Luggage can be loaded in the large top frame of the cab.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Original Bus Layout grid */
                        <>
                          <div className="text-center pb-4 border-b border-gray-100 mb-6 font-semibold text-xs text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                              ⚙️
                            </div> Driver Panel (Front cabin)
                          </div>

                          {/* Legend explanation */}
                          <div className="flex justify-between items-center gap-2 mb-6 text-xs text-gray-600 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded border border-gray-200 bg-white" />
                              <span>Available</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded border border-red-200 bg-red-50 text-red-600 flex items-center justify-center text-[10px] font-bold">✓</div>
                              <span>My Selection</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded bg-gray-200 border border-gray-300" />
                              <span>Reserved</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-5.5 h-5.5 rounded bg-amber-100 border border-amber-300" />
                              <span>Locked</span>
                            </div>
                          </div>

                          {/* 2 - 2 Seats configuration */}
                          {/* Left: Columns 1, 2. Right: Columns 3, 4 */}
                          <div className="space-y-3.5 max-w-[280px] mx-auto">
                            {["A", "B", "C", "D", "E", "F", "G"].map((rowId) => (
                              <div key={rowId} className="flex justify-between items-center gap-4">
                                
                                {/* Left Column pair */}
                                <div className="flex gap-2">
                                  {[1, 2].map((col) => {
                                    const seatNum = `${rowId}${col}`;
                                    const isBooked = bookedSeatsFromDB.includes(seatNum);
                                    const isLocked = lockedSeatsFromDB.includes(seatNum);
                                    const isSelected = selectedSeats.includes(seatNum);
                                    return (
                                      <button
                                        key={seatNum}
                                        disabled={isBooked || isLocked}
                                        onClick={() => handleSeatClick(seatNum)}
                                        className={`w-10 h-10 rounded-lg border text-xs font-semibold flex items-center justify-center cursor-pointer transition-all ${
                                          isBooked 
                                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
                                            : isLocked 
                                              ? "bg-amber-100 text-amber-600 border-amber-300 cursor-not-allowed"
                                              : isSelected 
                                                ? "bg-red-50 text-red-600 border-red-500 shadow-sm" 
                                                : "bg-white text-gray-700 border-gray-200 hover:border-slate-800"
                                        }`}
                                      >
                                        {seatNum}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Middle Passage spacer */}
                                <div className="w-6 text-center text-[10px] text-gray-300 font-bold uppercase font-mono">
                                  Aisle
                                </div>

                                {/* Right Column pair */}
                                <div className="flex gap-2">
                                  {[3, 4].map((col) => {
                                    const seatNum = `${rowId}${col}`;
                                    const isBooked = bookedSeatsFromDB.includes(seatNum);
                                    const isLocked = lockedSeatsFromDB.includes(seatNum);
                                    const isSelected = selectedSeats.includes(seatNum);
                                    return (
                                      <button
                                        key={seatNum}
                                        disabled={isBooked || isLocked}
                                        onClick={() => handleSeatClick(seatNum)}
                                        className={`w-10 h-10 rounded-lg border text-xs font-semibold flex items-center justify-center cursor-pointer transition-all ${
                                          isBooked 
                                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" 
                                            : isLocked 
                                              ? "bg-amber-100 text-amber-600 border-amber-300 cursor-not-allowed"
                                              : isSelected 
                                                ? "bg-red-50 text-red-600 border-red-500 shadow-sm" 
                                                : "bg-white text-gray-700 border-gray-200 hover:border-slate-800"
                                        }`}
                                      >
                                        {seatNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-center text-gray-400 mt-6 leading-normal font-sans">
                            Note: Double seats are suitable for couples. Sleepers accommodate 1 adult. VIP sofa includes leg-rest.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Booking Right checkout pane */}
                    <div className="md:col-span-5 space-y-4">
                      
                      {/* Price breakdown and checkout pane */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                        <h4 className="font-bold text-gray-900 text-sm">Booking Fare Calculation</h4>
                        
                        {selectedSeats.length === 0 ? (
                          <div className="py-6 text-center space-y-2">
                            <Info className="h-5 w-5 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-400 font-semibold">Please select seat numbers on map grid</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Selected Seat(s)</span>
                              <span className="font-bold text-slate-900 bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                                {selectedSeats.join(", ")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Base ticket cost</span>
                              <span className="font-semibold text-gray-800">
                                Nrs {selectedTrip.basePrice * selectedSeats.length}
                              </span>
                            </div>

                            {/* Coupon Promo form */}
                            <div className="pt-2 border-t border-gray-50">
                              <label className="text-[10px] text-gray-400 block font-bold mb-1">Apply promo code (e.g. YATRA200)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  placeholder="Enter Coupon code"
                                  className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs flex-1 uppercase focus:outline-none"
                                />
                                <button
                                  onClick={applyPromoCode}
                                  className="bg-slate-900 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                  Apply
                                </button>
                              </div>
                              {appliedCoupon && (
                                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> Code {appliedCoupon.code} applied!
                                </p>
                              )}
                              {couponError && (
                                <p className="text-[10px] text-red-500 mt-1">{couponError}</p>
                              )}
                            </div>

                            {/* Discount deduction */}
                            {appliedCoupon && (
                              <div className="flex justify-between items-center text-xs text-emerald-600">
                                <span>Coupon promo discount ({appliedCoupon.discountPct}%)</span>
                                <span>
                                  - Nrs {Math.min(
                                    ((selectedTrip.basePrice * selectedSeats.length) * appliedCoupon.discountPct) / 100,
                                    appliedCoupon.maxDiscount
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">Nepalese counter processing fee</span>
                              <span className="font-semibold text-gray-800">Nrs 35</span>
                            </div>

                            {/* Net Total */}
                            <div className="flex justify-between items-end border-t border-gray-150 pt-3">
                              <div>
                                <p className="text-[10px] text-gray-500">Collectible Net Total</p>
                                <p className="text-lg font-extrabold text-red-600">
                                  Nrs {(() => {
                                    let base = selectedTrip.basePrice * selectedSeats.length;
                                    let disc = 0;
                                    if (appliedCoupon) {
                                      disc = (base * appliedCoupon.discountPct) / 100;
                                      if (disc > appliedCoupon.maxDiscount) disc = appliedCoupon.maxDiscount;
                                    }
                                    return base - disc + 35;
                                  })()}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => {
                                  if (!currentUser) {
                                    alert("Please sign in or OTP register to checkout ticket");
                                    return;
                                  }
                                  requestSeatLock();
                                }}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                proceed checkout <ShieldCheck className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Seat lock notice */}
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[11px] text-amber-700 flex items-start gap-1.5 leading-normal">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <b>Assured Seating locks:</b> Once checkout starts, seats are reserved exclusively for you for <b>120 seconds</b>. Complete transaction before timer expires to guarantee ticket.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Tab Contents: My Bookings History */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="font-bold text-gray-900 text-base">Your Booking manifest history</h3>

              {refundStatusMessage && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{refundStatusMessage}</span>
                </div>
              )}

              {userBookings.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-150 rounded-2xl">
                  <Ticket className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No active ticket bookings found</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Search and book tickets to Pokhara, Chitwan, or Biratnagar to see them listed in your travel wallet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((bk) => (
                    <div 
                      key={bk.id}
                      className="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Booking ID & Status</p>
                          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                            {bk.id}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              bk.bookingStatus === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            }`}>
                              {bk.bookingStatus}
                            </span>
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-gray-100 py-1 px-2.5 rounded font-bold text-gray-500 uppercase tracking-wider">
                            Paid via: {bk.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase text-[9px] font-bold">Route</p>
                          <p className="font-bold text-gray-800 text-sm">{bk.tripDetails.fromCity} → {bk.tripDetails.toCity}</p>
                          <p className="text-gray-500">{bk.tripDetails.operatorName} ({bk.tripDetails.busType})</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase text-[9px] font-bold">Departure schedule</p>
                          <p className="font-bold text-gray-800">{new Date(bk.tripDetails.departureTime).toLocaleString()}</p>
                          <p className="text-gray-500">Plate: {bk.tripDetails.plateNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase text-[9px] font-bold">Passenger Details</p>
                          <p className="font-bold text-gray-800">Seats: {bk.seatNumbers.join(", ")}</p>
                          <p className="text-red-600 font-bold mt-0.5">Nrs {bk.totalFare}</p>
                        </div>
                      </div>

                      {/* Ticket printable section with simulated QR Code */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <QrCode className="h-4 w-4 text-red-500" /> Passenger Boarding E-Ticket QR
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Present this barcode to the driver when boarding standard vehicle.
                          </p>
                          <div className="pt-1.5 flex items-center gap-2">
                            <span className="font-mono text-[10px] bg-white border px-2 py-0.5 rounded font-bold text-slate-800">
                              {bk.ticketQrCode}
                            </span>
                            {bk.refundStatus !== "NONE" && (
                              <span className="bg-orange-50 text-orange-600 border border-orange-100 font-bold px-2 text-[9px] rounded">
                                Refund: {bk.refundStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Render QR Simulator */}
                        <div className="bg-white border rounded p-1.5 shadow-sm shrink-0 flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-mono text-[9px] font-bold tracking-widest text-wrap p-1">
                            YATRA TICKET BC5
                          </div>
                          <span className="text-[8px] text-gray-400 mt-1">Scan boarding</span>
                        </div>
                      </div>

                      {/* Refund & Cancellation buttons */}
                      {bk.bookingStatus === "CONFIRMED" && bk.refundStatus === "NONE" && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setRefundTargetId(bk.id);
                              setRefundReason("");
                            }}
                            className="text-xs text-red-600 hover:bg-red-50/50 hover:underline border border-red-100 rounded px-2.5 py-1"
                          >
                            Cancel Ticket & Request Refund
                          </button>
                        </div>
                      )}

                      {refundTargetId === bk.id && (
                        <form onSubmit={submitRefundRequest} className="bg-red-50/30 border border-red-100/60 p-4 rounded-xl space-y-3">
                          <h5 className="text-xs font-bold text-red-700">Cancel ticket. Specify cancellation reason:</h5>
                          <input
                            type="text"
                            required
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Reason viz. Flight rescheduled, plan altered..."
                            className="bg-white border border-gray-300 text-xs rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-850"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-red-600 text-white text-xs font-semibold py-1.5 px-4 rounded-lg cursor-pointer"
                            >
                              Confirm Cancellation
                            </button>
                            <button
                              type="button"
                              onClick={() => setRefundTargetId(null)}
                              className="bg-white text-gray-600 border border-gray-200 text-xs rounded-lg py-1.5 px-3"
                            >
                              Discard
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Contents: Profile Details */}
          {activeTab === "profile" && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6"
            >
              <h3 className="font-bold text-gray-900 text-base">Yatra Traveler Profile Card</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Full Registered Surname</label>
                    <input 
                      type="text" 
                      value={currentUser.fullName} 
                      disabled
                      className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-500 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Phone Number (Nepal Mobile)</label>
                    <input 
                      type="text" 
                      value={currentUser.phoneNumber} 
                      disabled
                      className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-500 w-full font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={currentUser.email || "add.email@yatra.com"} 
                    disabled
                    className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-500 w-full"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    Your profile is completely verified. Your OTP token credentials authorize boarding verification automatically.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Side: Gemini Chat AI Assistant Panel & OTP Registration */}
        <div className="lg:col-span-4 space-y-6">

          {/* OTP Authentication Card (for Travelers who aren't logged in) */}
          {!currentUser && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                <h4 className="font-extrabold text-sm tracking-tight">Yatra Verified Passenger Auth</h4>
              </div>

              {authError && (
                <div className="p-2.5 bg-red-500/20 text-red-100 border border-red-500/30 rounded-lg text-xs">
                  {authError}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={triggerSendOtp} className="space-y-3.5">
                  <p className="text-xs text-slate-300">
                    Register or sign in with your Nepalese mobile number to unlock real seat maps, view live ticket logs, and initiate instant refund cancellations.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Nepal Mobile Number</label>
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                      <span className="text-sm font-semibold text-slate-400 mr-2 border-r border-slate-755 pr-2 font-mono">+977</span>
                      <input
                        type="text"
                        required
                        placeholder="985XXXXXXX"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="bg-transparent text-sm w-full focus:outline-none focus:ring-0 text-white font-mono"
                      />
                    </div>
                  </div>

                  {isRegisterMode && (
                    <div>
                      <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      {isRegisterMode ? "Already verified? Sign In" : "New User? Register"}
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm cursor-pointer"
                    >
                      Request OTP Code
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={triggerVerifyOtp} className="space-y-4">
                  <p className="text-xs text-slate-300">
                    We sent a mock SMS OTP code to your number. Enter <b>123456</b> or <b>654321</b> to log in.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Verify OTP Token</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="bg-slate-800 border border-slate-700 px-3 py-2.5 text-center text-sm font-bold tracking-widest text-white rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs py-2 px-3 rounded-xl flex-1 cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-6 rounded-xl flex-1 shadow-sm cursor-pointer"
                    >
                      Verify & Log In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Persistent Yatra AI Travel helper chatbot integrated with map selection! */}
          <YatraAI userId={currentUser?.id} onSelectTripId={handleSelectTripIdFromAI} />

          {/* Quick Nepal travel notice info box */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2.5">
            <h5 className="font-bold text-gray-800 text-xs flex items-center gap-1">
              🏔️ Nepalese Tourism Travel Notice
            </h5>
            <p className="text-[11px] text-gray-500 leading-relaxed font-normal">
              Continuous monsoon weather can alter standard travel timings. Luxury lines (VIP Sofa, Cabin sleeper) are recommended for Mugling-Malekhu segments due to active air suspension.
            </p>
          </div>
        </div>

      </div>

      {/* Advanced Simulated Payments Portal (eSewa / Khalti Modal Overlay) */}
      <AnimatePresence>
        {showPaymentModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h4 className="font-extrabold text-gray-900 text-base">Secure checkout - Boarding gateway</h4>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 px-2.5 rounded-full hover:bg-gray-100 text-gray-400 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-red-800">
                  You are locking seats: <b>{selectedSeats.join(", ")}</b>. Cost: <b>Nrs {(() => {
                    let base = selectedTrip.basePrice * selectedSeats.length;
                    let disc = 0;
                    if (appliedCoupon) {
                      disc = (base * appliedCoupon.discountPct) / 100;
                      if (disc > appliedCoupon.maxDiscount) disc = appliedCoupon.maxDiscount;
                    }
                    return base - disc + 35;
                  })()}</b>
                </div>

                <p className="text-xs text-gray-500">
                  Select payment service provider to compile transaction secure ticket dispatch:
                </p>

                {/* Gateway buttons */}
                <div className="space-y-2.5">
                  {/* eSewa */}
                  <button
                    onClick={() => setSelectedPaymentGateway("eSewa")}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      selectedPaymentGateway === "eSewa" 
                        ? "bg-emerald-50 text-emerald-900 border-emerald-500 font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                        eS
                      </div>
                      <span className="text-xs">eSewa Mobile Wallet</span>
                    </div>
                    {selectedPaymentGateway === "eSewa" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </button>

                  {/* Khalti */}
                  <button
                    onClick={() => setSelectedPaymentGateway("Khalti")}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      selectedPaymentGateway === "Khalti" 
                        ? "bg-purple-50 text-purple-900 border-purple-500 font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                        Khl
                      </div>
                      <span className="text-xs">Khalti Nepal Premium Gateway</span>
                    </div>
                    {selectedPaymentGateway === "Khalti" && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                  </button>

                  {/* IME Pay */}
                  <button
                    onClick={() => setSelectedPaymentGateway("IME Pay")}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      selectedPaymentGateway === "IME Pay" 
                        ? "bg-orange-50 text-orange-900 border-orange-500 font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-extrabold text-[10px] flex items-center justify-center">
                        IME
                      </div>
                      <span className="text-xs">IME Pay Digital Remit</span>
                    </div>
                    {selectedPaymentGateway === "IME Pay" && <CheckCircle2 className="h-4 w-4 text-orange-600" />}
                  </button>

                  {/* FonePay */}
                  <button
                    onClick={() => setSelectedPaymentGateway("FonePay")}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      selectedPaymentGateway === "FonePay" 
                        ? "bg-red-50 text-red-900 border-red-500 font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                        FP
                      </div>
                      <span className="text-xs">FonePay QR Integration</span>
                    </div>
                    {selectedPaymentGateway === "FonePay" && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                  </button>

                  {/* Credit Card */}
                  <button
                    onClick={() => setSelectedPaymentGateway("Master Card")}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      selectedPaymentGateway === "Master Card" 
                        ? "bg-slate-50 text-slate-900 border-slate-500 font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center">
                        CC
                      </div>
                      <span className="text-xs">Nepalese Credit Card checkout</span>
                    </div>
                    {selectedPaymentGateway === "Master Card" && <CheckCircle2 className="h-4 w-4 text-slate-800" />}
                  </button>
                </div>

                {/* Final dispatch pay button */}
                <div className="pt-2">
                  <button
                    onClick={finalizeBooking}
                    disabled={bookingLoading}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {bookingLoading ? "Processing payment..." : `Approve checkout via ${selectedPaymentGateway}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket generated successfully success overlay screen */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-950">Dhanyabad! Ticket reservation complete</h3>
              <p className="text-xs text-gray-500">
                You transaction succeeded. Your traveler wallet notification confirmed. E-ticket dispatched.
              </p>

              {/* The aesthetic Ticket */}
              <div className="border border-red-200/50 rounded-2xl bg-gradient-to-br from-red-600/5 to-white/70 p-5 text-left space-y-3 shadow-inner relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-red-656/5 rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Transit Pass Ticket</span>
                    <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Yatra Nepal e-Ticket</h5>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white border border-gray-200 py-0.5 px-2 rounded">
                    {confirmedBooking.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Origin / Destination</span>
                    <span className="font-bold text-gray-800">{confirmedBooking.tripDetails.fromCity} ➔ {confirmedBooking.tripDetails.toCity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Departing hub</span>
                    <span className="font-semibold text-gray-700">{new Date(confirmedBooking.tripDetails.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Assigned Seats</span>
                    <span className="font-bold text-red-600">{confirmedBooking.seatNumbers.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Vehicle plate tag</span>
                    <span className="font-mono">{confirmedBooking.tripDetails.plateNumber}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center bg-transparent">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Traveler name</span>
                    <span className="text-xs font-bold text-gray-800">{confirmedBooking.fullName}</span>
                  </div>
                  
                  {/* QR Core simulation */}
                  <div className="p-1 border border-gray-255 bg-white rounded flex flex-col items-center">
                    <div className="bg-slate-900 text-white w-12 h-12 flex items-center justify-center font-mono text-[6px] p-1 font-bold">
                      VERIFIED BOARD {confirmedBooking.id}
                    </div>
                    <span className="text-[6px] text-gray-400 mt-0.5">Quick board</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { setConfirmedBooking(null); setActiveTab("history"); }}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold py-2 px-5 rounded-xl text-xs uppercase cursor-pointer"
                >
                  View My Travel Wallet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
