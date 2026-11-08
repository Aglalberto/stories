import { describe, expect, it } from 'vitest';
import { textoDoLivro } from './livro';
import { criarEstadoInicial } from './motor';

describe('textoDoLivro', () => {
  it('reúne título, capítulos e decisões', () => {
    const e = criarEstadoInicial('ABCDE', 'Ana');
    e.jogadores.j2 = { nome: 'Beto', conectado: true };
    e.genero = 'scifi';
    e.tituloHistoria = 'Sinal Perdido';
    e.final = 'triunfo';
    e.capitulos = [
      {
        numero: 1,
        titulo: 'Começo',
        narracao: 'Era uma vez.',
        cenas: { j1: '', j2: '' },
        opcoes: { j1: [], j2: [] },
        escolhas: { j1: { opcaoId: null, texto: 'Voar', estilo: 'livre' }, j2: { opcaoId: 'x', texto: 'Ficar', estilo: 'cuidado' } },
        efeitos: null,
        epilogo: false,
      },
    ];
    const t = textoDoLivro(e);
    expect(t).toContain('Sinal Perdido');
    expect(t).toContain('Ficção Científica · com Ana e Beto');
    expect(t).toContain('CAPÍTULO 1 — Começo');
    expect(t).toContain('Ana: Voar | Beto: Ficar');
    expect(t).toContain('Triunfo');
  });
});
