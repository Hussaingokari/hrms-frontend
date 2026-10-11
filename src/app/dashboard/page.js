"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { request } from "@/lib/api";
import { getUser, clearUser } from "@/lib/auth";

const rupees = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.push("/login");
      return;
    }
    if (stored.role === "ADMIN") {
      router.push("/admin");
      return;
    }
    setUser(stored);

    request("/employees/me")
      .then(setProfile)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <>
      <TopBar user={user} onLogout={handleLogout} />

      <div className="page">
        <div className="page-head">
          <h1>My profile</h1>
          <p>This is the record your admin keeps for you. You can view it, but only an admin can change it.</p>
        </div>

        {error && (
          <p className="alert" role="alert" style={{ marginTop: 20 }}>
            Your profile isn&apos;t set up yet. Ask your admin to add an
            employee record with this email: {user.email}
          </p>
        )}

        {!error && !profile && (
          <p className="muted" style={{ marginTop: 20 }}>
            Loading your profile...
          </p>
        )}

        {profile && (
          <div className="profile">
            <div className="profile-head">
              <span className="avatar avatar-lg">
                {profile.firstName.charAt(0).toUpperCase()}
              </span>
              <div>
                <h2>
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="muted">{profile.designation || "Employee"}</p>
              </div>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{profile.department || "Not set"}</dd>
              </div>
              <div>
                <dt>Designation</dt>
                <dd>{profile.designation || "Not set"}</dd>
              </div>
              <div>
                <dt>Salary</dt>
                <dd>{rupees(profile.salary)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </>
  );
}