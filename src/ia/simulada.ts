import { GENEROS } from '../jogo/generos';
import type { GeradorHistoria, PedidoGeracao } from './gerador';

/**
 * Narrador de demonstração, sem IA: gera capítulos de exemplo localmente.
 * Serve para testar o jogo sem chave de API e nos testes automatizados.
 */
export function criarGeradorSimulado(opcoes: { atrasoMs?: number } = {}): GeradorHistoria {
  const atraso = opcoes.atrasoMs ?? 18;
  return {
    async gerar(pedido, aoParcial, sinal) {
      const texto = montarTextoSimulado(pedido);
      let acumulado = '';
      const pedacos = texto.match(/[\s\S]{1,14}/g) ?? [];
      for (const p of pedacos) {
        if (sinal.aborted) throw new Error('Geração cancelada.');
        acumulado += p;
        aoParcial(acumulado);
        if (atraso > 0) await new Promise((r) => setTimeout(r, atraso));
      }
      return acumulado;
    },
  };
}

const TITULOS = [
  'O Primeiro Passo',
  'Sombras no Caminho',
  'A Ponte Estreita',
  'O Segredo Revelado',
  'Ventos Contrários',
  'A Última Porta',
  'O Coração da Tormenta',
  'Além do Horizonte',
];

export function montarTextoSimulado(p: PedidoGeracao): string {
  const { numero, epilogo, genero, nomes } = p.contexto;
  const g = GENEROS[genero];
  const [a, b] = [nomes.j1, nomes.j2];
  const titulo = epilogo ? 'Epílogo: o Fim e o Começo' : TITULOS[(numero - 1) % TITULOS.length];

  const narracao = epilogo
    ? `Quando a poeira finalmente baixou, ${a} e ${b} se olharam como quem atravessou um mundo inteiro de mãos dadas. ` +
      `Cada escolha, cada risco e cada gesto de cuidado tinham deixado marcas — algumas doíam, outras brilhavam.\n\n` +
      `— Faríamos tudo de novo? — perguntou ${b}, meio rindo.\n— Faríamos melhor — respondeu ${a}.\n\n` +
      `E, em algum lugar daquele universo de ${g.nome.toLowerCase()}, alguém começou a contar a história dos dois.`
    : `${numero === 1 ? `Tudo começou de repente. ` : `As decisões anteriores ainda ecoavam quando o caminho mudou outra vez. `}` +
      `${a} percebeu primeiro o detalhe estranho no ar; ${b} sentiu que algo os observava. ` +
      `O mundo de ${g.nome.toLowerCase()} se abria diante deles, cheio de promessas e armadilhas.\n\n` +
      `— Você confia em mim? — perguntou ${a}.\n— Sempre. Mas fique perto — respondeu ${b}.\n\n` +
      `À frente, três caminhos se desenhavam, e nenhum deles parecia seguro. Era hora de decidir.`;

  const opcoes = (quem: string) => [
    { texto: `Avançar na frente e enfrentar o perigo (${quem})`, estilo: 'ousadia' },
    { texto: 'Procurar uma passagem escondida', estilo: 'astucia' },
    { texto: 'Proteger o parceiro e seguir com calma', estilo: 'cuidado' },
  ];

  const dados: Record<string, unknown> = epilogo
    ? {
        opcoes_j1: [],
        opcoes_j2: [],
        efeitos: { vigor_j1: 0, vigor_j2: 0, sintonia: 1, missao: 15, resumo: 'A dupla dá o último passo junta.' },
        final: 'agridoce',
      }
    : { opcoes_j1: opcoes(a), opcoes_j2: opcoes(b) };

  if (numero === 1) {
    dados.titulo_historia = `Crônicas de ${a} e ${b}`;
    dados.personagens = {
      j1: { nome: a, papel: 'Exploradora destemida', descricao: `${a} nunca recusa um desafio.` },
      j2: { nome: b, papel: 'Estrategista sonhador', descricao: `${b} enxerga o que os outros não veem.` },
    };
  } else if (!epilogo) {
    dados.efeitos = { vigor_j1: -1, vigor_j2: 0, sintonia: 1, missao: 12, resumo: 'Um arranhão, mas a dupla avança unida.' };
  }

  const cena = (quem: string) =>
    epilogo ? '' : `Só você nota: há um símbolo gravado perto de ${quem === a ? b : a}, igual ao do seu sonho de ontem.`;

  return (
    `<titulo>${titulo}</titulo>\n<narracao>${narracao}</narracao>\n` +
    `<cena_j1>${cena(a)}</cena_j1>\n<cena_j2>${cena(b)}</cena_j2>\n` +
    `<dados>${JSON.stringify(dados)}</dados>`
  );
}
