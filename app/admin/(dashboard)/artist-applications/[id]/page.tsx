"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean; title: string; message: string; variant?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void; showCancel?: boolean; confirmText?: string;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {}, showCancel: true, confirmText: "Confirm" });
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/artist-applications/${id}`);
        const data = await res.json();
        if (data.success) setApplicant(data.data);
        else setModal({ isOpen: true, title: "Error", message: data.message || "Failed to load applicant", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => router.push("/admin/artist-applications") });
      } catch {
        setModal({ isOpen: true, title: "Error", message: "Failed to load applicant details", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => router.push("/admin/artist-applications") });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const performAction = async (action: string, successMsg: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/artist-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setModal({
          isOpen: true, title: "Success", message: data.message || successMsg, variant: "success",
          showCancel: false, confirmText: action === "approve" ? "View Artist" : "Close",
          onConfirm: () => {
            if (action === "approve" && data.data?.artistId) {
              router.push(`/admin/artists/${data.data.artistId}/edit`);
            } else {
              router.push("/admin/artist-applications");
            }
          },
        });
        if (action !== "approve") {
          setApplicant((prev: any) => prev ? { ...prev, status: action === "reject" ? "rejected" : "pending", rejectedAt: action === "reject" ? new Date().toISOString() : undefined } : prev);
        }
      } else {
        setModal({ isOpen: true, title: "Action Failed", message: data.message || data.error || "Something went wrong", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => {} });
      }
    } catch {
      setModal({ isOpen: true, title: "Error", message: "Failed to process action. Please try again.", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => {} });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmApprove = () => {
    setModal({
      isOpen: true, title: "Approve Applicant", variant: "warning",
      message: `This will create an artist profile for "${applicant?.name}" and remove them from the applicants list. Proceed?`,
      confirmText: "Yes, Approve",
      onConfirm: () => performAction("approve", "Applicant approved and moved to artist database."),
    });
  };

  const confirmReject = () => {
    setModal({
      isOpen: true, title: "Reject Applicant", variant: "danger",
      message: `Reject "${applicant?.name}"? They will be auto-removed after 7 days. You can un-reject within that period.`,
      confirmText: "Yes, Reject",
      onConfirm: () => performAction("reject", "Applicant rejected."),
    });
  };

  const confirmUnreject = () => {
    setModal({
      isOpen: true, title: "Un-reject Applicant", variant: "info",
      message: `Return "${applicant?.name}" to pending status? You will then be able to approve them.`,
      confirmText: "Yes, Un-reject",
      onConfirm: () => performAction("unreject", "Applicant returned to pending status."),
    });
  };

  const confirmDelete = () => {
    setModal({
      isOpen: true, title: "Delete Applicant", variant: "danger",
      message: `Permanently delete "${applicant?.name}"? This action cannot be undone.`,
      confirmText: "Yes, Delete",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/artist-applications/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setModal({
              isOpen: true, title: "Deleted", message: data.message || "Applicant deleted.", variant: "success",
              showCancel: false, confirmText: "Back to List",
              onConfirm: () => router.push("/admin/artist-applications"),
            });
          } else {
            setModal({ isOpen: true, title: "Error", message: data.message || "Failed to delete", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => {} });
          }
        } catch {
          setModal({ isOpen: true, title: "Error", message: "Failed to delete applicant", variant: "danger", showCancel: false, confirmText: "Close", onConfirm: () => {} });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) return <div className="fade-in"><p className="text-center py-16" style={{ color: "var(--text2)" }}>Loading applicant details...</p></div>;
  if (!applicant) return <div className="fade-in"><p className="text-center py-16" style={{ color: "var(--text2)" }}>Applicant not found.</p></div>;

  const a = applicant;
  const isPending = a.status === "pending";
  const isRejected = a.status === "rejected";
  const isApproved = a.status === "approved";

  const canUnreject = isRejected && a.rejectedAt && (Date.now() - new Date(a.rejectedAt).getTime() < 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "1.75rem 2rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", minWidth: 0, flex: 1 }}>
          <Link href="/admin/artist-applications" className="admin-action-btn" title="Back" style={{ flexShrink: 0, marginTop: "0.15rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <h1 className="admin-title" style={{ margin: 0, fontSize: "1.5rem" }}>
                <span className="text-gold">{a.name}</span>
              </h1>
              <span style={{
                display: "inline-block", padding: "0.2rem 0.75rem", borderRadius: 20,
                fontSize: "0.75rem", fontWeight: 600,
                background: isPending ? "rgba(0, 210, 255, 0.15)" : isApproved ? "rgba(32, 191, 107, 0.15)" : "rgba(255, 71, 87, 0.15)",
                color: isPending ? "#00d2ff" : isApproved ? "#20bf6b" : "#ff4757",
                border: `1px solid ${isPending ? "rgba(0, 210, 255, 0.3)" : isApproved ? "rgba(32, 191, 107, 0.3)" : "rgba(255, 71, 87, 0.3)"}`,
              }}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>
            <p style={{ margin: "0.3rem 0 0", color: "var(--text3)", fontSize: "0.82rem", lineHeight: 1.5 }}>
              Submitted <strong>{new Date(a.createdAt).toLocaleDateString()}</strong>
              &nbsp;&middot;&nbsp;Updated <strong>{new Date(a.updatedAt).toLocaleDateString()}</strong>
              &nbsp;&middot;&nbsp;{a.applicantEmail}
              &nbsp;&middot;&nbsp;{a.applicantPhone}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", flexShrink: 0 }}>
          {isPending && (
            <>
              <button onClick={confirmReject} disabled={actionLoading}
                className="btn-outline" style={{ padding: "0.55rem 1.2rem", borderRadius: "10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.45rem", borderColor: "rgba(255,71,87,0.3)", color: "#ff4757" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Reject
              </button>
              <button onClick={confirmApprove} disabled={actionLoading}
                className="btn-primary" style={{ padding: "0.55rem 1.4rem", borderRadius: "10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Approve &amp; Add to Database
              </button>
            </>
          )}
          {canUnreject && (
            <>
              <button onClick={confirmUnreject} disabled={actionLoading}
                className="btn-outline" style={{ padding: "0.55rem 1.2rem", borderRadius: "10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.45rem", borderColor: "var(--gold)", color: "var(--gold)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Un-reject
              </button>
              <button onClick={confirmDelete} disabled={actionLoading} title="Delete permanently"
                style={{ background: "none", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 10, padding: "0.55rem", cursor: "pointer", color: "#ff4757", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Basic Info + Performance ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Basic Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <DetailRow label="Full Name" value={a.name} />
            <DetailRow label="Category" value={a.category} />
            {a.category_tag && <DetailRow label="Category Tag" value={a.category_tag} />}
            <DetailRow label="City" value={a.location?.city || "N/A"} />
            <DetailRow label="State" value={a.location?.state || "India"} />
            <DetailRow label="Email" value={a.applicantEmail} />
            <DetailRow label="Phone" value={a.applicantPhone} />
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Performance Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <DetailRow label="Duration" value={`${a.performance?.duration_minutes?.min || "-"} - ${a.performance?.duration_minutes?.max || "-"} min`} />
            <DetailRow label="Team Size" value={`${a.performance?.team_members?.min || "-"} - ${a.performance?.team_members?.max || "-"} members`} />
            <DetailRow label="Genres" value={a.performance?.genres?.join(", ") || "N/A"} />
            <DetailRow label="Languages" value={a.performance?.languages?.join(", ") || "N/A"} />
          </div>
        </div>
      </div>

      {/* ── About ── */}
      {a.about && (
        <div className="admin-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            About / Bio
          </h3>
          <p style={{ color: "var(--text2)", lineHeight: 1.7, fontSize: "0.9rem", whiteSpace: "pre-wrap", margin: 0 }}>
            {typeof a.about === "string" ? a.about : Array.isArray(a.about) ? a.about.join("\n\n") : "N/A"}
          </p>
        </div>
      )}

      {/* ── Media ── */}
      <div className="admin-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Media
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text3)", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Images ({a.media?.images?.length || 0})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {a.media?.images?.map((img: string, i: number) => (
                <a key={i} href={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${img}`} target="_blank" rel="noopener noreferrer"
                  style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", display: "block" }}>
                  <img src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${img}`} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
              ))}
              {(!a.media?.images || a.media.images.length === 0) && <span style={{ color: "var(--text3)", fontSize: "0.85rem" }}>No images</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text3)", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              YouTube Videos ({a.media?.videos?.length || 0})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {a.media?.videos?.map((vid: string, i: number) => {
                const id = vid.match(/(?:v\/|v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/)?.[1];
                const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
                const failed = id ? failedThumbs.has(id) : true;
                return (
                  <a key={i} href={vid} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none" }}>
                    <div style={{ width: 80, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--bg3)" }}>
                      {thumb && !failed ? (
                        <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailedThumbs(prev => new Set(prev).add(id!))} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816z"/></svg>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vid}</span>
                  </a>
                );
              })}
              {(!a.media?.videos || a.media.videos.length === 0) && <span style={{ color: "var(--text3)", fontSize: "0.85rem" }}>No videos</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      {a.faq && a.faq.length > 0 && (
        <div className="admin-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>FAQ</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {a.faq.map((item: { question: string; answer: string }, i: number) => (
              <div key={i} style={{ padding: "0.85rem 1rem", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)", marginBottom: "0.3rem" }}>Q: {item.question}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.6 }}>A: {item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
        variant={modal.variant}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.68rem", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.1rem" }}>{label}</div>
      <div style={{ fontSize: "0.88rem", color: "var(--text)", fontWeight: 500 }}>{value || "N/A"}</div>
    </div>
  );
}
