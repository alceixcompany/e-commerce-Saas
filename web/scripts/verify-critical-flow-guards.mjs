import { readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function assertIncludes(filePath, expectedSnippet) {
  const source = read(filePath);
  if (!source.includes(expectedSnippet)) {
    throw new Error(`${filePath} is missing expected snippet: ${expectedSnippet}`);
  }
}

function assertExcludes(filePath, forbiddenSnippet) {
  const source = read(filePath);
  if (source.includes(forbiddenSnippet)) {
    throw new Error(`${filePath} still contains forbidden snippet: ${forbiddenSnippet}`);
  }
}

const checks = [
  () => assertIncludes('src/app/products/ProductListingClient.tsx', 'productService.fetchPublicProductsPage'),
  () => assertExcludes('src/app/products/ProductListingClient.tsx', 'const API_URL = process.env.NEXT_PUBLIC_API_URL'),
  () => assertExcludes('src/app/products/ProductListingClient.tsx', 'fetch(`${API_URL}/public/products?`'),

  () => assertIncludes('src/app/checkout/_hooks/useCheckout.ts', 'paymentSettingsService.getPublicPaymentSettings'),
  () => assertExcludes('src/app/checkout/_hooks/useCheckout.ts', "/public/section-content/payment_settings"),

  () => assertIncludes('src/contexts/CartContext.tsx', 'useCartController'),
  () => assertExcludes('src/contexts/CartContext.tsx', 'useCartStore'),
  () => assertExcludes('src/contexts/CartContext.tsx', 'useAuthStore'),

  () => assertIncludes('src/lib/store/useAuthStore.ts', 'partialize: (state) => ({'),
  () => assertExcludes('src/lib/store/useAuthStore.ts', 'isAuthenticated: state.isAuthenticated'),
];

try {
  checks.forEach((run) => run());
  console.log('Critical flow guards passed.');
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Critical flow guards failed with an unknown error.'
  );
  process.exit(1);
}
