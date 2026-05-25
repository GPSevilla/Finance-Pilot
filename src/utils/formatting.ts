export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, digits = 1): string {
  return `${formatNumber(value * 100, digits)}%`;
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(value);
}

export function formatMonthLabel(monthIndex: number): string {
  if (monthIndex <= 0) {
    return "Now";
  }

  const years = Math.floor(monthIndex / 12);
  const months = monthIndex % 12;
  if (!years) {
    return `${months} mo`;
  }
  if (!months) {
    return `${years} yr`;
  }
  return `${years} yr ${months} mo`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
