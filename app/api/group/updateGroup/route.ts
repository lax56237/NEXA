import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Group from "../../../models/Group";
import UserDetails from "../../../models/UserDetails";
import jwt from "jsonwebtoken";
import User from "../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { task, groupID, userNumber, role, description } = await req.json();
        // 1. Get current logged-in user via token
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        const currentUser = await User.findOne({ email: decoded.email });
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // 2. Find group
        const group = await Group.findOne({ groupID });
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const currentUserRole = group.groupMemberss.get(currentUser.userNumber);
        if (!currentUserRole) {
            return NextResponse.json({ error: "You are not in this group" }, { status: 403 });
        }

        switch (task) {
            case "editDescription":
                if (currentUserRole !== "admin") {
                    return NextResponse.json({ error: "Only admins can edit description" }, { status: 403 });
                }
                group.groupDescription = description;
                break;

            case "addMember":
                if (currentUserRole !== "admin") {
                    return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
                }
                group.groupMemberss.set(userNumber, role);
                await group.save();

                // update UserDetails
                const addUser = await UserDetails.findOne({ userNumber });
                if (addUser && !addUser.GroupID.includes(groupID)) {
                    addUser.GroupID.push(groupID);
                    await addUser.save();
                }
                break;

            case "removeMember":
                if (currentUserRole !== "admin") {
                    return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
                }
                if (group.groupMemberss.get(userNumber) === "admin") {
                    return NextResponse.json({ error: "Admins cannot remove other admins" }, { status: 403 });
                }
                group.groupMemberss.delete(userNumber);
                await group.save();

                // remove from UserDetails
                await UserDetails.updateOne(
                    { userNumber },
                    { $pull: { GroupID: groupID } }
                );
                break;

            case "changeRole":
                if (currentUserRole !== "admin") {
                    return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 });
                }
                if (!group.groupMemberss.has(userNumber)) {
                    return NextResponse.json({ error: "User not in group" }, { status: 404 });
                }
                group.groupMemberss.set(userNumber, role);
                break;

            case "exitGroup":
                console.log("comes in exit case=============");
                if (!group.groupMemberss.has(currentUser.userNumber)) {
                    return NextResponse.json({ error: "You are not in this group" }, { status: 403 });
                }

                // remove from group
                group.groupMemberss.delete(currentUser.userNumber);
                await group.save();

                // remove from user details
                await UserDetails.updateOne(
                    { userNumber: currentUser.userNumber },
                    { $pull: { GroupID: groupID } }
                );
                break;


            default:
                return NextResponse.json({ error: "Invalid task" }, { status: 400 });
        }

        await group.save();
        return NextResponse.json({ success: true, group });
    } catch (err) {
        console.error("Error in updateGroup:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
