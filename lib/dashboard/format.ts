const moneyFmt = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const moneyFmtDecimal = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pctFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const pctFmt0 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatMoney = (value: number): string => moneyFmt.format(value);
export const formatMoneyDecimal = (value: number): string => moneyFmtDecimal.format(value);
export const formatPercent = (value: number): string => pctFmt.format(value);
export const formatPercent0 = (value: number): string => pctFmt0.format(value);
export const formatDays = (value: number): string => `${Math.abs(value).toFixed(0)} days`;
export const formatTimes = (value: number): string => `${value.toFixed(2)}x`;

export const formatCompact = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}GHS ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}GHS ${(abs / 1_000).toFixed(0)}K`;
  return formatMoney(value);
};

export const formatYAxisMoney = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};
