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
    <div className="min-h-screen bg-[#080B11] font-sans text-slate-300 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Gradient Orbs (Efeito futurista de luzes ao fundo) */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      {/* Header Estilo Cyberpunk/SaaS Moderno */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#0c1017]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Espaço para a Logo da sua empresa */}
            <div className="flex h-11 items-center justify-center">
              {/* DESCOMENTE A LINHA ABAIXO E COLE A URL DO SEU LOGO NO src="" */}
              {/* <img src="https://raw.githubusercontent.com/cardozooscar/imagenscgr/refs/heads/main/WhatsApp_Image_2025-10-30_at_10.21.26__1_-removebg-preview.png" alt="Fibranet Logo" className="h-9 object-contain" /> */}
              
              {/* Fallback visual caso a imagem não seja configurada */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                  <Icon name="wifi" />
                </div>
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  FIBRA<span className="text-cyan-400">NET</span>
                </span>
              </div>
            </div>
            
            <div className="hidden h-5 w-px bg-slate-800 md:block" />
            <span className="hidden rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 md:inline-block">
              Hotspot Admin
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs text-slate-500 font-medium">Sessão ativa</span>
              <span className="text-sm font-semibold text-slate-300">{userEmail}</span>
            </div>
            <form action="/admin/logout" method="post">
              <button className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/40 hover:text-red-400">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Título de Seção */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Dashboard de Captura</h2>
            <p className="text-sm text-slate-500">Monitore usuários e leads coletados via Wi-Fi em tempo real.</p>
          </div>
        </div>

        {/* Grid de Métricas Avançadas */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard
            label="Volume Total"
            valor={stats.total}
            icon="users"
            gradient="from-blue-600/20 to-transparent border-blue-500/30 text-blue-400"
          />
          <StatCard 
            label="Novos Hoje" 
            valor={stats.hoje} 
            icon="calendar" 
            gradient="from-cyan-600/20 to-transparent border-cyan-500/30 text-cyan-400"
          />
          <StatCard
            label="Últimos 7 dias"
            valor={stats.ultimos7}
            icon="trend"
            gradient="from-purple-600/20 to-transparent border-purple-500/30 text-purple-400"
          />
          <StatCard 
            label="Cidades Atendidas" 
            valor={stats.cidades} 
            icon="pin" 
            gradient="from-emerald-600/20 to-transparent border-emerald-500/30 text-emerald-400"
          />
        </div>

        {/* Glass Box do Filtro + Tabela */}
        <div className="mt-10 rounded-2xl border border-slate-800/80 bg-[#0c1017]/60 shadow-2xl backdrop-blur-md">
          
          {/* Painel de Controle de Filtros */}
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-800/80 p-5">
            <div className="relative min-w-[280px] flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Icon name="search" />
              </span>
              <input
                type="text"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPagina(1);
                }}
                placeholder="Filtrar por cliente, e-mail, celular ou cidade..."
                className="w-full rounded-xl border border-slate-800 bg-[#07090e]/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07090e]/40 p-1.5">
              <input
                type="date"
                value={de}
                onChange={(e) => {
                  setDe(e.target.value);
                  setPagina(1);
                }}
                className="bg-transparent px-2 py-1.5 text-sm font-medium text-slate-400 outline-none filter invert brightness-200 focus:text-cyan-400"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">até</span>
              <input
                type="date"
                value={ate}
                onChange={(e) => {
                  setAte(e.target.value);
                  setPagina(1);
                }}
                className="bg-transparent px-2 py-1.5 text-sm font-medium text-slate-400 outline-none filter invert brightness-200 focus:text-cyan-400"
              />
            </div>

            {(busca || de || ate) && (
              <button
                onClick={limpar}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Limpar Filtros
              </button>
            )}

            <button
              onClick={exportarCSV}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all hover:brightness-110 active:scale-95"
            >
              <Icon name="download" />
              Exportar Base
            </button>
          </div>

          {/* Info bar da contagem */}
          <div className="bg-[#0e141f]/40 px-6 py-2 border-b border-slate-800/40">
            <p className="text-xs font-medium text-slate-500">
              Query retornou <span className="text-cyan-400 font-bold">{filtrados.length}</span> registros 
              {filtrados.length !== leads.length && ` de um total de ${leads.length}`}
            </p>
          </div>

          {/* Área da Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0e141f]/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Usuário / Identificação</th>
                  <th className="px-6 py-4">Informações de Contato</th>
                  <th className="px-6 py-4">Cidade / Região</th>
                  <th className="px-6 py-4">Ponto de Acesso (AP)</th>
                  <th className="px-6 py-4 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {visiveis.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-slate-800/20 group">
                    {/* Usuário */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-cyan-400 border border-slate-700/60 group-hover:border-cyan-500/30 group-hover:bg-cyan-950/20 transition-all">
                          {iniciais(l.nome)}
                        </div>
                        <span className="font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                          {l.nome}
                        </span>
                      </div>
                    </td>
                    
                    {/* Contato */}
                    <td className="px-6 py-4.5">
                      <div className="font-medium text-slate-300">{l.email || "—"}</div>
                      <div className="mt-0.5 font-mono text-xs text-slate-500">
                        {l.telefone || "—"}
                      </div>
                    </td>
                    
                    {/* Cidade */}
                    <td className="px-6 py-4.5 font-semibold text-slate-400">
                      {l.cidade || "—"}
                    </td>
                    
                    {/* MAC AP */}
                    <td className="px-6 py-4.5">
                      {l.mac_ap ? (
                        <span className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-400 shadow-inner group-hover:border-slate-700 transition-colors">
                          {l.mac_ap}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    
                    {/* Data */}
                    <td className="whitespace-nowrap px-6 py-4.5 text-right font-mono text-xs text-slate-500">
                      {dataHoraBR(l.created_at)}
                    </td>
                  </tr>
                ))}

                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-600">
                        <Icon name="inbox" />
                      </div>
                      <h4 className="text-base font-bold text-slate-400">Nenhum registro mapeado</h4>
                      <p className="mt-1 text-sm text-slate-600 max-w-xs mx-auto">
                        Não existem leads capturados para os critérios informados nesta pesquisa.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Estilo Grid */}
          {filtrados.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#0e141f]/30 px-6 py-4 text-sm">
              <span className="font-medium text-slate-500">
                Mostrando <span className="text-slate-300 font-bold">{inicio + 1}</span> a <span className="text-slate-300 font-bold">{Math.min(inicio + POR_PAGINA, filtrados.length)}</span> de{" "}
                <span className="text-cyan-400 font-bold">{filtrados.length}</span> bases filtradas
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-400"
                >
                  <Icon name="left" />
                  Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-400"
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
  gradient,
}: {
  label: string;
  valor: number;
  icon: IconName;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#0c1017]/40 p-6 shadow-xl backdrop-blur-sm bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <span className="opacity-80">
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight text-white">{valor}</p>
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}