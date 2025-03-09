import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startPrice: {
      type: Number,
      required: true, // Предполагаю, что это обязательно
    },
    endTime: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: { type: String, enum: ["active", "ended"], default: "active" },
  },
  { timestamps: true }
);

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
