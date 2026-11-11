import { LIMITES, MAX_ACAO_LIVRE, MEDIDORES_INICIAIS, TOTAL_CAPITULOS } from './config';
import type {
  Capitulo,
  Efeitos,
  Escolha,
  EstadoJogo,
  IdJogador,
  Medidores,
  RespostaCapitulo,
  SugestaoTema,
  TextoParcial,
  TipoFinal,
} from './tipos';
import { JOGADORES } from './tipos';
import { limparTemaLivre, validarSugestao, type TemaDefinido } from './generos';

export function criarEstadoInicial(codigo: string, nomeAnfitriao: string): EstadoJogo {
  return {
    versao: 1,
    codigo,
    idPartida: 0,
    fase: 'lobby',
    jogadores: { j1: { nome: nomeAnfitriao, conectado: true }, j2: null },
    genero: null,
    temaLivre: null,
    origemTema: null,
    sugestoes: { j1: null, j2: null },
    adulto: false,
    semente: null,
    tituloHistoria: '',
    personagens: null,
    capitulos: [],
    medidores: clonarMedidores(MEDIDORES_INICIAIS),
    totalCapitulos: TOTAL_CAPITULOS,
    gerando: false,
    parcial: null,
    erro: null,
    final: null,
    generoAnterior: null,
  };
}

function clonarMedidores(m: Medidores | typeof MEDIDORES_INICIAIS): Medidores {
  return { vigor: { j1: m.vigor.j1, j2: m.vigor.j2 }, sintonia: m.sintonia, missao: m.missao };
}

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(v) ? v : 0)));

/** Garante que as variações propostas pela IA fiquem dentro das faixas do jogo. */
export function limitarEfeitos(e: Efeitos): Efeitos {
  const [vMin, vMax] = LIMITES.deltaVigor;
  const [sMin, sMax] = LIMITES.deltaSintonia;
  const [mMin, mMax] = LIMITES.deltaMissao;
  return {
    vigor: { j1: limitar(e.vigor.j1, vMin, vMax), j2: limitar(e.vigor.j2, vMin, vMax) },
    sintonia: limitar(e.sintonia, sMin, sMax),
    missao: limitar(e.missao, mMin, mMax),
    resumo: (e.resumo ?? '').slice(0, 160),
  };
}

export function aplicarEfeitos(m: Medidores, e: Efeitos): Medidores {
  const ef = limitarEfeitos(e);
  return {
    vigor: {
      j1: limitar(m.vigor.j1 + ef.vigor.j1, 0, LIMITES.vigorMax),
      j2: limitar(m.vigor.j2 + ef.vigor.j2, 0, LIMITES.vigorMax),
    },
    sintonia: limitar(m.sintonia + ef.sintonia, 0, LIMITES.sintoniaMax),
    missao: limitar(m.missao + ef.missao, 0, LIMITES.missaoMax),
  };
}

export function ultimoCapitulo(e: EstadoJogo): Capitulo | null {
  return e.capitulos.length ? e.capitulos[e.capitulos.length - 1] : null;
}

export function ambosEscolheram(c: Capitulo | null): boolean {
  return !!c && !c.epilogo && JOGADORES.every((j) => !!c.escolhas[j]);
}

export function alguemCaiu(m: Medidores): boolean {
  return m.vigor.j1 <= 0 || m.vigor.j2 <= 0;
}

/** O próximo capítulo a ser gerado é o epílogo? */
export function proximoEhEpilogo(e: EstadoJogo): boolean {
  const ult = ultimoCapitulo(e);
  if (!ult) return false;
  return ult.numero >= e.totalCapitulos || alguemCaiu(e.medidores);
}

/** O anfitrião deve pedir um novo capítulo à IA agora? */
export function precisaGerar(e: EstadoJogo): boolean {
  if (e.fase !== 'jogando' || e.gerando || e.erro) return false;
  if (e.capitulos.length === 0) return true;
  return ambosEscolheram(ultimoCapitulo(e));
}

/** Desfecho sugerido a partir dos medidores (usado se a IA não informar). */
export function finalSugerido(m: Medidores): TipoFinal {
  if (!alguemCaiu(m) && m.missao >= 80 && m.sintonia >= 6) return 'triunfo';
  if (m.missao >= 50 || (m.sintonia >= 7 && !alguemCaiu(m))) return 'agridoce';
  return 'tragico';
}

export function validarEscolha(e: EstadoJogo, numero: number, escolha: Escolha): Escolha | null {
  const ult = ultimoCapitulo(e);
  if (!ult || ult.epilogo || ult.numero !== numero || e.gerando) return null;
  const texto = String(escolha?.texto ?? '').trim().slice(0, MAX_ACAO_LIVRE);
  if (!texto) return null;
  return {
    opcaoId: typeof escolha.opcaoId === 'string' ? escolha.opcaoId : null,
    texto,
    estilo: ['ousadia', 'astucia', 'cuidado', 'livre'].includes(escolha.estilo) ? escolha.estilo : 'livre',
  };
}

