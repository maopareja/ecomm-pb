export const getApiBase = () => {
    // 1. Try environment variable (injected during build)
    const envBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
    if (envBase) return envBase;

    // 2. Client-side fallback: Detect from current URL if we are in the known subpath
    if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/prjzdev1092')) {
            return '/prjzdev1092';
        }
    }
    return '';
};

export const API_BASE = getApiBase();
