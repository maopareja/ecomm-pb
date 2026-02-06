/**
 * Dynamic Base Path Detection
 * 
 * This utility detects the deployment context automatically without requiring rebuilds.
 * Works in any context: localhost/, localhost/prjzdev1092, domain.com/context, etc.
 */

/**
 * Gets the current base path from the browser URL
 * @returns The base path prefix (e.g., "/prjzdev1092") or empty string for root context
 */
export function getBasePath(): string {
    // Server-side rendering: no base path
    if (typeof window === 'undefined') return '';

    const path = window.location.pathname;

    // Known deployment contexts - add more as needed
    const knownPrefixes = [
        '/prjzdev1092',
        // Add other deployment contexts here if needed
        // '/staging',
        // '/demo',
    ];

    // Check if current path starts with any known prefix
    for (const prefix of knownPrefixes) {
        if (path.startsWith(prefix)) {
            return prefix;
        }
    }

    // No prefix detected - running in root context
    return '';
}

/**
 * API base URL for fetch calls
 * Use this constant for all API requests
 */
export const API_BASE = typeof window !== 'undefined' ? getBasePath() : '';

/**
 * Link helper for Next.js <Link> components
 * @param href - The target path (e.g., "/checkout")
 * @returns Full path with base prefix (e.g., "/prjzdev1092/checkout")
 */
export function withBasePath(href: string): string {
    const base = getBasePath();
    return base + href;
}
