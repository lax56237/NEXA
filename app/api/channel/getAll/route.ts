import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Channel from "../../../models/Channel";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ success: false, error: "No cookie" }, { status: 401 });
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ success: false, error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

    const channelDoc = await Channel.findOne({ userEmail: decoded.email });

    if (!channelDoc) {
      return NextResponse.json({ success: true, channels: { channels: [] } });
    }

    return NextResponse.json({ success: true, channels: channelDoc });
  } catch (err) {
    console.error("❌ Error in getAll channels:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
