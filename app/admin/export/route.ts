import { createClient } from "@/lib/supabase-server";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Escapa aspas e envolve em aspas se tiver vírgula/quebra/aspas.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const cidade = searchParams.get("cidade");

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (de) query = query.gte("created_at", de);
  if (ate) query = query.lte("created_at", `${ate}T23:59:59`);
  if (cidade) query = query.ilike("cidade", `%${cidade}%`);

  const { data, error } = await query;
  if (error) return new Response(`Erro: ${error.message}`, { status: 500 });

  const header = "data,nome,email,telefone,cidade,mac_cliente,mac_ap\n";
  const rows = (data ?? [])
    .map((l) =>
      [
        l.created_at,
        l.nome,
        l.email,
        l.telefone,
        l.cidade,
        l.mac_cliente,
        l.mac_ap,
      ]
        .map(csvCell)
        .join(",")
    )
    .join("\n");

  // BOM (\uFEFF) pra acentuação abrir certo no Excel.
  return new Response("\uFEFF" + header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-fibranet.csv"',
    },
  });
}