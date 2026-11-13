import { connectToDatabase } from "@/lib/db/connect";
import Review from "@/lib/models/Review";
import "@/lib/models/User";
import { unstable_cache } from "next/cache";

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

async function loadHomeReviews(): Promise<HomeReview[]> {
  await connectToDatabase();
  const reviews = await Review.find()
    .populate("user", "name username image address")
    .sort({ updatedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(reviews)) as HomeReview[];
}

/** Homepage marquee reviews, populated once on the server. */
export const getHomeReviews = unstable_cache(
  loadHomeReviews,
  ["home-reviews"],
  { revalidate: 300, tags: ["reviews"] }
);
