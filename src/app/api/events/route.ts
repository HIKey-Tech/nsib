import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET — public: returns upcoming/all published events
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const upcoming = searchParams.get("upcoming") === "true";

  const vals: unknown[] = ["published"];
  let sql = "SELECT * FROM events WHERE status = $1";
  if (upcoming) {
    vals.push(new Date().toISOString());
    sql += ` AND event_date >= $${vals.length}`;
  }
  vals.push(limit);
  sql += ` ORDER BY event_date ASC LIMIT $${vals.length}`;

  try {
    const events = await query(sql, vals);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Events fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST — authenticated: create an event
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  // Only admins may manage content.
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, description, event_date, end_date, location, category, image_url, registration_link } = body;

  if (!title || !event_date) {
    return NextResponse.json({ error: "Title and event date are required" }, { status: 400 });
  }

  try {
    const rows = await query(
      `INSERT INTO events (title, description, event_date, end_date, location, category,
                           image_url, registration_link, status, organizer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', $9)
       RETURNING *`,
      [
        title,
        description || "",
        event_date,
        end_date || null,
        location || "",
        category || "general",
        image_url || null,
        registration_link || null,
        payload.email,
      ]
    );
    return NextResponse.json({ event: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Event create error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// DELETE — authenticated: delete an event
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  // Only admins may manage content.
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

  try {
    await query("DELETE FROM events WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Event delete error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
