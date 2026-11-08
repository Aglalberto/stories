import type { Escolha, EstadoJogo, TextoParcial } from '../jogo/tipos';

/** Mensagens do convidado (J2) para o anfitrião (J1). */
export type MsgConvidado =
  | { t: 'ola'; nome: string }
  | { t: 'escolha'; numero: number; escolha: Escolha }
  | { t: 'ping' };

/** Mensagens do anfitrião para o convidado. */
export type MsgAnfitriao =
  | { t: 'estado'; estado: EstadoJogo }
  | { t: 'parcial'; parcial: TextoParcial }
  | { t: 'ping' };

export function ehMsgConvidado(m: unknown): m is MsgConvidado {
  if (!m || typeof m !== 'object') return false;
  const t = (m as { t?: unknown }).t;
  if (t === 'ola') return typeof (m as { nome?: unknown }).nome === 'string';
  if (t === 'escolha') {
    const x = m as { numero?: unknown; escolha?: { texto?: unknown } };
    return typeof x.numero === 'number' && typeof x.escolha?.texto === 'string';
  }
  return t === 'ping';
}

export function ehMsgAnfitriao(m: unknown): m is MsgAnfitriao {
  if (!m || typeof m !== 'object') return false;
  const t = (m as { t?: unknown }).t;
  if (t === 'estado') return typeof (m as { estado?: unknown }).estado === 'object';
  if (t === 'parcial') return typeof (m as { parcial?: unknown }).parcial === 'object';
  return t === 'ping';
}
