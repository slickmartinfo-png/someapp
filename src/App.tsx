import React, { useState, useEffect } from "react";
import { 
  Bus, Users, Compass, ShieldAlert, Sparkles, AlertTriangle, ArrowRight, MapPin, Check, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Role } from "./types";

import PassengerApp from "./components/PassengerApp";
import DriverApp from "./components/DriverApp";
import OperatorDashboard from "./components/OperatorDashboard";
import SuperAdminPanel from "./components/SuperAdminPanel";

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<string>("passenger");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  // App-level Shared Session User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Sync role to workspace selection automatically to make demo experience extremely buttery!
  const handleSelectWorkspace = (spaceId: string) => {
    setActiveWorkspace(spaceId);
    
    // Auto-login placeholder for testing if changing roles instantly
    if (spaceId === "passenger") {
      setCurrentUser({
        id: "u_5",
        phoneNumber: "9851112222",
        fullName: "Sita Kumari",
        email: "sita@yatra.com",
        role: "PASSENGER",
        isActive: true,
        createdAt: new Date().toISOString()
      });
    } else if (spaceId === "driver") {
      setCurrentUser({
        id: "u_2",
        phoneNumber: "9841987654",
        fullName: "Driver Shyam Krishna",
        email: "shyam@yatra.com",
        role: "DRIVER",
        isActive: true,
        createdAt: new Date().toISOString()
      });
    } else if (spaceId === "operator") {
      setCurrentUser({
        id: "u_3",
        phoneNumber: "9801122334",
        fullName: "Yatayat Pvt Ltd Operator",
        role: "OPERATOR",
        isActive: true,
        createdAt: new Date().toISOString()
      });
    } else if (spaceId === "admin") {
      setCurrentUser({
        id: "u_4",
        phoneNumber: "9811223344",
        fullName: "Hari Admin",
        role: "SUPER_ADMIN",
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Default to Passenger Sate on mount
  useEffect(() => {
    handleSelectWorkspace("passenger");
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Top Universal Premium Header & Navigation workspace control bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Bus className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Yatra Nepal
              </h1>
              <span className="text-[10px] text-red-600 font-mono font-bold tracking-widest uppercase block mt-1">
                E-Ticketing Transit
              </span>
            </div>
          </div>

          {/* Aesthetic switcher switcher (Desktop) */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-2xl gap-1 items-center justify-center border border-slate-200 relative">
            <button
              onClick={() => handleSelectWorkspace("passenger")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspace === "passenger"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🏔️ Passenger App
            </button>
            <button
              onClick={() => handleSelectWorkspace("driver")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspace === "driver"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🧑‍✈️ Driver App
            </button>
            <button
              onClick={() => handleSelectWorkspace("operator")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspace === "operator"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🏢 Operator Dash
            </button>
            <button
              onClick={() => handleSelectWorkspace("admin")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorkspace === "admin"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🛡️ Super Admin
            </button>
          </div>

          {/* Mobile Switcher Burger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            aria-label="Toggle App Switcher"
          >
            {menuOpen ? <X className="h-5 w-5 text-red-656" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

        {/* Mobile Dropdown Swapper */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-100 bg-white shadow-md py-3 px-6 flex flex-col gap-2 overflow-hidden"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Switch Workspace Context</p>
              <button
                onClick={() => { handleSelectWorkspace("passenger"); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                  activeWorkspace === "passenger" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏔️ Passenger Web Portal (Live Booking)
              </button>
              <button
                onClick={() => { handleSelectWorkspace("driver"); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                  activeWorkspace === "driver" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🧑‍✈️ Driver Dashboard & QR Gate Scanner
              </button>
              <button
                onClick={() => { handleSelectWorkspace("operator"); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                  activeWorkspace === "operator" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏢 operator Fleet and Schedules panel
              </button>
              <button
                onClick={() => { handleSelectWorkspace("admin"); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                  activeWorkspace === "admin" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🛡️ Super Admin Control Room (Config)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-12">
        
        {/* Transition area */}
        <div className="mt-6 text-gray-800">
          <AnimatePresence mode="wait">
            {activeWorkspace === "passenger" && (
              <motion.div
                key="passenger"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <PassengerApp 
                  currentUser={currentUser} 
                  setCurrentUser={setCurrentUser} 
                  onSelectWorkspace={handleSelectWorkspace} 
                />
              </motion.div>
            )}

            {activeWorkspace === "driver" && (
              <motion.div
                key="driver"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <DriverApp 
                  currentUser={currentUser} 
                  setCurrentUser={setCurrentUser} 
                />
              </motion.div>
            )}

            {activeWorkspace === "operator" && (
              <motion.div
                key="operator"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <OperatorDashboard 
                  currentUser={currentUser} 
                  setCurrentUser={setCurrentUser} 
                />
              </motion.div>
            )}

            {activeWorkspace === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <SuperAdminPanel 
                  currentUser={currentUser} 
                  setCurrentUser={setCurrentUser} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Workspace alert details taken to the bottom */}
      <div className="max-w-7xl mx-auto w-full px-6 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex gap-3 items-start text-xs leading-relaxed">
            <Sparkles className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold text-[13px] text-white tracking-tight">✨ Active Live Multi-User Full-Stack Database Engine!</p>
              <p className="text-slate-400 mt-0.5">
                Switch workspaces instantly to test both ends of the ecosystem: publish routes in <strong className="text-white">Operator Dash</strong>, purchase tickets in <strong className="text-white">Passenger App</strong>, boarding-verify in <strong className="text-white">Driver App</strong>, or approve instant refunds in <strong className="text-white">Super Admin</strong>!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 bg-white/10 text-[10px] font-black rounded-xl px-3 py-1.5 uppercase border border-white/10 text-white tracking-widest">
            ACTIVE VIEW: <span className="text-red-500 font-black">{activeWorkspace}</span>
          </div>
        </div>
      </div>

      {/* Footer with all the quicklinks and stuff */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-350 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-656 bg-red-600 rounded-lg flex items-center justify-center">
                <Bus className="h-4.5 w-4.5 text-white" />
              </div>
              <h2 className="text-base font-black tracking-tight text-white">Yatra Nepal</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nepal's pioneer high-capacity smart booking engine. Directly connected to 850+ luxury coaches, cross-border commercial fleets, and tourism networks.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-800 border border-slate-700 font-bold tracking-wider rounded px-2 py-0.5 uppercase text-slate-400">ISO 9001</span>
              <span className="text-[10px] bg-red-950/40 border border-red-900/60 font-bold tracking-wider rounded px-2 py-0.5 uppercase text-red-400 font-mono">Government Approved</span>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-xs font-black uppercase text-white tracking-widest">Popular Hubs & Routes</h4>
            <ul className="text-xs space-y-2 text-slate-400 font-sans">
              <li><button onClick={() => { setActiveWorkspace("passenger"); }} className="hover:text-white transition-colors cursor-pointer text-left">Kathmandu ⇄ Pokhara Tourist Lines</button></li>
              <li><button onClick={() => { setActiveWorkspace("passenger"); }} className="hover:text-white transition-colors cursor-pointer text-left">Lumbini Sacred Garden Exp</button></li>
              <li><button onClick={() => { setActiveWorkspace("passenger"); }} className="hover:text-white transition-colors cursor-pointer text-left">Chitwan National Safari Aircon</button></li>
              <li><button onClick={() => { setActiveWorkspace("passenger"); }} className="hover:text-white transition-colors cursor-pointer text-left">Nepal ⇄ India Cross-Border Cabs</button></li>
              <li><button onClick={() => { setActiveWorkspace("passenger"); }} className="hover:text-white transition-colors cursor-pointer text-left">Kathmandu ⇄ Gorakhpur Express</button></li>
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-xs font-black uppercase text-white tracking-widest">Partners & Gateways</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-400">
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">💚 eSewa Pay</span>
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">💜 Khalti Wallet</span>
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">🧡 IME Pay</span>
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">💳 Visa / Master</span>
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">🏔️ NTB Partner</span>
              <span className="bg-slate-900 p-2 rounded border border-slate-800 text-center">🚍 Nepal Yatayat</span>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-xs font-black uppercase text-white tracking-widest">Immediate Helpline Support</h4>
            <p className="text-xs text-slate-400">Need support for cross-border Scorpio booking, custom clearance, or seat adjustments?</p>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-left space-y-1">
              <p className="text-white font-extrabold text-xs">📞 Support Desk</p>
              <p className="text-red-500 font-bold text-[13px] font-mono">+977 (1) 4567890 / 9851122334</p>
              <p className="text-[10px] text-slate-500">Email: ticket@yatranepal.com</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 font-sans flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Yatra Nepal Co. All rights reserved. Registered Office: Durbar Marg, Kathmandu, Nepal.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-450 transition-all cursor-pointer">Terms</span>
            <span className="hover:text-slate-450 transition-all cursor-pointer">Privacy Charter</span>
            <span className="hover:text-slate-450 transition-all cursor-pointer">Cancellations</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
