import { describe, expect, it } from 'vitest';
import { gerarCodigoSala, LISTA_GENEROS, normalizarCodigo, sortearGenero } from './generos';

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
