
export const formatNumber = (num: number, precision: number = 1): string => {
  const numAbs = Math.abs(num);
  if (numAbs < 1e3) return num.toFixed(0);
  if (numAbs < 1e6) return (num / 1e3).toFixed(precision) + 'K';
  if (numAbs < 1e9) return (num / 1e6).toFixed(precision) + 'M';
  if (numAbs < 1e12) return (num / 1e9).toFixed(precision) + 'B';
  if (numAbs < 1e15) return (num / 1e12).toFixed(precision) + 'T';
  return (num / 1e15).toFixed(precision) + 'Q';
};

export const formatHealth = (current: number, max: number): string => {
  return `${formatNumber(current, 0)} / ${formatNumber(max, 0)}`;
};

// formatPercentage removed as crit chance/damage are no longer displayed or upgraded this way.
// export const formatPercentage = (value: number, precision: number = 1): string => {
//   return `${(value * 100).toFixed(precision)}%`;
// };
