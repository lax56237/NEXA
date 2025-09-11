import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Channel from "../../../models/Channel";
import UserDetails from "../../../models/UserDetails";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ success: false, error: "No auth cookie" }, { status: 401 });
    }

    const token = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ success: false, error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string; userNumber?: string;[k: string]: any };

    // read incoming channel data
    const { name, description, profileImage } = await req.json();

    if (!name || !profileImage) {
      return NextResponse.json({ success: false, error: "Missing required fields (name/profileImage)" }, { status: 400 });
    }

    // try to fetch user details from DB (fallback if JWT doesn't contain userNumber)
    const userEmailFromToken = decoded.email;
    const userDetails = userEmailFromToken ? await UserDetails.findOne({ userEmail: userEmailFromToken }) : null;

    const userEmail = userEmailFromToken ?? userDetails?.userEmail ?? "";
    const userNumber = decoded.userNumber ?? userDetails?.userNumber ?? "";

    // find or create Channel doc for this user
    let channelDoc = await Channel.findOne({ userEmail });

    if (!channelDoc) {
      channelDoc = new Channel({
        userEmail,
        userNumber,
        channels: [],
      });
    } else {
      // if existing doc missing userNumber, set it (keeps schema happy)
      if ((!channelDoc.userNumber || channelDoc.userNumber === "") && userNumber) {
        channelDoc.userNumber = userNumber;
      }
    }

    // push the new channel (videos default to empty array)
    channelDoc.channels.push({
      name,
      description: description || "",
      profileImage,
      videos: [],
    });

    await channelDoc.save();

    // also add channel name into UserDetails.Channels array (if user exists)
    if (userEmail) {
      await UserDetails.updateOne({ userEmail }, { $addToSet: { Channels: name } }).catch(() => { });
    }

    return NextResponse.json({ success: true, channel: channelDoc });
  } catch (err) {
    console.error("❌ Error creating channel:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
