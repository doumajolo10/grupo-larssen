// Conteúdo do site do Grupo Larssen. Fonte: textos dos sites antigos (pesquisa/paginas.json).
// Itens marcados com confirmar: true foram escritos por nós e precisam de validação do cliente.

const CONTATO = {
  telefone: "(55) 3522-1635",
  telLink: "tel:+555535221635",
  whats: "555535221635",
  emails: { madeireira: "contato@madeireiralarssen.com.br", tratadas: "contato@madelarssen.com.br" },
  endereco: "Rua Renato José Oppermann, 210",
  bairro: "Distrito Industrial",
  cidade: "Três Passos/RS",
  cep: "98600-000",
  localAtendimento: "Larssen Madeiras Tratadas",
  lat: -27.4432, lon: -53.948,
  instagram: "https://www.instagram.com/madeireiralarssen",
  facebook: "https://www.facebook.com/larssenmadeireira",
  facebookEscavacoes: "https://www.facebook.com/larssenescavacoes/",
};

const EMPRESAS = [
  {
    id: "florestal", nome: "Larssen Florestal", curto: "Florestal", km: 0, cor: "#54763A",
    logo: null, icone: "assets/logos/icone-florestal.svg",
    frase: "Floresta plantada, manejada e colhida pelo próprio grupo.",
    texto: "É onde a rota começa. A Larssen Florestal cuida de cerca de 500 hectares de pinus e eucalipto reflorestados, destinados só à extração, e de áreas de mata nativa preservada. A colheita é mecanizada, com harvester, para entregar toras de qualidade à serraria com segurança e menos impacto no solo.",
    numeros: [["500 ha", "de reflorestamento"], ["Pinus", "e eucalipto"], ["Harvester", "na colheita"]],
    servicos: [
      ["Plantio e reflorestamento", "Implantação de florestas de pinus e eucalipto em áreas destinadas à extração."],
      ["Manejo florestal", "Cuidado do talhão do plantio ao corte, seguindo a legislação ambiental."],
      ["Colheita mecanizada", "Corte, desgalhamento e traçamento com harvester."],
      ["Preservação de nativas", "Conservação de matas nativas e regeneração de áreas antes usadas para outros fins."],
    ],
    confirmar: true,
    foto: "ig-harvester.jpg", fotos: ["ig-harvester.jpg", "ig-eucalipto.jpg", "larssenmadeirastratadas_2020_02_reflorestamento.jpg", "madeireiralarssen_2019_08_responsabilidade.jpg"],
  },
  {
    id: "madeireira", nome: "Madeireira Larssen", curto: "Madeireira", desde: 1970, km: 2, cor: "#5A3B15",
    logo: "assets/logos/madeireira.svg", icone: "assets/logos/icone-madeireira.svg",
    frase: "Serraria e beneficiamento de madeira desde 1970.",
    texto: "Instalada no Distrito Industrial de Três Passos/RS, a Madeireira Larssen produz madeira serrada e beneficiada para a construção civil, o agronegócio e a indústria. São 47.000 m² de área, 11.000 m² cobertos, 50 colaboradores e capacidade de 100 m³ por dia, com entregas para todos os estados do Brasil.",
    numeros: [["1970", "início da serraria"], ["47.000 m²", "de área total"], ["11.000 m²", "de área coberta"], ["100 m³", "de produção por dia"], ["50", "colaboradores"]],
    linhas: ["bruta", "beneficiada", "casas", "agro", "industria", "montadas"],
    foto: "madeireiralarssen_2019_08_empresa3.jpg", fotos: ["madeireiralarssen_2019_08_empresa3.jpg", "madeireiralarssen_2019_08_maquinas.jpg", "madeireiralarssen_2019_08_toras.jpg", "madeireiralarssen_2019_08_galpao.jpg"],
  },
  {
    id: "tratadas", nome: "Larssen Madeiras Tratadas", curto: "Madeiras Tratadas", desde: 2010, km: 9, cor: "#688838",
    logo: "assets/logos/tratadas.svg", icone: "assets/logos/icone-tratadas.svg",
    frase: "Tratamento em autoclave que multiplica a vida útil da madeira.",
    texto: "Extensão da madeireira criada em 2010 para elevar a qualidade, a durabilidade e a resistência das madeiras de pinus e eucalipto cultivadas pelo grupo. Do plantio ao tratamento químico em autoclave e à entrega, todo o processo segue as normas técnicas.",
    numeros: [["2010", "início do tratamento"], ["CCA tipo C", "preservativo usado"], ["10x", "mais durabilidade"], ["6", "etapas na autoclave"]],
    linhas: ["tratadas"],
    foto: "larssenmadeirastratadas_2020_01_madelarssen_06.jpg", fotos: ["larssenmadeirastratadas_2020_01_madelarssen_06.jpg", "ig-empilhadeira.jpg", "larssenmadeirastratadas_2020_01_madelarssen_02.jpg", "larssenmadeirastratadas_2020_01_madelarssen_01.jpg"],
  },
  {
    id: "transportes", nome: "Log Larssen Transportes", curto: "Transportes", desde: 2023, km: 21, cor: "#1B211D",
    logo: null, icone: "assets/logos/icone-transportes.svg",
    frase: "Frota própria levando a madeira do RS para todo o Brasil.",
    texto: "A Log Larssen Transportes faz o transporte rodoviário de cargas do grupo e de terceiros, em viagens municipais, intermunicipais e interestaduais. É ela que leva a madeira do pátio em Três Passos até a obra do cliente.",
    servicos: [
      ["Transporte de madeira", "Toras, madeira serrada, dormentes e madeira tratada, com a carga amarrada e protegida."],
      ["Cargas para todo o Brasil", "Viagens interestaduais saindo do Noroeste gaúcho."],
      ["Frota própria", "Caminhões e carretas do próprio grupo."],
    ],
    confirmar: true,
    foto: "madeireiralarssen_2020_10_estrutura.jpg", fotos: ["madeireiralarssen_2020_10_estrutura.jpg", "madeireiralarssen_2020_10_06.jpg", "madeireiralarssen_2020_10_08.jpg", "madeireiralarssen_2019_08_toras2.jpg"],
  },
  {
    id: "escavacoes", nome: "Larssen Escavações", curto: "Escavações", km: 25, cor: "#E2A400",
    logo: "assets/logos/escavacoes.svg", icone: "assets/logos/icone-escavacoes.svg",
    frase: "Escavadeiras e rompedor para preparar o terreno da obra.",
    texto: "No fim da rota está a obra. A Larssen Escavações trabalha com máquinas próprias, como escavadeira Volvo com rompedor hidráulico e pá carregadeira.",
    servicos: [
      ["Rompimento de pedras e concreto", "Escavadeira com rompedor hidráulico para rocha e concreto."],
      ["Escavação", "Escavadeiras próprias para abrir o terreno da obra."],
      ["Carga de material", "Pá carregadeira para carregar terra, pedra e entulho."],
    ],
    confirmar: true,
    foto: "ig-escavadeira.jpg", fotos: ["ig-escavadeira.jpg", "madeireiralarssen_2020_10_04.jpg"],
  },
];

