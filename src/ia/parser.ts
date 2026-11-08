import type {
  Efeitos,
  EstiloOpcao,
  IdJogador,
  Opcao,
  Personagem,
  RespostaCapitulo,
  TextoParcial,
  TipoFinal,
} from '../jogo/tipos';

export class ErroFormato extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ErroFormato';
  }
}

/** Extrai o conteúdo de uma tag, mesmo que ainda não tenha sido fechada (streaming). */
export function extrairTag(texto: string, tag: string): { conteudo: string; fechada: boolean } | null {
  const abre = `<${tag}>`;
  const i = texto.indexOf(abre);
  if (i < 0) return null;
  const inicio = i + abre.length;
  const fim = texto.indexOf(`</${tag}>`, inicio);
  if (fim >= 0) return { conteudo: texto.slice(inicio, fim).trim(), fechada: true };
  let resto = texto.slice(inicio);
  // Remove um possível começo de tag ainda incompleto no fim do texto ("</narr").
  const lt = resto.lastIndexOf('<');
  if (lt >= 0 && !resto.slice(lt).includes('>')) resto = resto.slice(0, lt);
  return { conteudo: resto.replace(/^\s+/, ''), fechada: false };
}

/** Título e narração disponíveis até agora, para a máquina de escrever. */
export function extrairParcial(texto: string): TextoParcial {
  return {
    titulo: extrairTag(texto, 'titulo')?.conteudo ?? '',
    narracao: extrairTag(texto, 'narracao')?.conteudo ?? '',
  };
}

const ESTILOS: EstiloOpcao[] = ['ousadia', 'astucia', 'cuidado'];

function limparTexto(s: unknown, max: number): string {
  return String(s ?? '')
    .replace(/\*\*|__|^#+\s*/gm, '')
    .trim()
    .slice(0, max);
}

function lerJson(bruto: string): Record<string, unknown> {
  let s = bruto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b < a) throw new ErroFormato('JSON de dados ausente');
  s = s.slice(a, b + 1);
  try {
    const v = JSON.parse(s);
    if (!v || typeof v !== 'object') throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new ErroFormato('JSON de dados inválido');
  }
}

function lerOpcoes(v: unknown, j: IdJogador, numero: number): Opcao[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((o, i) => {
      const obj = (typeof o === 'string' ? { texto: o } : o) as { texto?: unknown; estilo?: unknown };
      const estilo = ESTILOS.includes(obj?.estilo as EstiloOpcao) ? (obj.estilo as EstiloOpcao) : ESTILOS[i % 3];
      return { id: `c${numero}-${j}-${i}`, texto: limparTexto(obj?.texto, 120), estilo };
    })
    .filter((o) => o.texto.length > 0)
    .slice(0, 3);
}

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

function lerEfeitos(v: unknown): Efeitos | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  return {
    vigor: { j1: num(o.vigor_j1), j2: num(o.vigor_j2) },
    sintonia: num(o.sintonia),
    missao: num(o.missao),
    resumo: limparTexto(o.resumo, 160),
  };
}

function lerPersonagem(v: unknown, padrao: string): Personagem {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return {
    nome: limparTexto(o.nome, 40) || padrao,
    papel: limparTexto(o.papel, 60),
    descricao: limparTexto(o.descricao, 240),
  };
}

export interface ContextoResposta {
  numero: number;
  epilogo: boolean;
  nomes: Record<IdJogador, string>;
}

/** Interpreta a resposta completa da IA. Lança ErroFormato se faltar algo essencial. */
export function interpretarResposta(texto: string, ctx: ContextoResposta): RespostaCapitulo {
  const narracao = extrairTag(texto, 'narracao');
  if (!narracao || !narracao.conteudo) throw new ErroFormato('Narração ausente');
  const titulo = limparTexto(extrairTag(texto, 'titulo')?.conteudo, 80) || (ctx.epilogo ? 'Epílogo' : `Capítulo ${ctx.numero}`);
  const dadosTag = extrairTag(texto, 'dados');
  if (!dadosTag) throw new ErroFormato('Bloco de dados ausente');
  const dados = lerJson(dadosTag.conteudo);

  const opcoes = {
    j1: lerOpcoes(dados.opcoes_j1, 'j1', ctx.numero),
    j2: lerOpcoes(dados.opcoes_j2, 'j2', ctx.numero),
  };
  const cenas = {
    j1: limparTexto(extrairTag(texto, 'cena_j1')?.conteudo, 900),
    j2: limparTexto(extrairTag(texto, 'cena_j2')?.conteudo, 900),
  };

  if (!ctx.epilogo) {
    if (opcoes.j1.length < 2 || opcoes.j2.length < 2) throw new ErroFormato('Opções insuficientes');
  }

  const finalBruto = String(dados.final ?? '').toLowerCase().replace('á', 'a');
  const final: TipoFinal | null = (['triunfo', 'agridoce', 'tragico'] as const).find((f) => f === finalBruto) ?? null;

  return {
    titulo,
    narracao: limparTexto(narracao.conteudo, 4000),
    cenas,
    opcoes,
    efeitos: ctx.numero > 1 ? lerEfeitos(dados.efeitos) : null,
    tituloHistoria: ctx.numero === 1 ? limparTexto(dados.titulo_historia, 80) || null : null,
    personagens:
      ctx.numero === 1
        ? {
            j1: lerPersonagem((dados.personagens as Record<string, unknown> | undefined)?.j1, ctx.nomes.j1),
            j2: lerPersonagem((dados.personagens as Record<string, unknown> | undefined)?.j2, ctx.nomes.j2),
          }
        : null,
    final: ctx.epilogo ? final : null,
  };
}
