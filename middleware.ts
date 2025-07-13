import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
    // Lista de rotas que precisam de autenticação
    const protectedRoutes = [
        '/api/api-keys',
        '/api/data-analysis',
        '/api/links',
        '/api/groups',
        '/api/user',
        '/api/subscription'
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
    } catch (error) {
        console.error("Token validation error:", error);
    }
    
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export const config = {
    matcher: '/api/:path*',
}; 