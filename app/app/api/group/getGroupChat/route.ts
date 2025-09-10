import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Group from "@/app/models/Group";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const groupID = req.nextUrl.searchParams.get("groupID");
        if (!groupID) {
            return NextResponse.json({ error: "Missing groupID" }, { status: 400 });
        }

        const group = await Group.findOne({ groupID });
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({ messages: group.groupmedia || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