export type Acao =
  | { tipo: 'convidadoEntrou'; nome: string }
  | { tipo: 'conexao'; jogador: IdJogador; conectado: boolean }
  | { tipo: 'sugerir'; jogador: IdJogador; sugestao: SugestaoTema | null }
  | { tipo: 'definirAdulto'; adulto: boolean }
  | { tipo: 'iniciar'; tema: TemaDefinido; idPartida: number }
  | { tipo: 'geracaoIniciada' }
  | { tipo: 'parcial'; parcial: TextoParcial }
  | { tipo: 'capituloGerado'; resposta: RespostaCapitulo }
  | { tipo: 'escolha'; jogador: IdJogador; numero: number; escolha: Escolha }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'limparErro' }
  | { tipo: 'novaPartida' };

export function motor(e: EstadoJogo, a: Acao): EstadoJogo {
  switch (a.tipo) {
    case 'convidadoEntrou': {
      const nome = a.nome.trim().slice(0, 24) || 'Parceiro(a)';
      return { ...e, jogadores: { ...e.jogadores, j2: { nome, conectado: true } } };
    }
    case 'conexao': {
      const j = e.jogadores[a.jogador];
      if (!j || j.conectado === a.conectado) return e;
      return { ...e, jogadores: { ...e.jogadores, [a.jogador]: { ...j, conectado: a.conectado } } };
    }
    case 'sugerir': {
      if (e.fase !== 'lobby') return e;
      const sugestao = a.sugestao ? validarSugestao(a.sugestao) : null;
      return { ...e, sugestoes: { ...e.sugestoes, [a.jogador]: sugestao } };
    }
    case 'definirAdulto':
      return e.fase === 'lobby' ? { ...e, adulto: a.adulto } : e;
    case 'iniciar': {
      if (e.fase !== 'lobby' || !e.jogadores.j2) return e;
      const t = a.tema;
      const temaLivre = t.temaLivre ? limparTemaLivre(t.temaLivre) : null;
      return {
        ...e,
        fase: 'jogando',
        idPartida: a.idPartida,
        genero: temaLivre ? null : t.genero,
        temaLivre,
        origemTema: temaLivre ? 'livre' : t.origem,
        semente: temaLivre ? null : t.semente,
        capitulos: [],
        medidores: clonarMedidores(MEDIDORES_INICIAIS),
        erro: null,
        final: null,
      };
    }
    case 'geracaoIniciada':
      return { ...e, gerando: true, erro: null, parcial: { titulo: '', narracao: '' } };
    case 'parcial':
      return e.gerando ? { ...e, parcial: a.parcial } : e;
    case 'capituloGerado': {
      const r = a.resposta;
      const epilogo = proximoEhEpilogo(e);
      const numero = e.capitulos.length + 1;
      const efeitos = r.efeitos && numero > 1 ? limitarEfeitos(r.efeitos) : null;
      const medidores = efeitos ? aplicarEfeitos(e.medidores, efeitos) : e.medidores;
      const cap: Capitulo = {
        numero,
        titulo: r.titulo,
        narracao: r.narracao,
        cenas: epilogo ? { j1: '', j2: '' } : r.cenas,
        opcoes: epilogo ? { j1: [], j2: [] } : r.opcoes,
        escolhas: {},
        efeitos,
        epilogo,
      };
      return {
        ...e,
        capitulos: [...e.capitulos, cap],
        medidores,
        tituloHistoria: e.tituloHistoria || r.tituloHistoria || '',
        // No tema livre, o clima visual só é conhecido depois do capítulo 1.
        genero: e.genero ?? r.visual ?? 'fantasia',
        personagens: e.personagens ?? r.personagens,
        gerando: false,
        parcial: null,
        erro: null,
        fase: epilogo ? 'final' : e.fase,
        final: epilogo ? (r.final ?? finalSugerido(medidores)) : null,
      };
    }
    case 'escolha': {
      const valida = validarEscolha(e, a.numero, a.escolha);
      const ult = ultimoCapitulo(e);
      if (!valida || !ult || ult.escolhas[a.jogador]) return e;
      const cap: Capitulo = { ...ult, escolhas: { ...ult.escolhas, [a.jogador]: valida } };
      return { ...e, capitulos: [...e.capitulos.slice(0, -1), cap] };
    }
    case 'erro':
      return { ...e, gerando: false, parcial: null, erro: a.mensagem };
    case 'limparErro':
      return { ...e, erro: null };
    case 'novaPartida':
      return {
        ...criarEstadoInicial(e.codigo, e.jogadores.j1?.nome ?? ''),
        jogadores: e.jogadores,
        adulto: e.adulto,
        generoAnterior: e.genero ?? e.generoAnterior,
      };
  }
}
