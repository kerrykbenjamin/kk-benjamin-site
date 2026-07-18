"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setLoading(false);
        return;
      }
      // Full reload so the server renders the editor toolbar + edit affordances.
      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <label htmlFor="pw" className="eyebrow mb-2 block text-sage">
        Password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-[8px] border border-forest/20 bg-white/70 px-4 py-3 text-forest outline-none focus:border-sage"
        placeholder="Enter your password"
        autoFocus
      />
      {error && <p className="mt-3 text-sm text-[#8a2d2d]">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="mt-5 w-full rounded-[8px] bg-forest px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Log in to edit"}
      </button>
    </form>
  );
}
