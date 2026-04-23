import { checkIfIsAPIKey, ValidateAPIKey } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization");
    const isApiKey = checkIfIsAPIKey(token!);

    if (!isApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    }

    const apiKey = await ValidateAPIKey(token!);

    if (!apiKey.valid) {
      throw new Error("Invalid API key");
    }
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error validating API key:", error);
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
}
