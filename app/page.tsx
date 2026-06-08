"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Dados técnicos que a controller da Grandstream pode anexar na URL.
  // Os nomes dos parâmetros variam conforme a firmware/config do portal externo,
  // então capturamos de forma genérica e guardamos o que vier.
  const [macCliente, setMacCliente] = useState("");
  const [macAp, setMacAp] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Tentamos os nomes mais comuns. Ajuste depois de ver o que a GWN realmente envia.
    setMacCliente(
      params.get("client_mac") ||
        params.get("mac") ||
        params.get("station_mac") ||
        ""
    );
    setMacAp(
      params.get("ap_mac") || params.get("nas_mac") || params.get("ap") || ""
    );
  }, []);

  async function handleSubmit() {
    if (!nome.trim()) {
      setErrorMsg("Preencha pelo menos o nome.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("leads").insert({
      nome: nome.trim(),
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      cidade: cidade.trim() || null,
      mac_cliente: macCliente || null,
      mac_ap: macAp || null,
      origem: "hotspot-fibranet",
    });

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] px-4 py-10 font-sans text-white">
      <div className="w-full max-w-md rounded-2xl border border-blue-900/40 bg-[#0d0d2b] p-8 shadow-2xl">
        {/* Logo / cabeçalho */}
        <div className="mb-6 text-center">
          <p className="text-[10px] tracking-[0.3em] text-zinc-400">
            PROVEDOR DE INTERNET
          </p>
          <h2 className="text-2xl font-bold italic">
            Fibra<span className="text-white">net</span>
          </h2>
          <p className="text-[10px] tracking-widest text-zinc-400">BRASIL</p>
        </div>

        {status === "success" ? (
          <div className="py-10 text-center">
            <h1 className="mb-2 text-xl font-bold text-blue-400">
              Tudo certo! ✅
            </h1>
            <p className="text-zinc-300">
              Seus dados foram registrados. Aproveite a navegação!
            </p>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-center text-xl font-bold text-blue-500">
              Wi-Fi Fibranet Brasil
            </h1>
            <p className="mb-6 text-center text-sm text-zinc-300">
              Preencha os dados para continuar
            </p>

            <div className="space-y-4">
              <Field
                label="NOME COMPLETO"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={setNome}
              />
              <Field
                label="E-MAIL"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={setEmail}
              />
              <Field
                label="TELEFONE"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={setTelefone}
              />
              <Field
                label="CIDADE"
                placeholder="Sua cidade"
                value={cidade}
                onChange={setCidade}
              />

              {status === "error" && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
              >
                {status === "loading" ? "ENVIANDO..." : "ENVIAR DADOS"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold tracking-wide text-blue-200">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-blue-900/50 bg-[#060615] px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-blue-500"
      />
    </div>
  );
}