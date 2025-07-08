import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptSecret, generate2FASecret } from "@/lib/2fa";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = req.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized", status: 401 });
  }

  let email: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    email = payload.email;
  } catch (err) {
    return NextResponse.json({ error: "Invalid token", status: 401 });
  }

  const secret = generate2FASecret(email);

  if (
    !secret.otpauth_url ||
    typeof secret.otpauth_url !== "string" ||
    !secret.otpauth_url.startsWith("otpauth://")
  ) {
    return NextResponse.json({ error: "Failed to generate OTP Auth URL", status: 500 });
  }

  // encrypt secret
  const encryptedSecret = encryptSecret(secret.base32);

  // save secret in database
  await prisma.user.update({
    where: { email },
    data: { twoFASecret: encryptedSecret },
  });

  // ✅ CORRIGIDO: await adicionado aqui
  const data = await QRCode.toDataURL(secret.otpauth_url);

  return NextResponse.json({ data, status: 200 });
}
