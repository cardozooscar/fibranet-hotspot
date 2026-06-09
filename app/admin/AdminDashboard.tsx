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

// Micro-interação: Clique para copiar isolado
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {}
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center text-slate-600 hover:text-cyan-400 p-1 rounded-md hover:bg-slate-800/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ml-1"
      title="Copiar"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
    </button>
  );
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

  // Controle local para navegação do componente visual do calendário
  const [calNav, setCalNav] = useState(() => {
    const d = new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });

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

  // Mapeamento de volume de leads por dia para alimentar o Heatmap do calendário rápido
  const leadsPorDiaMap = useMemo(() => {
    const mapa: Record<string, number> = {};
    leads.forEach((l) => {
      const dia = diaBR(l.created_at);
      mapa[dia] = (mapa[dia] || 0) + 1;
    });
    return mapa;
  }, [leads]);

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

  // Geração da matriz de dias do calendário selecionado
  const { matrizCalendario, nomeMes } = useMemo(() => {
    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const primeiroDiaSemana = new Date(calNav.year, calNav.month, 1).getDay();
    const totalDiasMes = new Date(calNav.year, calNav.month + 1, 0).getDate();
    
    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    for (let d = 1; d <= totalDiasMes; d++) {
      dias.push(d);
    }
    return { matrizCalendario: dias, nomeMes: nomesMeses[calNav.month] };
  }, [calNav]);

  const mudarMes = (direcao: number) => {
    setCalNav((prev) => {
      let novoMes = prev.month + direcao;
      let novoAno = prev.year;
      if (novoMes > 11) { novoMes = 0; novoAno += 1; }
      if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
      return { month: novoMes, year: novoAno };
    });
  };

  return (
    <div className="min-h-screen bg-[#05070f] font-sans text-slate-300 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Neon Orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-900 bg-[#070913]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/cardozooscar/imagenscgr/refs/heads/main/WhatsApp_Image_2025-10-30_at_10.21.26__1_-removebg-preview.png" 
                alt="Fibranet Logo" 
                className="h-10 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]" 
              />
            </div>
            <div className="hidden h-5 w-px bg-slate-800 md:block" />
            <span className="hidden rounded-full border border-cyan-500/10 bg-cyan-500/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 md:inline-block">
              NOC Hotspot v2.5
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Operador</span>
              <span className="text-sm font-semibold text-slate-400">{userEmail}</span>
            </div>
            <form action="/admin/logout" method="post">
              <button className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-bold text-slate-400 transition-all hover:border-red-500/30 hover:text-red-400 hover:bg-red-950/10">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Bento Grid de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-[#0c1017]/40 to-transparent p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Volume Total Capturado</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20"><Icon name="users" /></span>
            </div>
            <p className="mt-4 text-5xl font-black tracking-tight text-white">{stats.total}</p>
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-40 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 80 Q 25 75, 50 45 T 100 15 L 100 100 L 0 100 Z" fill="url(#grad-blue)" />
                <path d="M 0 80 Q 25 75, 50 45 T 100 15" fill="none" stroke="#3b82f6" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 via-[#0c1017]/40 to-transparent p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Novos Hoje</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Icon name="calendar" /></span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-white">{stats.hoje}</p>
            <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 90 L 20 80 L 40 40 L 60 85 L 80 20 L 100 30" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/10 via-[#0c1017]/40 to-transparent p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Últimos 7 dias</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Icon name="trend" /></span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-white">{stats.ultimos7}</p>
            <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 50 Q 20 20, 40 60 T 80 30 T 100 10" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* TOOLBAR DE BUSCA GLOBAL */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-900 bg-[#0a0d14]/90 p-4 mb-6 shadow-xl">
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
              placeholder="Buscar por nome, e-mail, celular ou cidade na lista atual..."
              className="w-full rounded-xl border border-slate-800 bg-[#05060b] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500/50"
            />
          </div>
          
          {/* Inputs ocultos ou mini para manter compatibilidade total de formulário/filtros manuais se necessário */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-[#05060b]/40 p-1.5 text-xs text-slate-500 font-medium">
            Período ativo: <span className="text-cyan-400 font-mono">{de || "Início"}</span> até <span className="text-cyan-400 font-mono">{ate || "Fim"}</span>
          </div>

          <button
            onClick={exportarCSV}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all hover:brightness-110 active:scale-95"
          >
            <Icon name="download" />
            Exportar Base
          </button>
        </div>

        {/* NOVO LAYOUT: DUAS COLUNAS (CALENDÁRIO + TABELA) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: CALENDÁRIO INTERATIVO */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-900 bg-[#0a0d14]/70 p-5 shadow-2xl backdrop-blur-md sticky top-28">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span className="text-cyan-400"><Icon name="calendar" /></span> Navegação Temporal
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => mudarMes(-1)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                  <Icon name="left" />
                </button>
                <span className="text-xs font-bold text-slate-300 min-w-[100px] text-center uppercase tracking-wide">
                  {nomeMes} {calNav.year}
                </span>
                <button onClick={() => mudarMes(1)} className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                  <Icon name="right" />
                </button>
              </div>
            </div>

            {/* Matriz do Calendário */}
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, idx) => (
                <span key={idx} className="text-[10px] font-bold text-slate-600 py-1 uppercase">{d}</span>
              ))}
              
              {matrizCalendario.map((dia, idx) => {
                if (dia === null) return <div key={idx} className="p-2" />;
                
                // Monta string padrão YYYY-MM-DD para bater com diaBR
                const dataString = `${calNav.year}-${String(calNav.month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                const totalLeadsDia = leadsPorDiaMap[dataString] || 0;
                
                // Verifica se este dia específico é o selecionado na query
                const isSelecionado = de === dataString && ate === dataString;
                const isHoje = dataString === hojeBR();

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setDe(dataString);
                      setAte(dataString);
                      setPagina(1);
                    }}
                    className={`group relative p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center aspect-square ${
                      isSelecionado 
                        ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105 z-10" 
                        : isHoje
                        ? "bg-slate-900 border-slate-700 text-cyan-400 ring-1 ring-cyan-500/20"
                        : "bg-[#05060b]/40 border-slate-900 hover:border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{dia}</span>
                    {/* Indicador Heatmap de volume de dados coletados */}
                    {totalLeadsDia > 0 && (
                      <span className={`absolute bottom-1 w-4 h-3 text-[8px] font-black rounded flex items-center justify-center leading-none ${
                        isSelecionado ? "bg-slate-950 text-cyan-400" : "bg-cyan-950 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {totalLeadsDia}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Controles rápidos do calendário */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
              <button 
                onClick={() => {
                  const hoje = hojeBR();
                  setDe(hoje);
                  setAte(hoje);
                  setPagina(1);
                  const d = new Date();
                  setCalNav({ month: d.getMonth(), year: d.getFullYear() });
                }}
                className="w-full text-center py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Filtrar Apenas Hoje
              </button>
              {(busca || de || ate) && (
                <button 
                  onClick={limpar}
                  className="w-full text-center py-2 rounded-xl bg-red-950/10 border border-red-900/20 text-xs font-bold text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  Limpar Todos os Filtros
                </button>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: LISTAGEM FILTRADA DA TABELA */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-[#0a0d14]/70 shadow-2xl backdrop-blur-md overflow-hidden">
            
            {/* Chips de Filtros Ativos */}
            {(busca || de || ate) && (
              <div className="flex flex-wrap items-center gap-2 bg-[#0d111a]/40 px-5 py-3 border-b border-slate-900">
                <span className="text-xs text-slate-500 font-semibold mr-1">Filtros:</span>
                {busca && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#05070f] px-2.5 py-1 text-xs font-medium text-slate-400">
                    Busca: <strong className="text-cyan-400">"{busca}"</strong>
                    <button onClick={() => { setBusca(""); setPagina(1); }} className="hover:text-red-400 ml-1 text-slate-500">✕</button>
                  </span>
                )}
                {(de || ate) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#05070f] px-2.5 py-1 text-xs font-medium text-slate-400">
                    Período: <strong className="text-cyan-400">{de === ate ? de : `${de || "Início"} a ${ate || "Fim"}`}</strong>
                    <button onClick={() => { setDe(""); setAte(""); setPagina(1); }} className="hover:text-red-400 ml-1 text-slate-500">✕</button>
                  </span>
                )}
              </div>
            )}

            <div className="bg-[#0b0e16]/90 px-6 py-3 border-b border-slate-900/60">
              <p className="text-xs font-medium text-slate-400">
                Exibindo <span className="text-cyan-400 font-bold">{filtrados.length}</span> registros nesta janela temporal
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-[#0a0d14] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">Cidade / AP</th>
                    <th className="px-6 py-4 text-right">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {visiveis.map((l) => {
                    const isHoje = diaBR(l.created_at) === hojeBR();
                    return (
                      <tr key={l.id} className="transition-all hover:bg-slate-900/20 group">
                        {/* Usuário */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-cyan-400 border border-slate-800 group-hover:border-cyan-500/30 transition-all">
                              {iniciais(l.nome)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                                {l.nome}
                              </span>
                              {isHoje && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black text-emerald-400 border border-emerald-500/20 w-max mt-0.5 animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Contato */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center font-medium text-slate-300 text-xs max-w-[160px] truncate">
                            <span>{l.email || "—"}</span>
                            {l.email && <CopyButton text={l.email} />}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-500 flex items-center">
                            <span>{l.telefone || "—"}</span>
                            {l.telefone && <CopyButton text={l.telefone} />}
                          </div>
                        </td>
                        
                        {/* Cidade / AP */}
                        <td className="px-6 py-4.5 text-xs">
                          <div className="font-semibold text-slate-400 truncate max-w-[120px]">{l.cidade || "—"}</div>
                          <div className="mt-0.5">
                            {l.mac_ap ? (
                              <span className="inline-flex items-center font-mono text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                                AP: {l.mac_ap}
                                <CopyButton text={l.mac_ap} />
                              </span>
                            ) : (
                              <span className="text-slate-800">—</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Data */}
                        <td className="whitespace-nowrap px-6 py-4.5 text-right font-mono text-xs text-slate-500">
                          {dataHoraBR(l.created_at)}
                        </td>
                      </tr>
                    );
                  })}

                  {visiveis.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 border border-slate-900 text-slate-700">
                          <Icon name="inbox" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-400">Nenhum registro mapeado</h4>
                        <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto">
                          Selecione outro dia no calendário ou limpe os filtros ativos para ver mais dados.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {filtrados.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-900 bg-[#0a0d14]/40 px-6 py-3 text-xs">
                <span className="font-medium text-slate-500">
                  <span className="text-slate-300 font-bold">{inicio + 1}</span>-<span className="text-slate-300 font-bold">{Math.min(inicio + POR_PAGINA, filtrados.length)}</span> de <span className="text-cyan-400 font-bold">{filtrados.length}</span>
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaSegura === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 font-bold text-slate-400 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Icon name="left" />
                  </button>
                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura === totalPaginas}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 font-bold text-slate-400 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Icon name="right" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
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
      width="14"
      height="14"
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