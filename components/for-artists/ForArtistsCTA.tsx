"use client";

import { useState } from "react";
import Link from "next/link";
import ApplicantForm from "./ApplicantForm";

export default function ForArtistsCTA() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="page-cta-banner">
        <span className="ornament">✦ ✦ ✦</span>
        <h2>
          Ready to <em className="cta-accent">Join?</em>
        </h2>
        <p>
          Create your artist profile in minutes and start receiving booking requests from top event organisers.
        </p>
        <div className="cta-actions">
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Submit Request
          </button>
          <Link href="/contact" className="btn-outline">
            Talk to Our Team
          </Link>
        </div>
      </div>

      <ApplicantForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}
