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
    Groups?: string[]; // existing field (if present)
    GroupID?: string[]; // new: array of group IDs user belongs to
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
        Groups: [{ type: String }], // existing
        GroupID: [{ type: String }], // new field to store group IDs
        userNumbers: [{ type: String }],
        extraDetails: [
            {
                key: { type: String },
                value: { type: String },
            },
        ],
        userEmail: { type: String, required: true },
        userNumber: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.UserDetails ||
    mongoose.model<IUserDetails>("UserDetails", userDetailsSchema);
