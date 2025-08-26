import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: true });
    if (!token) return NextResponse.json({ error: "NO_TOKEN" }, { status: 401 });
    return NextResponse.json({ token });
}