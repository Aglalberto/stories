/**
 * Duração da partida: 7 capítulos com escolhas + epílogo.
 * Cada capítulo leva ~2–3 min (gerar, ler, conversar e escolher),
 * o que dá uma sessão de 20–30 minutos.
 */
export const TOTAL_CAPITULOS = 7;

export const MODELO = 'claude-sonnet-5-5';
export const NOME_MODELO = 'Claude Sonnet 5.5';

export const MEDIDORES_INICIAIS = {
  vigor: { j1: 8, j2: 8 },
  sintonia: 5,
  missao: 0,
} as const;

export const LIMITES = {
  vigorMax: 10,
  sintoniaMax: 10,
  missaoMax: 100,
  /** Faixa permitida para cada variação vinda da IA. */
  deltaVigor: [-3, 2],
  deltaSintonia: [-2, 2],
  deltaMissao: [-5, 20],
} as const;

export const MAX_ACAO_LIVRE = 140;

/** Parâmetros de URL úteis para demonstração e testes. */
export function lerParametros(search: string = typeof location !== 'undefined' ? location.search : '') {
  const p = new URLSearchParams(search);
  return {
    rapido: p.get('rapido') === '1',
    transporteLocal: p.get('transporte') === 'local',
    iaSimulada: p.get('ia') === 'simulada',
  };
}
