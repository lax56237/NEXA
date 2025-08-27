import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Group from "../../../models/Group";
import UserDetails from "../../../models/UserDetails";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { groupID, userNumber, role } = await req.json();

        if (!groupID || !userNumber || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const group = await Group.findOne({ groupID });
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        group.groupMemberss.set(userNumber, role);
        await group.save();

        const user = await UserDetails.findOne({ userNumber });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.GroupID.includes(groupID)) {
            user.GroupID.push(groupID);
            await user.save();
        }

        return NextResponse.json({ success: true, group, user });
    } catch (err: any) {
        console.error("Error adding member:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
