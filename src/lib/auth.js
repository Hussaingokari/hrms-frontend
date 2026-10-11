export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function clearUser() {
  localStorage.removeItem("user");
}

export function getHomePath(user) {
  return user?.role === "ADMIN" ? "/admin" : "/dashboard";
}