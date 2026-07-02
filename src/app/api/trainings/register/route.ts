import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST — public: a visitor enrols in a training
export async function POST(request: Request) {
  const { training_id, full_name, email, phone, organization, location, notes } =
    await request.json();

  if (!training_id || !full_name || !email) {
    return NextResponse.json(
      { error: "Training, name and email are required" },
      { status: 400 }
    );
  }

  try {
    // Confirm the training exists and is open before recording a registration.
    const exists = await query(
      "SELECT 1 FROM trainings WHERE id = $1 AND status = 'published'",
      [training_id]
    );
    if (exists.length === 0) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    await query(
      `INSERT INTO training_registrations
         (training_id, full_name, email, phone, organization, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        training_id,
        full_name,
        email,
        phone || null,
        organization || null,
        location || null,
        notes || null,
      ]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Training registration error:", err);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
