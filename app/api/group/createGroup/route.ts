import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Group from "../../../models/Group";
import User from "../../../models/User";
import UserDetails from "../../../models/UserDetails";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json().catch(() => ({}));

        const groupName = (body.groupName as string) || (body.name as string) || "";
        const groupDescription = body.groupDescription || body.description || "";
        const groupProfilePicture = body.groupProfilePicture || null;
        const groupMemberss = body.groupMemberss || body.members || {};
        const email = body.email;
        const userNumber = body.userNumber;
        if (!groupName.trim()) {
            return NextResponse.json({ error: "Group name is required" }, { status: 400 });
        }

        let currentUserNumber = userNumber;
        if (!currentUserNumber && email) {
            const user = await User.findOne({ email }).lean<{ userNumber?: string } | null>();
            currentUserNumber = user?.userNumber;
        }
        if (!currentUserNumber) {
            return NextResponse.json({ error: "Creator userNumber is required" }, { status: 400 });
        }

        const membersMap = new Map<string, string>(Object.entries(groupMemberss));
        membersMap.set(currentUserNumber, "admin");
        const membersObj = Object.fromEntries(membersMap);

        const newGroup = await Group.create({
            groupName,
            groupDescription,
            groupProfilePicture,
            groupMemberss: membersObj,
            groupmedia: [],
        });

        // Add the new group's ID to all members' UserDetails.GroupID array
        const memberUserNumbers = Object.keys(membersObj);
        if (memberUserNumbers.length) {
            await UserDetails.updateMany(
                { userNumber: { $in: memberUserNumbers } },
                { $addToSet: { GroupID: newGroup.groupID } }
            );
        }

        return NextResponse.json(
            { message: "Group created", group: newGroup },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}