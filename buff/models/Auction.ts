import mongoose, { Schema } from "mongoose";

const auctionSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    currentBid: { type: Number, default: 0 },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Auction ||
  mongoose.model("Auction", auctionSchema);
