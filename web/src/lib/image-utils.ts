/**
 * Utility to get a branded placeholder image based on the product category.
 * Ensures a luxury aesthetic even when actual product images are missing.
 */
export const getProductPlaceholder = (categoryName?: string): string => {
  const category = categoryName?.toLowerCase() || '';

  if (category.includes('necklace') || category.includes('kolye')) {
    return '/image/alceix/defaults/necklace.png';
  }
  
  if (category.includes('ring') || category.includes('yüzük')) {
    return '/image/alceix/defaults/ring.png';
  }
  
  if (category.includes('earring') || category.includes('küpe')) {
    return '/image/alceix/defaults/earrings.png';
  }
  
  if (category.includes('bracelet') || category.includes('bileklik')) {
    return '/image/alceix/defaults/bracelet.png';
  }

  // General default for jewelry
  return '/image/alceix/defaults/necklace.png';
};

/**
 * Utility to get a branded placeholder for blog posts/journal entries.
 */
export const getBlogPlaceholder = (): string => {
  return '/image/alceix/defaults/bracelet.png'; // Using bracelet as it fits editorial style well
};
