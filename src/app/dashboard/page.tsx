"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

type Sector = "aviation" | "maritime" | "railway" | "other";
type ReportType = "preliminary" | "final" | "interim" | "safety_bulletin";
type NewsCategory = "general" | "safety" | "aviation" | "maritime" | "railway" | "press_release" | "announcement";

interface Report {
  id: string;
  report_no: string;
  title: string;
  type: ReportType;
  sector: Sector;
  report_status: string | null;
  operator: string | null;
  reg_no: string | null;
  vehicle_type: string | null;
  train_name: string | null;
  occurrence: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  published_at: string;
  created_at: string;
  status: string;
  uploader_name: string;
}

const REPORT_STATUSES = ["Preliminary Report", "Interim Statement", "Final Report", "Safety Advisory"];

interface Publication {
  id: string;
  title: string;
  category: string;
  reference_no: string | null;
  status: string | null;
  file_url: string;
  published_at: string;
  uploader_name: string;
}

const PUB_CATEGORIES = [
  { value: "legislation", label: "Legislation" },
  { value: "mou", label: "MoU" },
  { value: "form", label: "Form / Checklist" },
  { value: "manual", label: "Investigation Manual" },
  { value: "foi", label: "FOI Document" },
  { value: "general", label: "General" },
];

// Per-sector field labels, matching the client's exact column names.
const FIELD_LABELS: Record<Sector, { operator: string; reg: string; vtype: string }> = {
  aviation: { operator: "Aircraft Operator", reg: "Reg No", vtype: "Aircraft Type" },
  maritime: { operator: "Operator", reg: "Vessel/Craft No", vtype: "Vessel Type" },
  railway: { operator: "Train Operator", reg: "Reg No", vtype: "Train Type" },
  other: { operator: "Operator / Party", reg: "Reference", vtype: "Type" },
};

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  image_url: string | null;
  published_at: string;
  author_name: string;
  status: string;
}

interface User {
  userId: string;
  email: string;
  role: string;
}

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  totp_enabled: boolean;
  created_at: string;
}

interface Analytics {
  totals: { views: number; unique_visitors: number; news_views: number; downloads: number };
  byDay: { day: string; count: number }[];
  topPages: { path: string; count: number }[];
  topNews: { id: string; title: string; count: number }[];
  topReports: { id: string; title: string; sector: string; count: number }[];
  sectorDownloads: { sector: string; count: number }[];
}

const SECTORS = [
  { value: "aviation", label: "Aviation", color: "#1B2A6B", icon: "✈" },
  { value: "maritime", label: "Maritime", color: "#0077B6", icon: "⚓" },
  { value: "railway", label: "Railway", color: "#6A0572", icon: "🚆" },
  { value: "other", label: "Other", color: "#475569", icon: "⚠" },
];

const NEWS_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "safety", label: "Safety Alert" },
  { value: "aviation", label: "Aviation" },
  { value: "maritime", label: "Maritime" },
  { value: "railway", label: "Railway" },
  { value: "press_release", label: "Press Release" },
  { value: "announcement", label: "Announcement" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// PUT a file to a signed URL, reporting bytes sent. fetch() can't report upload
// progress, so we use XHR for the one request that's actually slow on a thin uplink.
function putWithProgress(url: string, file: File, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded); };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed (network error)"));
    xhr.send(file);
  });
}

// Downscale + re-encode raster images so covers don't hog a slow uplink.
// Returns the original untouched for non-images or when it wouldn't help.
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 1600;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/webp", 0.82));
    if (!blob || blob.size >= file.size) return file; // no win — keep original
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file; // decoding failed — upload as-is
  }
}

// Upload a file and return its public URL. Prefers a direct-to-storage signed URL
// (bypasses Vercel's 4.5MB function-body limit); falls back to a normal POST on
// local-disk dev. `subdir` is "reports" or "covers".
async function uploadFileToStorage(file: File, subdir: string, onProgress: (loaded: number) => void): Promise<string> {
  const initRes = await fetch("/api/reports/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, subdir }),
  });
  const init = await initRes.json();
  if (!initRes.ok) throw new Error(init.error || "Could not start upload");

  if (init.signed) {
    await putWithProgress(init.uploadUrl, file, onProgress);
    return init.publicUrl;
  }

  // Local-disk fallback — small dev files go through the function.
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/reports/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "File upload failed");
  onProgress(file.size);
  return data.url;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ROWS_PER_PAGE = 10;

function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const btn = (active: boolean): React.CSSProperties => ({
    minWidth: 34, height: 34, padding: "0 0.5rem", borderRadius: 8,
    border: active ? "1.5px solid #1B2A6B" : "1.5px solid #E2E8F0",
    background: active ? "#1B2A6B" : "white", color: active ? "white" : "#1B2A6B",
    fontWeight: active ? 700 : 500, fontSize: "0.85rem", cursor: "pointer",
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "1.25rem" }}>
      <button style={{ ...btn(false), opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }} disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button key={n} style={btn(n === page)} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button style={{ ...btn(false), opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }} disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

