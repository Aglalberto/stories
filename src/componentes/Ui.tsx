import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma';

const ESTILOS: Record<Variante, string> = {
  primario:
    'bg-primaria text-[#1a1208] font-semibold shadow-[0_8px_30px_-8px_var(--primaria)] disabled:opacity-40 disabled:shadow-none',
  secundario: 'bg-white/8 text-texto border border-borda backdrop-blur-sm disabled:opacity-40',
  fantasma: 'text-suave underline-offset-4 hover:underline disabled:opacity-40',
};

export function Botao({
  variante = 'primario',
  className = '',
  children,
  ...resto
}: { variante?: Variante; children: ReactNode } & HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`rounded-2xl px-5 py-3.5 font-titulo text-[1.05rem] tracking-wide transition-colors ${ESTILOS[variante]} ${className}`}
      {...resto}
    >
      {children}
    </motion.button>
  );
}

export function Cartao({ className = '', children, ...resto }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={`rounded-3xl border border-borda bg-papel p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,.7)] backdrop-blur-md ${className}`}
      {...resto}
    >
      {children}
    </motion.div>
  );
}

export function Campo({
  rotulo,
  dica,
  ...resto
}: { rotulo: string; dica?: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-titulo text-sm tracking-wide text-suave">{rotulo}</span>
      <input
        className="w-full rounded-2xl border border-borda bg-black/30 px-4 py-3.5 text-lg text-texto outline-none placeholder:text-white/25 focus:border-primaria"
        {...resto}
      />
      {dica && <span className="mt-1.5 block text-xs leading-relaxed text-suave/80">{dica}</span>}
    </label>
  );
}

export function TelaBase({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 24, rotateX: -6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -16, rotateX: 4 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900 }}
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),1.25rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)] ${className}`}
    >
      {children}
    </motion.main>
  );
}

export function Voltar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-4 self-start rounded-full px-1 py-2 text-sm text-suave" aria-label="Voltar">
      ← Voltar
    </button>
  );
}

export function Carregando({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 text-suave" role="status">
      <span className="relative inline-flex h-6 w-6">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primaria/30 border-t-primaria"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </span>
      <span className="font-titulo italic">{texto}</span>
    </div>
  );
}
