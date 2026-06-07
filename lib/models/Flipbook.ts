import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpread {
  leftImage: string;
  rightImage: string;
  title: string;
  subtitle: string;
}

export interface IFlipbook extends Document {
  userId: string;
  title: string;
  description: string;
  coverFrontImage?: string;
  coverBackImage?: string;
  audioUrl?: string;
  spreads: ISpread[];
  createdAt: Date;
  updatedAt: Date;
}

const SpreadSchema = new Schema<ISpread>({
  leftImage: { type: String, required: true },
  rightImage: { type: String, required: true },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});

const FlipbookSchema = new Schema<IFlipbook>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    coverFrontImage: { type: String, default: "" },
    coverBackImage: { type: String, default: "" },
    audioUrl: { type: String, default: "" },
    spreads: { type: [SpreadSchema], required: true, default: [] },
  },
  { timestamps: true }
);

// Force schema re-registration to prevent Next.js hot-reload caching issues
if (mongoose.models.Flipbook) {
  delete mongoose.models.Flipbook;
}

const Flipbook: Model<IFlipbook> = mongoose.model<IFlipbook>("Flipbook", FlipbookSchema);

export default Flipbook;

