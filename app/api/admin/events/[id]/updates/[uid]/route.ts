import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { deleteEventUpdate } from "@/lib/services/eventService";
import Event from "@/lib/models/Event";
import { revalidateEvent } from "@/lib/cache/revalidate";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return null;
  return session;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; uid: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, uid } = await params;
    await deleteEventUpdate(uid);
    const event = await Event.findById(id).select("slug").lean();
    if (event?.slug) revalidateEvent(event.slug);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
