import { describe, expect, it } from 'vitest';
import { aplicarEfeitos, criarEstadoInicial, finalSugerido, limitarEfeitos, motor, precisaGerar, proximoEhEpilogo } from './motor';
import type { EstadoJogo, RespostaCapitulo } from './tipos';

const resposta = (extra: Partial<RespostaCapitulo> = {}): RespostaCapitulo => ({
  titulo: 'T',
  narracao: 'N',
  cenas: { j1: 'a', j2: 'b' },
  opcoes: {
    j1: [{ id: 'o1', texto: 'Ir', estilo: 'ousadia' }],
    j2: [{ id: 'o2', texto: 'Ficar', estilo: 'cuidado' }],
  },
  efeitos: { vigor: { j1: -1, j2: 0 }, sintonia: 1, missao: 10, resumo: 'r' },
  tituloHistoria: 'Livro',
  personagens: null,
  final: null,
  ...extra,
});

function comDupla(): EstadoJogo {
  let e = criarEstadoInicial('ABCDE', 'Ana');
  e = motor(e, { tipo: 'convidadoEntrou', nome: 'Beto' });
  return motor(e, { tipo: 'sortear', genero: 'noir', semente: { lugar: 'l', elemento: 'e', objetivo: 'o' }, idPartida: 1 });
}

function escolherAmbos(e: EstadoJogo): EstadoJogo {
  const n = e.capitulos.at(-1)!.numero;
  e = motor(e, { tipo: 'escolha', jogador: 'j1', numero: n, escolha: { opcaoId: 'o1', texto: 'Ir', estilo: 'ousadia' } });
  return motor(e, { tipo: 'escolha', jogador: 'j2', numero: n, escolha: { opcaoId: null, texto: 'Dançar', estilo: 'livre' } });
}

describe('efeitos', () => {
  it('limita as variações às faixas do jogo', () => {
    expect(limitarEfeitos({ vigor: { j1: -9, j2: 5 }, sintonia: 7, missao: 99, resumo: '' })).toEqual({
      vigor: { j1: -3, j2: 2 },
      sintonia: 2,
      missao: 20,
      resumo: '',
    });
  });
  it('mantém os medidores entre 0 e o máximo', () => {
    const m = aplicarEfeitos({ vigor: { j1: 1, j2: 10 }, sintonia: 10, missao: 95 }, { vigor: { j1: -3, j2: 2 }, sintonia: 2, missao: 20, resumo: '' });
    expect(m).toEqual({ vigor: { j1: 0, j2: 10 }, sintonia: 10, missao: 100 });
  });
});