// Linhas de produto. carimbos = etapas da cadeia por onde o produto passa.
const LINHAS = [
  { id: "bruta", nome: "Madeira bruta", empresa: "madeireira", foto: "madeireiralarssen_2019_08_madeira-bruta.jpg",
    texto: "Madeira vendida como sai da serra, sem acabamento refinado. Pode ter farpas e rebarbas e tem superfície áspera: é a escolha para estruturas, cercas e obra pesada." },
  { id: "beneficiada", nome: "Madeira beneficiada", empresa: "madeireira", foto: "madeireiralarssen_2019_08_beneficiadas.jpg",
    texto: "Madeira que passa por plaina, desengrossadeira e tupia. Sai lisa, sem rachaduras ou rebarbas, pronta para verniz, tinta ou stain." },
  { id: "tratadas", nome: "Madeira tratada em autoclave", empresa: "tratadas", foto: "larssenmadeirastratadas_2020_01_madelarssen_02.jpg",
    texto: "Produtos que recebem o tratamento químico em autoclave com CCA tipo C: resistem a fungos, cupins e brocas e podem ficar em contato direto com o solo." },
  { id: "casas", nome: "Casas de madeira", empresa: "madeireira", foto: "larssenmadeirastratadas_2020_10_casa01.jpg",
    texto: "Estrutura, paredes, assoalhos, forros e acabamentos para casas de madeira: isolamento térmico e acústico, obra rápida e custo menor que a alvenaria." },
  { id: "agro", nome: "Agronegócio", empresa: "madeireira", foto: "madeireiralarssen_2020_09_aviarios.jpg",
    texto: "Maravalha e serragem, biomassa 100% natural para cama de aviários, compost barn, suínos e cavalos." },
  { id: "industria", nome: "Indústria e energia", empresa: "madeireira", foto: "madeireiralarssen_2020_09_cavaco.jpg",
    texto: "Cavaco de madeira com umidade e granulometria uniformes para caldeiras industriais: energia limpa e mais barata que outros combustíveis." },
  { id: "montadas", nome: "Peças montadas", empresa: "madeireira", foto: "madeireiralarssen_2020_10_tesouras.jpg",
    texto: "Além da madeira por demanda, o grupo entrega peças já montadas: pallets, tesouras, pergolados e decks." },
];

