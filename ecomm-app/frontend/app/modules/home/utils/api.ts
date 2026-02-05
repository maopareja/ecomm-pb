const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // Attempt to extract tenant from URL if on a tenant page
    let tenantSlug = "";
    if (typeof window !== 'undefined') {
        const pathParts = window.location.pathname.split('/');
        if (pathParts[1] === 'sites' && pathParts[2]) {
            tenantSlug = pathParts[2];
        } else {
            // Check subdomain
            const hostParts = window.location.hostname.split('.');
            if (hostParts.length > 1 && hostParts[0] !== 'localhost' && hostParts[0] !== 'www') {
                tenantSlug = hostParts[0];
            }
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {})
    };

    // Remove trailing slash and prepend API_BASE
    const sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const finalUrl = `${API_BASE}${sanitizedUrl}`;

    const response = await fetch(finalUrl, {
        ...options,
        headers,
        credentials: 'include'
    });

    return response;
};
