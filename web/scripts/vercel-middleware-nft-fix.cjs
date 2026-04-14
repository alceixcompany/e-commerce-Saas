/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Vercel's builder may expect `.next/server/middleware.js.nft.json` even though
// newer Next (Turbopack) outputs middleware under `.next/server/edge/*`.
// Creating the expected files is safe: they are used only for packaging, and
// the actual middleware bundle still comes from the manifest.

function ensureFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contents);
    console.log(`[postbuild] Created ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  const serverDir = path.join(process.cwd(), '.next', 'server');
  const nftPath = path.join(serverDir, 'middleware.js.nft.json');

  // Create only the NFT trace file. Do not create `.next/server/middleware.js`,
  // because if the platform prefers it at runtime, a stub can break middleware execution.
  ensureFile(nftPath, JSON.stringify({ version: 1, files: [] }));
}

try {
  main();
} catch (err) {
  console.warn('[postbuild] Failed to create middleware nft stub:', err);
  // Don't fail builds due to the fixer itself.
}
