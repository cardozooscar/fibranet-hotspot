import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import FormPortal from './FormPortal';

export default async function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tenant) return notFound();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050a1f]">
      <div className="w-full max-w-sm bg-[#0a0f2c] rounded-3xl shadow-2xl p-8 border border-blue-900/30">
        
        {/* Header com Logo */}
        <div className="flex flex-col items-center mb-8">
          {tenant.config.logo_url && (
            <img src={tenant.config.logo_url} alt="Logo" className="h-12 w-auto mb-6" />
          )}
          <h1 className="text-2xl font-bold text-blue-500 text-center tracking-tight">
            Wi-Fi {tenant.nome}
          </h1>
          <p className="text-blue-200/60 text-sm mt-2 text-center uppercase tracking-widest">
            Preencha os dados para continuar
          </p>
        </div>

        {/* Chamando o componente do formulário */}
        <FormPortal tenant={tenant} slug={slug} />

        <p className="text-[10px] text-center text-gray-600 mt-8 uppercase tracking-widest">
          Powered by Fibranet Brasil
        </p>
      </div>
    </main>
  );
}