import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, userNumber: user.userNumber },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const response = NextResponse.json({
            success: true,
            token,
        });

        response.cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
