import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongodb";
import UserDetails from "../../../models/UserDetails";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {

  try {
    await dbConnect();

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ valid: false, error: "No cookie" });
    }

    const token = cookieHeader
      .split("; ")
      .find(c => c.startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; userNumber: string };

    const details = await UserDetails.findOne({ userEmail: decoded.email });

    if (!details) {
      return NextResponse.json({ valid: false, error: "No user details found" });
    }

    return NextResponse.json({ valid: true, details });
  } catch (err) {
    console.error("❌ Error in getUserDetail:", err);
    return NextResponse.json({ valid: false, error: "Server error" });
  }
}
