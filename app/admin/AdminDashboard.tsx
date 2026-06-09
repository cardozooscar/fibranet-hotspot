"use client";

import { useMemo, useState } from "react";

export type Lead = {
  id: string;
  created_at: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  mac_cliente: string | null;
  mac_ap: string | null;
};

const TZ = "America/Sao_Paulo";
const POR_PAGINA = 10;

function dataHoraBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Data (sem hora) no fuso de SP, no formato AAAA-MM-DD, pra comparar com os filtros.
function diaBR(iso: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return f.format(new Date(iso)); // ex: "2026-06-09"
}

function hojeBR() {
  return diaBR(new Date().toISOString());
}

function diasAtrasBR(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return diaBR(d.toISOString());
}

export default function AdminDashboard({
  leads,
  userEmail,
}: {
  leads: Lead[];
  userEmail: string;
}) {
  const [busca, setBusca] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [pagina, setPagina] = useState(1);

  // ----- Estatísticas (cartões) -----
  const stats = useMemo(() => {
    const hoje = hojeBR();
    const limite7 = diasAtrasBR(7);
    const cidades = new Set(
      leads.map((l) => (l.cidade || "").trim().toLowerCase()).filter(Boolean)
    );
    return {
      total: leads.length,
      hoje: leads.filter((l) => diaBR(l.created_at) === hoje).length,
      ultimos7: leads.filter((l) => diaBR(l.created_at) >= limite7).length,
      cidades: cidades.size,
    };
  }, [leads]);

  // ----- Filtragem -----
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (q) {
        const alvo = `${l.nome} ${l.email ?? ""} ${l.telefone ?? ""} ${
          l.cidade ?? ""
        }`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      const dia = diaBR(l.created_at);
      if (de && dia < de) return false;
      if (ate && dia > ate) return false;
      return true;
    });
  }, [leads, busca, de, ate]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  function limpar() {
    setBusca("");
    setDe("");
    setAte("");
    setPagina(1);
  }

  function exportarCSV() {
    const cab = "data,nome,email,telefone,cidade,ap\n";
    const linhas = filtrados
      .map((l) =>
        [
          dataHoraBR(l.created_at),
          l.nome,
          l.email ?? "",
          l.telefone ?? "",
          l.cidade ?? "",
          l.mac_ap ?? "",
        ]
          .map((c) => {
            const s = String(c ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + cab + linhas], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-fibranet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-4 py-8 font-sans text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-blue-500">Leads</span> · Fibranet Brasil
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{userEmail}</p>
          </div>
          <form action="/admin/logout" method="post">
            <button className="rounded-lg border border-blue-900/50 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-blue-700 hover:text-white">
              Sair
            </button>
          </form>
        </div>

        {/* Cartões de resumo */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card titulo="Total de leads" valor={stats.total} />
          <Card titulo="Hoje" valor={stats.hoje} />
          <Card titulo="Últimos 7 dias" valor={stats.ultimos7} />
          <Card titulo="Cidades" valor={stats.cidades} />
        </div>

        {/* Filtros */}
        <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-blue-900/40 bg-[#0d0d2b] p-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs text-blue-200">Buscar</label>
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Nome, e-mail, telefone ou cidade"
              className="w-full rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-blue-200">De</label>
            <input
              type="date"
              value={de}
              onChange={(e) => {
                setDe(e.target.value);
                setPagina(1);
              }}
              className="rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-blue-200">Até</label>
            <input
              type="date"
              value={ate}
              onChange={(e) => {
                setAte(e.target.value);
                setPagina(1);
              }}
              className="rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={limpar}
            className="rounded-lg border border-blue-900/50 px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Limpar
          </button>
          <button
            onClick={exportarCSV}
            className="ml-auto rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-900/30"
          >
            ↓ Exportar CSV
          </button>
        </div>

        <p className="mb-3 text-sm text-zinc-400">
          {filtrados.length} registro(s){" "}
          {filtrados.length !== leads.length && `de ${leads.length}`}
        </p>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-xl border border-blue-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#11113a] text-blue-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold">Cidade</th>
                <th className="px-4 py-3 font-semibold">AP</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l, i) => (
                <tr
                  key={l.id}
                  className={`border-t border-blue-900/20 transition-colors hover:bg-blue-950/40 ${
                    i % 2 === 1 ? "bg-[#0d0d2b]/40" : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                    {dataHoraBR(l.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.nome}</td>
                  <td className="px-4 py-3 text-zinc-300">{l.email || "—"}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {l.telefone || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{l.cidade || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{l.mac_ap || "—"}</td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    Nenhum lead pra esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaSegura === 1}
              className="rounded-lg border border-blue-900/50 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="text-zinc-400">
              Página {paginaSegura} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura === totalPaginas}
              className="rounded-lg border border-blue-900/50 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-xl border border-blue-900/40 bg-[#0d0d2b] p-5">
      <p className="text-xs uppercase tracking-wide text-blue-200/70">
        {titulo}
      </p>
      <p className="mt-2 text-3xl font-bold text-white">{valor}</p>
    </div>
  );
}