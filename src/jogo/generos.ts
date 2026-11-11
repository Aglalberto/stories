import { MAX_TEMA_LIVRE } from './config';
import type { GeneroId, OrigemTema, Semente, SugestaoTema, TropoId } from './tipos';

export type Ambiente = 'vagalumes' | 'estrelas' | 'chuva' | 'nevoa' | 'ondas' | 'brasas' | 'petalas' | 'coracoes';

export interface Genero {
  id: GeneroId;
  nome: string;
  icone: string;
  chamada: string;
  tom: string;
  ambiente: Ambiente;
  /** Gêneros de romance aceitam um tropo romântico. */
  romance?: boolean;
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
  comedia: {
    id: 'comedia',
    nome: 'Comédia Romântica',
    icone: '💘',
    chamada: 'Encontros desastrados, mal-entendidos e um amor que ninguém planejou.',
    tom: 'comédia romântica leve e divertida, com diálogos espirituosos, situações constrangedoras e muito charme; o romance entre os protagonistas é o centro da história',
    ambiente: 'coracoes',
    romance: true,
    cores: { fundo1: '#1f0a17', fundo2: '#4a1735', primaria: '#ff8fb1', secundaria: '#ffd36e' },
    lugares: [
      'o casamento da melhor amiga, onde nada sai como planejado',
      'uma pousada charmosa reservada por engano para os dois',
      'um food truck disputando o melhor ponto de um festival',
      'um voo cancelado e a última vaga num carro alugado',
      'um escritório às vésperas da festa de fim de ano',
    ],
    elementos: [
      'uma aposta boba feita depois de duas taças de vinho',
      'um cachorro que se recusa a sair do colo de um dos dois',
      'um áudio constrangedor enviado para a pessoa errada',
      'um bolo de casamento de quatro andares sob responsabilidade da dupla',
      'um ex que aparece com o par perfeito',
    ],
    objetivos: [
      'salvar o casamento dos amigos sem admitir o que sentem',
      'vencer um concurso de casais fingindo ser um casal',
      'chegar a tempo para o pedido de casamento de outra pessoa',
      'manter a pousada aberta até o fim da temporada',
      'convencer a família de que estão juntos há anos',
    ],
  },
  epoca: {
    id: 'epoca',
    nome: 'Romance de Época',
    icone: '🌹',
    chamada: 'Cartas secretas, bailes e um amor contra as convenções.',
    tom: 'romance de época (séculos 19 e início do 20), com costumes rígidos, olhares proibidos, cartas e segredos de família; o romance entre os protagonistas é o centro da história',
    ambiente: 'petalas',
    romance: true,
    cores: { fundo1: '#1a0d0b', fundo2: '#43201a', primaria: '#e8b77a', secundaria: '#d97a8a' },
    lugares: [
      'uma fazenda de café no interior do Brasil Império',
      'um navio a vapor rumo à Europa em 1890',
      'um teatro de ópera em Paris na Belle Époque',
      'uma casa de chá em Lisboa no começo do século 20',
      'um casarão no Rio de Janeiro às vésperas da Abolição',
    ],
    elementos: [
      'cartas de amor assinadas com uma inicial misteriosa',
      'um noivado arranjado anunciado no pior momento',
      'um retrato pintado que esconde uma mensagem',
      'um medalhão com o retrato de outra pessoa',
      'um convite para um baile de máscaras',
    ],
    objetivos: [
      'impedir um casamento arranjado sem desonrar a família',
      'recuperar uma herança roubada antes do fim da estação',
      'descobrir quem escreve as cartas anônimas',
      'fugir juntos antes que o navio zarpe',
      'salvar a fazenda da ruína',
    ],
  },
  regencia: {
    id: 'regencia',
    nome: 'Romance de Regência',
    icone: '💌',
    chamada: 'Temporada de bailes em Londres, fofocas e reputações em jogo.',
    tom: 'romance de Regência inglesa (1811–1820), com bailes, cartões de dança, colunas de fofoca, títulos de nobreza e diálogos afiados; o romance entre os protagonistas é o centro da história',
    ambiente: 'petalas',
    romance: true,
    cores: { fundo1: '#0f1424', fundo2: '#2b3352', primaria: '#f0d9a8', secundaria: '#c9a7e8' },
    lugares: [
      'um salão de baile em Londres, na abertura da temporada de 1813',
      'uma propriedade no campo durante uma longa visita de verão',
      'as termas de Bath, cheias de fofocas',
      'uma biblioteca onde ninguém deveria estar à meia-noite',
      'uma carruagem atolada numa estrada de chuva',
    ],
    elementos: [
      'um cartão de dança com um nome riscado',
      'uma coluna de fofocas que sabe demais',
      'uma luva esquecida no lugar mais comprometedor',
      'um duque cheio de dívidas e com um segredo',
      'uma aposta registrada no livro do clube de cavalheiros',
    ],
    objetivos: [
      'escapar de um escândalo antes que ele chegue aos jornais',
      'garantir um casamento vantajoso sem perder o coração',
      'desmascarar o autor da coluna de fofocas',
      'conquistar a aprovação de uma matriarca implacável',
      'salvar a reputação da irmã mais nova',
    ],
  },
  romancemisterio: {
    id: 'romancemisterio',
    nome: 'Romance de Mistério',
    icone: '🗝️',
    chamada: 'Paixão e suspense: um segredo do passado e ninguém acima de suspeita.',
    tom: 'romance de mistério, com suspense, pistas, segredos do passado e atração crescente entre os protagonistas, que é tão importante quanto o mistério',
    ambiente: 'nevoa',
    romance: true,
    cores: { fundo1: '#12080f', fundo2: '#36142b', primaria: '#f2a7c3', secundaria: '#9fb4ff' },
    lugares: [
      'um hotel antigo na serra durante um fim de semana de chuva',
      'uma ilha particular onde o anfitrião desapareceu',
      'um vinhedo no Sul com uma safra amaldiçoada',
      'uma livraria herdada com um quarto trancado',
      'um trem noturno cruzando a Europa',
    ],
    elementos: [
      'um diário com páginas arrancadas',
      'uma aliança encontrada no lugar errado',
      'um bilhete que diz "não confie em ninguém"',
      'uma foto antiga dos dois juntos que nenhum lembra de ter tirado',
      'uma chave sem fechadura',
    ],
    objetivos: [
      'descobrir o que aconteceu com o primeiro amor de um deles',
      'provar a inocência um do outro',
      'encontrar o testamento escondido antes dos outros herdeiros',
      'desvendar um desaparecimento sem se apaixonar pelo principal suspeito',
      'revelar o segredo que separou as famílias dos dois',
    ],
  },
};