const P = (id, nome, linha, uso, bitolas, madeira, foto, carimbos, extra = {}) => ({ id, nome, linha, uso, bitolas, madeira, foto, carimbos, ...extra });
const PRODUTOS = [
  // Madeira bruta (madeireiralarssen.com.br/produtos/madeira-bruta)
  P("dormentes", "Dormentes", "bruta", "Linhas férreas", ["Bitola métrica: 0,16 × 0,22 × 2,00 m", "Bitola larga: 0,17 × 0,24 × 2,80 m", "Bitolas especiais"], "Eucalipto", "madeireiralarssen_2019_08_dormentes.jpg", ["floresta", "serraria"]),
  P("vigas", "Vigas", "bruta", "Pontes, estruturas e barracões", ["Medidas diversas"], "Eucalipto", "madeireiralarssen_2019_08_vigas-pontes.jpg", ["floresta", "serraria"]),
  P("mouroes", "Mourões", "bruta", "Palanques para cerca", ["16 × 21 × 220 cm"], "Eucalipto", "madeireiralarssen_2020_09_mouroes.jpg", ["floresta", "serraria"]),
  P("mouroes-rolicos", "Mourões roliços", "bruta", "Pergolados, postes de cerca, aviários, galpões, estufas e parreirais", ["Bitolas diversas"], "Eucalipto", "madeireiralarssen_2020_09_estacas.jpg", ["floresta", "serraria"]),
  P("tramas", "Tramas", "bruta", "Tramas para cercas", ["5 × 5 cm"], "Eucalipto", "madeireiralarssen_2019_08_trama.jpg", ["floresta", "serraria"]),
  P("ripas", "Ripas", "bruta", "Ripamento de telhados", ["2,5 × 5 cm", "2,7 × 5 cm", "2,5 × 7 cm"], "Pinus e eucalipto", "madeireiralarssen_2020_09_ripas.jpg", ["floresta", "serraria"]),
  P("pranchas", "Pranchas", "bruta", "Assoalho de pontes, escadarias e estruturas robustas", ["5 cm", "8 cm"], "Pinus e madeira nativa", "madeireiralarssen_2020_09_prancha-1.jpg", ["floresta", "serraria"]),
  P("tabuas", "Tábuas", "bruta", "Amplo uso na construção civil", ["Larguras 20, 25 e 30 cm"], "Pinus e eucalipto", "madeireiralarssen_2020_09_tabuas.jpg", ["floresta", "serraria"]),
  P("esteios", "Esteios", "bruta", "Pergolados e sustentação de casas", ["10 × 10 cm", "12 × 12 cm", "15 × 15 cm", "20 × 20 cm"], "Nativa, eucalipto ou pinus autoclavado", "madeireiralarssen_2020_09_esteios.jpg", ["floresta", "serraria"]),
  P("guias", "Guias", "bruta", "Tesouras, andaimes e escoramento", ["Larguras 10, 12 e 15 cm"], "Eucalipto e pinus", "madeireiralarssen_2020_09_guias.jpg", ["floresta", "serraria"]),
  P("escoras", "Escoras", "bruta", "Escoramento de laje", ["Bitolas diversas"], "Eucalipto", "madeireiralarssen_2020_09_escoras.jpg", ["floresta", "serraria"]),
  P("cortes-especiais", "Cortes especiais", "bruta", "Sob pedido do cliente, variando bitola e comprimento", ["Bitolas e comprimentos sob medida"], "Diversas", "madeireiralarssen_2020_09_cortes-especiais.jpg", ["floresta", "serraria"]),
  // Madeira beneficiada
  P("assoalhos", "Assoalhos", "beneficiada", "Pisos residenciais e comerciais", ["8 cm × comprimento variável"], "Pinus e eucalipto", "madeireiralarssen_2020_09_assoalho.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("paredes", "Paredes", "beneficiada", "Aplicação horizontal e vertical", ["8 e 10 cm × comprimento variado"], "Pinus e eucalipto", "madeireiralarssen_2020_09_parede.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("decks-beneficiados", "Decks", "beneficiada", "Entorno de piscinas, áreas de circulação e elevados", ["9 cm × variado"], "Nativa, pinus e eucalipto", "madeireiralarssen_2020_09_decks.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("divisorias", "Divisórias", "beneficiada", "Divisão interna de cômodos", ["12 × 270 cm"], "Pinus", "madeireiralarssen_2020_09_divisoria.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("forros", "Forros", "beneficiada", "Teto e beirais", ["Bitolas diversas"], "Pinus, eucalipto ou nativa", "madeireiralarssen_2020_09_forro.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("rodape", "Rodapé", "beneficiada", "Acabamento final do assoalho", ["Bitolas diversas"], "Pinus ou cedro", "madeireiralarssen_2020_09_rodape.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("cimalha", "Cimalha", "beneficiada", "Acabamento final do forro", ["Medidas diversas"], "Pinus ou cedro", "madeireiralarssen_2020_09_cimalha.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("guarnicao", "Guarnição", "beneficiada", "Acabamento de portas e janelas", ["Medidas diversas"], "Pinus ou cedro", "madeireiralarssen_2020_09_guarnicao.jpg", ["floresta", "serraria", "beneficiamento"]),
  // Tratadas
  P("pergolados", "Pergolados", "tratadas", "Jardins, varandas, garagens e áreas de piscina", ["Projetos sob medida"], "Pinus e eucalipto tratados", "larssenmadeirastratadas_2020_10_pergolado05.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
  P("decks", "Decks de pinus tratado", "tratadas", "Áreas externas e entorno de piscinas", ["Bitolas diversas"], "Pinus tratado", "larssenmadeirastratadas_2020_10_deck.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
  P("cercas", "Cercas", "tratadas", "Delimitar terrenos, dar privacidade e decorar jardins", ["Modelos diversos"], "Pinus e eucalipto tratados", "larssenmadeirastratadas_2020_10_cerca01.jpg", ["floresta", "serraria", "autoclave"]),
  P("dormentes-tratados", "Dormentes ferroviários tratados", "tratadas", "Linhas férreas", ["Bitola métrica e larga", "Bitolas especiais"], "Eucalipto de alta densidade", "larssenmadeirastratadas_2020_10_dormente04.jpg", ["floresta", "serraria", "autoclave"]),
  P("rolica", "Madeira roliça tratada", "tratadas", "Playgrounds, postes, cercas e estruturas", ["Diâmetros diversos"], "Eucalipto tratado", "larssenmadeirastratadas_2020_10_rolica-tratada.jpg", ["floresta", "autoclave"]),
  P("construcao", "Madeira para construção civil", "tratadas", "Casas de madeira e estruturas externas", ["Bitolas diversas"], "Pinus e eucalipto tratados", "larssenmadeirastratadas_2020_10_casa02.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
  P("mouroes-tratados", "Mourões tratados", "tratadas", "Cercas rurais e de divisa, em contato com o solo", ["Bitolas diversas"], "Eucalipto tratado", "larssenmadeirastratadas_2020_10_mouroes.jpg", ["floresta", "autoclave"]),
  // Casas
  P("casas-madeira", "Casas de madeira", "casas", "Moradia e lazer: até 60% mais baratas que alvenaria em certos casos", ["Projeto sob consulta"], "Pinus, eucalipto e nativa", "larssenmadeirastratadas_2020_10_casa01.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
  // Agro
  P("maravalha-aviario", "Maravalha para aviários", "agro", "Cama macia que retém umidade e reduz doenças", ["A granel ou ensacada"], "Pinus e eucalipto", "madeireiralarssen_2020_09_aviarios.jpg", ["serraria", "beneficiamento"]),
  P("compost-barn", "Compost barn", "agro", "Superfície macia e produtiva para estábulos", ["A granel"], "Pinus e eucalipto", "madeireiralarssen_2020_09_cama-gado.jpg", ["serraria", "beneficiamento"]),
  P("cama-suinos", "Cama para suínos", "agro", "Mais conforto, menos odor e composto orgânico no fim", ["A granel"], "Pinus e eucalipto", "madeireiralarssen_2020_09_suinos.jpg", ["serraria", "beneficiamento"]),
  P("cama-cavalos", "Cama para cavalos", "agro", "Baias de jockeys e hípicas: limpeza e reposição fáceis", ["A granel ou ensacada"], "Pinus e eucalipto", "madeireiralarssen_2020_09_cama-cavalo.jpg", ["serraria", "beneficiamento"]),
  // Indústria
  P("cavaco", "Cavaco para caldeira", "industria", "Combustível para caldeiras industriais", ["Umidade e granulometria uniformes"], "Pinus e eucalipto", "madeireiralarssen_2020_09_cavaco.jpg", ["floresta", "serraria"]),
  // Montadas
  P("pallets", "Pallets", "montadas", "Transporte e armazenamento de mercadorias", ["Medidas variáveis"], "Pinus e eucalipto", "madeireiralarssen_2020_10_pallets.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("tesouras", "Tesouras", "montadas", "Casas, galpões, aviários e chiqueirões", ["Medidas diversas"], "Eucalipto", "madeireiralarssen_2020_10_tesouras.jpg", ["floresta", "serraria", "beneficiamento"]),
  P("pergolados-montados", "Pergolados montados", "montadas", "Casas e jardins", ["Bitolas diversas"], "Nativa, eucalipto e pinus tratado", "madeireiralarssen_2020_10_pergolados.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
  P("decks-montados", "Decks montados", "montadas", "Áreas externas e piscinas", ["Bitolas diversas"], "Eucalipto e pinus tratado", "madeireiralarssen_2020_10_decks.jpg", ["floresta", "serraria", "beneficiamento", "autoclave"]),
];

// As etapas da cadeia (rota). foto = imagem real do grupo.
const ETAPAS = [
  { id: "floresta", nome: "Floresta", km: 0, empresa: "florestal", texto: "Cerca de 500 hectares de pinus e eucalipto reflorestados e colheita mecanizada com harvester.", foto: "ig-harvester.jpg" },
  { id: "serraria", nome: "Serraria", km: 2, texto: "Toras chegam ao pátio e viram madeira serrada: 100 m³ por dia em 11.000 m² de galpões.", foto: "madeireiralarssen_2019_08_maquinas.jpg" },
  { id: "beneficiamento", nome: "Beneficiamento", km: 5, texto: "Plaina, desengrossadeira e tupia transformam a peça bruta em assoalho, forro, deck e acabamento.", foto: "madeireiralarssen_2020_09_tabuas.jpg" },
  { id: "autoclave", nome: "Autoclave", km: 9, texto: "Vácuo e pressão injetam o preservativo CCA tipo C até a saturação: a madeira dura mais de dez vezes mais.", foto: "larssenmadeirastratadas_2020_01_madelarssen_02.jpg" },
  { id: "subprodutos", nome: "Subprodutos", km: 11, texto: "Nada se perde: maravalha e serragem viram cama de aviário e cavaco vira energia de caldeira.", foto: "madeireiralarssen_2020_10_07.jpg" },
  { id: "estrada", nome: "Estrada", km: 21, empresa: "transportes", texto: "Frota própria leva a carga do pátio de Três Passos para obras em todo o Brasil.", foto: "madeireiralarssen_2020_10_06.jpg" },
  { id: "obra", nome: "Obra", km: 25, empresa: "escavacoes", texto: "Na chegada, escavadeiras e rompedor preparam o terreno onde a madeira vai ser usada.", foto: "ig-escavadeira.jpg" },
];

const AUTOCLAVE = [
  ["Carga", "Depois de preparada e seca, a madeira entra na autoclave."],
  ["Vácuo inicial", "O vácuo retira a maior parte do ar das células da madeira."],
  ["Enchimento", "Ainda sob vácuo, a solução de CCA é transferida para a autoclave."],
  ["Pressão", "Sob alta pressão, a solução é injetada até a saturação das fibras."],
  ["Alívio", "A pressão é aliviada e a solução que sobra volta ao tanque."],
  ["Vácuo final", "Um último vácuo retira o excesso de produto da superfície."],
];

const ESTADOS = ["RS", "SC", "PR", "MS", "MT", "SP", "MG", "RJ"];

module.exports = { CONTATO, EMPRESAS, LINHAS, PRODUTOS, ETAPAS, AUTOCLAVE, ESTADOS };
