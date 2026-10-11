export default function TopBar({ user, onLogout }) {
  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark">H</span>
          HRMS
        </div>

        <div className="user-chip">
          <span className="avatar">{initial}</span>
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="role-tag">
              {user.role === "ADMIN" ? "Admin" : "Employee"}
            </span>
          </div>
          <button className="btn btn-light btn-sm" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}