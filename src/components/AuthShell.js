export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="brand">
          <span className="brand-mark">H</span>
          HRMS
        </div>

        <div className="aside-body">
          <h1>Your whole team in one clear record.</h1>
          <p>
            Keep every employee record in one place, with access that matches
            each person&apos;s role.
          </p>
          <ul className="role-list">
            <li>
              <strong>Admin</strong> adds, edits and removes employee records.
            </li>
            <li>
              <strong>Employee</strong> views their own profile.
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-box">{children}</div>
      </main>
    </div>
  );
}