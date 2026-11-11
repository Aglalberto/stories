import { MAX_TEMA_LIVRE } from './config';
import type { GeneroId, OrigemTema, Semente, SugestaoTema } from './tipos';

export type Ambiente = 'vagalumes' | 'estrelas' | 'chuva' | 'nevoa' | 'ondas' | 'brasas';

export interface Genero {
  id: GeneroId;
  nome: string;
  icone: string;
  chamada: string;
  tom: string;
  ambiente: Ambiente;
  cores: { fundo1: string; fundo2: string; primaria: string; secundaria: string };
  lugares: string[];
  elementos: string[];
  objetivos: string[];
}

export const GENEROS: Record<GeneroId, Genero> = {
  fantasia: {
    id: 'fantasia',
    nome: 'Fantasia Épica',
    icone: '🐉',
    chamada: 'Magia antiga, criaturas lendárias e um reino por um fio.',
    tom: 'fantasia épica com magia, criaturas míticas, reinos e profecias; maravilhamento e perigo',
    ambiente: 'vagalumes',
    cores: { fundo1: '#0d1f17', fundo2: '#1d3b2a', primaria: '#f2c46d', secundaria: '#7fd1a4' },
    lugares: [
      'uma floresta onde as árvores sussurram nomes esquecidos',
      'a feira de um porto flutuante preso a uma tartaruga gigante',
      'as ruínas de uma torre de magos partida ao meio',
      'um vilarejo nas montanhas onde a neve cai para cima',
      'a biblioteca subterrânea de um reino anão abandonado',
    ],
    elementos: [
      'um mapa que se redesenha sozinho à meia-noite',
      'um ovo de dragão que bate como um coração',
      'uma coroa que não pode tocar o chão',
      'uma canção de ninar que abre portas',
      'uma sombra que se recusa a seguir o próprio dono',
    ],
    objetivos: [
      'devolver a luz a uma estrela caída antes do eclipse',
      'quebrar a maldição que transforma o vale em pedra',
      'escoltar um segredo vivo até o último santuário',
      'impedir a coroação de um rei que não deveria existir',
      'encontrar o coração perdido de um gigante adormecido',
    ],
  },
  scifi: {
    id: 'scifi',
    nome: 'Ficção Científica',
    icone: '🚀',
    chamada: 'Uma nave, um sinal desconhecido e o vazio entre as estrelas.',
    tom: 'ficção científica espacial com tecnologia, mistério cósmico e dilemas humanos; assombro e tensão',
    ambiente: 'estrelas',
    cores: { fundo1: '#070b1f', fundo2: '#1b1446', primaria: '#6fe3ff', secundaria: '#b28bff' },
    lugares: [
      'uma estação de mineração em um asteroide que gira rápido demais',
      'o porão de carga de um cargueiro à deriva há 200 anos',
      'uma colônia sob a cúpula de um planeta oceânico',
      'um elevador espacial em plena tempestade solar',
      'o laboratório secreto de uma IA que pediu asilo',
    ],
    elementos: [
      'um sinal de rádio que repete a voz de um de vocês',
      'um androide que jura ter sido humano ontem',
      'uma semente alienígena que reage a emoções',
      'um diário de bordo com datas do futuro',
      'uma porta selada com o símbolo da Terra antiga',
    ],
    objetivos: [
      'consertar o motor de dobra antes que a estrela vizinha colapse',
      'decifrar o sinal e decidir se a humanidade deve responder',
      'resgatar a tripulação desaparecida da nave-irmã',
      'impedir que uma corporação transforme um planeta vivo em combustível',
      'levar o último embrião de uma espécie extinta até um novo lar',
    ],
  },
  noir: {
    id: 'noir',
    nome: 'Mistério Noir',
    icone: '🕵️',
    chamada: 'Chuva, neon e um caso que ninguém quer ver resolvido.',
    tom: 'mistério noir urbano, anos 1940 reimaginados, com pistas, suspeitos, diálogos afiados e reviravoltas',
    ambiente: 'chuva',
    cores: { fundo1: '#0b0c10', fundo2: '#22252d', primaria: '#f5d36b', secundaria: '#e46a6a' },
    lugares: [
      'um clube de jazz onde o pianista toca sem nunca olhar as teclas',
      'o escritório de detetives no último andar de um hotel decadente',
      'o cais do porto numa noite de neblina e apitos de navio',
      'a mansão de um magnata no dia da leitura do testamento',
      'um trem noturno parado no meio de uma ponte',
    ],
    elementos: [
      'uma fotografia rasgada com um rosto que não deveria estar ali',
      'uma chave de cofre escondida dentro de um batom',
      'um telegrama assinado por alguém dado como morto',
      'um disco de vinil com uma mensagem gravada ao contrário',
      'um relógio de bolso parado às 3h17',
    ],
    objetivos: [
      'descobrir quem armou para a dupla antes que a polícia chegue',
      'encontrar uma cantora desaparecida antes do amanhecer',
      'recuperar um colar roubado que esconde um segredo de Estado',
      'desmascarar o chefe do crime que se passa por benfeitor',
      'provar a inocência de um velho amigo condenado à forca',
    ],
  },
  terror: {
    id: 'terror',
    nome: 'Terror Sobrenatural',
    icone: '👻',
    chamada: 'Uma casa que respira, sussurros no escuro e um pacto antigo.',
    tom: 'terror sobrenatural de atmosfera, suspense crescente e sustos sugeridos, sem violência gráfica',
    ambiente: 'nevoa',
    cores: { fundo1: '#0a0607', fundo2: '#2a0f14', primaria: '#ff6b6b', secundaria: '#c9b6a6' },
    lugares: [
      'um casarão colonial herdado de uma tia que ninguém conhecia',
      'um hospital desativado no alto de uma serra enevoada',
      'uma pousada à beira de um lago onde ninguém nada',
      'uma cidade do interior onde todos os relógios pararam',
      'um farol cujo faroleiro desapareceu há dez anos',
    ],
    elementos: [
      'uma boneca que muda de posição quando ninguém olha',
      'um espelho que mostra o cômodo alguns segundos no futuro',
      'um gravador que capta vozes respondendo perguntas',
      'cartas de amor escritas por alguém que ainda vai nascer',
      'um quadro cujo retratado parece cada vez mais próximo',
    ],
    objetivos: [
      'quebrar o pacto que prende uma alma à casa antes da lua cheia',
      'sobreviver à noite e descobrir o que a névoa esconde',
      'libertar as crianças presas em um velho jogo de tabuleiro',
      'devolver o que foi roubado do cemitério antes do sino tocar',
      'descobrir o verdadeiro nome da entidade e dizê-lo em voz alta',
    ],
  },
  piratas: {
    id: 'piratas',
    nome: 'Aventura Pirata',
    icone: '🏴‍☠️',
    chamada: 'Mares bravios, tesouros malditos e uma tripulação nada confiável.',
    tom: 'aventura pirata de capa e espada, bem-humorada e cheia de ação, com mistérios do mar',
    ambiente: 'ondas',
    cores: { fundo1: '#04161d', fundo2: '#0d3a44', primaria: '#ffcf5a', secundaria: '#5fd3c4' },
    lugares: [
      'o convés de um galeão em meio a uma tempestade',
      'uma taverna em uma ilha que só aparece na maré baixa',
      'o esconderijo de contrabandistas dentro de um vulcão adormecido',
      'um mercado flutuante de barcos amarrados uns aos outros',
      'a cela de um navio da Marinha Real, de madrugada',
    ],
    elementos: [
      'uma bússola que aponta para o que você mais deseja',
      'um papagaio que só fala em código',
      'metade de um mapa tatuada nas costas de um náufrago',
      'uma moeda amaldiçoada que sempre volta ao bolso',
      'uma garrafa com uma carta endereçada à dupla',
    ],
    objetivos: [
      'encontrar o tesouro da Rainha das Marés antes do capitão rival',
      'quebrar a maldição que transforma a tripulação em névoa ao luar',
      'resgatar um navio inteiro engolido por um redemoinho',
      'devolver ao mar um coração de sereia roubado',
      'escapar do porto com um carregamento que todos querem',
    ],
  },
  apocalipse: {
    id: 'apocalipse',
    nome: 'Pós-Apocalipse',
    icone: '☢️',
    chamada: 'Um mundo em ruínas, recursos escassos e um fio de esperança.',
    tom: 'pós-apocalipse de sobrevivência, ruínas, comunidades e esperança teimosa, com tensão e humanidade',
    ambiente: 'brasas',
    cores: { fundo1: '#160c05', fundo2: '#3b2210', primaria: '#ffa94d', secundaria: '#a3d977' },
    lugares: [
      'um shopping abandonado tomado por uma floresta',
      'uma rodovia coberta de areia e carros enferrujados',
      'uma comunidade de sobreviventes dentro de um estádio',
      'o metrô inundado de uma metrópole silenciosa',
      'uma estação meteorológica isolada no alto de um morro',
    ],
    elementos: [
      'um rádio que capta uma transmissão de antes da queda',
      'um cão-robô que se recusa a sair do lado de vocês',
      'um pacote de sementes que ainda pode germinar',
      'um mapa marcando um lugar chamado "Recomeço"',
      'uma criança que sabe coisas que não deveria saber',
    ],
    objetivos: [
      'levar uma vacina até uma comunidade isolada antes da tempestade',
      'religar a antiga usina e devolver luz à cidade',
      'encontrar o lugar chamado "Recomeço" e descobrir se ele existe',
      'proteger o último poço de água limpa de um bando de saqueadores',
      'atravessar a zona morta com um segredo que pode salvar todos',
    ],
  },
};

