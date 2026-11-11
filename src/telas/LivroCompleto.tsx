import { motion } from 'motion/react';
import { useState } from 'react';
import { Botao } from '../componentes/Ui';
import { nomeDoTema, textoDoLivro } from '../jogo/livro';
import type { EstadoJogo } from '../jogo/tipos';

export function LivroCompleto({ estado: e, aoFechar }: { estado: EstadoJogo; aoFechar: () => void }) {
  const [aviso, setAviso] = useState('');

  const compartilhar = async () => {
    const texto = textoDoLivro(e);
    try {
      if (navigator.share) {
        await navigator.share({ title: e.tituloHistoria || 'Livro-Jogo a Dois', text: texto });
        return;
      }
    } catch {
      return;
    }
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(e.tituloHistoria || 'livro-jogo').replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setAviso('Arquivo baixado.');
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-y-auto bg-[color-mix(in_srgb,var(--fundo1)_94%,transparent)] backdrop-blur-md"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-label="Livro completo"
    >
      <div className="mx-auto max-w-md px-5 pt-[max(env(safe-area-inset-top),1.25rem)] pb-16">
        <div className="sticky top-0 -mx-5 flex justify-end bg-[color-mix(in_srgb,var(--fundo1)_90%,transparent)] px-5 py-2">
          <button onClick={aoFechar} className="rounded-full border border-borda bg-white/5 px-3 py-1.5 text-sm">
            Fechar ✕
          </button>
        </div>
        <p className="mt-2 font-titulo text-xs tracking-[0.3em] text-primaria uppercase">{nomeDoTema(e)}</p>
        <h1 className="mt-1 font-titulo text-4xl leading-tight font-extrabold">{e.tituloHistoria || 'Sua história'}</h1>

        {e.personagens && (
          <div className="mt-5 grid gap-3">
            {(['j1', 'j2'] as const).map((j) => (
              <div key={j} className="rounded-2xl border border-borda bg-white/5 p-4">
                <p className="font-titulo text-lg">
                  {e.personagens![j].nome} <span className="text-sm text-suave">· {e.personagens![j].papel}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-suave">{e.personagens![j].descricao}</p>
              </div>
            ))}
          </div>
        )}

        {e.capitulos.map((c) => (
          <article key={c.numero} className="mt-10">
            <p className="font-titulo text-xs tracking-[0.3em] text-suave uppercase">{c.epilogo ? 'Epílogo' : `Capítulo ${c.numero}`}</p>
            <h2 className="mt-1 font-titulo text-2xl font-bold">{c.titulo}</h2>
            <div className="capitular mt-3 text-[1.02rem] leading-[1.75] text-texto/90">
              {c.narracao.split(/\n+/).map((p, i) => (
                <p key={i} className="mb-3">
                  {p}
                </p>
              ))}
            </div>
            {(c.escolhas.j1 || c.escolhas.j2) && (
              <div className="mt-2 rounded-2xl bg-white/5 p-3 text-sm text-suave">
                {(['j1', 'j2'] as const).map((j) =>
                  c.escolhas[j] ? (
                    <p key={j}>
                      <span className="text-texto">{e.jogadores[j]?.nome}:</span> {c.escolhas[j]!.texto}
                    </p>
                  ) : null,
                )}
              </div>
            )}
          </article>
        ))}

        <Botao className="mt-10 w-full" variante="secundario" onClick={compartilhar}>
          Compartilhar / salvar a história
        </Botao>
        {aviso && <p className="mt-2 text-center text-sm text-suave">{aviso}</p>}
      </div>
    </motion.div>
  );
}
