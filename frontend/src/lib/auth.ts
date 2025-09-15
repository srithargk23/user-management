// src/lib/auth.ts

import { redirect } from "next/navigation";

export function setToken(token: string, username?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    if (username) {
      localStorage.setItem("username", username);
    }
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function getUserName(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("username");
  }
  return null;
}


export function requireAuth() {
  const token = getToken();
  if (!token) {
    redirect("/login");
  }
}


export function redirectIfAuth() {
  const token = getToken();
  if (token) {
    redirect("/dashboard/users");
  }
}