export type Role = 'PASSENGER' | 'DRIVER' | 'OPERATOR' | 'SUPER_ADMIN';

export type BusType = 'DELUXE' | 'AC_DELUXE' | 'VIP_SOFA' | 'SLEEPER' | 'PRIVATE_SUV' | 'PRIVATE_SEDAN' | 'SHARED_CAB';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export type RefundStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Operator {
  id: string;
  userId: string;
  companyName: string;
  panNumber: string;
  isApproved: boolean;
  supportEmail: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  fullName: string; // denormalized join value
  licenseNumber: string;
  isApproved: boolean;
  currentLat?: number;
  currentLng?: number;
  lastLocationAt?: string;
}

export interface Bus {
  id: string;
  operatorId: string;
  companyName: string; // denormalized join
  plateNumber: string;
  busType: BusType;
  amenities: string[];
  totalSeats: number;
  photos: string[];
  rating: number;
}

export interface Route {
  id: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  estimatedHrs: number;
  popularRank: number;
}

export interface Trip {
  id: string;
  busId: string;
  busType: BusType;
  plateNumber: string;
  operatorName: string;
  routeId: string;
  fromCity: string;
  toCity: string;
  driverId?: string;
  driverName?: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  availableSeats: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  tripId: string;
  tripDetails: {
    fromCity: string;
    toCity: string;
    departureTime: string;
    arrivalTime: string;
    operatorName: string;
    plateNumber: string;
    busType: BusType;
  };
  seatNumbers: string[];
  totalFare: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  ticketQrCode: string;
  refundStatus: RefundStatus;
  refundReason?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPct: number;
  maxDiscount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  bookingId?: string;
  senderName: string;
  senderPhone: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
