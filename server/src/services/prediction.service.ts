import User from "../models/User";

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
