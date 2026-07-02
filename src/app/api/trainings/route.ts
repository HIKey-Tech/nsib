import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET — public: list published trainings (with registration counts)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const trainings = await query(
      `SELECT t.*,
              (SELECT count(*) FROM training_registrations r WHERE r.training_id = t.id) AS reg_count
       FROM trainings t
       WHERE status = 'published'
       ORDER BY start_date ASC
       LIMIT $1`,
      [limit]
    );
    return NextResponse.json({ trainings });
  } catch (err) {
    console.error("Trainings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch trainings" }, { status: 500 });
  }
}

// POST — admin: create a training
export async function POST(request: Request) {
  const token = (await cookies()).get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, venue, category, start_date, end_date } = await request.json();
  if (!title || !start_date) {
    return NextResponse.json({ error: "Title and start date are required" }, { status: 400 });
  }

  try {
    const rows = await query(
      `INSERT INTO trainings (title, description, venue, category, start_date, end_date, organizer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description || "",
        venue || "",
        category || "general",
        start_date,
        end_date || null,
        payload.email,
      ]
    );
    return NextResponse.json({ training: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Training create error:", err);
    return NextResponse.json({ error: "Failed to create training" }, { status: 500 });
  }
}

// DELETE — admin: delete a training (registrations cascade)
export async function DELETE(request: Request) {
  const token = (await cookies()).get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Training ID required" }, { status: 400 });

  try {
    await query("DELETE FROM trainings WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Training delete error:", err);
    return NextResponse.json({ error: "Failed to delete training" }, { status: 500 });
  }
}