export const LISTA_GENEROS: Genero[] = Object.values(GENEROS);

export interface Tropo {
  id: TropoId;
  nome: string;
  descricao: string;
}

export const TROPOS: Tropo[] = [
  { id: 'amigos', nome: 'Friends to lovers', descricao: 'melhores amigos há anos que finalmente percebem que é mais que amizade' },
  { id: 'idade', nome: 'Age gap', descricao: 'uma diferença de idade marcante entre os dois (ambos adultos)' },
  { id: 'inimigos', nome: 'Enemies to lovers', descricao: 'rivais que se provocam até não conseguirem mais negar a atração' },
  { id: 'segundachance', nome: 'Segunda chance', descricao: 'ex-amores que se reencontram anos depois, com contas a acertar' },
  { id: 'fingido', nome: 'Namoro de mentira', descricao: 'fingem ser um casal por conveniência, e a mentira começa a virar verdade' },
  { id: 'conveniencia', nome: 'Casamento por conveniência', descricao: 'um casamento arranjado ou de fachada que pode virar amor' },
  { id: 'proibido', nome: 'Amor proibido', descricao: 'um amor que famílias, regras ou lados opostos não permitem' },
  { id: 'umacama', nome: 'Só uma cama', descricao: 'proximidade forçada: presos juntos, um único quarto, uma única cama' },
];

export const TROPO_POR_ID = Object.fromEntries(TROPOS.map((t) => [t.id, t])) as Record<TropoId, Tropo>;

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

export function sortearSemente(genero: GeneroId, rnd: Aleatorio = aleatorioSeguro, tropo?: TropoId): Semente {
  const g = GENEROS[genero];
  return {
    lugar: escolher(g.lugares, rnd),
    elemento: escolher(g.elementos, rnd),
    objetivo: escolher(g.objetivos, rnd),
    // Nos gêneros de romance, sem tropo escolhido, sorteia um.
    tropo: g.romance ? (tropo ?? escolher(TROPOS, rnd).id) : null,
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
  if (o.tipo === 'genero' && typeof o.genero === 'string' && Object.hasOwn(GENEROS, o.genero)) {
    const genero = o.genero as GeneroId;
    const tropo = (o as { tropo?: unknown }).tropo;
    if (GENEROS[genero].romance && typeof tropo === 'string' && Object.hasOwn(TROPO_POR_ID, tropo)) return { tipo: 'genero', genero, tropo: tropo as TropoId };
    return { tipo: 'genero', genero };
  }
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
  if (x.tipo === 'genero' && y.tipo === 'genero') return x.genero === y.genero && (x.tropo ?? null) === (y.tropo ?? null);
  if (x.tipo === 'livre' && y.tipo === 'livre') return x.texto.toLowerCase() === y.texto.toLowerCase();
  return true;
}

export function rotuloSugestao(s: SugestaoTema | null): string {
  if (!s || s.tipo === 'sortear') return '🎲 Surpresa';
  if (s.tipo === 'genero') return `${GENEROS[s.genero].icone} ${GENEROS[s.genero].nome}${s.tropo ? ` · ${TROPO_POR_ID[s.tropo].nome}` : ''}`;
  return `✍️ “${s.texto}”`;
}

/** Transforma uma sugestão (ou nenhuma) no tema da partida. */
export function resolverTema(s: SugestaoTema | null, anterior: GeneroId | null, rnd: Aleatorio = aleatorioSeguro): TemaDefinido {
  if (s?.tipo === 'genero') return { genero: s.genero, temaLivre: null, semente: sortearSemente(s.genero, rnd, s.tropo), origem: 'escolha' };
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
