import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET — admin: the registration roster, optionally filtered by ?training_id=
export async function GET(request: Request) {
  const token = (await cookies()).get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trainingId = new URL(request.url).searchParams.get("training_id");

  try {
    const registrations = trainingId
      ? await query(
          "SELECT * FROM training_registrations WHERE training_id = $1 ORDER BY created_at DESC",
          [trainingId]
        )
      : await query("SELECT * FROM training_registrations ORDER BY created_at DESC");
    return NextResponse.json({ registrations });
  } catch (err) {
    console.error("Registrations fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}
