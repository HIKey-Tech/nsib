import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_LEN = 500;

// POST — public: a visitor enrols in a training
export async function POST(request: Request) {
  // Public write endpoint — throttle to stop scripted spam filling the table.
  if (!rateLimit(`train-reg:${clientIp(request)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many registrations. Try again later." }, { status: 429 });
  }

  const { training_id, full_name, email, phone, organization, location, notes } =
    await request.json();

  if (!training_id || !full_name || !email) {
    return NextResponse.json(
      { error: "Training, name and email are required" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)) || String(email).length > 254) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  for (const v of [full_name, phone, organization, location, notes]) {
    if (v != null && String(v).length > MAX_LEN) {
      return NextResponse.json({ error: "One of the fields is too long" }, { status: 400 });
    }
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
