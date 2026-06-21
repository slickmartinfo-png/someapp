import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  User, Operator, Driver, Bus, Route, Trip, Booking, Coupon, SupportTicket, Notification, Review 
} from "./src/types";

// Initialize express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI Client lazily (safe startup if env is empty)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "dummy-key-not-set";
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// ----------------------------------------------------
// IN-MEMORY DATA TO IMITATE DATABASE STATE
// ----------------------------------------------------

let nextId = 1000;
const generateId = (prefix: string) => `${prefix}_${nextId++}`;

// Mock Users
let users: User[] = [
  { id: "u_1", phoneNumber: "9851012345", fullName: "Ram Bahadur", email: "ram@yatra.com", role: "PASSENGER", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_2", phoneNumber: "9841987654", fullName: "Shyam Krishna", email: "shyam@yatra.com", role: "DRIVER", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_3", phoneNumber: "9801122334", fullName: "Nepal Yatayat Operator", email: "info@nepalyatayat.com", role: "OPERATOR", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_4", phoneNumber: "9811223344", fullName: "Hari Admin", email: "admin@yatra.com", role: "SUPER_ADMIN", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_5", phoneNumber: "9851112222", fullName: "Sita Kumari", email: "sita@yatra.com", role: "PASSENGER", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_6", phoneNumber: "9841234567", fullName: "Ganesh Thapa", email: "ganesh@yatra.com", role: "DRIVER", isActive: true, createdAt: new Date().toISOString() },
  { id: "u_7", phoneNumber: "9861234567", fullName: "Koshi Premium Operator", email: "koshi@travel.com", role: "OPERATOR", isActive: true, createdAt: new Date().toISOString() }
];

// Mock Operators
let operators: Operator[] = [
  { id: "op_1", userId: "u_3", companyName: "Nepal Yatayat Pvt Ltd", panNumber: "123456789", isApproved: true, supportEmail: "support@nepalyatayat.com", createdAt: new Date().toISOString() },
  { id: "op_2", userId: "u_7", companyName: "Koshi Premium Travels", panNumber: "987654321", isApproved: false, supportEmail: "koshi.premium@gmail.com", createdAt: new Date().toISOString() }
];

// Mock Drivers
let drivers: Driver[] = [
  { id: "dr_1", userId: "u_2", fullName: "Shyam Krishna", licenseNumber: "L-102938/05", isApproved: true, currentLat: 27.7172, currentLng: 85.3240, lastLocationAt: new Date().toISOString() },
  { id: "dr_2", userId: "u_6", fullName: "Ganesh Thapa", licenseNumber: "L-449382/09", isApproved: false, currentLat: 28.2096, currentLng: 83.9856, lastLocationAt: new Date().toISOString() }
];

// Mock Routes
let routes: Route[] = [
  { id: "rt_1", fromCity: "Kathmandu", toCity: "Pokhara", distanceKm: 205, estimatedHrs: 6.0, popularRank: 5 },
  { id: "rt_2", fromCity: "Kathmandu", toCity: "Chitwan", distanceKm: 155, estimatedHrs: 5.0, popularRank: 4 },
  { id: "rt_3", fromCity: "Kathmandu", toCity: "Butwal", distanceKm: 260, estimatedHrs: 8.0, popularRank: 3 },
  { id: "rt_4", fromCity: "Pokhara", toCity: "Lumbini", distanceKm: 200, estimatedHrs: 7.0, popularRank: 2 },
  { id: "rt_5", fromCity: "Kathmandu", toCity: "Biratnagar", distanceKm: 380, estimatedHrs: 9.5, popularRank: 1 },
  { id: "rt_6", fromCity: "Kathmandu", toCity: "Gorakhpur", distanceKm: 360, estimatedHrs: 10.0, popularRank: 5 },
  { id: "rt_7", fromCity: "Kathmandu", toCity: "Siliguri", distanceKm: 480, estimatedHrs: 12.0, popularRank: 4 },
  { id: "rt_8", fromCity: "Pokhara", toCity: "Varanasi", distanceKm: 520, estimatedHrs: 14.0, popularRank: 3 },
  { id: "rt_9", fromCity: "Kakarbhitta", toCity: "Darjeeling", distanceKm: 110, estimatedHrs: 3.5, popularRank: 2 },
  { id: "rt_10", fromCity: "Birgunj", toCity: "Patna", distanceKm: 220, estimatedHrs: 6.0, popularRank: 4 }
];

// Mock Buses
let buses: Bus[] = [
  { id: "b_1", operatorId: "op_1", companyName: "Nepal Yatayat Pvt Ltd", plateNumber: "Ba 3 Kha 1234", busType: "VIP_SOFA", amenities: ["A/C", "WiFi", "USB Charging", "Sofa Seats", "Water Bottle", "Mineral Water", "LED TV"], totalSeats: 28, photos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"], rating: 4.8 },
  { id: "b_2", operatorId: "op_1", companyName: "Nepal Yatayat Pvt Ltd", plateNumber: "Ba 4 Kha 5678", busType: "SLEEPER", amenities: ["A/C", "Full Bed Sleeper", "USB Charging", "Blanket", "Water Bottle", "Reading Light"], totalSeats: 24, photos: ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800"], rating: 4.5 },
  { id: "b_3", operatorId: "op_2", companyName: "Koshi Premium Travels", plateNumber: "Ba 5 Kha 9901", busType: "AC_DELUXE", amenities: ["A/C", "Comfort Seats", "USB Charging", "WiFi"], totalSeats: 32, photos: ["https://images.unsplash.com/photo-1562620644-65647f3416b0?auto=format&fit=crop&q=80&w=800"], rating: 4.2 },
  { id: "b_4", operatorId: "op_1", companyName: "Nepal Yatayat Pvt Ltd", plateNumber: "Pradesh 3-03-001 Kha 4321", busType: "DELUXE", amenities: ["Comfort Seats", "Audio Sound", "Suspension Ride"], totalSeats: 35, photos: ["https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&q=80&w=800"], rating: 4.0 }
];

// Seed Trips list
let trips: Trip[] = [
  {
    id: "tr_1",
    busId: "b_1",
    busType: "VIP_SOFA",
    plateNumber: "Ba 3 Kha 1234",
    operatorName: "Nepal Yatayat Pvt Ltd",
    routeId: "rt_1",
    fromCity: "Kathmandu",
    toCity: "Pokhara",
    driverId: "dr_1",
    driverName: "Shyam Krishna",
    departureTime: "2026-06-22T07:00:00.000Z",
    arrivalTime: "2026-06-22T13:00:00.000Z",
    basePrice: 1500,
    availableSeats: 25,
    amenities: ["A/C", "WiFi", "USB Charging", "Sofa Seats", "Water Bottle"]
  },
  {
    id: "tr_2",
    busId: "b_2",
    busType: "SLEEPER",
    plateNumber: "Ba 4 Kha 5678",
    operatorName: "Nepal Yatayat Pvt Ltd",
    routeId: "rt_1",
    fromCity: "Kathmandu",
    toCity: "Pokhara",
    driverId: "dr_1",
    driverName: "Shyam Krishna",
    departureTime: "2026-06-22T21:00:00.000Z",
    arrivalTime: "2026-06-23T03:00:00.000Z",
    basePrice: 1800,
    availableSeats: 24,
    amenities: ["A/C", "Full Bed Sleeper", "USB Charging", "Blanket", "Water Bottle"]
  },
  {
    id: "tr_3",
    busId: "b_3",
    busType: "AC_DELUXE",
    plateNumber: "Ba 5 Kha 9901",
    operatorName: "Koshi Premium Travels",
    routeId: "rt_5",
    fromCity: "Kathmandu",
    toCity: "Biratnagar",
    driverId: "dr_2",
    driverName: "Ganesh Thapa",
    departureTime: "2026-06-22T08:00:00.000Z",
    arrivalTime: "2026-06-22T17:30:00.000Z",
    basePrice: 1200,
    availableSeats: 30,
    amenities: ["A/C", "Comfort Seats", "USB Charging", "WiFi"]
  },
  {
    id: "tr_4",
    busId: "b_4",
    busType: "DELUXE",
    plateNumber: "Pradesh 3-03-001 Kha 4321",
    operatorName: "Nepal Yatayat Pvt Ltd",
    routeId: "rt_2",
    fromCity: "Kathmandu",
    toCity: "Chitwan",
    driverId: "dr_1",
    driverName: "Shyam Krishna",
    departureTime: "2026-06-22T06:30:00.000Z",
    arrivalTime: "2026-06-22T11:30:00.000Z",
    basePrice: 950,
    availableSeats: 35,
    amenities: ["Comfort Seats", "Audio Sound"]
  },
  {
    id: "tx_1",
    busId: "cab_1",
    busType: "PRIVATE_SUV",
    plateNumber: "Ba 2 Cha 8899",
    operatorName: "Ryde Nepal-India Cabs",
    routeId: "rt_6",
    fromCity: "Kathmandu",
    toCity: "Gorakhpur",
    driverId: "dr_1",
    driverName: "Shyam Krishna",
    departureTime: "2026-06-22T06:00:00.000Z",
    arrivalTime: "2026-06-22T16:00:00.000Z",
    basePrice: 14500,
    availableSeats: 6,
    amenities: ["A/C", "Nepal-India Permit", "Luggage Carrier", "Scorpio SUV", "Bottled Water"]
  },
  {
    id: "tx_2",
    busId: "cab_2",
    busType: "PRIVATE_SEDAN",
    plateNumber: "Ba 1 Cha 4455",
    operatorName: "Sherpa Cross-Border Transit",
    routeId: "rt_7",
    fromCity: "Kathmandu",
    toCity: "Siliguri",
    driverId: "dr_2",
    driverName: "Ganesh Thapa",
    departureTime: "2026-06-22T05:30:00.000Z",
    arrivalTime: "2026-06-22T17:30:00.000Z",
    basePrice: 17000,
    availableSeats: 4,
    amenities: ["A/C", "Nepal-India Permit", "Toyota Etios Sedan", "En-route Meals Assistance", "USB Port"]
  },
  {
    id: "tx_3",
    busId: "cab_3",
    busType: "SHARED_CAB",
    plateNumber: "Ba 3 Cha 1211",
    operatorName: "Mithila Border Cabs",
    routeId: "rt_10",
    fromCity: "Kathmandu",
    toCity: "Patna",
    driverId: "dr_1",
    driverName: "Shyam Krishna",
    departureTime: "2026-06-22T10:00:00.000Z",
    arrivalTime: "2026-06-22T16:00:00.000Z",
    basePrice: 2800,
    availableSeats: 4,
    amenities: ["A/C", "Shared Seat", "Luggage Included", "Tata Sumo Comfy", "Direct Customs clearance"]
  },
  {
    id: "tx_4",
    busId: "cab_4",
    busType: "SHARED_CAB",
    plateNumber: "Ba 2 Cha 5678",
    operatorName: "Himalayan Ridge Riders",
    routeId: "rt_8",
    fromCity: "Pokhara",
    toCity: "Varanasi",
    driverId: "dr_2",
    driverName: "Ganesh Thapa",
    departureTime: "2026-06-22T04:00:00.000Z",
    arrivalTime: "2026-06-22T18:00:00.000Z",
    basePrice: 3500,
    availableSeats: 5,
    amenities: ["A/C", "Shared Seat", "English Speaking Driver", "Luggage Carrier", "Permit Included"]
  }
];

// Seed active dynamic Bookings
let bookings: Booking[] = [
  {
    id: "bk_1",
    userId: "u_5",
    fullName: "Sita Kumari",
    phoneNumber: "9851112222",
    tripId: "tr_1",
    tripDetails: {
      fromCity: "Kathmandu",
      toCity: "Pokhara",
      departureTime: "2026-06-22T07:00:00.000Z",
      arrivalTime: "2026-06-22T13:00:00.000Z",
      operatorName: "Nepal Yatayat Pvt Ltd",
      plateNumber: "Ba 3 Kha 1234",
      busType: "VIP_SOFA"
    },
    seatNumbers: ["A1", "A2"],
    totalFare: 3000,
    paymentMethod: "eSewa",
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    ticketQrCode: "TICKET-BK1-A1-A2-SITA",
    refundStatus: "NONE",
    createdAt: new Date().toISOString()
  }
];

// Coupons
let coupons: Coupon[] = [
  { id: "c_1", code: "YATRA200", discountPct: 10, maxDiscount: 200, expiresAt: "2026-12-31T23:59:59.000Z", isActive: true },
  { id: "c_2", code: "NEPALNEW", discountPct: 15, maxDiscount: 500, expiresAt: "2026-07-31T23:59:59.000Z", isActive: true }
];

// Support Tickets
let supportTickets: SupportTicket[] = [
  { id: "st_1", bookingId: "bk_1", senderName: "Sita Kumari", senderPhone: "9851112222", subject: "Sofa seat AC feedback", message: "The ac in VIP sofa was a bit cold but overall good service.", status: "OPEN", createdAt: new Date().toISOString() }
];

// Active real-time locked seats store to prevent double booking in passenger app!
// Key: tripId_seatNumber -> timestamp
let lockedSeats: Record<string, number> = {};

// Reviews
let reviews: Review[] = [
  { id: "rev_1", userId: "u_5", userName: "Sita Kumari", targetId: "tr_1", rating: 5, comment: "Excellent journey and very comfortable sofa seats. Strongly recommended!", createdAt: new Date().toISOString() }
];

// Notifications
let notifications: Notification[] = [
  { id: "nt_1", userId: "u_5", title: "Trip Booked Successfully!", content: "Your booking for Kathmandu -> Pokhara tomorrow at 7:00 AM on VIP Sofa is confirmed.", isRead: false, createdAt: new Date().toISOString() }
];

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Authenticate / OTP Login Simulation
app.post("/api/auth/otp-send", (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.length < 10) {
    return res.status(400).json({ error: "Invalid Nepal mobile phone number" });
  }
  // Simulate sending standard SMS OTP
  res.json({ message: "OTP sent to " + phoneNumber + " successfully", otpCode: "123456" });
});

app.post("/api/auth/otp-verify", (req, res) => {
  const { phoneNumber, otpCode, fullName, role } = req.body;
  if (otpCode !== "123456" && otpCode !== "654321") {
    return res.status(400).json({ error: "Incorrect or expired OTP code" });
  }

  // Find or register passenger
  let user = users.find(u => u.phoneNumber === phoneNumber);
  if (!user) {
    user = {
      id: generateId("u"),
      phoneNumber,
      fullName: fullName || "Yatra Traveler",
      role: (role as any) || "PASSENGER",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    
    // Auto provision Operator profile if user registers as an operator
    if (user.role === "OPERATOR") {
      operators.push({
        id: generateId("op"),
        userId: user.id,
        companyName: `${user.fullName} Yatayat Pvt Ltd`,
        panNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
        isApproved: false,
        supportEmail: `${user.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        createdAt: new Date().toISOString()
      });
    }

    // Auto provision Driver profile if registered as a driver
    if (user.role === "DRIVER") {
      drivers.push({
        id: generateId("dr"),
        userId: user.id,
        fullName: user.fullName,
        licenseNumber: `L-${Math.floor(100000 + Math.random() * 900000)}/09`,
        isApproved: false,
        currentLat: 27.7172,
        currentLng: 85.3240,
        lastLocationAt: new Date().toISOString()
      });
    }
  }

  res.json({ message: "Login successful", user });
});

// Update Profile
app.post("/api/user/profile-update", (req, res) => {
  const { userId, fullName, email } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  res.json({ message: "Profile updated successfully", user });
});

// Search Routes / Popular
app.get("/api/routes", (req, res) => {
  res.json(routes);
});

// Get structured active Trips for Search (by From, To, Date)
app.get("/api/trips", (req, res) => {
  const { from, to, date } = req.query;
  let results = trips;
  if (from) {
    results = results.filter(t => t.fromCity.toLowerCase() === (from as string).toLowerCase());
  }
  if (to) {
    results = results.filter(t => t.toCity.toLowerCase() === (to as string).toLowerCase());
  }
  // Date is simulated loosely since we have dynamic seed data. To make it extremely user friendly, we show available trips.
  res.json(results);
});

// Get Trip detail by ID (along with seat maps)
app.get("/api/trips/:id", (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  // Compute booked seats from confirm/pending bookings
  const bookedSeats: string[] = [];
  bookings
    .filter(b => b.tripId === trip.id && b.bookingStatus !== "CANCELLED")
    .forEach(b => bookedSeats.push(...b.seatNumbers));

  // Compute locked/pending seats that aren't finalized yet
  const activeLocks: string[] = [];
  const now = Date.now();
  Object.entries(lockedSeats).forEach(([key, expiry]) => {
    if (expiry > now && key.startsWith(`${trip.id}_`)) {
      activeLocks.push(key.replace(`${trip.id}_`, ""));
    }
  });

  res.json({
    ...trip,
    bookedSeats,
    lockedSeats: activeLocks
  });
});

// Live Seat Lock simulation endpoint (real-time prevention)
app.post("/api/seats/lock", (req, res) => {
  const { tripId, seatNumbers, durationMs = 120000 } = req.body; // Default lock for 2 minutes
  if (!tripId || !seatNumbers || !Array.isArray(seatNumbers)) {
    return res.status(400).json({ error: "Missing tripId or seatNumbers" });
  }

  const now = Date.now();
  const alreadyBooked: string[] = [];
  
  // Verify booking
  bookings
    .filter(b => b.tripId === tripId && b.bookingStatus !== "CANCELLED")
    .forEach(b => alreadyBooked.push(...b.seatNumbers));

  // Verify other locks
  const overlap = seatNumbers.filter((s: string) => {
    if (alreadyBooked.includes(s)) return true;
    const lockExpiry = lockedSeats[`${tripId}_${s}`];
    return lockExpiry && lockExpiry > now;
  });

  if (overlap.length > 0) {
    return res.status(409).json({ error: `Seats [${overlap.join(", ")}] are already reserved or locked` });
  }

  // Set locks
  seatNumbers.forEach((s: string) => {
    lockedSeats[`${tripId}_${s}`] = now + durationMs;
  });

  res.json({ success: true, message: "Seats successfully locked", lockedUntil: new Date(now + durationMs).toISOString() });
});

// Create Bookings with custom Simulated Payment structure (eSewa, Khalti, IME Pay, FonePay, Master Card)
app.post("/api/bookings/book", (req, res) => {
  const { userId, tripId, seatNumbers, paymentMethod, couponCode } = req.body;
  if (!userId || !tripId || !seatNumbers || seatNumbers.length === 0) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "Passenger profile not found" });

  const trip = trips.find(t => t.id === tripId);
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  // Compute Price
  let basePrice = trip.basePrice * seatNumbers.length;
  let discount = 0;
  if (couponCode) {
    const couponObj = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (couponObj) {
      discount = (basePrice * couponObj.discountPct) / 100;
      if (discount > couponObj.maxDiscount) discount = couponObj.maxDiscount;
    }
  }
  const totalFare = basePrice - discount;

  // Book seats
  const booking: Booking = {
    id: generateId("bk"),
    userId: user.id,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    tripId: trip.id,
    tripDetails: {
      fromCity: trip.fromCity,
      toCity: trip.toCity,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      operatorName: trip.operatorName,
      plateNumber: trip.plateNumber,
      busType: trip.busType
    },
    seatNumbers,
    totalFare,
    paymentMethod,
    paymentStatus: paymentMethod === "COSD" ? "UNPAID" : "PAID", // Card or automatic simulator auto-approves
    bookingStatus: "CONFIRMED",
    ticketQrCode: `VERIFY-YATRA-${trip.id}-${seatNumbers.join("-")}-${Math.floor(Math.random() * 9000 + 1000)}`,
    refundStatus: "NONE",
    createdAt: new Date().toISOString()
  };

  // Add booking to database
  bookings.push(booking);

  // Update trip available seats count
  trip.availableSeats = Math.max(0, trip.availableSeats - seatNumbers.length);

  // Clear locks
  seatNumbers.forEach((s: string) => {
    delete lockedSeats[`${tripId}_${s}`];
  });

  // Create real persistent confirmation notification
  notifications.unshift({
    id: generateId("nt"),
    userId: user.id,
    title: "Yatra Booked!",
    content: `Ticket ${booking.id} verified. Destination: ${trip.toCity} with ${trip.operatorName}. Seat: ${seatNumbers.join(", ")}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: "Ticket booked successfully", booking });
});

// Booking History
app.get("/api/bookings/history/:userId", (req, res) => {
  const result = bookings.filter(b => b.userId === req.params.userId);
  res.json(result);
});

// Request Cancellation & Refund Tracking
app.post("/api/bookings/refund-request", (req, res) => {
  const { bookingId, refundReason } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Booking record not found" });

  booking.refundStatus = "REQUESTED";
  booking.refundReason = refundReason || "Customer cancellation";
  booking.bookingStatus = "CANCELLED";

  // Re-enable available seats
  const trip = trips.find(t => t.id === booking.tripId);
  if (trip) {
    trip.availableSeats += booking.seatNumbers.length;
  }

  // Create Super Admin refund notification
  notifications.unshift({
    id: generateId("nt"),
    userId: "u_4", // Admin
    title: "New Refund Demanded",
    content: `${booking.fullName} requested refund for Ticket ${booking.id}. Amount: Nrs ${booking.totalFare}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: "Refund request lodged successfully. Our super admin team will verify it shortly.", booking });
});

// Support ticket generation
app.post("/api/support/ticket-create", (req, res) => {
  const { bookingId, senderName, senderPhone, subject, message } = req.body;
  const ticket: SupportTicket = {
    id: generateId("st"),
    bookingId,
    senderName: senderName || "Anonymous Traveler",
    senderPhone: senderPhone || "",
    subject: subject || "System Query",
    message: message || "",
    status: "OPEN",
    createdAt: new Date().toISOString()
  };
  supportTickets.unshift(ticket);
  res.json({ message: "Support ticket raised successfully. Ticket Ref: " + ticket.id, ticket });
});

app.get("/api/support/tickets", (req, res) => {
  res.json(supportTickets);
});

// ----------------------------------------------------
// DRIVER APP ENDPOINTS
// ----------------------------------------------------

// Get trips assigned to driver
app.get("/api/driver/trips/:driverId", (req, res) => {
  const results = trips.filter(t => t.driverId === req.params.driverId);
  res.json(results);
});

// Get passenger manifest lists
app.get("/api/driver/manifest/:tripId", (req, res) => {
  const list = bookings.filter(b => b.tripId === req.params.tripId && b.bookingStatus === "CONFIRMED");
  res.json(list);
});

// Scan Ticket / QR verification endpoint
app.post("/api/driver/qr-verify", (req, res) => {
  const { qrCodeText, tripId } = req.body;
  const booking = bookings.find(b => b.ticketQrCode === qrCodeText || b.id === qrCodeText);
  if (!booking) {
    return res.status(404).json({ verified: false, error: "No matching Yatra ticket found" });
  }

  if (tripId && booking.tripId !== tripId) {
    return res.status(400).json({ 
      verified: false, 
      error: `Ticket belongs to a different trip to ${booking.tripDetails.toCity}` 
    });
  }

  if (booking.bookingStatus === "CANCELLED") {
    return res.status(400).json({ verified: false, error: "This ticket has already been CANCELLED and REFUNDED" });
  }

  res.json({
    verified: true,
    bookingId: booking.id,
    fullName: booking.fullName,
    seats: booking.seatNumbers,
    fromCity: booking.tripDetails.fromCity,
    toCity: booking.tripDetails.toCity,
    status: booking.paymentStatus,
    company: booking.tripDetails.operatorName
  });
});

// Driver GPS tracking post
app.post("/api/driver/gps-share", (req, res) => {
  const { driverId, lat, lng } = req.body;
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return res.status(404).json({ error: "Driver profile not found" });

  driver.currentLat = parseFloat(lat);
  driver.currentLng = parseFloat(lng);
  driver.lastLocationAt = new Date().toISOString();

  res.json({ success: true, message: "GPS telemetry saved.", currentLat: lat, currentLng: lng });
});

// Get Live Bus location for map simulation
app.get("/api/trips/:id/location", (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  if (trip.driverId) {
    const driver = drivers.find(d => d.id === trip.driverId);
    if (driver) {
      return res.json({
        tripId: trip.id,
        driverName: driver.fullName,
        currentLat: driver.currentLat || 27.7172,
        currentLng: driver.currentLng || 85.3240,
        lastLocationAt: driver.lastLocationAt || new Date().toISOString()
      });
    }
  }

  // Fallback to Kathmandu coordinates
  res.json({
    tripId: trip.id,
    driverName: "Simulated Autopilot",
    currentLat: 27.7172,
    currentLng: 85.3240,
    lastLocationAt: new Date().toISOString()
  });
});

// ----------------------------------------------------
// OPERATOR DASHBOARD ENDPOINTS
// ----------------------------------------------------

// Get Operator buses
app.get("/api/operator/buses/:operatorId", (req, res) => {
  const result = buses.filter(b => b.operatorId === req.params.operatorId);
  res.json(result);
});

// Create new Trip Schedule (Operator Dashboard)
app.post("/api/operator/trips-schedule", (req, res) => {
  const { busId, routeId, departureTime, basePrice, driverId } = req.body;
  
  const bus = buses.find(b => b.id === busId);
  if (!bus) return res.status(404).json({ error: "Specified bus profile not found" });

  const routeObj = routes.find(r => r.id === routeId);
  if (!routeObj) return res.status(404).json({ error: "Specified route not found" });

  const depDate = new Date(departureTime);
  const arrDate = new Date(depDate.getTime() + routeObj.estimatedHrs * 60 * 60 * 1000);

  const newTrip: Trip = {
    id: generateId("tr"),
    busId,
    busType: bus.busType,
    plateNumber: bus.plateNumber,
    operatorName: bus.companyName,
    routeId,
    fromCity: routeObj.fromCity,
    toCity: routeObj.toCity,
    driverId: driverId || "dr_1",
    driverName: drivers.find(d => d.id === driverId)?.fullName || "Shyam Krishna",
    departureTime: depDate.toISOString(),
    arrivalTime: arrDate.toISOString(),
    basePrice: Number(basePrice) || 1000,
    availableSeats: bus.totalSeats,
    amenities: bus.amenities
  };

  trips.push(newTrip);
  res.json({ message: "Route trip schedule generated, publishing live!", trip: newTrip });
});

// Operator Fleet add
app.post("/api/operator/buses-add", (req, res) => {
  const { operatorId, companyName, plateNumber, busType, amenities, totalSeats } = req.body;
  const newBus: Bus = {
    id: generateId("b"),
    operatorId,
    companyName: companyName || "Yatra Travels",
    plateNumber,
    busType,
    amenities: amenities || ["A/C", "WiFi", "USB Charging"],
    totalSeats: Number(totalSeats) || 30,
    photos: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"],
    rating: 5.0
  };
  buses.push(newBus);
  res.json({ message: "Fleet bus profile added successfully", bus: newBus });
});

// Operator performance statistics
app.get("/api/operator/stats/:id", (req, res) => {
  const opBuses = buses.filter(b => b.operatorId === req.params.id);
  const busIds = opBuses.map(b => b.id);
  
  // Find trips of those buses
  const opTrips = trips.filter(t => busIds.includes(t.busId));
  const tripIds = opTrips.map(t => t.id);

  // Find bookings on those trips
  const opBookings = bookings.filter(b => tripIds.includes(b.tripId));

  const totalRevenue = opBookings
    .filter(b => b.paymentStatus === "PAID" && b.bookingStatus !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalFare, 0);

  res.json({
    revenue: totalRevenue,
    fleetCount: opBuses.length,
    activeTripsCount: opTrips.length,
    bookingsCount: opBookings.length,
    bookings: opBookings
  });
});

// ----------------------------------------------------
// SUPER ADMIN ENDPOINTS
// ----------------------------------------------------

app.get("/api/admin/operators", (req, res) => {
  res.json(operators);
});

app.post("/api/admin/operators-approve", (req, res) => {
  const { operatorId } = req.body;
  const operator = operators.find(op => op.id === operatorId);
  if (!operator) return res.status(404).json({ error: "Operator not found" });

  operator.isApproved = true;

  // Let associated Koshi Premium buses be unlocked
  buses.forEach(b => {
    if (b.operatorId === operatorId) {
      // Keep alignment
    }
  });

  res.json({ message: "Operator company approved successfully!", operator });
});

app.get("/api/admin/drivers", (req, res) => {
  res.json(drivers);
});

app.post("/api/admin/drivers-approve", (req, res) => {
  const { driverId } = req.body;
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return res.status(404).json({ error: "Driver profile not found" });

  driver.isApproved = true;
  res.json({ message: "Driver profile verified & approved successfully", driver });
});

// Approve refund payouts and dispatch
app.post("/api/admin/refunds-approve", (req, res) => {
  const { bookingId } = req.body;
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: "Booking session not found" });

  booking.refundStatus = "APPROVED";
  booking.paymentStatus = "REFUNDED";

  // Notify passenger
  notifications.unshift({
    id: generateId("nt"),
    userId: booking.userId,
    title: "Refund Approved (Yatra Nepal)",
    content: `Refund for Ticket ${booking.id} (Nrs ${booking.totalFare}) has been completed via ${booking.paymentMethod}.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: "Refund payouts sent to operator gateway.", booking });
});

app.post("/api/admin/coupons-add", (req, res) => {
  const { code, discountPct, maxDiscount, expiresAt } = req.body;
  const newCoupon: Coupon = {
    id: generateId("cp"),
    code: code.toUpperCase(),
    discountPct: Number(discountPct) || 10,
    maxDiscount: Number(maxDiscount) || 150,
    expiresAt: expiresAt || "2026-12-31T23:59:59.000Z",
    isActive: true
  };
  coupons.push(newCoupon);
  res.json({ message: "Promotional coupon code created successfully", coupon: newCoupon });
});

app.get("/api/admin/coupons", (req, res) => {
  res.json(coupons);
});

// System Analytics for Super Admin
app.get("/api/admin/analytics", (req, res) => {
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "PAID" && b.bookingStatus !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalFare, 0);

  const pendingRefunds = bookings.filter(b => b.refundStatus === "REQUESTED").length;

  res.json({
    totalUsers: users.length,
    totalBuses: buses.length,
    totalBookings: bookings.length,
    systemRevenue: totalRevenue,
    pendingRefunds,
    commissionCollected: totalRevenue * 0.08 // 8% system commission
  });
});

// ----------------------------------------------------
// AI ASSISTANT "YATRA AI" CHATBOT (GEMINI API)
// ----------------------------------------------------

app.post("/api/ai/chat", async (req, res) => {
  const { messages, userProfile } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid payload: messages expected" });
  }

  try {
    const gemini = getGeminiClient();

    // Dynamically feed available Nepal schedules directly to Gemini system instructions so it speaks factual data!
    const routesSummary = routes.map(r => `${r.fromCity} to ${r.toCity} (Distance: ${r.distanceKm}km, duration: ${r.estimatedHrs} hours)`).join("\n");
    const scheduleSummary = trips.map(t => `- [ID: ${t.id}] ${t.operatorName} (${t.busType}): Depart ${t.departureTime} at Nrs ${t.basePrice}. Seats left: ${t.availableSeats}. Plate: ${t.plateNumber}`).join("\n");
    
    const systemPrompt = `
You are "Yatra AI", the premium conversational travel assistant of "Yatra Nepal", the finest bus booking platform in Nepal.
Your job is to recommend schedules, answer policies, suggest beautiful locations, explain route packages, and help search buses factually.

Current scheduled trips today:
${scheduleSummary}

Popular Nepalese route statistics:
${routesSummary}

Active Promo Codes:
${coupons.map(c => `- Code: ${c.code} gets ${c.discountPct}% off (Max Discount: Nrs ${c.maxDiscount})`).join("\n")}

Key Booking Policies of Yatra Nepal:
- Simple Cancellation: Lodged cancellation requests are reviewed instantly.
- 100% Refund payout: Direct to eSewa/Khalti for approved cash refund within 12 hours.
- Verified Premium Buses: Only highly-approved transport operators like Nepal Yatayat, Koshi Travels are boarded.
- Real-time Boarding: Built-in QR scanner onboard standard buses.

Rules:
1. Always be helpful, extremely clean, concise, polite, and Nepalese hospitality-inspired. Introduce yourself briefly if relevant.
2. If the traveler wants to search or book, suggest they can use the Yatra passenger interface search bar, look up standard scheduled ids, or tell them the exact schedule ID and direct price. Example: Recommended scheduled trip is tr_1 (VIP Sofa) at Nrs 1500.
3. Keep answers concise. Do not output system JSON lists unless requested. Standard markdown is great! Keep format beautiful. Do not mention code endpoints or server implementations. Speak as a premium service support desk. Output in markdown.
`;

    // Package conversational history for Gemini
    // Extract last user text
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Let's call Gemini API cleanly
    const completion = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: lastUserMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const reply = completion.text || "I apologize, custom network error prevented me from analyzing route tables. Please try search filters manually!";
    res.json({ reply });
  } catch (err: any) {
    console.error("Yatra AI Error:", err);
    res.json({ 
      reply: "Namaste! I'm Yatra AI. It seems our direct satellite API connection is sleeping. Let me inform you that popular buses go from Kathmandu to Pokhara (VIP Sofa, Nrs 1500, departure 7:00 AM) and Kathmandu to Biratnagar (AC Deluxe, Nrs 1200)! You can instantly book them using the dynamic seat search card on the left panel!" 
    });
  }
});


// ----------------------------------------------------
// VITE DEV SERVER / STANDALONE ING COMPILING MIDDLEWARES
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Yatra Nepal Engine] Running on local address: http://localhost:${PORT}`);
  });
}

startServer();
