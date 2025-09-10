import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../../lib/mongodb";
import UserProfile from "../../../../models/UserProfile";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

        const user = await UserProfile.findOne({ userEmail: decoded.email });
        if (!user) {
            return NextResponse.json({ videos: [] });
        }

        const videos = user.content.filter((c: { type: string; }) => c.type === "video");

        return NextResponse.json({ videos });
    } catch (err) {
        console.error("Error fetching videos:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
