export const API = "http://localhost:8080/api";

export async function request(path, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user");
    if (stored) {
      token = JSON.parse(stored).token;
    }
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Token expired or invalid (not for login/register calls)
  if (res.status === 401 && !path.startsWith("/auth")) {
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired, please login again");
  }

  if (!res.ok) {
    let message =
      res.status === 403
        ? "You don't have permission to do this"
        : "Something went wrong";
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}