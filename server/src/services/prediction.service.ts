import User from "../models/User";
import Payment from "../models/Payment";
import Inventory from "../models/Inventory";

interface DataPoint {
  x: number;
  y: number;
}

interface RegressionResult {
  intercept: number;
  slope: number;
}

function linearRegression(data: DataPoint[]): RegressionResult {
  const n = data.length;
  if (n < 2) return { intercept: 0, slope: 0 };

  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { intercept: sumY / n, slope: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { intercept, slope };
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
}

export async function predictAttendance() {
  const users = await User.find({ role: "member" }).select("attendance");

  const weeklyAttendance: Record<string, number> = {};

  users.forEach((user) => {
    user.attendance.forEach((record: any) => {
      const date = new Date(record.date);
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date).toString().padStart(2, "0")}`;
      weeklyAttendance[weekKey] = (weeklyAttendance[weekKey] || 0) + 1;
    });
  });

  const sortedWeeks = Object.keys(weeklyAttendance).sort();
  const actualData: DataPoint[] = sortedWeeks.map((week, index) => ({
    x: index + 1,
    y: weeklyAttendance[week],
  }));

  const { intercept, slope } = linearRegression(actualData);

  const weeksToPredict = 8;
  const lastIndex = actualData.length;
  const predictions: Array<{ week: number; predicted: number }> = [];

  for (let i = 1; i <= weeksToPredict; i++) {
    const weekNum = lastIndex + i;
    const predicted = Math.max(0, Math.round(intercept + slope * weekNum));
    predictions.push({ week: weekNum, predicted });
  }

  const chartData = [
    ...actualData.map((d, i) => ({
      week: `W${d.x}`,
      label: sortedWeeks[i] || `W${d.x}`,
      actual: d.y,
      predicted: Math.round(intercept + slope * d.x),
    })),
    ...predictions.map((p) => ({
      week: `W${p.week}`,
      label: `W${p.week} (forecast)`,
      actual: null as number | null,
      predicted: p.predicted,
    })),
  ];

  return {
    model: { intercept: Math.round(intercept * 100) / 100, slope: Math.round(slope * 100) / 100 },
    totalDataPoints: actualData.length,
    chartData,
    predictions,
    peakPeriod: predictions.reduce((max, p) => (p.predicted > max.predicted ? p : max), predictions[0]),
  };
}

export async function predictClubProfit() {
  const now = new Date();
  const startWindow = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [completedPayments, activeMembers, recurringPurchaseData] = await Promise.all([
    Payment.find({ status: "completed", date: { $gte: startWindow } }).select("amount date"),
    User.countDocuments({ role: "member", status: "active" }),
    Inventory.aggregate([
      { $unwind: "$usageHistory" },
      { $match: { "usageHistory.date": { $gte: startWindow }, "usageHistory.type": "in" } },
      {
        $group: {
          _id: {
            year: { $year: "$usageHistory.date" },
            month: { $month: "$usageHistory.date" },
          },
          expenseProxy: { $sum: "$usageHistory.change" },
        },
      },
    ]),
  ]);

  const monthlyRevenueMap: Record<string, number> = {};
  completedPayments.forEach((payment) => {
    const date = new Date(payment.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + Number(payment.amount || 0);
  });

  const expenseMap: Record<string, number> = {};
  recurringPurchaseData.forEach((entry: any) => {
    const key = `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`;
    expenseMap[key] = Number(entry.expenseProxy || 0) * 50;
  });

  const monthlyProfitSeries = Array.from({ length: 12 }, (_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const revenue = monthlyRevenueMap[key] || 0;
    const expense = expenseMap[key] || 0;
    return {
      x: idx + 1,
      month: key,
      revenue,
      expense,
      profit: revenue - expense,
    };
  });

  const regressionData: DataPoint[] = monthlyProfitSeries.map((entry) => ({ x: entry.x, y: entry.profit }));
  const { intercept, slope } = linearRegression(regressionData);

  const futureMonths = 6;
  const forecasts = Array.from({ length: futureMonths }, (_, idx) => {
    const step = monthlyProfitSeries.length + idx + 1;
    const projected = Math.round(intercept + slope * step + activeMembers * 20);
    const futureDate = new Date(now.getFullYear(), now.getMonth() + idx + 1, 1);
    const month = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}`;
    return {
      month,
      projectedProfit: projected,
    };
  });

  return {
    model: {
      intercept: Math.round(intercept * 100) / 100,
      slope: Math.round(slope * 100) / 100,
    },
    activeMembers,
    history: monthlyProfitSeries,
    forecasts,
    nextMonthProjection: forecasts[0] || null,
  };
}
