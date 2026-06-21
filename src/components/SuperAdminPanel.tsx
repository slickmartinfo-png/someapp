import React, { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Plus, Wallet, ShieldAlert, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Operator, Driver, Coupon } from "../types";

interface SuperAdminPanelProps {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

export default function SuperAdminPanel({ currentUser, setCurrentUser }: SuperAdminPanelProps) {
  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [driverList, setDriverList] = useState<Driver[]>([]);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  
  // Custom Analytics States
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalBuses: 0,
    totalBookings: 0,
    systemRevenue: 0,
    pendingRefunds: 0,
    commissionCollected: 0
  });

  // Coupon Creation Form
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState(150);
  const [expiryDate, setExpiryDate] = useState("2026-12-31");

  // Refund tracking for cancellation payout approvals
  const [refundBookings, setRefundBookings] = useState<any[]>([]);

  const [segment, setSegment] = useState<"pending" | "coupons" | "payouts">("pending");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role === "SUPER_ADMIN") {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    try {
      // Find Operators
      const resOp = await fetch("/api/admin/operators");
      const listOp = await resOp.json();
      setOperatorList(listOp);

      // Find Drivers
      const resDr = await fetch("/api/admin/drivers");
      const listDr = await resDr.json();
      setDriverList(listDr);

      // Find Coupons
      const resCp = await fetch("/api/admin/coupons");
      const listCp = await resCp.json();
      setCouponList(listCp);

      // Find Analytics metrics
      const resMt = await fetch("/api/admin/analytics");
      const dataMt = await resMt.json();
      setMetrics(dataMt);

      // Fetch cancellation requests for payments refund payout approval
      const resTrips = await fetch("/api/trips");
      const tripsData = await resTrips.json();
      
      // Look up bookings containing cancellation REQUESTED from history logs
      // Simply query standard history for all preloaded passenger bookings is simulated nicely inside stats API
      const resHistory = await fetch("/api/operator/stats/op_1"); // operator 1 stats carries seeded bookings
      const statsData = await resHistory.json();
      
      const requestedRefunds = statsData.bookings.filter((b: any) => b.refundStatus === "REQUESTED");
      setRefundBookings(requestedRefunds);

    } catch (e) {
      console.error(e);
    }
  };

  const approveOperator = async (opId: string) => {
    try {
      const res = await fetch("/api/admin/operators-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId: opId })
      });
      if (res.ok) {
        setStatusMessage("Operator carrier license approved, fleet published live!");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveDriver = async (drvId: string) => {
    try {
      const res = await fetch("/api/admin/drivers-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: drvId })
      });
      if (res.ok) {
        setStatusMessage("Driver verified. License database authorized for active routes.");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveRefundPayment = async (bkId: string) => {
    try {
      const res = await fetch("/api/admin/refunds-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bkId })
      });
      if (res.ok) {
        setStatusMessage(`Refund issued for Ticket ${bkId}. Dispatched payouts to Khalti/eSewa.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createPromotionalCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await fetch("/api/admin/coupons-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountPct: discountPercent,
          maxDiscount,
          expiresAt: new Date(expiryDate).toISOString()
        })
      });
      if (res.ok) {
        setStatusMessage(`New Promo Code ${couponCode.toUpperCase()} configured live!`);
        setCouponCode("");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-6 shadow-xl border border-gray-105">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold mx-auto">
            🛡️
          </div>
          <h3 className="text-xl font-bold text-gray-900">Yatra Grand Super Admin</h3>
          <p className="text-xs text-gray-500 font-normal">Privileged console for approving operators and refunds</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          fetchAdminData();
        }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Super Admin Core Phone</label>
            <input
              type="text"
              required
              defaultValue="9811223344"
              className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm w-full font-mono focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-800"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              To bypass securely, click submit. Master Admin Phone: <b>9811223344</b> (OTP Token: <b>123456</b>)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Authenticate Admin Credentials
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white min-h-[500px]">
      
      {/* Super Header panels */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-[10px] bg-red-50 text-red-656 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-100">
            System Control Center
          </span>
          <h3 className="text-2xl font-black text-gray-950 mt-1 leading-none tracking-tight">
            Yatra Nepal Administration Engine
          </h3>
          <p className="text-xs text-gray-500">Global system orchestrator & commission payouts ledger</p>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Exit Admin Console
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs mb-6 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="text-red-500 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Admin Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Ledger broad revenue */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System Gross Turnovers</p>
            <h4 className="text-2xl font-extrabold text-slate-900">Nrs {metrics.systemRevenue}</h4>
            <p className="text-[10px] text-gray-500 font-semibold">Processed via Khalti, eSewa, Credit Cards</p>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Collected platform fees */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Commission Royalty (8%)</p>
            <h4 className="text-2xl font-extrabold text-slate-900">Nrs {metrics.commissionCollected}</h4>
            <p className="text-[10px] text-emerald-600 font-semibold">Retained in Yatra corporate wallets</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Total platform active users count */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registered platform Users</p>
            <h4 className="text-2xl font-extrabold text-slate-900">{metrics.totalUsers} Clients</h4>
            <p className="text-[10px] text-gray-500">Passengers, operators & registered drivers</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Pending refund items */}
        <div className="border border-gray-150 bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awaiting refund claims</p>
            <h4 className="text-2xl font-extrabold text-amber-600">{refundBookings.length} Requests</h4>
            <p className="text-[10px] text-gray-500">Demanding instant credit payouts approval</p>
          </div>
          <div className="w-10 h-10 bg-amber-50/70 text-amber-656 rounded-xl flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Admin Controls */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setSegment("pending")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              segment === "pending" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            🔒 Approvals Queue ({operatorList.filter(o => !o.isApproved).length + driverList.filter(d => !d.isApproved).length})
          </button>

          <button
            onClick={() => setSegment("coupons")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              segment === "coupons" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            🎟️ Promo Coupons Console ({couponList.length})
          </button>

          <button
            onClick={() => setSegment("payouts")}
            className={`w-full text-left font-medium text-xs py-2.5 px-4 rounded-xl flex items-center gap-2.5 transition-all ${
              segment === "payouts" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            💸 Cash Refund Payouts ({refundBookings.length})
          </button>
        </div>

        {/* Right segment rendering */}
        <div className="lg:col-span-9 space-y-6">

          {/* Segment: Approvals list */}
          {segment === "pending" && (
            <div className="space-y-6">
              
              {/* Operator approval pane */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Transport Operators Verification Queue</h4>
                
                {operatorList.filter(o => !o.isApproved).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No operators currently awaiting approval.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {operatorList.filter(o => !o.isApproved).map((op) => (
                      <div key={op.id} className="py-3 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-900 text-sm">{op.companyName}</h5>
                          <p className="text-gray-500 font-mono">PAN: {op.panNumber} | Email: {op.supportEmail}</p>
                        </div>
                        <button
                          onClick={() => approveOperator(op.id)}
                          className="bg-slate-900 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Approve Fleet PAN License
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Driver validation pane */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Driver Profile validations</h4>

                {driverList.filter(d => !d.isApproved).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">All driver license profiles fully authorized.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {driverList.filter(d => !d.isApproved).map((drv) => (
                      <div key={drv.id} className="py-3 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-800 text-sm">{drv.fullName}</h5>
                          <p className="text-gray-500">Nepalese Road Driving License: <b className="font-mono text-gray-700">{drv.licenseNumber}</b></p>
                        </div>
                        <button
                          onClick={() => approveDriver(drv.id)}
                          className="bg-red-600 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Approve Driver License Profile
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Segment: Coupon Promotional creation */}
          {segment === "coupons" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left: form */}
              <div className="md:col-span-5 bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Generate Promotional Discount Coupon</h4>

                <form onSubmit={createPromotionalCoupon} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Coupon code (caps)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. YATRA200"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full text-slate-950 uppercase font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 block font-bold mb-1">Discount percentage (%)</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        required
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block font-bold mb-1">Max Discount (Nrs)</label>
                      <input
                        type="number"
                        min={50}
                        required
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Coupon expiry date</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs rounded-xl w-full text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                  >
                    Activate Promo Code
                  </button>
                </form>
              </div>

              {/* Right: list */}
              <div className="md:col-span-7 bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Active discount promo systems</h4>

                <div className="divide-y divide-gray-100">
                  {couponList.map((cp) => (
                    <div key={cp.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="font-mono text-sm font-black text-red-600 bg-red-50 border border-red-100 px-2 rounded py-0.5 select-all">
                          {cp.code}
                        </span>
                        <p className="text-gray-500 pt-1">Gets {cp.discountPct}% off (Max discount Nrs {cp.maxDiscount})</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">
                        Exp: {new Date(cp.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Segment: Cash Refund payout approvals */}
          {segment === "payouts" && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Pending cancellation refund requests</h4>
              <p className="text-xs text-gray-500">
                Approving refund operations automatically credits the traveler's associated eSewa or Khalti balance with zero fee deduction.
              </p>

              {refundBookings.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">No cancellation files awaiting payout settlements.</p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {refundBookings.map((bk) => (
                    <div key={bk.id} className="py-4 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Ticket: {bk.id}</span>
                          <h5 className="font-bold text-slate-900 text-sm">{bk.fullName}</h5>
                          <p className="text-gray-500">Route path: {bk.tripDetails.fromCity} ➔ {bk.tripDetails.toCity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 font-bold">Canceled seats</p>
                          <p className="font-bold text-gray-800">{bk.seatNumbers.join(", ")}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-red-50/55 rounded-lg border border-red-100 flex justify-between items-center gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500">Demanded amount to pay out:</p>
                          <p className="font-extrabold text-red-656 text-sm">Nrs {bk.totalFare}</p>
                          <p className="text-[10px] text-gray-500">Refund gateway: <b className="text-slate-800">{bk.paymentMethod}</b></p>
                          <p className="text-[9px] text-red-500 block italic leading-tight">Reason: "{bk.refundReason}"</p>
                        </div>

                        <button
                          onClick={() => approveRefundPayment(bk.id)}
                          className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Check className="h-4 w-4" /> Approve Cash Transfer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
