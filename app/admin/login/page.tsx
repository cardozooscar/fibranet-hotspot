"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setLoading(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setLoading(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] px-4 font-sans text-white">
      <div className="w-full max-w-sm rounded-2xl border border-blue-900/40 bg-[#0d0d2b] p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-xl font-bold text-blue-500">
          Painel Fibranet
        </h1>

        <label className="mb-1 block text-xs font-semibold tracking-wide text-blue-200">
          E-MAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-blue-900/50 bg-[#060615] px-4 py-3 outline-none focus:border-blue-500"
        />

        <label className="mb-1 block text-xs font-semibold tracking-wide text-blue-200">
          SENHA
        </label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="w-full rounded-lg border border-blue-900/50 bg-[#060615] px-4 py-3 outline-none focus:border-blue-500"
        />

        {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}

        <button
          onClick={entrar}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "ENTRANDO..." : "ENTRAR"}
        </button>
      </div>
    </div>
  );
}