function RankBars({ items }: { items: { label: string; count: number; tag?: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className={styles.rankList}>
      {items.map((it, i) => (
        <div key={i} className={styles.rankRow}>
          <div className={styles.rankLabel} title={it.label}>
            {it.tag && <span className={styles.rankTag}>{it.tag}</span>}
            <span className={styles.rankText}>{it.label}</span>
          </div>
          <div className={styles.rankBarTrack}>
            <div className={styles.rankBarFill} style={{ width: `${(it.count / max) * 100}%` }} />
          </div>
          <span className={styles.rankCount}>{it.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newsImageInputRef = useRef<HTMLInputElement>(null);
  const eventFlyerInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const [pubsPage, setPubsPage] = useState(1);
  const [activeSection, setActiveSection] = useState<"overview" | "analytics" | "upload" | "reports" | "news" | "manage-news" | "events" | "publications" | "trainings" | "users">("overview");

  // Users management (admin only)
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [usersError, setUsersError] = useState("");
  // Create-user form
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("staff");
  const [newUserSubmitting, setNewUserSubmitting] = useState(false);
  const [newUserError, setNewUserError] = useState("");
  const [newUserSuccess, setNewUserSuccess] = useState("");

  // Publications state
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsFetched, setPubsFetched] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubCategory, setPubCategory] = useState("legislation");
  const [pubRef, setPubRef] = useState("");
  const [pubStatus, setPubStatus] = useState("");
  const [pubDate, setPubDate] = useState(new Date().toISOString().split("T")[0]);
  const [pubFile, setPubFile] = useState<File | null>(null);
  const [pubSubmitting, setPubSubmitting] = useState(false);
  const [pubError, setPubError] = useState("");
  const [pubSuccess, setPubSuccess] = useState("");
  const pubFileInputRef = useRef<HTMLInputElement>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState<NewsCategory>("general");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState("");
  const [newsImageUploading, setNewsImageUploading] = useState(false);
  const [newsImageMode, setNewsImageMode] = useState<"upload" | "url">("upload");
  const [newsDate, setNewsDate] = useState(new Date().toISOString().split("T")[0]);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [newsSuccess, setNewsSuccess] = useState("");

  // Events state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("general");
  const [eventRegistrationLink, setEventRegistrationLink] = useState("");
  const [eventFlyerFile, setEventFlyerFile] = useState<File | null>(null);
  const [eventFlyerPreview, setEventFlyerPreview] = useState("");
  const [eventFlyerUploading, setEventFlyerUploading] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventError, setEventError] = useState("");
  const [eventSuccess, setEventSuccess] = useState("");

  // Trainings (Learning Portal)
  type Training = { id: string; title: string; description: string; venue: string; category: string; start_date: string; end_date: string | null; reg_count: string };
  type Registration = { id: string; full_name: string; email: string; phone: string | null; organization: string | null; location: string | null; notes: string | null; created_at: string };
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingsFetched, setTrainingsFetched] = useState(false);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [trTitle, setTrTitle] = useState("");
  const [trDescription, setTrDescription] = useState("");
  const [trVenue, setTrVenue] = useState("");
  const [trCategory, setTrCategory] = useState("general");
  const [trStart, setTrStart] = useState("");
  const [trEnd, setTrEnd] = useState("");
  const [trSubmitting, setTrSubmitting] = useState(false);
  const [trError, setTrError] = useState("");
  const [trSuccess, setTrSuccess] = useState("");
  const [openRegId, setOpenRegId] = useState<string | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const handleEventFlyerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventFlyerFile(file);
    setEventFlyerPreview(URL.createObjectURL(file));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) {
      setEventError("Title and event date are required.");
      return;
    }
    setEventSubmitting(true);
    setEventError("");
    setEventSuccess("");
    try {
      let flyerUrl: string | undefined;
      if (eventFlyerFile) {
        setEventFlyerUploading(true);
        const fd = new FormData();
        fd.append("file", eventFlyerFile);
        const imgRes = await fetch("/api/events/upload-image", { method: "POST", body: fd });
        const imgData = await imgRes.json();
        setEventFlyerUploading(false);
        if (!imgRes.ok) throw new Error(imgData.error || "Flyer upload failed");
        flyerUrl = imgData.url;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          event_date: new Date(eventDate).toISOString(),
          end_date: eventEndDate ? new Date(eventEndDate).toISOString() : undefined,
          location: eventLocation,
          category: eventCategory,
          image_url: flyerUrl,
          registration_link: eventRegistrationLink || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      setEventSuccess("Event published successfully!");
      setEventTitle(""); setEventDescription(""); setEventDate(""); setEventEndDate("");
      setEventLocation(""); setEventCategory("general"); setEventRegistrationLink("");
      setEventFlyerFile(null); setEventFlyerPreview("");
      if (eventFlyerInputRef.current) eventFlyerInputRef.current.value = "";
    } catch (err) {
      setEventError(err instanceof Error ? err.message : "Submission failed");
    }
    setEventSubmitting(false);
    setTimeout(() => setEventSuccess(""), 3000);
  };

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCover, setUploadCover] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadReportNo, setUploadReportNo] = useState("");
  const [uploadSector, setUploadSector] = useState<Sector>("aviation");
  const [uploadOperator, setUploadOperator] = useState("");
  const [uploadRegNo, setUploadRegNo] = useState("");
  const [uploadVehicleType, setUploadVehicleType] = useState("");
  const [uploadTrainName, setUploadTrainName] = useState("");
  const [uploadOccurrence, setUploadOccurrence] = useState("");
  const [uploadStatus, setUploadStatus] = useState("Final Report");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, aviation: 0, maritime: 0, railway: 0 });

  // Edit-report modal state (admin) — update status / date and optionally swap the file
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const openEdit = (r: Report) => {
    setEditReport(r);
    setEditStatus(r.report_status || "");
    setEditDate((r.published_at || r.created_at).split("T")[0]);
    setEditFile(null);
    setEditError("");
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleEditSave = async () => {
    if (!editReport) return;
    setEditSaving(true);
    setEditError("");
    try {
      const patch: Record<string, unknown> = {
        report_status: editStatus,
        published_at: new Date(editDate).toISOString(),
      };
      if (editFile) {
        const fd = new FormData();
        fd.append("file", editFile);
        const up = await fetch("/api/reports/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || "File upload failed");
        patch.file_url = upData.url;
        patch.file_name = upData.name;
        patch.file_size = upData.size;
      }
      const res = await fetch(`/api/reports/${editReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update report");
      setReports(prev => prev.map(r => (r.id === editReport.id ? { ...r, ...data.report } : r)));
      setEditReport(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    }
    setEditSaving(false);
  };

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/reports?limit=100");
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
        setStats({
          total: data.reports.length,
          aviation: data.reports.filter((r: Report) => r.sector === "aviation").length,
          maritime: data.reports.filter((r: Report) => r.sector === "maritime").length,
          railway: data.reports.filter((r: Report) => r.sector === "railway").length,
        });
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
    }
    setReportsLoading(false);
  }, []);

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/news?limit=100");
      const data = await res.json();
      if (data.news) setNews(data.news);
    } catch (e) {
      console.error("Failed to fetch news", e);
    }
    setNewsLoading(false);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    }
    setAnalyticsLoading(false);
  }, []);

  const fetchPubs = useCallback(async () => {
    setPubsLoading(true);
    try {
      const res = await fetch("/api/publications?limit=200");
      const data = await res.json();
      if (data.publications) setPubs(data.publications);
    } catch (e) {
      console.error("Failed to fetch publications", e);
    }
    setPubsLoading(false);
    setPubsFetched(true);
  }, []);

  const handlePubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle || !pubFile) {
      setPubError("A title and a document file are required.");
      return;
    }
    setPubSubmitting(true);
    setPubError("");
    setPubSuccess("");
    try {
      const fd = new FormData();
      fd.append("file", pubFile);
      const upRes = await fetch("/api/publications/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "File upload failed");

      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pubTitle,
          category: pubCategory,
          reference_no: pubRef || null,
          status: pubStatus || null,
          file_url: upData.url,
          file_name: upData.name,
          file_size: upData.size,
          published_at: new Date(pubDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      setPubSuccess("Publication posted successfully!");
      setPubTitle(""); setPubRef(""); setPubStatus(""); setPubFile(null);
      setPubDate(new Date().toISOString().split("T")[0]);
      if (pubFileInputRef.current) pubFileInputRef.current.value = "";
      fetchPubs();
      setTimeout(() => setPubSuccess(""), 3000);
    } catch (err) {
      setPubError(err instanceof Error ? err.message : "Submission failed");
    }
    setPubSubmitting(false);
  };

  const handleDeletePub = async (id: string) => {
    if (!confirm("Delete this publication? This cannot be undone.")) return;
    const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
    if (res.ok) fetchPubs();
    else alert("Delete failed");
  };

  const fetchTrainings = useCallback(async () => {
    setTrainingsLoading(true);
    try {
      const res = await fetch("/api/trainings?limit=200");
      const data = await res.json();
      if (data.trainings) setTrainings(data.trainings);
    } catch (e) {
      console.error("Failed to fetch trainings", e);
    }
    setTrainingsLoading(false);
    setTrainingsFetched(true);
  }, []);

  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trTitle || !trStart) {
      setTrError("Title and start date are required.");
      return;
    }
    setTrSubmitting(true);
    setTrError("");
    setTrSuccess("");
    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trTitle,
          description: trDescription,
          venue: trVenue,
          category: trCategory,
          start_date: new Date(trStart).toISOString(),
          end_date: trEnd ? new Date(trEnd).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create training");
      setTrSuccess("Training published successfully!");
      setTrTitle(""); setTrDescription(""); setTrVenue(""); setTrCategory("general"); setTrStart(""); setTrEnd("");
      fetchTrainings();
      setTimeout(() => setTrSuccess(""), 3000);
    } catch (err) {
      setTrError(err instanceof Error ? err.message : "Submission failed");
    }
    setTrSubmitting(false);
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Delete this training and all its registrations? This cannot be undone.")) return;
    const res = await fetch(`/api/trainings?id=${id}`, { method: "DELETE" });
    if (res.ok) { if (openRegId === id) setOpenRegId(null); fetchTrainings(); }
    else alert("Delete failed");
  };

  const toggleRegistrations = async (id: string) => {
    if (openRegId === id) { setOpenRegId(null); return; }
    setOpenRegId(id);
    setRegsLoading(true);
    setRegs([]);
    try {
      const res = await fetch(`/api/trainings/registrations?training_id=${id}`);
      const data = await res.json();
      if (data.registrations) setRegs(data.registrations);
    } catch (e) {
      console.error("Failed to fetch registrations", e);
    }
    setRegsLoading(false);
  };

  useEffect(() => {
    // Check auth
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.replace("/login");
        } else {
          setUser(data.user);
          setLoading(false);
          fetchReports();
          fetchNews();
        }
      })
      .catch(() => router.replace("/login"));
  }, [router, fetchReports, fetchNews]);

  // Lazy-load analytics the first time that tab is opened.
  useEffect(() => {
    if (activeSection === "analytics" && !analytics && !analyticsLoading) fetchAnalytics();
  }, [activeSection, analytics, analyticsLoading, fetchAnalytics]);

  // Load publications when that tab is opened (only once).
  useEffect(() => {
    if (activeSection === "publications" && !pubsFetched && !pubsLoading) fetchPubs();
  }, [activeSection, pubsFetched, pubsLoading, fetchPubs]);

  // Load trainings when that tab is opened (only once).
  useEffect(() => {
    if (activeSection === "trainings" && !trainingsFetched && !trainingsLoading) fetchTrainings();
  }, [activeSection, trainingsFetched, trainingsLoading, fetchTrainings]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else setUsersError(data.error || "Failed to load users");
    } catch {
      setUsersError("Failed to load users");
    } finally {
      setUsersLoading(false);
      setUsersFetched(true);
    }
  }, []);

  const changeRole = async (id: string, role: string) => {
    setUsersError("");
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok) setUsers(prev => prev.map(u => (u.id === id ? data.user : u)));
    else setUsersError(data.error || "Failed to update role");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserSubmitting(true);
    setNewUserError("");
    setNewUserSuccess("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newUserEmail, password: newUserPassword, full_name: newUserName, role: newUserRole }),
    });
    const data = await res.json();
    setNewUserSubmitting(false);
    if (!res.ok) { setNewUserError(data.error || "Failed to create user"); return; }
    setUsers(prev => [...prev, data.user]);
    setNewUserName(""); setNewUserEmail(""); setNewUserPassword(""); setNewUserRole("staff");
    setNewUserSuccess(`Account created for ${data.user.email}. They must log in and set up 2FA on first sign-in.`);
    setTimeout(() => setNewUserSuccess(""), 6000);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    setUsersError("");
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    else setUsersError(data.error || "Failed to delete user");
  };

  // Load users when the Users tab is opened (admin only, only once).
  useEffect(() => {
    if (activeSection === "users" && !usersFetched && !usersLoading) fetchUsers();
  }, [activeSection, usersFetched, usersLoading, fetchUsers]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !uploadReportNo.trim() && "the report no.",
      !uploadOccurrence.trim() && "the occurrence",
      !uploadSector && "a transport sector",
      !uploadFile && "the report file",
    ].filter(Boolean);
    if (missing.length || !uploadFile) {
      setUploadError(`Please provide ${missing.join(", ")}.`);
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    setUploadProgress(5);

    try {
      // Step 1: Upload file + optional cover in parallel, direct to storage.
      // Shrink the cover first so it barely touches the uplink.
      const cover = uploadCover ? await compressImage(uploadCover) : null;
      const totalBytes = uploadFile.size + (cover?.size || 0);
      const loaded = { file: 0, cover: 0 };
      // Reserve 5–90% of the bar for the actual byte transfer.
      const bump = () =>
        setUploadProgress(Math.min(90, 5 + Math.round(((loaded.file + loaded.cover) / totalBytes) * 85)));

      const [fileUrl, coverUrl] = await Promise.all([
        uploadFileToStorage(uploadFile, "reports", l => { loaded.file = l; bump(); }),
        cover ? uploadFileToStorage(cover, "covers", l => { loaded.cover = l; bump(); }) : Promise.resolve(null),
      ]);
      setUploadProgress(92);

      // Step 2: Save report metadata
      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_no: uploadReportNo.trim(),
          sector: uploadSector,
          operator: uploadOperator,
          reg_no: uploadRegNo,
          vehicle_type: uploadVehicleType,
          train_name: uploadSector === "railway" ? uploadTrainName : null,
          occurrence: uploadOccurrence,
          report_status: uploadStatus,
          file_url: fileUrl,
          file_name: uploadFile.name,
          file_size: uploadFile.size,
          cover_image_url: coverUrl,
          published_at: new Date(uploadDate).toISOString(),
        }),
      });

      setUploadProgress(100);
      const reportData = await reportRes.json();

      if (!reportRes.ok) {
        throw new Error(reportData.error || "Failed to save report");
      }

      setUploadSuccess(
        user?.role === "admin"
          ? `Report published successfully! Report No: ${reportData.report?.report_no || "assigned"}`
          : `Report submitted for review! Report No: ${reportData.report?.report_no || "assigned"}. An admin will approve it before it appears on the website.`
      );
      setUploadFile(null);
      setUploadCover(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      setUploadReportNo("");
      setUploadOperator("");
      setUploadRegNo("");
      setUploadVehicleType("");
      setUploadTrainName("");
      setUploadOccurrence("");
      setUploadStatus("Final Report");
      setUploadDate(new Date().toISOString().split("T")[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchReports();
      setTimeout(() => {
        setUploadSuccess("");
        setActiveSection("reports");
      }, 2000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }

    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report? This cannot be undone.")) return;
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchReports();
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
  };

  const approveReport = async (id: string) => {
    const res = await fetch(`/api/reports/${id}`, { method: "PATCH" });
    if (res.ok) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "published" } : r));
    } else {
      const data = await res.json();
      alert(data.error || "Approve failed");
    }
  };

  const handleNewsImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsImageFile(file);
    setNewsImagePreview(URL.createObjectURL(file));
    setNewsImageUrl("");
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsExcerpt) {
      setNewsError("Title and excerpt are required.");
      return;
    }
    setNewsSubmitting(true);
    setNewsError("");
    setNewsSuccess("");
    try {
      let finalImageUrl = newsImageUrl || null;

      if (newsImageFile) {
        setNewsImageUploading(true);
        const fd = new FormData();
        fd.append("file", newsImageFile);
        const imgRes = await fetch("/api/news/upload-image", { method: "POST", body: fd });
        const imgData = await imgRes.json();
        setNewsImageUploading(false);
        if (!imgRes.ok) throw new Error(imgData.error || "Image upload failed");
        finalImageUrl = imgData.url;
      }

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle,
          excerpt: newsExcerpt,
          content: newsContent,
          category: newsCategory,
          image_url: finalImageUrl,
          published_at: new Date(newsDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish news");
      setNewsSuccess("News article published successfully!");
      setNewsTitle(""); setNewsExcerpt(""); setNewsContent("");
      setNewsImageUrl(""); setNewsImageFile(null); setNewsImagePreview("");
      if (newsImageInputRef.current) newsImageInputRef.current.value = "";
      setNewsDate(new Date().toISOString().split("T")[0]);
      fetchNews();
      setTimeout(() => { setNewsSuccess(""); setActiveSection("manage-news"); }, 2000);
    } catch (err) {
      setNewsError(err instanceof Error ? err.message : "Failed to publish");
      setNewsImageUploading(false);
    }
    setNewsSubmitting(false);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Delete this news article? This cannot be undone.")) return;
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchNews();
    } else {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading portal…</p>
      </div>
    );
  }

  const reportsTotalPages = Math.max(1, Math.ceil(reports.length / ROWS_PER_PAGE));
  const reportsPageC = Math.min(reportsPage, reportsTotalPages);
  const pagedReports = reports.slice((reportsPageC - 1) * ROWS_PER_PAGE, reportsPageC * ROWS_PER_PAGE);

  const newsTotalPages = Math.max(1, Math.ceil(news.length / ROWS_PER_PAGE));
  const newsPageC = Math.min(newsPage, newsTotalPages);
  const pagedNewsRows = news.slice((newsPageC - 1) * ROWS_PER_PAGE, newsPageC * ROWS_PER_PAGE);

  const pubsTotalPages = Math.max(1, Math.ceil(pubs.length / ROWS_PER_PAGE));
  const pubsPageC = Math.min(pubsPage, pubsTotalPages);
  const pagedPubs = pubs.slice((pubsPageC - 1) * ROWS_PER_PAGE, pubsPageC * ROWS_PER_PAGE);

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span className={styles.brandName}>NSIB</span>
            <span className={styles.brandSub}>Staff Portal</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeSection === "overview" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </button>
          <button
            className={`${styles.navItem} ${activeSection === "analytics" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("analytics")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics
          </button>
          <button
            className={`${styles.navItem} ${activeSection === "upload" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("upload")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Report
          </button>
          <button
            className={`${styles.navItem} ${activeSection === "reports" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("reports")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Manage Reports
          </button>
          {user?.role === "admin" && (
          <button
            className={`${styles.navItem} ${activeSection === "news" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("news")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
            </svg>
            Post News
          </button>
          )}
          <button
            className={`${styles.navItem} ${activeSection === "manage-news" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("manage-news")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
              <path d="M17.586 3.586a2 2 0 1 1 2.828 2.828L12 15l-4 1 1-4 8.586-8.414z" />
            </svg>
            Manage News
          </button>
          {user?.role === "admin" && (
          <button
            className={`${styles.navItem} ${activeSection === "events" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("events")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Create Event
          </button>
          )}
          {user?.role === "admin" && (
          <button
            className={`${styles.navItem} ${activeSection === "trainings" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("trainings")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Trainings
          </button>
          )}
          <button
            className={`${styles.navItem} ${activeSection === "publications" ? styles.navItemActive : ""}`}
            onClick={() => setActiveSection("publications")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Publications
          </button>
          {user?.role === "admin" && (
            <button
              className={`${styles.navItem} ${activeSection === "users" ? styles.navItemActive : ""}`}
              onClick={() => setActiveSection("users")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Users
            </button>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>{user?.email?.[0]?.toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.email}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <Link href="/" className={styles.siteLink}>← Back to Website</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Overview */}
        {activeSection === "overview" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Dashboard Overview</h1>
              <p className={styles.pageDesc}>Manage NSIB investigation reports across all transport sectors.</p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "rgba(27,42,107,0.1)", color: "var(--nsib-navy)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div>
                  <div className={styles.statNum}>{stats.total}</div>
                  <div className={styles.statLabel}>Total Reports</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "rgba(27,42,107,0.08)", color: "#1B2A6B" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3.2 3.2-2.4-.8L2 16l3 3c.6.6 1.4.9 2.2.9h.1c.8-.1 1.5-.4 2.1-.9l.6-.6 3.2-3.2 5 5 1.2-.7c.4-.2.7-.6.6-1.1z"/></svg>
                </div>
                <div>
                  <div className={styles.statNum}>{stats.aviation}</div>
                  <div className={styles.statLabel}>Aviation Reports</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "rgba(0,119,182,0.1)", color: "#0077B6" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21h20"/><path d="M12 9V5a2 2 0 0 1 2-2h2"/><path d="M20 21v-4a2 2 0 0 0-2-2h-3.5L12 9l-2.5 6H6a2 2 0 0 0-2 2v4"/></svg>
                </div>
                <div>
                  <div className={styles.statNum}>{stats.maritime}</div>
                  <div className={styles.statLabel}>Maritime Reports</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "rgba(106,5,114,0.08)", color: "#6A0572" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>
                </div>
                <div>
                  <div className={styles.statNum}>{stats.railway}</div>
                  <div className={styles.statLabel}>Railway Reports</div>
                </div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionCards}>
                {user?.role === "admin" && (
                <button className={styles.actionCard} onClick={() => setActiveSection("upload")}>
                  <div className={styles.actionIcon} style={{ background: "linear-gradient(135deg, var(--nsib-navy), var(--nsib-navy-light))" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <h3>Upload New Report</h3>
                  <p>Add a new investigation report to the public archive</p>
                </button>
                )}
                <button className={styles.actionCard} onClick={() => setActiveSection("reports")}>
                  <div className={styles.actionIcon} style={{ background: "linear-gradient(135deg, #0077B6, #0096D6)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3>Manage Reports</h3>
                  <p>View, edit, or delete existing investigation reports</p>
                </button>
                <Link href="/" className={styles.actionCard} style={{ textDecoration: "none" }}>
                  <div className={styles.actionIcon} style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <h3>View Public Site</h3>
                  <p>See how reports appear to the public on the website</p>
                </Link>
              </div>
            </div>

            {/* Recent reports preview */}
            {reports.length > 0 && (
              <div className={styles.recentSection}>
                <h2 className={styles.sectionTitle}>Recently Uploaded</h2>
                <div className={styles.recentList}>
                  {reports.slice(0, 5).map(r => (
                    <div key={r.id} className={styles.recentItem}>
                      <div className={styles.recentIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div className={styles.recentInfo}>
                        <span className={styles.recentTitle}>{r.title}</span>
                        <span className={styles.recentMeta}>{r.sector} · {formatDate(r.created_at)}</span>
                      </div>
                      <div className={`${styles.sectorBadge} ${styles[`sector_${r.sector}`]}`}>{r.sector}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeSection === "analytics" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Site Analytics</h1>
              <p className={styles.pageDesc}>Public engagement across the NSIB website — last 30 days.</p>
            </div>

            {analyticsLoading || !analytics ? (
              <div className={styles.loadingInner}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading analytics…</p>
              </div>
            ) : (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(27,42,107,0.1)", color: "var(--nsib-navy)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div>
                      <div className={styles.statNum}>{analytics.totals.views.toLocaleString()}</div>
                      <div className={styles.statLabel}>Total Page Views</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(0,119,182,0.1)", color: "#0077B6" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <div className={styles.statNum}>{analytics.totals.unique_visitors.toLocaleString()}</div>
                      <div className={styles.statLabel}>Unique Visitors</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(45,106,79,0.1)", color: "#2d6a4f" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                    </div>
                    <div>
                      <div className={styles.statNum}>{analytics.totals.news_views.toLocaleString()}</div>
                      <div className={styles.statLabel}>News Article Views</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(226,48,48,0.1)", color: "var(--nsib-red)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </div>
                    <div>
                      <div className={styles.statNum}>{analytics.totals.downloads.toLocaleString()}</div>
                      <div className={styles.statLabel}>Report Downloads</div>
                    </div>
                  </div>
                </div>

                {/* Views over time */}
                <div className={styles.chartCard}>
                  <h2 className={styles.sectionTitle}>Views Over Time</h2>
                  {(() => {
                    const max = Math.max(1, ...analytics.byDay.map((d) => d.count));
                    return (
                      <div className={styles.chartBars}>
                        {analytics.byDay.map((d) => (
                          <div
                            key={d.day}
                            className={styles.bar}
                            title={`${new Date(d.day).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}: ${d.count} views`}
                          >
                            <div className={styles.barFill} style={{ height: `${(d.count / max) * 100}%` }} />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className={styles.chartAxis}>
                    <span>{analytics.byDay[0] && new Date(analytics.byDay[0].day).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* Top pages + top news */}
                <div className={styles.analyticsCols}>
                  <div className={styles.listCard}>
                    <h2 className={styles.sectionTitle}>Top Pages</h2>
                    {analytics.topPages.length === 0 ? (
                      <p className={styles.emptyNote}>No page views recorded yet.</p>
                    ) : (
                      <RankBars items={analytics.topPages.map((p) => ({ label: p.path, count: p.count }))} />
                    )}
                  </div>
                  <div className={styles.listCard}>
                    <h2 className={styles.sectionTitle}>Top News Articles</h2>
                    {analytics.topNews.length === 0 ? (
                      <p className={styles.emptyNote}>No news views recorded yet.</p>
                    ) : (
                      <RankBars items={analytics.topNews.map((n) => ({ label: n.title, count: n.count }))} />
                    )}
                  </div>
                </div>

                {/* Reports */}
                <div className={styles.analyticsCols}>
                  <div className={styles.listCard}>
                    <h2 className={styles.sectionTitle}>Most Downloaded Reports</h2>
                    {analytics.topReports.length === 0 ? (
                      <p className={styles.emptyNote}>Report download tracking activates once reports are wired to the live archive.</p>
                    ) : (
                      <RankBars items={analytics.topReports.map((r) => ({ label: r.title, count: r.count, tag: r.sector }))} />
                    )}
                  </div>
                  <div className={styles.listCard}>
                    <h2 className={styles.sectionTitle}>Downloads by Sector</h2>
                    {analytics.sectorDownloads.length === 0 ? (
                      <p className={styles.emptyNote}>No downloads recorded yet.</p>
                    ) : (
                      <RankBars items={analytics.sectorDownloads.map((s) => ({ label: s.sector, count: s.count }))} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload Section */}
        {activeSection === "upload" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Upload Report</h1>
              <p className={styles.pageDesc}>
                {user?.role === "admin"
                  ? "Upload a new investigation report — it will be published immediately."
                  : "Submit an investigation report for admin review. It will appear on the website once approved."}
              </p>
            </div>

            {uploadError && (
              <div className={styles.alertError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className={styles.alertSuccess}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {uploadSuccess}
              </div>
            )}

            <form className={styles.uploadForm} onSubmit={handleUploadSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formLeft}>
                  {/* Drop Zone */}
                  <div
                    className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ""} ${uploadFile ? styles.dropZoneHasFile : ""}`}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                      className={styles.fileInput}
                      onChange={handleFileSelect}
                    />
                    {uploadFile ? (
                      <div className={styles.fileSelected}>
                        <div className={styles.fileIcon}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <span className={styles.fileName}>{uploadFile.name}</span>
                        <span className={styles.fileSize}>{formatBytes(uploadFile.size)}</span>
                        <button
                          type="button"
                          className={styles.fileRemove}
                          onClick={e => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        >
                          Change file
                        </button>
                      </div>
                    ) : (
                      <div className={styles.dropZoneContent}>
                        <div className={styles.dropIcon}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className={styles.dropTitle}>Drag &amp; drop your file here</p>
                        <p className={styles.dropSub}>or <strong>click to browse</strong></p>
                        <p className={styles.dropFormats}>PDF, Word, Excel, Images · Max 50MB</p>
                      </div>
                    )}
                  </div>

                  {/* Cover Photo (optional) */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-cover">Cover Photo (optional)</label>
                    <input
                      id="r-cover"
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={styles.formInput}
                      onChange={e => setUploadCover(e.target.files?.[0] || null)}
                    />
                    <p className={styles.dropFormats} style={{ marginTop: "0.4rem" }}>
                      {uploadCover ? `Selected: ${uploadCover.name}` : "Leave empty to use the NSIB logo. JPG, PNG or WebP."}
                    </p>
                  </div>

                  {/* Sector Selection */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Transport Sector *</label>
                    <div className={styles.sectorGrid}>
                      {SECTORS.map(s => (
                        <label key={s.value} className={`${styles.sectorOption} ${uploadSector === s.value ? styles.sectorOptionActive : ""}`}>
                          <input
                            type="radio"
                            name="sector"
                            value={s.value}
                            checked={uploadSector === s.value}
                            onChange={() => setUploadSector(s.value as Sector)}
                            className={styles.sectorInput}
                          />
                          <span className={styles.sectorEmoji}>{s.icon}</span>
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.formRight}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-reportno">Report No. *</label>
                    <input id="r-reportno" type="text" className={styles.formInput}
                      placeholder="e.g. NSIB/AIR/2020/001"
                      required value={uploadReportNo} onChange={e => setUploadReportNo(e.target.value)} />
                  </div>

                  {uploadSector === "railway" && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="r-trainname">Train Name</label>
                      <input id="r-trainname" type="text" className={styles.formInput}
                        placeholder="e.g. Lagos–Ibadan Express"
                        value={uploadTrainName} onChange={e => setUploadTrainName(e.target.value)} />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-operator">{FIELD_LABELS[uploadSector].operator}</label>
                    <input id="r-operator" type="text" className={styles.formInput}
                      placeholder="e.g. Allied Air Limited"
                      value={uploadOperator} onChange={e => setUploadOperator(e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-reg">{FIELD_LABELS[uploadSector].reg}</label>
                    <input id="r-reg" type="text" className={styles.formInput}
                      placeholder={uploadSector === "maritime" ? "e.g. IMO 9074729" : "e.g. 5N-ABC"}
                      value={uploadRegNo} onChange={e => setUploadRegNo(e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-vtype">{FIELD_LABELS[uploadSector].vtype}</label>
                    <input id="r-vtype" type="text" className={styles.formInput}
                      placeholder="e.g. Boeing 737-400"
                      value={uploadVehicleType} onChange={e => setUploadVehicleType(e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-occurrence">Occurrence *</label>
                    <input id="r-occurrence" type="text" className={styles.formInput}
                      placeholder="e.g. Runway Excursion"
                      required value={uploadOccurrence} onChange={e => setUploadOccurrence(e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-date">Date of Release</label>
                    <input id="r-date" type="date" className={styles.formInput}
                      value={uploadDate} onChange={e => setUploadDate(e.target.value)} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="r-status">Status</label>
                    <select id="r-status" className={styles.formSelect}
                      value={uploadStatus} onChange={e => setUploadStatus(e.target.value)}>
                      {REPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {uploading && uploadProgress > 0 && (
                    <div className={styles.progressWrapper}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className={styles.progressLabel}>{uploadProgress < 60 ? "Uploading file…" : uploadProgress < 90 ? "Saving record…" : "Almost done…"}</span>
                    </div>
                  )}

                  <button type="submit" className={styles.submitBtn} disabled={uploading}>
                    {uploading ? (
                      <><span className={styles.btnSpinner}></span> Uploading…</>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Publish Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Reports Management */}
        {activeSection === "reports" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>
                {user?.role === "admin" ? "Manage Reports" : "My Submissions"}
              </h1>
              <button className={styles.uploadTrigger} onClick={() => setActiveSection("upload")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Upload New
              </button>
            </div>

            {reportsLoading ? (
              <div className={styles.loadingInner}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading reports…</p>
              </div>
            ) : user?.role === "admin" ? (
              /* ── Admin view: Pending tab + All tab ── */
              (() => {
                const drafts = reports.filter(r => r.status === "draft");
                const published = reports.filter(r => r.status === "published");
                return (
                  <>
                    {/* Pending drafts callout */}
                    {drafts.length > 0 && (
                      <div style={{
                        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "var(--radius-md)", padding: "0.9rem 1.1rem",
                        marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem",
                        fontSize: "0.88rem", color: "#92400e", fontWeight: 600,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {drafts.length} report{drafts.length !== 1 ? "s" : ""} pending your approval
                      </div>
                    )}

                    {/* Pending Approval table */}
                    {drafts.length > 0 && (
                      <>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: "0.75rem" }}>Pending Approval</h2>
                        <div className={styles.reportsTable} style={{ marginBottom: "2rem" }}>
                          <div className={styles.tableHeader}>
                            <span>Report No · Occurrence</span>
                            <span>Sector</span>
                            <span>Submitted by</span>
                            <span>Date</span>
                            <span>Actions</span>
                          </div>
                          {drafts.map(r => (
                            <div key={r.id} className={styles.tableRow}>
                              <div className={styles.reportTitle}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span title={`${r.report_no} · ${r.occurrence || r.title}`}>
                                  <strong style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{r.report_no}</strong>
                                  {" · "}{r.occurrence || r.title}
                                </span>
                              </div>
                              <div className={`${styles.sectorBadge} ${styles[`sector_${r.sector}`]}`}>{r.sector}</div>
                              <div className={styles.dateCell} style={{ fontSize: "0.82rem" }}>{r.uploader_name || "—"}</div>
                              <div className={styles.dateCell}>{formatDate(r.created_at)}</div>
                              <div className={styles.actionCell}>
                                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>View</a>
                                <button
                                  className={styles.viewBtn}
                                  style={{ background: "rgba(16,185,129,0.1)", color: "#065f46", borderColor: "rgba(16,185,129,0.3)" }}
                                  onClick={() => approveReport(r.id)}
                                >
                                  Approve
                                </button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* All published reports */}
                    <h2 className={styles.sectionTitle} style={{ marginBottom: "0.75rem" }}>Published Reports</h2>
                    {published.length === 0 ? (
                      <div className={styles.emptyState}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <h3>No published reports yet</h3>
                        <p>Upload a report or approve a pending submission.</p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.reportsTable}>
                          <div className={styles.tableHeader}>
                            <span>Report No · Occurrence</span>
                            <span>Sector</span>
                            <span>Status</span>
                            <span>Date</span>
                            <span>Actions</span>
                          </div>
                          {pagedReports.filter(r => r.status === "published").map(r => (
                            <div key={r.id} className={styles.tableRow}>
                              <div className={styles.reportTitle}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span title={`${r.report_no} · ${r.occurrence || r.title}`}>
                                  <strong style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{r.report_no}</strong>
                                  {" · "}{r.occurrence || r.title}
                                </span>
                              </div>
                              <div className={`${styles.sectorBadge} ${styles[`sector_${r.sector}`]}`}>{r.sector}</div>
                              <div className={styles.typeBadge}>{r.report_status || r.type?.replace("_", " ")}</div>
                              <div className={styles.dateCell}>{formatDate(r.published_at || r.created_at)}</div>
                              <div className={styles.actionCell}>
                                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>View</a>
                                <button className={styles.viewBtn} onClick={() => openEdit(r)}>Edit</button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Pager page={reportsPageC} totalPages={reportsTotalPages} onChange={setReportsPage} />
                      </>
                    )}
                  </>
                );
              })()
            ) : (
              /* ── Staff view: own submissions with status ── */
              reports.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  <h3>No submissions yet</h3>
                  <p>Upload a report to submit it for admin review.</p>
                  <button className={styles.submitBtn} onClick={() => setActiveSection("upload")}>Upload a Report</button>
                </div>
              ) : (
                <>
                  <div className={styles.reportsTable}>
                    <div className={styles.tableHeader}>
                      <span>Report No · Occurrence</span>
                      <span>Sector</span>
                      <span>Approval Status</span>
                      <span>Submitted</span>
                      <span>File</span>
                    </div>
                    {pagedReports.map(r => (
                      <div key={r.id} className={styles.tableRow}>
                        <div className={styles.reportTitle}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          <span title={`${r.report_no} · ${r.occurrence || r.title}`}>
                            <strong style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{r.report_no}</strong>
                            {" · "}{r.occurrence || r.title}
                          </span>
                        </div>
                        <div className={`${styles.sectorBadge} ${styles[`sector_${r.sector}`]}`}>{r.sector}</div>
                        <div>
                          {r.status === "draft" ? (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.35rem",
                              fontSize: "0.78rem", fontWeight: 700, padding: "0.25rem 0.6rem",
                              borderRadius: "20px", background: "rgba(245,158,11,0.1)",
                              color: "#92400e", border: "1px solid rgba(245,158,11,0.3)",
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              Pending Review
                            </span>
                          ) : (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.35rem",
                              fontSize: "0.78rem", fontWeight: 700, padding: "0.25rem 0.6rem",
                              borderRadius: "20px", background: "rgba(16,185,129,0.1)",
                              color: "#065f46", border: "1px solid rgba(16,185,129,0.3)",
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              Published
                            </span>
                          )}
                        </div>
                        <div className={styles.dateCell}>{formatDate(r.created_at)}</div>
                        <div className={styles.fileCell}>
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>View</a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pager page={reportsPageC} totalPages={reportsTotalPages} onChange={setReportsPage} />
                </>
              )
            )}
          </div>
        )}
        {/* Post News Section */}
        {activeSection === "news" && user?.role === "admin" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Post News Article</h1>
              <p className={styles.pageDesc}>Publish news, press releases, and announcements to the NSIB website.</p>
            </div>

            {newsError && (
              <div className={styles.alertError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {newsError}
              </div>
            )}
            {newsSuccess && (
              <div className={styles.alertSuccess}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {newsSuccess}
              </div>
            )}

            <form className={styles.uploadForm} onSubmit={handleNewsSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formLeft}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category *</label>
                    <div className={styles.sectorGrid}>
                      {NEWS_CATEGORIES.map(c => (
                        <label key={c.value} className={`${styles.sectorOption} ${newsCategory === c.value ? styles.sectorOptionActive : ""}`}>
                          <input type="radio" name="news-cat" value={c.value} checked={newsCategory === c.value} onChange={() => setNewsCategory(c.value as NewsCategory)} className={styles.sectorInput} />
                          <span>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Cover Image <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                    <div style={{ display: "flex", gap: "1.25rem", marginBottom: "0.75rem" }}>
                      <button type="button" onClick={() => setNewsImageMode("upload")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "0.875rem", fontWeight: newsImageMode === "upload" ? 600 : 400, color: newsImageMode === "upload" ? "var(--nsib-navy)" : "#6b7280", borderBottom: newsImageMode === "upload" ? "2px solid var(--nsib-navy)" : "2px solid transparent", paddingBottom: "2px" }}>Upload file</button>
                      <button type="button" onClick={() => setNewsImageMode("url")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "0.875rem", fontWeight: newsImageMode === "url" ? 600 : 400, color: newsImageMode === "url" ? "var(--nsib-navy)" : "#6b7280", borderBottom: newsImageMode === "url" ? "2px solid var(--nsib-navy)" : "2px solid transparent", paddingBottom: "2px" }}>Paste URL</button>
                    </div>
                    {newsImageMode === "upload" ? (
                      <div
                        className={styles.dropZone}
                        style={{ minHeight: "100px", padding: "1rem" }}
                        onClick={() => newsImageInputRef.current?.click()}
                      >
                        <input
                          ref={newsImageInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className={styles.fileInput}
                          onChange={handleNewsImageSelect}
                        />
                        {newsImagePreview ? (
                          <div className={styles.fileSelected}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={newsImagePreview} alt="preview" style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "8px" }} />
                            <button type="button" className={styles.fileRemove} onClick={e => { e.stopPropagation(); setNewsImageFile(null); setNewsImagePreview(""); if (newsImageInputRef.current) newsImageInputRef.current.value = ""; }}>Change image</button>
                          </div>
                        ) : (
                          <div className={styles.dropZoneContent}>
                            <div className={styles.dropIcon}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <p className={styles.dropSub}><strong>Click to upload</strong> · JPEG, PNG, WebP, GIF · Max 10MB</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <input id="news-image" type="url" className={styles.formInput} placeholder="https://images.unsplash.com/…" value={newsImageUrl} onChange={e => setNewsImageUrl(e.target.value)} />
                        {newsImageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={newsImageUrl} alt="preview" style={{ marginTop: "0.75rem", width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", border: "1px solid #e5e7eb" }} />
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.formRight}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="news-title">Headline *</label>
                    <input id="news-title" type="text" className={styles.formInput} placeholder="e.g. NSIB Signs MoU with Nigerian Navy" required value={newsTitle} onChange={e => setNewsTitle(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="news-excerpt">Summary / Excerpt *</label>
                    <textarea id="news-excerpt" className={styles.formTextarea} placeholder="One-paragraph summary displayed on the news page…" rows={3} required value={newsExcerpt} onChange={e => setNewsExcerpt(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="news-content">Full Content <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                    <textarea id="news-content" className={styles.formTextarea} placeholder="Full article body text…" rows={5} value={newsContent} onChange={e => setNewsContent(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="news-date">Publication Date</label>
                    <input id="news-date" type="date" className={styles.formInput} value={newsDate} onChange={e => setNewsDate(e.target.value)} />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={newsSubmitting || newsImageUploading}>
                    {newsImageUploading ? (<><span className={styles.btnSpinner}></span> Uploading image…</>) : newsSubmitting ? (<><span className={styles.btnSpinner}></span> Publishing…</>) : (<>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /></svg>
                      Publish Article
                    </>)}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Manage News */}
        {activeSection === "manage-news" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Manage News</h1>
              {user?.role === "admin" && (
              <button className={styles.uploadTrigger} onClick={() => setActiveSection("news")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Post New
              </button>
              )}
            </div>

            {newsLoading ? (
              <div className={styles.loadingInner}><div className={styles.loadingSpinner}></div><p>Loading…</p></div>
            ) : news.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                </svg>
                <h3>No news articles yet</h3>
                <p>{user?.role === "admin" ? "Post your first article to get started." : "No news articles have been published yet."}</p>
                {user?.role === "admin" && <button className={styles.submitBtn} onClick={() => setActiveSection("news")}>Post News</button>}
              </div>
            ) : (
              <>
              <div className={styles.reportsTable}>
                <div className={styles.tableHeader}>
                  <span>Headline</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Author</span>
                  <span>Actions</span>
                </div>
                {pagedNewsRows.map(n => (
                  <div key={n.id} className={styles.tableRow}>
                    <div className={styles.reportTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /></svg>
                      <span title={n.title}>{n.title.length > 55 ? n.title.slice(0, 55) + "…" : n.title}</span>
                    </div>
                    <div className={styles.typeBadge}>{n.category.replace("_", " ")}</div>
                    <div className={styles.dateCell}>{formatDate(n.published_at)}</div>
                    <div className={styles.dateCell}>{n.author_name}</div>
                    <div className={styles.actionCell}>
                      {user?.role === "admin" && <button className={styles.deleteBtn} onClick={() => handleDeleteNews(n.id)}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
              <Pager page={newsPageC} totalPages={newsTotalPages} onChange={setNewsPage} />
              </>
            )}
          </div>
        )}
        {/* Events Section */}
        {activeSection === "events" && user?.role === "admin" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Create Event</h1>
              <p className={styles.pageDesc}>Publish upcoming events to the public events page.</p>
            </div>

            {eventSuccess && (
              <div className={styles.successBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {eventSuccess}
              </div>
            )}
            {eventError && (
              <div className={styles.errorBanner}>{eventError}</div>
            )}

            <form onSubmit={handleEventSubmit} className={styles.newsForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Event Title *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Transport Safety Summit 2025"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>End Date & Time (optional)</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={eventEndDate}
                    onChange={e => setEventEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Location</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                    placeholder="e.g. NSIB Headquarters, Abuja"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.select}
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value)}
                  >
                    {[["general","General"],["conference","Conference"],["workshop","Workshop"],["seminar","Seminar"],["training","Training"],["safety_drill","Safety Drill"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={eventDescription}
                  onChange={e => setEventDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the event, agenda, audience, and objectives..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Event Flyer <span style={{ fontWeight: 400, textTransform: "none", color: "#999" }}>(optional)</span></label>
                <div
                  className={styles.dropZone}
                  style={{ minHeight: "110px", padding: "1rem", cursor: "pointer" }}
                  onClick={() => eventFlyerInputRef.current?.click()}
                >
                  <input
                    ref={eventFlyerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={styles.fileInput}
                    onChange={handleEventFlyerSelect}
                  />
                  {eventFlyerPreview ? (
                    <div className={styles.fileSelected}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={eventFlyerPreview} alt="flyer preview" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px" }} />
                      <button
                        type="button"
                        className={styles.fileRemove}
                        onClick={e => { e.stopPropagation(); setEventFlyerFile(null); setEventFlyerPreview(""); if (eventFlyerInputRef.current) eventFlyerInputRef.current.value = ""; }}
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <div className={styles.dropZoneContent}>
                      <div className={styles.dropIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <p className={styles.dropTitle}>Upload event flyer</p>
                      <p className={styles.dropSub}>Click to browse</p>
                      <p className={styles.dropFormats}>JPEG, PNG, WebP · max 10 MB</p>
                    </div>
                  )}
                </div>
                {eventFlyerUploading && (
                  <p style={{ fontSize: "0.82rem", color: "var(--nsib-slate-light)", marginTop: "0.4rem" }}>Uploading flyer…</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Registration Link (optional)</label>
                <input
                  type="url"
                  className={styles.input}
                  value={eventRegistrationLink}
                  onChange={e => setEventRegistrationLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={eventSubmitting || eventFlyerUploading}>
                {eventSubmitting ? (eventFlyerUploading ? "Uploading flyer…" : "Publishing…") : "Publish Event"}
              </button>
            </form>
          </div>
        )}

        {activeSection === "trainings" && user?.role === "admin" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Trainings</h1>
              <p className={styles.pageDesc}>Create trainings for the Learning Portal and view who has registered.</p>
            </div>

            {trSuccess && (
              <div className={styles.successBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {trSuccess}
              </div>
            )}
            {trError && <div className={styles.errorBanner}>{trError}</div>}

            <form onSubmit={handleTrainingSubmit} className={styles.newsForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Training Title *</label>
                <input type="text" className={styles.input} value={trTitle} onChange={e => setTrTitle(e.target.value)} placeholder="e.g. Aviation Safety Course" required />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Date & Time *</label>
                  <input type="datetime-local" className={styles.input} value={trStart} onChange={e => setTrStart(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>End Date & Time (optional)</label>
                  <input type="datetime-local" className={styles.input} value={trEnd} onChange={e => setTrEnd(e.target.value)} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Venue</label>
                  <input type="text" className={styles.input} value={trVenue} onChange={e => setTrVenue(e.target.value)} placeholder="e.g. NSIB Headquarters, Abuja" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select className={styles.select} value={trCategory} onChange={e => setTrCategory(e.target.value)}>
                    {[["general","General"],["aviation","Aviation"],["maritime","Maritime"],["railway","Railway"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} value={trDescription} onChange={e => setTrDescription(e.target.value)} rows={4} placeholder="Describe the training, syllabus, and audience..." />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={trSubmitting}>
                {trSubmitting ? "Publishing…" : "Publish Training"}
              </button>
            </form>

            <div style={{ marginTop: "2rem" }}>
              <h2 className={styles.sectionTitle}>Published Trainings</h2>
              {trainingsLoading ? (
                <div className={styles.loadingInner}><div className={styles.loadingSpinner}></div><p>Loading…</p></div>
              ) : trainings.length === 0 ? (
                <p style={{ color: "#94a3b8", padding: "1rem 0" }}>No trainings created yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {trainings.map(t => (
                    <div key={t.id} style={{ border: "1px solid #e5e8ef", borderRadius: "10px", padding: "1rem 1.2rem", background: "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--nsib-navy)" }}>{t.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                            {formatDate(t.start_date)}{t.venue ? ` · ${t.venue}` : ""} · {t.category}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className={styles.viewBtn} onClick={() => toggleRegistrations(t.id)}>
                            {openRegId === t.id ? "Hide" : "Registrations"} ({t.reg_count})
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteTraining(t.id)}>Delete</button>
                        </div>
                      </div>

                      {openRegId === t.id && (
                        <div style={{ marginTop: "1rem", borderTop: "1px solid #eef0f5", paddingTop: "1rem" }}>
                          {regsLoading ? (
                            <p style={{ color: "#94a3b8" }}>Loading registrations…</p>
                          ) : regs.length === 0 ? (
                            <p style={{ color: "#94a3b8" }}>No one has registered yet.</p>
                          ) : (
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                                <thead>
                                  <tr style={{ textAlign: "left", color: "#64748b" }}>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Name</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Email</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Phone</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Organization</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Location</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Notes</th>
                                    <th style={{ padding: "0.4rem 0.6rem" }}>Registered</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {regs.map(r => (
                                    <tr key={r.id} style={{ borderTop: "1px solid #eef0f5" }}>
                                      <td style={{ padding: "0.4rem 0.6rem", fontWeight: 600 }}>{r.full_name}</td>
                                      <td style={{ padding: "0.4rem 0.6rem" }}>{r.email}</td>
                                      <td style={{ padding: "0.4rem 0.6rem" }}>{r.phone || "—"}</td>
                                      <td style={{ padding: "0.4rem 0.6rem" }}>{r.organization || "—"}</td>
                                      <td style={{ padding: "0.4rem 0.6rem" }}>{r.location || "—"}</td>
                                      <td style={{ padding: "0.4rem 0.6rem" }}>{r.notes || "—"}</td>
                                      <td style={{ padding: "0.4rem 0.6rem", whiteSpace: "nowrap" }}>{formatDate(r.created_at)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publications Section */}
        {activeSection === "publications" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Publications</h1>
              <p className={styles.pageDesc}>Post legislations, MoUs, forms, manuals, and FOI documents to the website.</p>
            </div>

            {pubError && (
              <div className={styles.alertError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {pubError}
              </div>
            )}
            {pubSuccess && (
              <div className={styles.alertSuccess}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {pubSuccess}
              </div>
            )}

            {user?.role === "admin" && (
            <form className={styles.uploadForm} onSubmit={handlePubSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formLeft}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category *</label>
                    <div className={styles.sectorGrid}>
                      {PUB_CATEGORIES.map(c => (
                        <label key={c.value} className={`${styles.sectorOption} ${pubCategory === c.value ? styles.sectorOptionActive : ""}`}>
                          <input type="radio" name="pub-cat" value={c.value} checked={pubCategory === c.value} onChange={() => setPubCategory(c.value)} className={styles.sectorInput} />
                          <span>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.dropZone} style={{ minHeight: "120px" }} onClick={() => pubFileInputRef.current?.click()}>
                    <input ref={pubFileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className={styles.fileInput} onChange={e => setPubFile(e.target.files?.[0] || null)} />
                    {pubFile ? (
                      <div className={styles.fileSelected}>
                        <div className={styles.fileIcon}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <span className={styles.fileName}>{pubFile.name}</span>
                        <span className={styles.fileSize}>{formatBytes(pubFile.size)}</span>
                        <button type="button" className={styles.fileRemove} onClick={e => { e.stopPropagation(); setPubFile(null); if (pubFileInputRef.current) pubFileInputRef.current.value = ""; }}>Change file</button>
                      </div>
                    ) : (
                      <div className={styles.dropZoneContent}>
                        <div className={styles.dropIcon}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <p className={styles.dropTitle}>Upload document</p>
                        <p className={styles.dropSub}>Click to browse</p>
                        <p className={styles.dropFormats}>PDF, Word, Excel · Max 50MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRight}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="pub-title">Title *</label>
                    <input id="pub-title" type="text" className={styles.formInput} placeholder="e.g. NSIB Establishment Act 2022" required value={pubTitle} onChange={e => setPubTitle(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="pub-ref">Reference No. <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                    <input id="pub-ref" type="text" className={styles.formInput} placeholder="e.g. LEG/001/2026" value={pubRef} onChange={e => setPubRef(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="pub-status">Status <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                    <input id="pub-status" type="text" className={styles.formInput} placeholder="e.g. In Force / Active / Published" value={pubStatus} onChange={e => setPubStatus(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="pub-date">Date</label>
                    <input id="pub-date" type="date" className={styles.formInput} value={pubDate} onChange={e => setPubDate(e.target.value)} />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={pubSubmitting}>
                    {pubSubmitting ? (<><span className={styles.btnSpinner}></span> Publishing…</>) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        Post Publication
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
            )}

            <div style={{ marginTop: "2rem" }}>
              <h2 className={styles.sectionTitle}>Posted Publications</h2>
              {pubsLoading ? (
                <div className={styles.loadingInner}><div className={styles.loadingSpinner}></div><p>Loading…</p></div>
              ) : pubs.length === 0 ? (
                <p style={{ color: "#94a3b8", padding: "1rem 0" }}>No publications posted yet.</p>
              ) : (
                <>
                <div className={styles.reportsTable}>
                  <div className={styles.tableHeader}>
                    <span>Title</span><span>Category</span><span>Reference</span><span>Date</span><span>Status</span><span>Actions</span>
                  </div>
                  {pagedPubs.map(p => (
                    <div key={p.id} className={styles.tableRow}>
                      <div className={styles.reportTitle}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <span title={p.title}>{p.title.length > 45 ? p.title.slice(0, 45) + "…" : p.title}</span>
                      </div>
                      <div className={styles.typeBadge}>{p.category}</div>
                      <div className={styles.dateCell} style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{p.reference_no || "—"}</div>
                      <div className={styles.dateCell}>{formatDate(p.published_at)}</div>
                      <div className={styles.dateCell}>{p.status || "—"}</div>
                      <div className={styles.actionCell}>
                        <a href={p.file_url} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>View</a>
                        {user?.role === "admin" && <button className={styles.deleteBtn} onClick={() => handleDeletePub(p.id)}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
                <Pager page={pubsPageC} totalPages={pubsTotalPages} onChange={setPubsPage} />
                </>
              )}
            </div>
          </div>
        )}

        {activeSection === "users" && user?.role === "admin" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Users</h1>
              <p className={styles.pageDesc}>Create staff accounts and manage roles. New users must complete 2FA setup on their first sign-in.</p>
            </div>

            {/* ── Create user form ── */}
            <div className={styles.formCard} style={{ marginBottom: "2rem" }}>
              <h2 className={styles.formCardTitle}>Create New User</h2>
              {newUserError && (
                <div className={styles.alertError}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {newUserError}
                </div>
              )}
              {newUserSuccess && (
                <div className={styles.alertSuccess}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {newUserSuccess}
                </div>
              )}
              <form onSubmit={handleCreateUser}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 0.7fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input className={styles.formInput} type="text" required placeholder="John Doe"
                      value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input className={styles.formInput} type="email" required placeholder="user@nsib.gov.ng"
                      value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password (min. 8 chars)</label>
                    <input className={styles.formInput} type="password" required minLength={8} placeholder="••••••••"
                      value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Role</label>
                    <select className={styles.formInput} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={newUserSubmitting}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      padding: "0 1.1rem", background: "var(--nsib-navy)", color: "#fff",
                      border: "none", borderRadius: "var(--radius-md)", fontSize: "0.85rem",
                      fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                      opacity: newUserSubmitting ? 0.7 : 1, height: "40px", flexShrink: 0,
                    }}
                  >
                    {newUserSubmitting ? <span className={styles.btnSpinner} /> : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><line x1="12" y1="3" x2="12" y2="15"/><line x1="9" y1="6" x2="15" y2="6"/></svg>
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── User list ── */}
            {usersError && (
              <div className={styles.alertError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {usersError}
              </div>
            )}

            {usersLoading ? (
              <div className={styles.loadingInner}><div className={styles.loadingSpinner}></div><p>Loading…</p></div>
            ) : users.length === 0 ? (
              <p style={{ color: "#94a3b8", padding: "1rem 0" }}>No users yet. Create one above.</p>
            ) : (
              <div className={styles.reportsTable}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: "1.6fr 2fr 1.4fr 0.8fr 1fr 2.2rem" }}>
                  <span>Name</span><span>Email</span><span>Role</span><span>2FA</span><span>Joined</span><span></span>
                </div>
                {users.map(u => (
                  <div key={u.id} className={styles.tableRow} style={{ gridTemplateColumns: "1.6fr 2fr 1.4fr 0.8fr 1fr 2.2rem" }}>
                    <div className={styles.reportTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <span title={u.full_name}>{u.full_name}</span>
                    </div>
                    <div className={styles.dateCell} style={{ fontSize: "0.82rem" }}>{u.email}</div>
                    <div>
                      {u.id === user?.userId ? (
                        <span className={styles.typeBadge}>{u.role} (you)</span>
                      ) : (
                        <select
                          className={styles.formInput}
                          style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                        >
                          <option value="admin">admin</option>
                          <option value="staff">staff</option>
                        </select>
                      )}
                    </div>
                    <div className={styles.dateCell}>{u.totp_enabled ? "On" : "Off"}</div>
                    <div className={styles.dateCell}>{formatDate(u.created_at)}</div>
                    <div>
                      {u.id !== user?.userId && (
                        <button
                          title="Delete user"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", padding: "0.25rem", borderRadius: "4px",
                            display: "flex", alignItems: "center", transition: "color 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit report modal (admin): change status/date, optionally replace the file */}
      {editReport && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => !editSaving && setEditReport(null)}
        >
          <div
            style={{ background: "white", borderRadius: "var(--radius-lg)", padding: "1.75rem", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--nsib-navy)", marginBottom: "0.35rem" }}>Edit Report</h2>
            <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1.25rem", fontFamily: "monospace" }}>{editReport.report_no}</p>

            {editError && <div className={styles.alertError} style={{ marginBottom: "1rem" }}>{editError}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-status">Status</label>
              <select id="edit-status" className={styles.formSelect} value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                {REPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-date">Date of Release</label>
              <input id="edit-date" type="date" className={styles.formInput} value={editDate} onChange={e => setEditDate(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="edit-file">Replace File (optional)</label>
              <input id="edit-file" ref={editFileInputRef} type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                onChange={e => setEditFile(e.target.files?.[0] || null)} />
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.4rem" }}>
                {editFile ? `New file: ${editFile.name}` : "Leave empty to keep the current file."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button type="button" className={styles.viewBtn} style={{ flex: 1 }} disabled={editSaving} onClick={() => setEditReport(null)}>Cancel</button>
              <button type="button" className={styles.submitBtn} style={{ flex: 1, marginTop: 0 }} disabled={editSaving} onClick={handleEditSave}>
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