describe('motor', () => {
  it('só sorteia com o parceiro presente', () => {
    const e = criarEstadoInicial('ABCDE', 'Ana');
    const r = motor(e, { tipo: 'sortear', genero: 'noir', semente: { lugar: 'l', elemento: 'e', objetivo: 'o' }, idPartida: 1 });
    expect(r.fase).toBe('lobby');
  });

  it('pede geração no início e após as duas escolhas', () => {
    let e = comDupla();
    expect(precisaGerar(e)).toBe(true);
    e = motor(e, { tipo: 'geracaoIniciada' });
    expect(precisaGerar(e)).toBe(false);
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
    expect(e.capitulos).toHaveLength(1);
    expect(e.medidores.missao).toBe(0); // capítulo 1 não aplica efeitos
    expect(e.tituloHistoria).toBe('Livro');
    expect(precisaGerar(e)).toBe(false);
    e = motor(e, { tipo: 'escolha', jogador: 'j1', numero: 1, escolha: { opcaoId: 'o1', texto: 'Ir', estilo: 'ousadia' } });
    expect(precisaGerar(e)).toBe(false);
    e = escolherAmbos(e);
    expect(precisaGerar(e)).toBe(true);
  });

  it('ignora escolha repetida, vazia ou de outro capítulo', () => {
    let e = comDupla();
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
    const a = motor(e, { tipo: 'escolha', jogador: 'j1', numero: 2, escolha: { opcaoId: null, texto: 'x', estilo: 'livre' } });
    expect(a).toBe(e);
    const b = motor(e, { tipo: 'escolha', jogador: 'j1', numero: 1, escolha: { opcaoId: null, texto: '   ', estilo: 'livre' } });
    expect(b).toBe(e);
    const c = motor(e, { tipo: 'escolha', jogador: 'j1', numero: 1, escolha: { opcaoId: null, texto: 'a', estilo: 'livre' } });
    const d = motor(c, { tipo: 'escolha', jogador: 'j1', numero: 1, escolha: { opcaoId: null, texto: 'b', estilo: 'livre' } });
    expect(d.capitulos[0].escolhas.j1?.texto).toBe('a');
  });

  it('aplica efeitos e chega ao epílogo após o último capítulo', () => {
    let e = comDupla();
    for (let i = 1; i <= e.totalCapitulos; i++) {
      e = motor(e, { tipo: 'geracaoIniciada' });
      e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
      expect(e.capitulos.at(-1)!.epilogo).toBe(false);
      e = escolherAmbos(e);
    }
    expect(e.medidores.missao).toBe(60); // 6 capítulos com +10
    expect(proximoEhEpilogo(e)).toBe(true);
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta({ final: 'triunfo' }) });
    const epi = e.capitulos.at(-1)!;
    expect(epi.epilogo).toBe(true);
    expect(epi.opcoes.j1).toEqual([]);
    expect(e.fase).toBe('final');
    expect(e.final).toBe('triunfo');
    expect(precisaGerar(e)).toBe(false);
  });

  it('antecipa o epílogo quando alguém fica sem vigor', () => {
    let e = comDupla();
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
    e = escolherAmbos(e);
    const golpe = resposta({ efeitos: { vigor: { j1: -3, j2: 0 }, sintonia: 0, missao: 0, resumo: '' } });
    for (let i = 0; i < 3; i++) {
      e = motor(e, { tipo: 'capituloGerado', resposta: golpe });
      if (proximoEhEpilogo(e)) break;
      e = escolherAmbos(e);
    }
    expect(e.medidores.vigor.j1).toBe(0);
    expect(e.capitulos.at(-1)!.epilogo).toBe(false); // ainda há uma última escolha
    e = escolherAmbos(e);
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
    expect(e.fase).toBe('final');
    expect(e.final).toBe('tragico');
  });

  it('nova partida mantém os jogadores e lembra o gênero anterior', () => {
    let e = comDupla();
    e = motor(e, { tipo: 'capituloGerado', resposta: resposta() });
    e = motor(e, { tipo: 'novaPartida' });
    expect(e.fase).toBe('lobby');
    expect(e.capitulos).toEqual([]);
    expect(e.jogadores.j2?.nome).toBe('Beto');
    expect(e.generoAnterior).toBe('noir');
  });

  it('registra erro e permite tentar de novo', () => {
    let e = comDupla();
    e = motor(e, { tipo: 'geracaoIniciada' });
    e = motor(e, { tipo: 'erro', mensagem: 'falhou' });
    expect(e.gerando).toBe(false);
    expect(precisaGerar(e)).toBe(false);
    e = motor(e, { tipo: 'limparErro' });
    expect(precisaGerar(e)).toBe(true);
  });
});

describe('finalSugerido', () => {
  it('classifica pelos medidores', () => {
    expect(finalSugerido({ vigor: { j1: 5, j2: 5 }, sintonia: 7, missao: 90 })).toBe('triunfo');
    expect(finalSugerido({ vigor: { j1: 0, j2: 5 }, sintonia: 7, missao: 90 })).toBe('agridoce');
    expect(finalSugerido({ vigor: { j1: 3, j2: 5 }, sintonia: 3, missao: 20 })).toBe('tragico');
  });
});
