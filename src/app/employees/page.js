"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getHomePath } from "@/lib/auth";

export default function EmployeesRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    router.replace(user ? getHomePath(user) : "/login");
  }, [router]);

  return null;
}