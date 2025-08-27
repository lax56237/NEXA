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
        const { userEmail, imageData, keywords, description } = await req.json();

        if (!userEmail || !imageData || !keywords || !description) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        // Validate imageData structure
        if (!imageData.data || !imageData.width || !imageData.height) {
            return NextResponse.json({ success: false, message: "Invalid image data" }, { status: 400 });
        }

        // Convert comma-separated keywords to array and trim whitespace
        const keywordsArray = keywords.split(',').map((kw: string) => kw.trim()).filter((kw: string) => kw.length > 0);

        if (keywordsArray.length === 0) {
            return NextResponse.json({ success: false, message: "At least one keyword is required" }, { status: 400 });
        }

        const user = await UserProfile.findOne({ userEmail });
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        // Calculate compressed size
        const compressedSize = Math.ceil(imageData.data.length * 0.75); // base64 to bytes approximation

        user.content.push({ 
            type: "image", 
            imageData: {
                data: imageData.data,
                width: imageData.width,
                height: imageData.height,
                format: imageData.format || 'jpeg',
                originalSize: imageData.originalSize || 0,
                compressedSize: compressedSize
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
            message: "Image added!",
            compressionRatio: Math.round((compressedSize / (imageData.originalSize || 1)) * 100)
        });
    } catch (err) {
        console.error("Add image error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
