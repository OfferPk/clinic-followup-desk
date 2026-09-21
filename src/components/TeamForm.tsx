"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: fd.get("role") || "receptionist",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <h2 className="text-sm font-semibold">Add receptionist</h2>
      <div>
        <label className="label">Name</label>
        <input name="name" className="input" required />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input" required />
      </div>
      <div>
        <label className="label">Password</label>
        <input name="password" type="password" className="input" required minLength={6} />
      </div>
      <input type="hidden" name="role" value="receptionist" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
