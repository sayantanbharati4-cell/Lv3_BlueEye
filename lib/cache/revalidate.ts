import { revalidatePath, revalidateTag } from "next/cache";

/** Next 16 requires a cache-life profile for tag revalidation. */
function markTagStale(tag: string) {
  revalidateTag(tag, "max");
}

export function revalidateArtist(slug?: string) {
  markTagStale("artists");
  revalidatePath("/");
  revalidatePath("/artists");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/artists/${slug}`);
}

export function revalidateBlog(slug?: string) {
  markTagStale("blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export function revalidateEvent(slug?: string) {
  markTagStale("events");
  revalidatePath("/");
  revalidatePath("/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

export function revalidateReviews() {
  markTagStale("reviews");
  revalidatePath("/");
}
