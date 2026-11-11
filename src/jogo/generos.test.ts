import { describe, expect, it } from 'vitest';
import { gerarCodigoSala, LISTA_GENEROS, mesmaSugestao, normalizarCodigo, resolverTema, rotuloSugestao, sortearGenero, validarSugestao } from './generos';

describe('sorteio', () => {
  it('nunca repete o gênero anterior', () => {
    for (let i = 0; i < 200; i++) {
      expect(sortearGenero('noir').genero).not.toBe('noir');
    }
  });
  it('cobre todos os gêneros e gera uma semente do próprio gênero', () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const { genero, semente } = sortearGenero(null);
      vistos.add(genero);
      const g = LISTA_GENEROS.find((x) => x.id === genero)!;
      expect(g.lugares).toContain(semente.lugar);
      expect(g.objetivos).toContain(semente.objetivo);
    }
    expect(vistos.size).toBe(LISTA_GENEROS.length);
  });
  it('é determinístico com um gerador fixo', () => {
    expect(sortearGenero(null, () => 0).genero).toBe(LISTA_GENEROS[0].id);
  });
});

describe('código da sala', () => {
  it('tem 5 caracteres sem ambiguidades', () => {
    for (let i = 0; i < 100; i++) expect(gerarCodigoSala()).toMatch(/^[A-HJKMNP-Z2-9]{5}$/);
  });
  it('normaliza o que a pessoa digita', () => {
    expect(normalizarCodigo(' k7q-f2 ')).toBe('K7QF2');
  });
});

describe('tema escolhido', () => {
  it('resolve gênero escolhido com semente do próprio gênero', () => {
    const t = resolverTema({ tipo: 'genero', genero: 'terror' }, null);
    expect(t.genero).toBe('terror');
    expect(t.origem).toBe('escolha');
    expect(LISTA_GENEROS.find((g) => g.id === 'terror')!.lugares).toContain(t.semente!.lugar);
  });
  it('resolve tema livre sem gênero nem semente', () => {
    expect(resolverTema({ tipo: 'livre', texto: '  Espiões   em Paris ' }, null)).toEqual({ genero: null, temaLivre: 'Espiões em Paris', semente: null, origem: 'livre' });
  });
  it('sem sugestão (ou surpresa) sorteia evitando o anterior', () => {
    for (let i = 0; i < 50; i++) {
      const t = resolverTema(null, 'noir');
      expect(t.origem).toBe('sorteio');
      expect(t.genero).not.toBe('noir');
    }
    expect(resolverTema({ tipo: 'sortear' }, null).origem).toBe('sorteio');
  });
  it('valida sugestões vindas da rede', () => {
    expect(validarSugestao({ tipo: 'genero', genero: 'scifi' })).toEqual({ tipo: 'genero', genero: 'scifi' });
    expect(validarSugestao({ tipo: 'genero', genero: 'toString' })).toBeNull();
    expect(validarSugestao({ tipo: 'livre', texto: '   ' })).toBeNull();
    expect(validarSugestao({ tipo: 'livre', texto: 'x'.repeat(500) })).toEqual({ tipo: 'livre', texto: 'x'.repeat(120) });
    expect(validarSugestao('lixo')).toBeNull();
  });
  it('compara sugestões e gera rótulos', () => {
    expect(mesmaSugestao(null, { tipo: 'sortear' })).toBe(true);
    expect(mesmaSugestao({ tipo: 'livre', texto: 'Paris' }, { tipo: 'livre', texto: 'paris' })).toBe(true);
    expect(mesmaSugestao({ tipo: 'genero', genero: 'noir' }, { tipo: 'genero', genero: 'terror' })).toBe(false);
    expect(rotuloSugestao({ tipo: 'genero', genero: 'piratas' })).toBe('🏴‍☠️ Aventura Pirata');
    expect(rotuloSugestao(null)).toBe('🎲 Surpresa');
  });
});
