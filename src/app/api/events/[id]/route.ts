import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rows = await query<{ id: string; category: string }>(
    "SELECT * FROM events WHERE id = $1 AND status = 'published' LIMIT 1",
    [id]
  );
  const event = rows[0];

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Related events: same category, upcoming, excluding this one
  const related = await query(
    `SELECT id, title, event_date, location, category
       FROM events
      WHERE status = 'published' AND category = $1 AND id <> $2 AND event_date >= $3
      ORDER BY event_date ASC
      LIMIT 3`,
    [event.category, id, new Date().toISOString()]
  );

  return NextResponse.json({ event, related });
}
