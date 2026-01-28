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

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    return response;
};
