import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Group from "@/app/models/Group";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { groupID } = await req.json();

        if (!groupID) {
            return NextResponse.json(
                { error: "Group ID is required" },
                { status: 400 }
            );
        }

        const group = await Group.findOne({ groupID });
        
        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ group });
    } catch (error) {
        console.error("Error in getGroupDetails:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}