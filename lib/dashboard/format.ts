const MINUS = "−";

/** GH¢ 12.34M / GH¢ 456K, with a true minus sign. */
export const formatMoney = (value: number, decimals = 2): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? MINUS : "";
  if (abs >= 1_000_000) return `${sign}GH¢ ${(abs / 1_000_000).toFixed(decimals)}M`;
  if (abs >= 1_000) return `${sign}GH¢ ${(abs / 1_000).toFixed(0)}K`;
  return `${sign}GH¢ ${abs.toFixed(0)}`;
};

/** Figures in GH¢ millions for tables, negatives in brackets (accounting style). */
export const formatMillions = (value: number): string => {
  if (value === 0) return "–";
  if (Math.abs(value) < 5_000) return value < 0 ? "(<0.01)" : "<0.01";
  const s = (Math.abs(value) / 1_000_000).toFixed(2);
  return value < 0 ? `(${s})` : s;
};

export const formatPercent = (value: number, decimals = 1): string =>
  `${value < 0 ? MINUS : ""}${(Math.abs(value) * 100).toFixed(decimals)}%`;

export const formatPoints = (value: number): string =>
  `${value > 0 ? "+" : value < 0 ? MINUS : ""}${Math.abs(value * 100).toFixed(1)} pts`;

export const formatRatio = (value: number): string => `${value.toFixed(2)}x`;

export const formatAxisMillions = (value: number): string => {
  if (value === 0) return "0";
  const m = Math.abs(value / 1_000_000);
  return `${value < 0 ? MINUS : ""}${Number.isInteger(m) ? m : m.toFixed(1)}M`;
};
