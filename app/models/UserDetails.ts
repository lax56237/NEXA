import mongoose, { Schema, Document } from "mongoose";

interface Interest {
    topic: string;
    value: number;
}

interface ExtraDetail {
    key: string;
    value: string;
}

export interface IUserDetails extends Document {
    username: string;
    interests: Interest[];
    userNumbers: string[];
    extraDetails: ExtraDetail[];
    userEmail: string;
    userNumber: string;
     profilePicture?: string; //new one added
    Groups?: string[]; 
    GroupID?: string[];
    Channels?: string[]; 
}

const userDetailsSchema = new Schema<IUserDetails>(
    {
        username: { type: String, required: true },
        interests: [
            {
                topic: { type: String },
                value: { type: Number, default: 0 },
            },
        ],
        Groups: [{ type: String }], 
        GroupID: [{ type: String }], 
        Channels: [{ type: String }], 
        userNumbers: [{ type: String }],
        extraDetails: [
            {
                key: { type: String },
                value: { type: String },
            },
        ],
        userEmail: { type: String, required: true },
        userNumber: { type: String, required: true },
        
         // ✅ New profile picture field
        profilePicture: { type: String, default: "" }, 
        // This can hold a Base64 string or a file URL
    },
    { timestamps: true }
);

export default mongoose.models.UserDetails ||
    mongoose.model<IUserDetails>("UserDetails", userDetailsSchema);