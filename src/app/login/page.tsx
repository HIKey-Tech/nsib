"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./login.module.css";

type Stage = "form" | "enroll" | "twofa" | "backup";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login credentials
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 2FA
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startEnroll = async () => {
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Could not start 2FA setup"); return false; }
    setQr(data.qr);
    setSecret(data.secret);
    setStage("enroll");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
    if (data.needs2fa) setStage("twofa");
    else if (data.needsEnrollment) await startEnroll();
    setLoading(false);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/2fa/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Activation failed"); return; }
    setBackupCodes(data.backupCodes || []);
    setCode("");
    setStage("backup");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Verification failed"); return; }
    router.push("/dashboard");
  };

  const codeInput = (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="code">Authentication Code</label>
      <input
        id="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className={styles.input}
        placeholder="6-digit code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
        style={{ letterSpacing: "0.3em", fontSize: "1.1rem" }}
      />
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Brand Panel */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--nsib-slate-light)",
            textDecoration: "none", transition: "color 0.2s",
          }}>
            <span>←</span><span>Back to Website</span>
          </Link>
          <h1 className={styles.brandTitle}>
            NSIB<br />Staff<br /><span>Portal</span>
          </h1>
          <p className={styles.brandDesc}>
            Secure access for NSIB staff to upload and manage investigation reports across all transport sectors.
          </p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
                </svg>
              </div>
              Upload Aviation, Marine &amp; Rail Reports
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              Protected by two-factor authentication
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              Real-time public visibility
            </li>
          </ul>
        </div>
        <div className={styles.brandAccent} />
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formBox}>
          {error && (
            <div className={styles.errorAlert}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1 — credentials */}
          {stage === "form" && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Welcome back</h2>
                <p className={styles.formSubtitle}>Sign in to access the staff portal.</p>
              </div>
              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">Email Address</label>
                  <input id="email" type="email" className={styles.input} placeholder="you@nsib.gov.ng"
                    required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <input id="password" type="password" className={styles.input} placeholder="••••••••"
                    required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <span>Sign in to Portal</span>}
                </button>
              </form>
            </>
          )}

          {/* Step 2a — enrollment */}
          {stage === "enroll" && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Set up two-factor</h2>
                <p className={styles.formSubtitle}>
                  Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code to confirm.
                </p>
              </div>
              {qr && (
                <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0 1rem" }}>
                  <Image src={qr} alt="2FA QR code" width={200} height={200}
                    style={{ borderRadius: 12, border: "1px solid var(--nsib-gray-200)" }} unoptimized />
                </div>
              )}
              <p style={{ fontSize: "0.78rem", color: "var(--nsib-slate-light)", textAlign: "center", marginBottom: "1rem", wordBreak: "break-all" }}>
                Can't scan? Enter this key manually:<br /><strong style={{ color: "var(--nsib-navy)" }}>{secret}</strong>
              </p>
              <form className={styles.form} onSubmit={handleActivate}>
                {codeInput}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <span>Confirm &amp; Enable</span>}
                </button>
              </form>
            </>
          )}

          {/* Step 2b — verify at login */}
          {stage === "twofa" && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Two-factor verification</h2>
                <p className={styles.formSubtitle}>Enter the 6-digit code from your authenticator app, or a backup code.</p>
              </div>
              <form className={styles.form} onSubmit={handleVerify}>
                {codeInput}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <span>Verify &amp; Continue</span>}
                </button>
              </form>
            </>
          )}

          {/* Step 3 — backup codes (shown once) */}
          {stage === "backup" && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Save your backup codes</h2>
                <p className={styles.formSubtitle}>
                  Store these somewhere safe. Each one lets you sign in once if you lose your device. They won't be shown again.
                </p>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem",
                margin: "0.5rem 0 1.25rem", fontFamily: "monospace",
              }}>
                {backupCodes.map((c) => (
                  <div key={c} style={{
                    padding: "0.6rem", textAlign: "center", background: "var(--nsib-gray-100)",
                    border: "1px solid var(--nsib-gray-200)", borderRadius: 8,
                    fontSize: "0.95rem", letterSpacing: "0.05em", color: "var(--nsib-navy)",
                  }}>{c}</div>
                ))}
              </div>
              <button className={styles.submitBtn} onClick={() => router.push("/dashboard")}>
                <span>I've saved them — Continue</span>
              </button>
            </>
          )}

          <div className={styles.divider}>or</div>
          <div className={styles.registerRow}>
            <Link href="/" className={styles.registerLink}>← Return to NSIB website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
