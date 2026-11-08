import type { EstadoJogo } from '../jogo/tipos';
import type { Turno } from '../ia/gerador';

const CHAVE_API = 'livrojogo:chave-api';
const CHAVE_PARTIDA = 'livrojogo:partida';
const CHAVE_CONVIDADO = 'livrojogo:convidado';
const CHAVE_NOME = 'livrojogo:nome';
const CHAVE_PREFS = 'livrojogo:prefs';

function ler<T>(chave: string): T | null {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function gravar(chave: string, valor: unknown) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento indisponível (aba anônima etc.) */
  }
}

export const armazenamento = {
  chaveApi: () => ler<string>(CHAVE_API) ?? '',
  salvarChaveApi: (k: string) => gravar(CHAVE_API, k.trim() || null),

  nome: () => ler<string>(CHAVE_NOME) ?? '',
  salvarNome: (n: string) => gravar(CHAVE_NOME, n.trim() || null),

  partida: () => ler<{ estado: EstadoJogo; historico: Turno[]; demo: boolean }>(CHAVE_PARTIDA),
  salvarPartida: (p: { estado: EstadoJogo; historico: Turno[]; demo: boolean } | null) => gravar(CHAVE_PARTIDA, p),

  convidado: () => ler<{ codigo: string; nome: string }>(CHAVE_CONVIDADO),
  salvarConvidado: (c: { codigo: string; nome: string } | null) => gravar(CHAVE_CONVIDADO, c),

  prefs: () => ler<Preferencias>(CHAVE_PREFS) ?? { velocidade: 'normal' as const },
  salvarPrefs: (p: Preferencias) => gravar(CHAVE_PREFS, p),
};

export interface Preferencias {
  velocidade: 'lenta' | 'normal' | 'rapida';
}
