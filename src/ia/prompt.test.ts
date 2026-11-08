import { describe, expect, it } from 'vitest';
import { criarEstadoInicial, motor } from '../jogo/motor';
import type { EstadoJogo } from '../jogo/tipos';
import { montarPedido, PROMPT_SISTEMA } from './prompt';
import { criarGeradorSimulado, montarTextoSimulado } from './simulada';
import { interpretarResposta } from './parser';

function partida(): EstadoJogo {
  let e = criarEstadoInicial('ABCDE', 'Ana');
  e = motor(e, { tipo: 'convidadoEntrou', nome: 'Beto' });
  return motor(e, {
    tipo: 'sortear',
    genero: 'piratas',
    semente: { lugar: 'uma taverna', elemento: 'uma bússola', objetivo: 'achar o tesouro' },
    idPartida: 1,
  });
}

describe('prompt', () => {
  it('o prompt de sistema é fixo e em português', () => {
    expect(PROMPT_SISTEMA).toContain('português do Brasil');
    expect(PROMPT_SISTEMA).not.toMatch(/\$\{/);
  });

  it('monta o pedido do capítulo 1 com gênero, semente e nomes', () => {
    const p = montarPedido(partida());
    expect(p).toMatchObject({ numero: 1, epilogo: false });
    expect(p.mensagem).toContain('Aventura Pirata');
    expect(p.mensagem).toContain('uma taverna');
    expect(p.mensagem).toContain('J1 se chama Ana');
    expect(p.mensagem).toContain('J2 se chama Beto');
  });

  it('inclui as escolhas anteriores e os medidores', () => {
    let e = partida();
    const texto = montarTextoSimulado({
      historico: [],
      mensagem: '',
      contexto: { numero: 1, epilogo: false, genero: 'piratas', nomes: { j1: 'Ana', j2: 'Beto' }, totalCapitulos: 7 },
    });
    e = motor(e, { tipo: 'capituloGerado', resposta: interpretarResposta(texto, { numero: 1, epilogo: false, nomes: { j1: 'Ana', j2: 'Beto' } }) });
    e = motor(e, { tipo: 'escolha', jogador: 'j1', numero: 1, escolha: { opcaoId: 'x', texto: 'Abrir o baú', estilo: 'ousadia' } });
    e = motor(e, { tipo: 'escolha', jogador: 'j2', numero: 1, escolha: { opcaoId: null, texto: 'Cantar "alto"', estilo: 'livre' } });
    const p = montarPedido(e);
    expect(p.numero).toBe(2);
    expect(p.mensagem).toContain('CAPÍTULO 2 DE 7');
    expect(p.mensagem).toContain('"Abrir o baú" [ousadia]');
    expect(p.mensagem).toContain("ação livre: \"Cantar 'alto'\"");
    expect(p.mensagem).toContain('sintonia 5/10');
  });
});

describe('narrador simulado', () => {
  it('produz respostas que o parser aceita em todos os capítulos', async () => {
    const g = criarGeradorSimulado({ atrasoMs: 0 });
    const nomes = { j1: 'Ana', j2: 'Beto' };
    for (let n = 1; n <= 8; n++) {
      const epilogo = n === 8;
      let parciais = 0;
      const texto = await g.gerar(
        { historico: [], mensagem: '', contexto: { numero: n, epilogo, genero: 'terror', nomes, totalCapitulos: 7 } },
        () => parciais++,
        new AbortController().signal,
      );
      expect(parciais).toBeGreaterThan(5);
      const r = interpretarResposta(texto, { numero: n, epilogo, nomes });
      expect(r.narracao.length).toBeGreaterThan(50);
      if (epilogo) expect(r.final).toBe('agridoce');
    }
  });
});
