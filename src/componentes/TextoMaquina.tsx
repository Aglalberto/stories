import { useEffect, useRef, useState } from 'react';

/** Progresso já revelado por chave, para não reescrever ao remontar o componente. */
const revelados = new Map<string, number>();

export interface PropsTextoMaquina {
  texto: string;
  chave: string;
  /** O texto está completo (não chegará mais nada pelo streaming). */
  completo: boolean;
  /** Caracteres por segundo. Infinity mostra tudo de uma vez. */
  cps: number;
  instantaneo?: boolean;
  aoTerminar?: () => void;
  className?: string;
}

/**
 * Efeito de máquina de escrever: revela o texto num ritmo constante,
 * independente de como os trechos chegam do streaming. Toque para pular.
 */
export function TextoMaquina({ texto, chave, completo, cps, instantaneo, aoTerminar, className = '' }: PropsTextoMaquina) {
  const [n, setN] = useState(() => (instantaneo || !Number.isFinite(cps) ? texto.length : (revelados.get(chave) ?? 0)));
  const nRef = useRef(n);
  const textoRef = useRef(texto);
  textoRef.current = texto;
  const terminouRef = useRef(false);
  const aoTerminarRef = useRef(aoTerminar);
  aoTerminarRef.current = aoTerminar;

  useEffect(() => {
    nRef.current = revelados.get(chave) ?? (instantaneo ? texto.length : 0);
    terminouRef.current = false;
  }, [chave]);

  useEffect(() => {
    if (instantaneo || !Number.isFinite(cps)) {
      nRef.current = texto.length;
      revelados.set(chave, texto.length);
      setN(texto.length);
      return;
    }
    let raf = 0;
    let anterior = performance.now();
    const passo = (agora: number) => {
      const dt = Math.min(0.1, (agora - anterior) / 1000);
      anterior = agora;
      const alvo = textoRef.current.length;
      if (nRef.current < alvo) {
        // Acelera um pouco se o texto disponível estiver muito à frente.
        const atraso = alvo - nRef.current;
        const vel = cps * (atraso > 400 ? 2 : 1);
        nRef.current = Math.min(alvo, nRef.current + vel * dt);
        revelados.set(chave, nRef.current);
        setN(Math.floor(nRef.current));
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [chave, cps, instantaneo, texto.length]);

  const fim = n >= texto.length;
  useEffect(() => {
    if (completo && fim && texto.length > 0 && !terminouRef.current) {
      terminouRef.current = true;
      aoTerminarRef.current?.();
    }
  }, [completo, fim, texto.length]);

  const pular = () => {
    nRef.current = textoRef.current.length;
    revelados.set(chave, nRef.current);
    setN(textoRef.current.length);
  };

  const visivel = texto.slice(0, n);
  const paragrafos = visivel.split(/\n\s*\n|\n/).filter((p, i, arr) => p.trim() || i === arr.length - 1);
  const escrevendo = !completo || !fim;

  return (
    <div
      className={`capitular font-leitura text-[1.075rem] leading-[1.75] text-texto/95 ${className}`}
      onClick={escrevendo ? pular : undefined}
      aria-live="polite"
      data-testid="narracao"
      data-completa={completo && fim ? 'sim' : 'nao'}
    >
      {paragrafos.map((p, i) => (
        <p key={i} className={`mb-4 ${i === paragrafos.length - 1 && escrevendo ? 'cursor-escrita' : ''}`}>
          {p}
        </p>
      ))}
      {escrevendo && texto.length > 40 && (
        <p className="mt-1 text-center text-xs tracking-widest text-suave/50 uppercase">toque para acelerar</p>
      )}
    </div>
  );
}
