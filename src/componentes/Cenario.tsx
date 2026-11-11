import { memo, useMemo } from 'react';
import { GENEROS, type Ambiente } from '../jogo/generos';
import type { GeneroId } from '../jogo/tipos';

const QTD: Record<Ambiente | 'padrao', number> = {
  vagalumes: 22,
  estrelas: 40,
  chuva: 60,
  nevoa: 6,
  ondas: 4,
  brasas: 30,
  petalas: 20,
  coracoes: 16,
  padrao: 18,
};

/** Fundo animado do gênero. Só anima transform/opacity para manter 60 fps. */
export const Cenario = memo(function Cenario({ genero }: { genero: GeneroId | null }) {
  const g = genero ? GENEROS[genero] : null;
  const ambiente = g?.ambiente ?? 'padrao';
  const particulas = useMemo(() => {
    const n = QTD[ambiente];
    // Pseudoaleatório determinístico: as partículas não "pulam" a cada render.
    let s = 7;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      left: `${r() * 100}%`,
      top: ambiente === 'ondas' ? `${55 + i * 11}%` : `${r() * 100}%`,
      vars: {
        '--dur': `${6 + r() * 8}s`,
        '--dur-curta': `${0.6 + r() * 0.5}s`,
        '--dur-longa': `${14 + r() * 10}s`,
        '--atraso': `${-r() * 12}s`,
        '--dx': `${(r() - 0.5) * 30}vw`,
        '--dy': `${(r() - 0.5) * 30}vh`,
      } as React.CSSProperties,
    }));
  }, [ambiente]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ contain: 'strict' }}>
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, var(--fundo2) 0%, var(--fundo1) 70%)`,
        }}
      />
      <div className={`absolute inset-0 amb-${ambiente}`}>
        {particulas.map((p) => (
          <span key={p.id} className="particula" style={{ left: p.left, top: p.top, ...p.vars }} />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(90% 70% at 50% 110%, rgba(0,0,0,.55), transparent 70%)' }}
      />
      <div className="grao" />
    </div>
  );
});

/** Aplica as cores do gênero nas variáveis CSS globais. */
export function aplicarTema(genero: GeneroId | null) {
  const root = document.documentElement;
  const padrao = { fundo1: '#0f0b1e', fundo2: '#2a1c4f', primaria: '#f2c46d', secundaria: '#c79bff' };
  const c = genero ? GENEROS[genero].cores : padrao;
  root.style.setProperty('--fundo1', c.fundo1);
  root.style.setProperty('--fundo2', c.fundo2);
  root.style.setProperty('--primaria', c.primaria);
  root.style.setProperty('--secundaria', c.secundaria);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.fundo1);
}