export const LISTA_GENEROS: Genero[] = Object.values(GENEROS);

export type Aleatorio = () => number;

/** Número aleatório em [0, 1) com crypto quando disponível. */
export const aleatorioSeguro: Aleatorio = () => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] / 2 ** 32;
  }
  return Math.random();
};

function escolher<T>(lista: readonly T[], rnd: Aleatorio): T {
  return lista[Math.floor(rnd() * lista.length) % lista.length];
}

export function sortearSemente(genero: GeneroId, rnd: Aleatorio = aleatorioSeguro): Semente {
  const g = GENEROS[genero];
  return {
    lugar: escolher(g.lugares, rnd),
    elemento: escolher(g.elementos, rnd),
    objetivo: escolher(g.objetivos, rnd),
  };
}

/** Sorteia um gênero (evitando repetir o anterior) e uma semente de história. */
export function sortearGenero(
  anterior: GeneroId | null,
  rnd: Aleatorio = aleatorioSeguro,
): { genero: GeneroId; semente: Semente } {
  const candidatos = LISTA_GENEROS.filter((g) => g.id !== anterior);
  const g = escolher(candidatos, rnd);
  return { genero: g.id, semente: sortearSemente(g.id, rnd) };
}

/** Tema já resolvido, pronto para começar a partida. */
export interface TemaDefinido {
  genero: GeneroId | null;
  temaLivre: string | null;
  semente: Semente | null;
  origem: OrigemTema;
}

