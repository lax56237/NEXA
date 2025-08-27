import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

function generateUserNumber(length = 10): string {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let userNumber = generateUserNumber();
        while (await User.findOne({ userNumber })) {
            userNumber = generateUserNumber();
        }

        const newUser = new User({
            email,
            password: hashedPassword,
            userNumber,
        });

        await newUser.save();

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            userNumber,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
