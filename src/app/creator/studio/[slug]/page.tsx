"use client";

import { ArtDetailClientPage } from "@/app/art/[slug]/art-detail-client-page";

export default function CreatorArtDetailPage() {
  return (
    <div className="container py-10">
      {/* We reuse the existing public detail page component and pass a prop 
          to tell it to render the creator-specific action buttons. */}
      <ArtDetailClientPage isCreatorView={true} />
    </div>
  );
}
