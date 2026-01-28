import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|favicon.ico).*)",
    ],
}

export default async function middleware(req: NextRequest) {
    // Single Tenant Mode: No rewriting.
    // All requests go directly to the default app structure.
    return NextResponse.next()
}
