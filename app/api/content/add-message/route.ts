import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import UserProfile from "../../../models/UserProfile";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI as string);
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { userEmail, message, keywords, description } = await req.json();

        if (!userEmail || !message || !keywords || !description) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        // Convert comma-separated keywords to array and trim whitespace
        const keywordsArray = keywords.split(',').map((kw: string) => kw.trim()).filter((kw: string) => kw.length > 0);

        if (keywordsArray.length === 0) {
            return NextResponse.json({ success: false, message: "At least one keyword is required" }, { status: 400 });
        }

        const user = await UserProfile.findOne({ userEmail });
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        user.content.push({ 
            type: "text", 
            message, 
            keywords: keywordsArray,
            description,
            likes: [],
            comments: [],
            createdAt: new Date()
        });
        await user.save();

        return NextResponse.json({ success: true, message: "Text message added!" });
    } catch (err) {
        console.error("Add message error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
