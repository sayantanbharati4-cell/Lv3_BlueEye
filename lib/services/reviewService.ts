import { connectToDatabase } from "@/lib/db/connect";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export type HomeReview = {
  _id: string;
  user?: {
    name?: string;
    username?: string;
    image?: string;
    address?: string;
  } | null;
  rating: number;
  text: string;
  isEdited: boolean;
  role?: string;
};

/** Homepage marquee reviews, populated once on the server. */
export async function getHomeReviews(): Promise<HomeReview[]> {
  await connectToDatabase();
  const reviews = await Review.find()
    .populate("user", "name username image address")
    .sort({ updatedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(reviews)) as HomeReview[];
}
