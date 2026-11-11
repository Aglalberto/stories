import { GENEROS } from './generos';
import type { EstadoJogo, TipoFinal } from './tipos';

export const NOMES_FINAL: Record<TipoFinal, { titulo: string; icone: string; frase: string }> = {
  triunfo: { titulo: 'Triunfo', icone: '🏆', frase: 'Vocês venceram — e venceram juntos.' },
  agridoce: { titulo: 'Final agridoce', icone: '🌗', frase: 'Nem tudo foi salvo, mas o que importa ficou.' },
  tragico: { titulo: 'Final trágico', icone: '🥀', frase: 'A história cobrou seu preço. Que a próxima seja diferente.' },
};

/** Nome do tema da partida para exibir (gênero ou tema livre). */
export function nomeDoTema(e: Pick<EstadoJogo, 'genero' | 'temaLivre'>): string {
  if (e.temaLivre) return `Tema livre: ${e.temaLivre}`;
  return e.genero ? GENEROS[e.genero].nome : '';
}

/** Texto corrido do livro completo, para compartilhar ou baixar. */
export function textoDoLivro(e: EstadoJogo): string {
  const nome = (j: 'j1' | 'j2') => e.jogadores[j]?.nome ?? j.toUpperCase();
  const linhas: string[] = [];
  linhas.push(e.tituloHistoria || 'Livro-Jogo a Dois');
  if (e.genero || e.temaLivre) linhas.push(`${nomeDoTema(e)} · com ${nome('j1')} e ${nome('j2')}`);
  linhas.push('');
  for (const c of e.capitulos) {
    linhas.push(c.epilogo ? `EPÍLOGO — ${c.titulo}` : `CAPÍTULO ${c.numero} — ${c.titulo}`);
    linhas.push('');
    linhas.push(c.narracao);
    const escolhas = (['j1', 'j2'] as const).filter((j) => c.escolhas[j]).map((j) => `${nome(j)}: ${c.escolhas[j]!.texto}`);
    if (escolhas.length) {
      linhas.push('');
      linhas.push(`Decisões — ${escolhas.join(' | ')}`);
    }
    linhas.push('');
  }
  if (e.final) linhas.push(`${NOMES_FINAL[e.final].icone} ${NOMES_FINAL[e.final].titulo}`);
  linhas.push('', 'Escrito com Livro-Jogo a Dois — https://aglalberto.github.io/stories/');
  return linhas.join('\n');
}
