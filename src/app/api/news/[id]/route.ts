import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { deleteUpload } from "@/lib/storage";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await query(
    "SELECT * FROM news WHERE id = $1 AND status = 'published' LIMIT 1",
    [id]
  );
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ news: rows[0] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  // Only admins may delete content.
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const rows = await query<{ image_url: string | null }>(
      "DELETE FROM news WHERE id = $1 RETURNING image_url",
      [id]
    );
    if (rows[0]) await deleteUpload(rows[0].image_url);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("News delete error:", err);
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 });
  }
}
