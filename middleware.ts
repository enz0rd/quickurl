import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { ValidateAPIKey } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // Lista de rotas que precisam de autenticação
    console.log("MIDDLEWARE AQUI --------------------------------------------------");
    const protectedRoutes = [
        '/api/keys/:path*',
        '/api/data-analysis/:path*',
        '/api/links/:path*',
        '/api/groups/:path*',
        '/api/user/:path*',
        '/api/subscription/:path*'
    ];

    // Verifica se a rota atual precisa de autenticação
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const token = request.headers.get("Authorization");

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("ERROR VALIDATING TOKEN - JWT secret is not set");
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

    try {
        const isValid = jwt.verify(token, jwtSecret);
        if (isValid) {
            return NextResponse.next();
        }
    } catch {
        try {
            const apiKey = await ValidateAPIKey(token);
            if (apiKey.valid) {
                return NextResponse.next();
            }
        
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } catch (err) {
            console.error("Error validating token: ", err);
        }
    }
    

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export const config = {
    matcher: '/api/:path*',
}; 