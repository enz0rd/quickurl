import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export default async function ValidateToken(req: Request) {
    const token = req.headers.get("Authorization");
    
    if (!token) {
        NextResponse.json({ message: "Unauthorized" }, {status: 401});
        return;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("ERROR VALIDATING TOKEN - JWT secret is not set");
        NextResponse.json({ message: "Internal server error" }, {status: 500});
        return;
    }

    const isValid = jwt.verify(token, jwtSecret);
    if (isValid) {
        const decoded = jwt.decode(token);
        return { valid: true, token: decoded, message: "Token is valid" };
    }
    
    NextResponse.json({ message: "Unauthorized" }, {status: 401});
}