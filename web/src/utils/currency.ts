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

export const formatPrice = (price: number, currencyCode: string | undefined): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // Custom logic for space if needed
  return `${symbol} ${formattedPrice}`;
};
