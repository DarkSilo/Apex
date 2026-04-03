export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "coach" | "member";
  sport: string;
  membershipType: "monthly" | "annual" | "lifetime";
  status: "active" | "inactive";
  phone: string;
  attendance: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  date: string;
  sessionId?: string;
}

export interface InventoryUsageEntry {
  date: string;
  type: "in" | "out" | "adjustment";
  change: number;
  previousStock: number;
  newStock: number;
  reason: string;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  currentStock: number;
  condition: "new" | "good" | "fair" | "poor";
  minThreshold: number;
  sport: string;
  description: string;
  isLowStock?: boolean;
  usageHistory?: InventoryUsageEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  coachId: User | string;
  sport: string;
  status: "scheduled" | "completed" | "cancelled";
  maxParticipants: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  memberId: User | string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed" | "refunded";
  method: "cash" | "card" | "bank_transfer" | "online";
  description: string;
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  coaches: number;
  sportBreakdown: Array<{ _id: string; count: number }>;
}

export interface PredictionData {
  model: { intercept: number; slope: number };
  totalDataPoints: number;
  chartData: Array<{
    week: string;
    label: string;
    actual: number | null;
    predicted: number;
  }>;
  predictions: Array<{ week: number; predicted: number }>;
  peakPeriod: { week: number; predicted: number };
}

export interface MonthlyReport {
  period: { year: number; month: number };
  summary: {
    totalRevenue: number;
    totalPayments: number;
    avgPayment: number;
  };
  monthlyBreakdown: Array<{
    _id: number;
    revenue: number;
    count: number;
  }>;
  payments: Payment[];
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  members: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}
