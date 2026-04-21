export const getCurrencySymbol = (code: string | undefined): string => {
  if (!code) return '$';
  
  switch (code.toUpperCase()) {
    case 'TRY':
      return '₺';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'USD':
      return '$';
    default:
      return '$';
  }
};

export const roundMoney = (value: number, decimals = 2): number => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  const factor = 10 ** decimals;
  return Math.round((numberValue + Number.EPSILON) * factor) / factor;
};

export const formatMoney = (
  value: number,
  locale: string | undefined = 'en-US',
  decimals = 2
): string => {
  const rounded = roundMoney(value, decimals);
  return rounded.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPrice = (
  price: number,
  currencyCode: string | undefined,
  locale: string | undefined = 'en-US'
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${formatMoney(price, locale, 2)}`;
};
