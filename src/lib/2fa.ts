// /lib/2fa.ts
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export function generate2FASecret(userEmail: string) {
    const secret = speakeasy.generateSecret({
        name: `quickurl 2FA (${userEmail})`,
    });

    return {
        ascii: secret.ascii,
        base32: secret.base32, // Salve no banco
        otpauth_url: secret.otpauth_url,
    };
}

export async function generateQRCode(otpauthUrl: string) {
    return await QRCode.toDataURL(otpauthUrl);
}

export function verify2FACode(userToken: string, decryptedBase32Secret: string) {
    return speakeasy.totp.verify({
        secret: decryptedBase32Secret,
        encoding: "base32",
        token: userToken,
        window: 1,
    });
}



import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env.TWOFA_SECRET_ENCRYPTION_KEY!; // 32 bytes
const iv = crypto.randomBytes(16);

export function encryptSecret(secret: string) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
    let encrypted = cipher.update(secret);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptSecret(encrypted: string) {
    const [ivHex, contentHex] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const content = Buffer.from(contentHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
    let decrypted = decipher.update(content);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
