import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import UserDetails from "../../../models/UserDetails";
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

        const { username, interests, extraDetails, profilePicture } = await req.json();

        if (!username) {
            console.log("❌ Missing username");
            return NextResponse.json({ success: false, error: "Missing username" }, { status: 400 });
        }

        const userDetails = await UserDetails.create({
            username,
            interests,
            extraDetails,
            profilePicture, 
            userEmail: decoded.email,
            userNumber: decoded.userNumber,
        });

        return NextResponse.json({ success: true, data: userDetails });
    } catch (err) {
        console.error("Error in createuserdetails:", err);
        return NextResponse.json({ success: false, error: "Failed to save details" }, { status: 500 });
    }
}
