export const formatCurrency = (
  amount: number,
  currency: string = '$',
  showPlus: boolean = false
): string => {
  const isPositive = amount > 0;
  const absFormatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showPlus && isPositive) {
    return `+${currency}${absFormatted}`;
  } else if (amount < 0) {
    return `-${currency}${absFormatted}`;
  }
  return `${currency}${absFormatted}`;
};

export const formatShortDate = (dateString: string): string => {
  const d = new Date(dateString);
  const now = new Date();
  
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
};

export const formatDateGroupHeader = (dateString: string): string => {
  const d = new Date(dateString);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const dateFormatted = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isToday) return `Today • ${dateFormatted}`;
  if (isYesterday) return `Yesterday • ${dateFormatted}`;
  return dateFormatted;
};
