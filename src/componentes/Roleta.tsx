import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { GENEROS, LISTA_GENEROS } from '../jogo/generos';
import type { GeneroId, Semente } from '../jogo/tipos';

const ALTURA = 76;
const VOLTAS = 4;

/** Sorteio do gênero em forma de rolo de caça-níquel, em sincronia nos dois celulares. */
export function Roleta({
  genero,
  semente,
  rapido,
  aoTerminar,
}: {
  genero: GeneroId;
  semente: Semente | null;
  rapido: boolean;
  aoTerminar: () => void;
}) {
  const itens = useMemo(() => {
    const lista = [];
    for (let v = 0; v < VOLTAS; v++) lista.push(...LISTA_GENEROS);
    lista.push(...LISTA_GENEROS);
    return lista;
  }, []);
  const indiceFinal = (VOLTAS * LISTA_GENEROS.length) + LISTA_GENEROS.findIndex((g) => g.id === genero);
  const y = useMotionValue(0);
  const [parou, setParou] = useState(false);

  useEffect(() => {
    navigator.vibrate?.([20, 60, 20]);
    const ctrl = animate(y, -indiceFinal * ALTURA, {
      duration: rapido ? 0.2 : 3.4,
      ease: [0.12, 0.8, 0.18, 1],
      onComplete: () => {
        setParou(true);
        navigator.vibrate?.(60);
      },
    });
    return () => ctrl.stop();
  }, [indiceFinal, rapido, y]);

  useEffect(() => {
    if (!parou) return;
    const t = setTimeout(aoTerminar, rapido ? 150 : 3200);
    return () => clearTimeout(t);
  }, [parou, rapido, aoTerminar]);

  const g = GENEROS[genero];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      onClick={parou ? aoTerminar : undefined}
      data-testid="roleta"
    >
      <p className="mb-5 font-titulo text-sm tracking-[0.3em] text-suave uppercase">Sorteando a aventura</p>
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-borda bg-black/40"
        style={{ height: ALTURA * 3 }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[76px] bg-gradient-to-b from-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[76px] bg-gradient-to-t from-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 z-10 rounded-2xl border-2 border-primaria/70" style={{ top: ALTURA, height: ALTURA }} />
        <motion.div style={{ y, paddingTop: ALTURA }}>
          {itens.map((it, i) => (
            <div key={i} className="flex items-center justify-center gap-3 font-titulo text-xl" style={{ height: ALTURA }}>
              <span className="text-3xl">{it.icone}</span>
              <span>{it.nome}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="mt-8 max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={parou ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-titulo text-3xl font-extrabold text-primaria" data-testid="genero-sorteado">
          {g.icone} {g.nome}
        </h2>
        <p className="mt-2 text-suave">{g.chamada}</p>
        {semente && (
          <p className="mt-4 text-sm leading-relaxed text-texto/80 italic">
            Onde tudo começa: {semente.lugar}…
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
