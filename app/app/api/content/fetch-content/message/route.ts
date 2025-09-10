import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongodb";
import UserProfile from "../../../../models/UserProfile";

export async function POST(req: Request) {
    try {
        const { email, userNumber } = await req.json();

        if (!email && !userNumber) {
            return NextResponse.json({ error: "Missing user info" }, { status: 400 });
        }

        await connectDB();

        const user = await UserProfile.findOne({
            $or: [{ userEmail: email }, { userNumber }],
        });

        if (!user) {
            return NextResponse.json({ messages: [] });
        }

        const messages = user.content.filter((c: any) => c.type === "text");

        return NextResponse.json({ messages });
    } catch (err) {
        console.error("Fetch messages error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
