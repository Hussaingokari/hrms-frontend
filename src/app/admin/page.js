"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { request } from "@/lib/api";
import { getUser, clearUser } from "@/lib/auth";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  designation: "",
  salary: "",
};

const rupees = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEmployees = async () => {
    try {
      setEmployees(await request("/employees"));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const stored = getUser();
    if (!stored) {
      router.push("/login");
      return;
    }
    if (stored.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    setUser(stored);
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departmentCount = useMemo(
    () => new Set(employees.map((e) => e.department).filter(Boolean)).size,
    [employees]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.firstName, e.lastName, e.email, e.department, e.designation]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [employees, query]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const body = JSON.stringify({
      ...form,
      salary: Number(form.salary) || 0,
    });

    try {
      if (editingId) {
        await request(`/employees/${editingId}`, { method: "PUT", body });
        setNotice("Employee updated");
      } else {
        await request("/employees", { method: "POST", body });
        setNotice("Employee added");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (emp) => {
    setError("");
    setNotice("");
    setEditingId(emp.id);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department ?? "",
      designation: emp.designation ?? "",
      salary: emp.salary ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Delete ${emp.firstName} ${emp.lastName}? This cannot be undone.`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await request(`/employees/${emp.id}`, { method: "DELETE" });
      setNotice("Employee deleted");
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

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
          <h1>Employees</h1>
          <p>Add, edit and remove employee records.</p>
        </div>

        <div className="summary">
          <div className="summary-item">
            <strong>{employees.length}</strong>
            <span>Employees</span>
          </div>
          <div className="summary-item">
            <strong>{departmentCount}</strong>
            <span>Departments</span>
          </div>
        </div>

        <form className="panel" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit employee" : "Add employee"}</h2>

          {(error || notice) && (
            <div className="stack">
              {error && (
                <p className="alert" role="alert">
                  {error}
                </p>
              )}
              {notice && <p className="notice">{notice}</p>}
            </div>
          )}

          <div className="emp-form">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="empEmail">Email</label>
              <input
                id="empEmail"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="designation">Designation</label>
              <input
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="salary">Salary (₹)</label>
              <input
                id="salary"
                name="salary"
                type="number"
                min="0"
                value={form.salary}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Save changes" : "Add employee"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="toolbar">
          <h2>All employees</h2>
          <input
            className="search"
            type="search"
            placeholder="Search by name, email or department"
            aria-label="Search employees"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">
                    {employees.length === 0
                      ? "No employees yet. Use the form above to add the first one."
                      : "No employees match your search."}
                  </td>
                </tr>
              )}
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="person">
                      <span className="avatar avatar-sm">
                        {emp.firstName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="person-name">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="person-email">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{rupees(emp.salary)}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-quiet btn-sm"
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}