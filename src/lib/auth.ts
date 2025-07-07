import jwt from 'jsonwebtoken';

export default async function ValidateToken(token: string) {
    if (!token) {
        return { valid: false, message: "Token is missing" };
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return { valid: false, message: "JWT secret is not set" };
    }

    const isValid = jwt.verify(token, jwtSecret);
    if (isValid) {
        return { valid: true, message: "Token is valid" };
    }

    return { valid: false, message: "Token is invalid" };
}