export function limparTemaLivre(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim().slice(0, MAX_TEMA_LIVRE);
}

/** Valida uma sugestão vinda da rede; devolve null se for inválida. */
export function validarSugestao(s: unknown): SugestaoTema | null {
  if (!s || typeof s !== 'object') return null;
  const o = s as { tipo?: unknown; genero?: unknown; texto?: unknown };
  if (o.tipo === 'sortear') return { tipo: 'sortear' };
  if (o.tipo === 'genero' && typeof o.genero === 'string' && Object.hasOwn(GENEROS, o.genero)) return { tipo: 'genero', genero: o.genero as GeneroId };
  if (o.tipo === 'livre' && typeof o.texto === 'string') {
    const texto = limparTemaLivre(o.texto);
    return texto ? { tipo: 'livre', texto } : null;
  }
  return null;
}

export function mesmaSugestao(a: SugestaoTema | null, b: SugestaoTema | null): boolean {
  const x = a ?? { tipo: 'sortear' };
  const y = b ?? { tipo: 'sortear' };
  if (x.tipo !== y.tipo) return false;
  if (x.tipo === 'genero' && y.tipo === 'genero') return x.genero === y.genero;
  if (x.tipo === 'livre' && y.tipo === 'livre') return x.texto.toLowerCase() === y.texto.toLowerCase();
  return true;
}

export function rotuloSugestao(s: SugestaoTema | null): string {
  if (!s || s.tipo === 'sortear') return '🎲 Surpresa';
  if (s.tipo === 'genero') return `${GENEROS[s.genero].icone} ${GENEROS[s.genero].nome}`;
  return `✍️ “${s.texto}”`;
}

/** Transforma uma sugestão (ou nenhuma) no tema da partida. */
export function resolverTema(s: SugestaoTema | null, anterior: GeneroId | null, rnd: Aleatorio = aleatorioSeguro): TemaDefinido {
  if (s?.tipo === 'genero') return { genero: s.genero, temaLivre: null, semente: sortearSemente(s.genero, rnd), origem: 'escolha' };
  if (s?.tipo === 'livre' && limparTemaLivre(s.texto)) return { genero: null, temaLivre: limparTemaLivre(s.texto), semente: null, origem: 'livre' };
  const { genero, semente } = sortearGenero(anterior, rnd);
  return { genero, temaLivre: null, semente, origem: 'sorteio' };
}

const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Código de sala curto, sem caracteres ambíguos (0/O, 1/I/L). */
export function gerarCodigoSala(rnd: Aleatorio = aleatorioSeguro, tamanho = 5): string {
  let c = '';
  for (let i = 0; i < tamanho; i++) c += escolher(ALFABETO_CODIGO.split(''), rnd);
  return c;
}

export function normalizarCodigo(bruto: string): string {
  return bruto
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}
