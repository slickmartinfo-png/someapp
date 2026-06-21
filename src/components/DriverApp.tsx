import React, { useState, useEffect } from "react";
import { 
  Bus, UserCheck, ShieldAlert, Navigation, QrCode, ClipboardList, MapPin, 
  MapPinOff, Bell, Play, Power, CheckCircle, AlertTriangle, CheckSquare, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Driver, Trip, Booking } from "../types";

interface DriverAppProps {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

export default function DriverApp({ currentUser, setCurrentUser }: DriverAppProps) {
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [assignedTrips, setAssignedTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  
  // Passenger manifest simulation
  const [manifest, setManifest] = useState<Booking[]>([]);
  
  // GPS sharing toggles & coordinates
  const [gpsActive, setGpsActive] = useState(false);
  const [currentLat, setCurrentLat] = useState(27.7172);
  const [currentLng, setCurrentLng] = useState(85.3240);
  const [telemetryMessage, setTelemetryMessage] = useState("");

  // Scan simulation states
  const [inputQrCode, setInputQrCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    verified: boolean;
    error?: string;
    bookingId?: string;
    fullName?: string;
    seats?: string[];
    toCity?: string;
    payment_status?: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // SOS Emergency toggles
  const [isSosActive, setIsSosActive] = useState(false);
  const [boardedSeats, setBoardedSeats] = useState<string[]>([]);

  // Local OTP Auth simulator for Driver
  const [phoneInput, setPhoneInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role === "DRIVER") {
      loadDriverProfile();
    }
  }, [currentUser]);

  const loadDriverProfile = async () => {
    if (!currentUser) return;
    try {
      // Find driver profile
      const res = await fetch("/api/admin/drivers");
      const list = await res.json();
      const profile = list.find((d: any) => d.userId === currentUser.id);
      if (profile) {
        setDriverProfile(profile);
        fetchDriverTrips(profile.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDriverTrips = async (drvId: string) => {
    try {
      const res = await fetch(`/api/driver/trips/${drvId}`);
      const data = await res.json();
      setAssignedTrips(data);
      if (data.length > 0) {
        handleSelectTrip(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setScanResult(null);
    try {
      const res = await fetch(`/api/driver/manifest/${trip.id}`);
      const list = await res.json();
      setManifest(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Perform GPS Telemetry loop simulation
  useEffect(() => {
    let interval: any;
    if (gpsActive && driverProfile) {
      interval = setInterval(() => {
        // Slowly increment coordinates representing Mugling -> Pokhara Highway line
        setCurrentLat(prev => prev + (Math.random() - 0.48) * 0.002);
        setCurrentLng(prev => prev + (Math.random() - 0.48) * 0.002);

        // Send telemetry to server
        fetch("/api/driver/gps-share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: driverProfile.id,
            lat: currentLat.toFixed(5),
            lng: currentLng.toFixed(5)
          })
        }).then(res => res.json())
          .then(data => setTelemetryMessage(`Live GPS shared: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`))
          .catch(e => console.error(e));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [gpsActive, currentLat, currentLng, driverProfile]);

  const triggerDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!phoneInput) return;
    try {
      const res = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneInput,
          otpCode: "123456", // Default OTP
          fullName: "Driver Prem",
          role: "DRIVER"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setOtpSent(false);
      } else {
        setAuthError(data.error);
      }
    } catch (e) {
      setAuthError("Failed to verify Driver profile with server");
    }
  };

  const scanSimulateVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQrCode || !selectedTrip) return;
    setIsScanning(true);
    setScanResult(null);

    // Simulate 1s scan time
    setTimeout(async () => {
      try {
        const res = await fetch("/api/driver/qr-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrCodeText: inputQrCode.trim(),
            tripId: selectedTrip.id
          })
        });
        const data = await res.json();
        if (res.ok) {
          setScanResult({
            verified: true,
            bookingId: data.bookingId,
            fullName: data.fullName,
            seats: data.seats,
            toCity: data.toCity,
            payment_status: data.status
          });
        } else {
          setScanResult({
            verified: false,
            error: data.error || "Invalid or Unrecognized ticket"
          });
        }
      } catch (err) {
        setScanResult({ verified: false, error: "Network scanner validation error" });
      } finally {
        setIsScanning(false);
      }
    }, 1200);
  };

  const markPassengerBoarded = (seatsList: string[]) => {
    setBoardedSeats([...boardedSeats, ...seatsList]);
    setScanResult(null);
    setInputQrCode("");
  };

  const handleToggleSos = () => {
    setIsSosActive(!isSosActive);
    // Persist a server alert or message
  };

  if (!currentUser || currentUser.role !== "DRIVER") {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold mx-auto border border-slate-800">
            🚍
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Yatra Nepal Driver Portal</h3>
          <p className="text-xs text-slate-500">Sign in with master credentials to access today's routes</p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 text-red-750 text-xs border border-red-100 rounded-xl mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={triggerDriverLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Driver Phone Number</label>
            <input
              type="text"
              required
              placeholder="9841987654"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm w-full font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
              To login instantly, you can use pre-seeded driver phone: <b>9841987654</b> (OTP auto-applied as <b>123456</b>)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Sign In to Driver Workspace
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-white border border-slate-200 rounded-3xl shadow-sm min-h-[500px]">
      
      {/* Header telemetry and statuses */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Driver Cabin Terminal
          </span>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-1">
            Namaste, {currentUser.fullName} 
            {driverProfile?.isApproved ? (
              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                ✓ Verified License
              </span>
            ) : (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold animate-pulse">
                ⏳ Approval Pending
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500">License ID Ref: {driverProfile?.licenseNumber || "N/A"}</p>
        </div>

        {/* SOS Button panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSos}
            className={`px-4 py-2 rounded-xl text-xs font-bold leading-normal cursor-pointer transition-all flex items-center gap-1.5 ${
              isSosActive 
                ? "bg-red-600 text-white animate-bounce" 
                : "bg-red-50 text-red-656 hover:bg-red-100 border border-red-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" /> 
            {isSosActive ? "SOS EMERGENCY ACTIVATED!" : "🚨 SEND TRIP SOS ALERT"}
          </button>
          
          <button
            onClick={() => setCurrentUser(null)}
            className="text-xs text-gray-500 hover:text-black border px-3 py-2 rounded-xl hover:bg-gray-50"
          >
            Leave Cabin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Manifest and Active Assigned Trips */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Assigned Trip select list */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Bus className="h-4 w-4 text-red-600" /> Driver's Assigned Daily Schedules
            </h4>

            {assignedTrips.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No schedules registered for your vehicle today.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedTrips.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => handleSelectTrip(tr)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedTrip?.id === tr.id 
                        ? "bg-red-50/50 border-red-500 ring-1 ring-red-500/50" 
                        : "bg-white border-gray-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Trip Ref ID: {tr.id}</span>
                      <span className="text-[10px] bg-white border font-mono px-2 rounded">{tr.plateNumber}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">{tr.fromCity} ➜ {tr.toCity}</h5>
                    <p className="text-xs text-gray-600 mt-1">Departing {new Date(tr.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Assigned Operator: {tr.operatorName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Passenger Boarding list Manifest */}
          {selectedTrip && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-slate-800" /> Active Booking Passenger Manifest
                </h4>
                <span className="text-xs bg-gray-100 px-2.5 py-1 rounded font-bold text-slate-600">
                  {manifest.length} Confirmed Groups
                </span>
              </div>

              {manifest.length === 0 ? (
                <div className="p-6 text-center text-gray-400 italic text-xs space-y-1">
                  <p>No confirmed passenger tickets booked on this schedule yet.</p>
                  <p className="text-[10px] text-gray-400 font-normal">Go back to Passenger App, book some tickets and refresh!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {manifest.map((bk) => (
                    <div key={bk.id} className="py-3.5 flex flex-wrap justify-between items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{bk.fullName}</h5>
                          <span className="text-[10px] font-mono bg-gray-100 py-0.5 px-2 rounded font-semibold">{bk.id}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-455" /> +977-{bk.phoneNumber} | Payment: <b>{bk.paymentStatus}</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold">Assigned Seats</p>
                          <p className="font-bold text-red-600 text-sm">{bk.seatNumbers.join(", ")}</p>
                        </div>

                        {/* Boarding state checkbox simulation */}
                        {bk.seatNumbers.every(s => boardedSeats.includes(s)) ? (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 font-bold">
                            <CheckSquare className="h-4 w-4" /> Boarded
                          </span>
                        ) : (
                          <button
                            onClick={() => markPassengerBoarded(bk.seatNumbers)}
                            className="bg-slate-900 hover:bg-red-600 text-white rounded-lg text-[11px] font-bold px-3 py-1.5 transition-colors cursor-pointer"
                          >
                            Mark Boarded
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right: GPS tracking simulation and Camera QR Scan simulator */}
        <div className="lg:col-span-4 space-y-6">

          {/* GPS telemetry engine */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <Navigation className="h-4.5 w-4.5 text-red-500" /> Bus GPS Sharing Engine
              </h4>
              <button
                onClick={() => setGpsActive(!gpsActive)}
                className={`py-1 px-3 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${
                  gpsActive ? "bg-emerald-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                }`}
              >
                {gpsActive ? "GPS ON" : "GPS OFF"}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300">
                PWA background simulation. Feeds live coordinates onto traveller maps for Mugling routes.
              </p>
              
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 font-mono text-[11px] space-y-1 text-slate-200">
                <p>Latitude: <b className="text-red-400">{currentLat.toFixed(5)}</b></p>
                <p>Longitude: <b className="text-red-400">{currentLng.toFixed(5)}</b></p>
              </div>

              {telemetryMessage && (
                <p className="text-[10px] text-emerald-400 text-center animate-pulse">{telemetryMessage}</p>
              )}
            </div>
          </div>

          {/* Camera QR scan Simulator */}
          {selectedTrip && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <QrCode className="h-4.5 w-4.5 text-red-656" /> Boarding Ticket Scanner
              </h4>

              <form onSubmit={scanSimulateVerify} className="space-y-3">
                <p className="text-xs text-gray-500">
                  Simulate scanning. Copy/Paste either passenger Booking ID (e.g. <b>bk_1</b>) or Ticket QR String (e.g. <b>VERIFY-YATRA-...</b>):
                </p>
                
                <input
                  type="text"
                  required
                  placeholder="Paste ticket code or Booking ID here"
                  value={inputQrCode}
                  onChange={(e) => setInputQrCode(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-red-500 font-mono text-gray-800"
                />

                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-slate-900 text-white hover:bg-slate-950 font-bold text-xs py-2 px-4 rounded-xl shadow-inner transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isScanning ? "Contacting database via sat..." : "Initiate Verification Scan"}
                </button>
              </form>

              {/* Scan outcome rendering */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                      scanResult.verified 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {scanResult.verified ? (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                      )}
                      <span>{scanResult.verified ? "TICKET VERIFICATION SUCCESSFUL" : "VERIFICATION FAILED"}</span>
                    </div>

                    {scanResult.verified ? (
                      <div className="space-y-1 font-normal text-gray-700">
                        <p>Passenger name: <b>{scanResult.fullName}</b></p>
                        <p>Assumed seats: <b>{scanResult.seats?.join(", ")}</b></p>
                        <p>Destination: <b>{scanResult.toCity}</b></p>
                        <p>Financial ledger state: <b>{scanResult.payment_status}</b></p>

                        <button
                          type="button"
                          onClick={() => scanResult.seats && markPassengerBoarded(scanResult.seats)}
                          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg transition-colors cursor-pointer text-center text-[11px]"
                        >
                          Confirm Boarding Check-In
                        </button>
                      </div>
                    ) : (
                      <p className="font-normal text-red-656 leading-relaxed">
                        Reason: {scanResult.error}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
