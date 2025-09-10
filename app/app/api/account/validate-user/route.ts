import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import User from "../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
        };

        await connectDB();

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return NextResponse.json({ valid: false }, { status: 404 });
        }
        return NextResponse.json({
            valid: true,
            email: user.email,
            userNumber: user.userNumber,
        });

    } catch (error) {
        console.error("Error in validate-user:", error);
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}
