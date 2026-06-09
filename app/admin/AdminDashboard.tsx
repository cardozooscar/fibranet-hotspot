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

function diaBR(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function hojeBR() {
  return diaBR(new Date().toISOString());
}

function diasAtrasBR(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return diaBR(d.toISOString());
}

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
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
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const visiveis = filtrados.slice(inicio, inicio + POR_PAGINA);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Icon name="wifi" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Fibranet Brasil
              </p>
              <p className="text-xs text-slate-500">Painel de Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {userEmail}
            </span>
            <form action="/admin/logout" method="post">
              <button className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Cartões */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total de leads"
            valor={stats.total}
            icon="users"
          />
          <StatCard label="Hoje" valor={stats.hoje} icon="calendar" />
          <StatCard
            label="Últimos 7 dias"
            valor={stats.ultimos7}
            icon="trend"
          />
          <StatCard label="Cidades" valor={stats.cidades} icon="pin" />
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nome, e-mail, telefone ou cidade"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <input
            type="date"
            value={de}
            onChange={(e) => {
              setDe(e.target.value);
              setPagina(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-sm text-slate-400">até</span>
          <input
            type="date"
            value={ate}
            onChange={(e) => {
              setAte(e.target.value);
              setPagina(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {(busca || de || ate) && (
            <button
              onClick={limpar}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Limpar
            </button>
          )}
          <button
            onClick={exportarCSV}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Icon name="download" />
            Exportar CSV
          </button>
        </div>

        <p className="mt-5 mb-3 text-sm text-slate-500">
          {filtrados.length} registro{filtrados.length !== 1 ? "s" : ""}
          {filtrados.length !== leads.length && ` de ${leads.length}`}
        </p>

        {/* Tabela */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Cidade</th>
                  <th className="px-5 py-3 font-medium">AP</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiveis.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                          {iniciais(l.nome)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {l.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-700">{l.email || "—"}</div>
                      <div className="text-xs text-slate-400">
                        {l.telefone || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {l.cidade || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {l.mac_ap ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {l.mac_ap}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                      {dataHoraBR(l.created_at)}
                    </td>
                  </tr>
                ))}
                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Icon name="inbox" />
                      </div>
                      <p className="text-sm text-slate-500">
                        Nenhum lead encontrado pra esses filtros.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {filtrados.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm">
              <span className="text-slate-500">
                Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, filtrados.length)} de{" "}
                {filtrados.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="left" />
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                  <Icon name="right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  valor,
  icon,
}: {
  label: string;
  valor: number;
  icon: IconName;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{valor}</p>
    </div>
  );
}

type IconName =
  | "wifi"
  | "users"
  | "calendar"
  | "trend"
  | "pin"
  | "search"
  | "download"
  | "left"
  | "right"
  | "inbox";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    wifi: (
      <>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    trend: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    pin: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
    left: <polyline points="15 18 9 12 15 6" />,
    right: <polyline points="9 18 15 12 9 6" />,
    inbox: (
      <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}