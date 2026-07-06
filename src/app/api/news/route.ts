import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { clampInt } from "@/lib/params";

export const dynamic = 'force-dynamic';

// GET — public: returns published news
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = clampInt(searchParams.get("limit"), 20, 100);
  const category = searchParams.get("category");

  const vals: unknown[] = ["published"];
  let sql =
    "SELECT * FROM news WHERE status = $1";
  if (category) {
    vals.push(category);
    sql += ` AND category = $${vals.length}`;
  }
  vals.push(limit);
  sql += ` ORDER BY published_at DESC LIMIT $${vals.length}`;

  try {
    const news = await query(sql, vals);
    return NextResponse.json({ news });
  } catch (err) {
    console.error("News fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

// POST — authenticated: create a news item
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nsib_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  // Only admins may create content.
  if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, excerpt, content, category, image_url, published_at, report_url, report_name, report_size } = body;

  if (!title || !excerpt) {
    return NextResponse.json({ error: "Title and excerpt are required" }, { status: 400 });
  }

  try {
    const rows = await query(
      `INSERT INTO news (title, excerpt, content, category, image_url, report_url, report_name, report_size, status, published_at, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', $9, $10, $11)
       RETURNING *`,
      [
        title,
        excerpt,
        content || "",
        category || "general",
        image_url || null,
        report_url || null,
        report_name || null,
        report_size || null,
        published_at || new Date().toISOString(),
        payload.userId,
        payload.email,
      ]
    );
    return NextResponse.json({ news: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("News create error:", err);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
