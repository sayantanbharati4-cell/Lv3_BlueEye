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

      <div className="admin-table-container" style={{ marginTop: "1rem" }}>
        <div className="flex gap-3 my-6 flex-wrap" style={{ alignItems: "center" }}>
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

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Applied</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16">Loading applicants...</td></tr>
              ) : applicants.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16">No applicants found.</td></tr>
              ) : applicants.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="admin-artist-thumb">
                        <img
                          src={a.media?.images?.[0]
                            ? (a.media.images[0].startsWith("http") ? a.media.images[0] : `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${a.media.images[0]}`)
                            : "https://placehold.co/100x100/1a1a1a/d4a017?text=Artist"}
                          alt={a.name}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{a.name}</div>
                        <div className="text-xs text-text3">{a.applicantEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge">{a.category}</span>
                  </td>
                  <td>
                    <div className="text-sm">{a.applicantPhone}</div>
                    <div className="text-xs text-text3">{a.location?.city || "N/A"}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block", padding: "0.2rem 0.75rem", borderRadius: 20,
                        fontSize: "0.78rem", fontWeight: 600,
                        background: statusColors[a.status] || "var(--bg3)",
                        color: statusTextColors[a.status] || "var(--text2)",
                        border: `1px solid ${(statusColors[a.status] || "var(--border)").replace("0.15", "0.3")}`,
                      }}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-text3">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="text-right">
                    <Link href={`/admin/artist-applications/${a._id}`} className="admin-action-btn" title="View Details">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
