import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

type Lead = {
  id: string;
  created_at: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  mac_cliente: string | null;
  mac_ap: string | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; cidade?: string }>;
}) {
  const supabase = await createClient();

  // Proteção: só passa quem está logado.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { de, ate, cidade } = await searchParams;

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (de) query = query.gte("created_at", de);
  if (ate) query = query.lte("created_at", `${ate}T23:59:59`);
  if (cidade) query = query.ilike("cidade", `%${cidade}%`);

  const { data, error } = await query;
  const leads = (data as Lead[]) ?? [];

  const exportParams = new URLSearchParams();
  if (de) exportParams.set("de", de);
  if (ate) exportParams.set("ate", ate);
  if (cidade) exportParams.set("cidade", cidade);
  const exportHref = `/admin/export?${exportParams.toString()}`;

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-6 py-8 font-sans text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-500">
            Leads · Fibranet Brasil
          </h1>
          <form action="/admin/logout" method="post">
            <button className="text-sm text-zinc-400 hover:text-white">
              Sair
            </button>
          </form>
        </div>

        <form
          method="get"
          className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-blue-900/40 bg-[#0d0d2b] p-4"
        >
          <div>
            <label className="mb-1 block text-xs text-blue-200">De</label>
            <input
              type="date"
              name="de"
              defaultValue={de}
              className="rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-blue-200">Até</label>
            <input
              type="date"
              name="ate"
              defaultValue={ate}
              className="rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-blue-200">Cidade</label>
            <input
              type="text"
              name="cidade"
              defaultValue={cidade}
              placeholder="Ex: Barueri"
              className="rounded-lg border border-blue-900/50 bg-[#060615] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
          >
            Filtrar
          </button>
          <a
            href="/admin"
            className="rounded-lg border border-blue-900/50 px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Limpar
          </a>
          <a
            href={exportHref}
            className="ml-auto rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-900/30"
          >
            ↓ Exportar CSV
          </a>
        </form>

        <p className="mb-3 text-sm text-zinc-400">
          {leads.length} registro(s) encontrado(s)
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400">
            Erro ao carregar: {error.message}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-blue-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0d0d2b] text-blue-200">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Cidade</th>
                <th className="px-4 py-3">AP</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-blue-900/30 hover:bg-[#0d0d2b]/60"
                >
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">{l.nome}</td>
                  <td className="px-4 py-3 text-zinc-300">{l.email || "—"}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {l.telefone || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{l.cidade || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{l.mac_ap || "—"}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Nenhum lead pra esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}