import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import UserProfile from "../../../models/UserProfile";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {

    try {
        await dbConnect();
        const cookieHeader = req.headers.get("cookie");

        if (!cookieHeader) {
            return NextResponse.json({ success: false, error: "No auth cookie" }, { status: 401 });
        }

        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ success: false, error: "No token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            email: string;
            userNumber: string;
        };

        const { username } = await req.json();

        if (!username) {
            return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userEmail: decoded.email },
            {
                $setOnInsert: {
                    username,
                    userEmail: decoded.email,
                    userNumber: decoded.userNumber,
                    content: [],
                },
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: profile });
    } catch (err) {
        console.error("createuserprofile error:", err);
        return NextResponse.json({ success: false, error: "Failed to create profile" }, { status: 500 });
    }
}
