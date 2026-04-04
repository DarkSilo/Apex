export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "badge-success",
    inactive: "badge-neutral",
    completed: "badge-success",
    requested: "badge-info",
    submitted: "badge-warning",
    pending: "badge-warning",
    failed: "badge-danger",
    refunded: "badge-info",
    scheduled: "badge-info",
    cancelled: "badge-danger",
    new: "badge-success",
    good: "badge-info",
    fair: "badge-warning",
    poor: "badge-danger",
  };
  return colors[status] || "badge-neutral";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
