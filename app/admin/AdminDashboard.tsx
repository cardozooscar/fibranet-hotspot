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
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header com Glassmorphism */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm shadow-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Icon name="wifi" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                Fibranet Brasil
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Painel de Gestão de Leads
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              {userEmail}
            </span>
            <form action="/admin/logout" method="post">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Cartões de Estatísticas com Hover Effect */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard
            label="Total de leads"
            valor={stats.total}
            icon="users"
            color="from-blue-500 to-blue-600"
            bgIcon="bg-blue-50 text-blue-600"
          />
          <StatCard 
            label="Hoje" 
            valor={stats.hoje} 
            icon="calendar" 
            color="from-indigo-500 to-indigo-600"
            bgIcon="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Últimos 7 dias"
            valor={stats.ultimos7}
            icon="trend"
            color="from-violet-500 to-violet-600"
            bgIcon="bg-violet-50 text-violet-600"
          />
          <StatCard 
            label="Cidades" 
            valor={stats.cidades} 
            icon="pin" 
            color="from-emerald-500 to-emerald-600"
            bgIcon="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Toolbar de Filtros */}
        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
          <div className="relative min-w-[260px] flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nome, e-mail, telefone ou cidade..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={de}
              onChange={(e) => {
                setDe(e.target.value);
                setPagina(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            <span className="text-sm font-medium text-slate-400">até</span>
            <input
              type="date"
              value={ate}
              onChange={(e) => {
                setAte(e.target.value);
                setPagina(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-600 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {(busca || de || ate) && (
            <button
              onClick={limpar}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Limpar Filtros
            </button>
          )}

          <button
            onClick={exportarCSV}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300"
          >
            <Icon name="download" />
            Exportar CSV
          </button>
        </div>

        <div className="mt-6 mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Exibindo <strong className="text-slate-900">{filtrados.length}</strong> registro{filtrados.length !== 1 ? "s" : ""}
            {filtrados.length !== leads.length && ` de ${leads.length} totais`}
          </p>
        </div>

        {/* Tabela Melhorada */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Contato</th>
                  <th className="px-6 py-4 font-semibold">Cidade</th>
                  <th className="px-6 py-4 font-semibold">MAC AP</th>
                  <th className="px-6 py-4 font-semibold">Data de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiveis.map((l) => (
                  <tr key={l.id} className="group transition-colors hover:bg-indigo-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-xs font-bold text-indigo-700 ring-2 ring-white">
                          {iniciais(l.nome)}
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">
                          {l.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{l.email || "—"}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {l.telefone || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {l.cidade || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {l.mac_ap ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                          {l.mac_ap}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-500">
                      {dataHoraBR(l.created_at)}
                    </td>
                  </tr>
                ))}
                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-4 ring-slate-50/50">
                        <Icon name="inbox" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">Nenhum lead encontrado</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Tente ajustar os filtros de busca ou as datas selecionadas.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Estilizada */}
          {filtrados.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-sm">
              <span className="font-medium text-slate-500">
                Mostrando <strong className="text-slate-900">{inicio + 1}</strong> a <strong className="text-slate-900">{Math.min(inicio + POR_PAGINA, filtrados.length)}</strong> de{" "}
                <strong className="text-slate-900">{filtrados.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                >
                  <Icon name="left" />
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
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
  color = "from-blue-500 to-blue-600",
  bgIcon = "bg-blue-50 text-blue-600"
}: {
  label: string;
  valor: number;
  icon: IconName;
  color?: string;
  bgIcon?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgIcon}`}>
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{valor}</p>
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
      width="20"
      height="20"
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