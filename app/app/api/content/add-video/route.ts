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
        const { userEmail, videoData, thumbnail, keywords, description } = await req.json();

        if (!userEmail || !videoData || !thumbnail || !keywords || !description) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        // Validate thumbnail structure
        if (!thumbnail.data || !thumbnail.width || !thumbnail.height) {
            return NextResponse.json({ success: false, message: "Invalid thumbnail data" }, { status: 400 });
        }

        // Convert comma-separated keywords to array and trim whitespace
        const keywordsArray = keywords.split(',').map((kw: string) => kw.trim()).filter((kw: string) => kw.length > 0);

        if (keywordsArray.length === 0) {
            return NextResponse.json({ success: false, message: "At least one keyword is required" }, { status: 400 });
        }

        const user = await UserProfile.findOne({ userEmail });
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        // Calculate compressed sizes
        const videoCompressedSize = Math.ceil(videoData.length * 0.75);
        const thumbnailCompressedSize = Math.ceil(thumbnail.data.length * 0.75);

        user.content.push({ 
            type: "video", 
            videoData,
            thumbnail: {
                data: thumbnail.data,
                width: thumbnail.width,
                height: thumbnail.height,
                format: thumbnail.format || 'jpeg',
                originalSize: thumbnail.originalSize || 0,
                compressedSize: thumbnailCompressedSize
            },
            keywords: keywordsArray,
            description,
            likes: [],
            comments: [],
            createdAt: new Date()
        });
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: "Video added!",
            compressionRatio: Math.round((thumbnailCompressedSize / (thumbnail.originalSize || 1)) * 100)
        });
    } catch (err) {
        console.error("Add video error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
