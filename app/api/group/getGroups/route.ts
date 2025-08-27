import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import UserDetails from "../../../models/UserDetails";
import Group from "../../../models/Group";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await UserDetails.findOne({ userEmail: email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        console.log();
        const groupIDs = user.GroupID || [];

        const groups = await Group.find({ groupID: { $in: groupIDs } });

        return NextResponse.json({ groups }, { status: 200 });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
