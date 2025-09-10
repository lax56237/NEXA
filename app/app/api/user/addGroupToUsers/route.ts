import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserDetails from "@/app/models/UserDetails";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json().catch(() => ({}));
        const groupID = typeof body.groupID === "string" ? body.groupID : "";
        const userNumbers = Array.isArray(body.userNumbers) ? body.userNumbers : [];

        if (!groupID) {
            return NextResponse.json({ error: "groupID is required" }, { status: 400 });
        }
        if (!userNumbers.length) {
            return NextResponse.json({ error: "userNumbers array is required" }, { status: 400 });
        }

        const res = await UserDetails.updateMany(
            { userNumber: { $in: userNumbers } },
            { $addToSet: { GroupID: groupID } }
        );

        return NextResponse.json({ matchedCount: res.matchedCount, modifiedCount: res.modifiedCount }, { status: 200 });
    } catch (error) {
        console.error("Error in addGroupToUsers:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}