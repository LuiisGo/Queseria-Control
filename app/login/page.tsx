"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const json = await response.json();
    if (json.success) {
      toast.success("Bienvenido");
      router.push(json.data.role === "Admin" ? "/admin/dashboard" : "/tienda/inicio");
      router.refresh();
    } else {
      toast.error(json.error || "No se pudo iniciar sesión.");
    }
    setLoading(false);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-white shadow-soft">
            <Image src="/brand/logo-lsa.jpg" alt="Logo San Antonio" fill sizes="112px" className="object-cover" priority />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">Grupo lechero</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-normal">{APP_NAME}</h1>
        </div>

        <form className="panel p-5" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">Usuario</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <input className="field pl-11" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-black/50">Contraseña</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <input className="field pl-11" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
            </div>
          </div>
          <button className="btn-primary mt-5 w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
