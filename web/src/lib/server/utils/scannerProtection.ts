/**
 * Utility to identify and block common scanner/malicious slugs.
 */
export function isScannerSlug(slug: string): boolean {
    if (!slug) return false;
    const s = slug.toLowerCase();
    
    // Common scanner paths
    const scannerPaths = [
        '.env', 
        '.git', 
        'wp-admin', 
        'wp-login.php', 
        'xmlrpc.php',
        'phpmyadmin',
        'cgi-bin',
        'config.php',
        'database.sql'
    ];

    if (scannerPaths.some(path => s.includes(path))) return true;

    // Asset extensions that shouldn't be handled by the catch-all dynamic route
    const assetExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.map', '.json', '.js', '.css', '.txt'];
    if (assetExtensions.some(ext => s.endsWith(ext))) return true;

    // Garbage slugs
    if (s === 'undefined' || s === 'null') return true;

    return false;
}
