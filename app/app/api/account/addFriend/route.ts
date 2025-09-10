import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongodb";
import UserDetails from "../../../models/UserDetails";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { userNumber } = await req.json();
        if (!userNumber) {
            return NextResponse.json({ error: "User number required" }, { status: 400 });
        }

        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };

        const currentUser = await UserDetails.findOne({ userEmail: decoded.email });
        if (!currentUser) {
            return NextResponse.json({ error: "Current user not found" }, { status: 404 });
        }

        const targetUser = await UserDetails.findOne({ userNumber });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!currentUser.userNumbers.includes(userNumber)) {
            currentUser.userNumbers.push(userNumber);
            await currentUser.save();
        }

        return NextResponse.json({ success: true, message: "Friend added" });
    } catch (err) {
        console.error("AddFriend error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
