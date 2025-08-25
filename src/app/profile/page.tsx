import { ProfileClientPage } from "./profile-client-page";

/**
 * Renders the main profile page.
 * This is a simple server component that acts as a layout wrapper.
 * All data fetching and logic are now handled client-side in ProfileClientPage.
 */
export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Profile</h1>
      <ProfileClientPage />
    </div>
  );
}
