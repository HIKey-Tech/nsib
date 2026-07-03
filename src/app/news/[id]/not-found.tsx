import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--nsib-navy)" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Article not found</h1>
      <p style={{ color: "#666" }}>This news article may have been removed or the link is incorrect.</p>
      <Link href="/news" style={{ marginTop: "1rem", padding: "0.75rem 1.75rem", background: "var(--nsib-navy)", color: "white", borderRadius: "10px", fontWeight: 600, textDecoration: "none" }}>← Back to News</Link>
    </main>
  );
}
