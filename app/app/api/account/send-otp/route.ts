import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const otp = generateOtp();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}`,
        });

        return NextResponse.json({ success: true, otp });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 });
    }
}
