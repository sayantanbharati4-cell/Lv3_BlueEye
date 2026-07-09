"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "rgba(0, 210, 255, 0.15)",
  approved: "rgba(32, 191, 107, 0.15)",
  rejected: "rgba(255, 71, 87, 0.15)",
};

const statusTextColors: Record<string, string> = {
  pending: "#00d2ff",
  approved: "#20bf6b",
  rejected: "#ff4757",
};

export default function AdminArtistApplicantsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/artist-applications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data.applicants);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch {
      console.error("Failed to fetch applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [status, page]);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-end mb-10 gap-8">
        <div>
          <h1 className="admin-title">
            Artist <span className="text-gold">Applicants</span>
          </h1>
          <p className="admin-subtitle">Review and approve artist applications submitted through the website.</p>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{
            flex: "0 0 auto", minWidth: "160px", width: "auto",
            padding: "0.6rem 0.8rem", borderRadius: "12px",
            background: "var(--bg)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "0.85rem",
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text3)" }}>Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text3)" }}>No applicants found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applicants.map((a) => (
            <Link
              key={a._id}
              href={`/admin/artist-applications/${a._id}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "1.25rem",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}
              >
                <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <img
                    src={a.media?.images?.[0]
                      ? (a.media.images[0].startsWith("http") ? a.media.images[0] : `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${a.media.images[0]}`)
                      : "https://placehold.co/100x100/1a1a1a/d4a017?text=Artist"}
                    alt={a.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{a.name}</span>
                    <span
                      style={{
                        display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20,
                        fontSize: "0.72rem", fontWeight: 600,
                        background: statusColors[a.status] || "var(--bg3)",
                        color: statusTextColors[a.status] || "var(--text2)",
                        border: `1px solid ${(statusColors[a.status] || "var(--border)").replace("0.15", "0.3")}`,
                      }}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text3)", marginTop: "0.2rem" }}>
                    {a.applicantEmail}
                  </div>
                </div>

                <span style={{
                  padding: "0.3rem 0.7rem", borderRadius: 8,
                  background: "rgba(0, 210, 255, 0.08)", color: "var(--gold)",
                  fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap",
                }}>
                  {a.category}
                </span>

                <div style={{ fontSize: "0.82rem", color: "var(--text3)", whiteSpace: "nowrap" }}>
                  <div>{a.applicantPhone}</div>
                  <div style={{ fontSize: "0.75rem" }}>{a.location?.city || "N/A"}</div>
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--text3)", whiteSpace: "nowrap" }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <span className="admin-action-btn" style={{ padding: "0.45rem", borderRadius: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" style={{ marginTop: "1.5rem" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-outline" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", opacity: page === 1 ? 0.4 : 1 }}>
            Previous
          </button>
          <span className="text-sm text-text3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-outline" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", opacity: page === totalPages ? 0.4 : 1 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
