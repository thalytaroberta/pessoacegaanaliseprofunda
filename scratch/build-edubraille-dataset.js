const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Map of categories and module items
const categoryMap = [
  {
    category: "HISTÓRIA",
    icon: "history",
    color: "amber",
    modules: [
      { id: 1, name: "A pessoa antes da deficiência", slug: "a-pessoa-antes-da-deficiencia", desc: "Ontologia, subjetividade e desconstrução do diagnóstico como identidade mestre.", tags: ["História", "Autonomia", "Direitos"] },
      { id: 2, name: "Conceitos e classificações", slug: "conceitos-e-classificacoes", desc: "Acuidade, campo visual, visão funcional, cegueira congênita/adquirida e surdocegueira.", tags: ["Saúde", "Classificação", "Visão Funcional"] },
      { id: 3, name: "História da deficiência visual", slug: "historia-da-deficiencia-visual", desc: "Da Antiguidade e Idade Média ao Iluminismo e à Carta sobre os Cegos de Diderot.", tags: ["História", "Filosofia", "Diderot"] },
      { id: 4, name: "História da educação de cegos", slug: "historia-da-educacao-de-cegos", desc: "Valentin Haüy, a fundação do INJA em 1784 e as primeiras impressões em alto-relevo.", tags: ["Educação", "Valentin Haüy", "INJA"] },
      { id: 5, name: "Charles Barbier", slug: "charles-barbier", desc: "A Escrita Noturna militar de 12 pontos, a fonografia e o encontro com os alunos do INJA.", tags: ["Tecnologia Militar", "Barbier", "Escrita Noturna"] },
      { id: 6, name: "Louis Braille", slug: "louis-braille", desc: "Trajetória biográfica, a invenção da cela de 6 pontos em 1824 e seu legado universal.", tags: ["Louis Braille", "Genialidade", "História"] },
      { id: 7, name: "Sistema Braille", slug: "sistema-braille", desc: "Estrutura da cela, 64 combinações, ordem das séries, Braille integral e contraído.", tags: ["Braille", "Código", "Notação"] },
      { id: 8, name: "Internacionalização do Braille", slug: "internacionalizacao-do-braille", desc: "Expansão global, a Guerra dos Tipos nos EUA, acordos da UNESCO e unificação.", tags: ["Internacional", "UNESCO", "Guerra dos Tipos"] },
      { id: 9, name: "Braille no Brasil", slug: "braille-no-brasil", desc: "José Álvares de Azevedo, D. Pedro II, Imperial Instituto dos Meninos Cegos (1854) e o IBC.", tags: ["Brasil", "IBC", "Álvares de Azevedo"] },
      { id: 10, name: "Padronização brasileira", slug: "padronizacao-brasileira", desc: "Comissão Brasileira do Braille (CBB), Grafia Portuguesa, Matemática, Química e Informática.", tags: ["CBB", "MEC", "Grafias Técnicas"] }
    ]
  },
  {
    category: "PESSOA E DESENVOLVIMENTO",
    icon: "user-check",
    color: "indigo",
    modules: [
      { id: 11, name: "Psicologia e experiência da cegueira", slug: "psicologia-e-experiencia-da-cegueira", desc: "Processos de luto, reconstrução da autoimagem, aceitação e saúde mental.", tags: ["Psicologia", "Luto", "Autoestima"] },
      { id: 12, name: "A pessoa por trás da deficiência", slug: "a-pessoa-por-tras-da-deficiencia", desc: "Autodeterminação, maternidade/paternidade cega, sexualidade e crítica ao Inspiration Porn.", tags: ["Autonomia", "Protagonismo", "Vida Plena"] },
      { id: 13, name: "Desenvolvimento infantil e cognição", slug: "desenvolvimento-infantil-e-cognicao", desc: "Conceituação háptica, permanência do objeto, teoria de Vygotsky e prevenção ao verbalismo.", tags: ["Infância", "Cognição", "Vygotsky"] },
      { id: 14, name: "Neurociência da deficiência visual", slug: "neurociencia-da-deficiencia-visual", desc: "Plasticidade cortical cross-modal, recrutamento do córtex occipital V1 na leitura tátil e TMS.", tags: ["Neurociência", "Brain Plasticity", "fMRI"] }
    ]
  },
  {
    category: "EDUCAÇÃO E BRAILLE",
    icon: "book-open",
    color: "emerald",
    modules: [
      { id: 15, name: "Pré-Braille", slug: "pre-braille", desc: "Discriminação tátil, coordenação motora fina, lateralidade e Lego Braille Bricks.", tags: ["Pré-Braille", "Motricidade", "Lego Braille"] },
      { id: 16, name: "Modelos e métodos pedagógicos", slug: "modelos-e-metodos-pedagogicos", desc: "Estudo comparativo: Tradicional, Fônico, Construtivista, Evidências/Mangold, PBL e DUA.", tags: ["Pedagogia", "Métodos", "DUA"] },
      { id: 17, name: "Expanded Core Curriculum — ECC", slug: "expanded-core-curriculum-ecc", desc: "Análise dos 9 Domínios do ECC norte-americano vs. AEE brasileiro vs. Desenho Universal.", tags: ["ECC", "AEE", "Currículo"] },
      { id: 18, name: "Modelo integrado de educação e autonomia", slug: "modelo-integrado-de-educacao-e-autonomia", desc: "Ensino holístico por projetos práticos conectando Braille, matemática, mobilidade e AVDs.", tags: ["Modelo Integrado", "PBL", "Autonomia"] },
      { id: 19, name: "Alfabetização Braille", slug: "alfabetizacao-braille", desc: "Alfabetização infantil vs. adulta, velocidade de leitura tátil, Dual Media e compreensão.", tags: ["Alfabetização", "Fluência", "Leitura Tátil"] },
      { id: 20, name: "Reglete e punção tradicionais", slug: "reglete-e-puncao-tradicionais", desc: "Mecanismo da reglete negativa, escrita espelhada da direita para a esquerda e punções.", tags: ["Reglete", "Punção", "Escrita Espelhada"] },
      { id: 21, name: "TECE e Aline Picolli", slug: "tece-e-aline-picolli", desc: "Estudo de caso de inovação em tecnologia assistiva no Brasil, pós-graduação na UNICAMP e patentes.", tags: ["TECE", "Aline Picolli", "UNICAMP"] },
      { id: 22, name: "Reglete positiva", slug: "reglete-positiva", desc: "Escrita direta em alto-relevo da esquerda para a direita, análise motora e dados empíricos.", tags: ["Reglete Positiva", "Escrita Direta", "TECE"] },
      { id: 23, name: "Máquina Braille de baixo custo", slug: "maquina-braille-de-baixo-custo", desc: "Perkins Brailler vs. projeto mecânico nacional em polímeros da TECE e iniciativas globais.", tags: ["Máquina Braille", "Perkins", "Baixo Custo"] }
    ]
  },
  {
    category: "TECNOLOGIA E REPRESENTAÇÃO",
    icon: "cpu",
    color: "blue",
    modules: [
      { id: 24, name: "Tecnologia assistiva", slug: "tecnologia-assistiva", desc: "Evolução histórica: instrumentos manuais → mecânicos → digitais → inteligência artificial.", tags: ["Tecnologia Assistiva", "Evolução", "Autonomia"] },
      { id: 25, name: "Matemática, soroban e ciências", slug: "matematica-soroban-e-ciencias", desc: "Grafia Matemática Braille, Soroban Fukoma/Cranmer adaptado e notação química/física.", tags: ["Matemática", "Soroban", "Ciências"] },
      { id: 26, name: "Mapas, gráficos e representações táteis", slug: "mapas-graficos-e-representacoes-tateis", desc: "Cartografia tátil, termoformagem Thermoform, Swell Paper e maquetes 3D com áudio.", tags: ["Cartografia Tátil", "Thermoform", "3D"] },
      { id: 27, name: "Musicografia Braille", slug: "musicografia-braille", desc: "Notação musical tátil de Louis Braille, partituras digitais e o software MusiBRAILLE.", tags: ["Música", "Musicografia", "MusiBRAILLE"] },
      { id: 28, name: "Orientação e mobilidade", slug: "orientacao-e-mobilidade", desc: "Richard Hoover, Valley Forge 1944, técnica da bengala longa, pontos de referência e GPS.", tags: ["Orientação e Mobilidade", "Bengala", "Hoover"] },
      { id: 29, name: "Bengala e aceitação", slug: "bengala-e-aceitacao", desc: "Estudo do estigma social, identidade, Lei nº 14.636/2023 (Bengala Verde) e autonomia.", tags: ["Bengala Verde", "Estigma", "Identidade"] },
      { id: 30, name: "Vida independente", slug: "vida-independente", desc: "Atividades da Vida Diária (AVDs/AIVDs), Centros de Vida Independente e gestão doméstica.", tags: ["Vida Independente", "AVDs", "Gestão Doméstica"] },
      { id: 31, name: "Cozinha e atividades de vida diária", slug: "cozinha-e-atividades-de-vida-diaria", desc: "Técnicas de segurança no fogão, técnica do relógio, dosadores e culinária adaptada.", tags: ["Culinária", "Segurança", "Técnica do Relógio"] }
    ]
  },
  {
    category: "AUTONOMIA E RELAÇÕES",
    icon: "heart",
    color: "rose",
    modules: [
      { id: 32, name: "Cão-guia", slug: "cao-guia", desc: "Formação, desobediência inteligente, Lei Federal nº 11.126/2005 e distinção de apoio emocional/pets.", tags: ["Cão-Guia", "Lei 11.126", "Desobediência Inteligente"] },
      { id: 33, name: "Animais de companhia e apoio emocional", slug: "animais-de-companhia-e-apoio-emocional", desc: "Estudo científico da Interação Humano-Animal no suporte ao luto da perda visual.", tags: ["Apoio Emocional", "Antrozoologia", "Saúde Mental"] },
      { id: 34, name: "Família", slug: "familia", desc: "Superproteção capacitista, infantilização prolongada e orientação a pais para a autonomia.", tags: ["Família", "Superproteção", "Orientação"] },
      { id: 35, name: "Educação Especial e AEE", slug: "educacao-especial-e-aee", desc: "Salas de Recursos Multifuncionais, PEI/PDI, Declaração de Salamanca e braillistas.", tags: ["AEE", "Inclusão", "Salamanca"] },
      { id: 36, name: "Acessibilidade", slug: "acessibilidade", desc: "As 6 Dimensões de Sassaki, ABNT NBR 9050, acessibilidade urbana e diretrizes WCAG 2.2 / 3.0.", tags: ["Acessibilidade", "NBR 9050", "WCAG"] }
    ]
  },
  {
    category: "TECNOLOGIA DIGITAL",
    icon: "monitor",
    color: "purple",
    modules: [
      { id: 37, name: "Informática e Braille digital", slug: "informatica-e-braille-digital", desc: "DOSVOX, leitores de tela NVDA/JAWS, VoiceOver, TalkBack e Linhas Braille recarregáveis.", tags: ["Informática", "NVDA", "DOSVOX"] },
      { id: 38, name: "Inteligência Artificial e deficiência visual", slug: "inteligencia-artificial-e-deficiencia-visual", desc: "Visão computacional multimodal (GPT-4o, Be My AI, Gemini), OCR inteligente e geração tátil.", tags: ["Inteligência Artificial", "GPT-4o", "Be My AI"] }
    ]
  },
  {
    category: "DIREITOS E SOCIEDADE",
    icon: "shield-check",
    color: "red",
    modules: [
      { id: 39, name: "Modelos da deficiência e direitos", slug: "modelos-da-deficiencia-e-direitos", desc: "Comparação: Modelo Caritativo → Médico → Social → Biopsicossocial (ONU 2006).", tags: ["Modelo Biopsicossocial", "Modelo Social", "ONU"] },
      { id: 40, name: "Legislação internacional", slug: "legislacao-internacional", desc: "DUDH, Convenção da ONU/2006, Agenda 2030 (ODS) e Tratado de Marraqueche (WIPO).", tags: ["Legislação Internacional", "Convenção ONU", "Marraqueche"] },
      { id: 41, name: "Legislação brasileira", slug: "legislacao-brasileira", desc: "Constituição/88, LDB, LBI/Estatuto Lei 13.146, Lei Visão Monocular e Lei Bengala Verde.", tags: ["LBI", "Estatuto PcD", "Legislação Brasil"] },
      { id: 42, name: "Movimento social", slug: "movimento-social", desc: "Associações autônomas de cegos, ONCB, protagonismo político e 'Nada Sobre Nós, Sem Nós'.", tags: ["Movimento Social", "ONCB", "Protagonismo"] },
      { id: 43, name: "Capacitismo", slug: "capacitismo", desc: "Combate ao capacitismo estrutural, institucional, atitudinal, linguístico e Inspiration Porn.", tags: ["Capacitismo", "Inspiration Porn", "Direitos Civis"] }
    ]
  },
  {
    category: "ESPORTE",
    icon: "activity",
    color: "yellow",
    modules: [
      { id: 44, name: "Esporte", slug: "esporte", desc: "História do esporte adaptado, Guttmann, IBSA, CPB e classificação médica B1, B2 e B3.", tags: ["Esporte Paralímpico", "IBSA", "Classificação"] },
      { id: 45, name: "Grandes esportes para pessoas cegas", slug: "grandes-esportes-para-pessoas-cegas", desc: "Estudo profundo: Goalball, Futebol de Cegos (Futebol de 5), Judô, Atletismo e Natação.", tags: ["Goalball", "Futebol de Cegos", "Judô"] },
      { id: 46, name: "Grandes competições", slug: "grandes-competicoes", desc: "Jogos Paralímpicos 1960–2026, IBSA World Games, Parapan e Paralimpíadas Escolares.", tags: ["Jogos Paralímpicos", "Parapan", "Competições"] },
      { id: 47, name: "Grandes atletas", slug: "grandes-atletas", desc: "Galeria de 15 ícones: Trischa Zorn, Antônio Tenório, Terezinha Guilhermina, Ricardinho, Mizael.", tags: ["Atletas", "Antônio Tenório", "Ricardinho"] },
      { id: 48, name: "Esporte, identidade e autonomia", slug: "esporte-identidade-e-autonomia", desc: "Psicologia do esporte, reconstrução do esquema corporal, autoeficácia e Role Models.", tags: ["Autoeficácia", "Role Models", "Reabilitação"] }
    ]
  },
  {
    category: "CULTURA E CONTEMPORANEIDADE",
    icon: "feather",
    color: "teal",
    modules: [
      { id: 49, name: "Cultura, lazer e arte", slug: "cultura-lazer-e-arte", desc: "Audiodescrição (AD), arte tátil em museus (Pinacoteca/Louvre), cordel Braille e música.", tags: ["Audiodescrição", "Arte Tátil", "Cultura"] },
      { id: 50, name: "Brasil contemporâneo", slug: "brasil-contemporaneo", desc: "Panorama 2026: IBC, MEC, CBB, ONCB, CPB, PNLD Acessível e transversalidade da inclusão.", tags: ["Brasil 2026", "IBC", "PNLD Acessível"] },
      { id: 51, name: "Nordeste", slug: "nordeste", desc: "Levantamento das 9 unidades federativas do Nordeste: instituições, CAPs e universidades.", tags: ["Nordeste", "CAPs", "Universidades"] },
      { id: 52, name: "Pernambuco", slug: "pernambuco", desc: "História 1935, Instituto de Cegos do Recife, CAP/PE, FAV, UFPE, UPE e vírus Zika.", tags: ["Pernambuco", "Recife", "FAV"] },
      { id: 53, name: "Recife", slug: "recife", desc: "Serviços municipais, AEE, Setor Braille da Biblioteca Pública do Estado (BPEP) e rotas acessíveis.", tags: ["Recife", "BPEP", "Acessibilidade Urbana"] },
      { id: 54, name: "Interior de Pernambuco", slug: "interior-de-pernambuco", desc: "Cidades polo (Caruaru, Garanhuns, Petrolina, Arcoverde, Serra Talhada) e transparência de dados.", tags: ["Interior PE", "Sertão", "Agreste"] },
      { id: 55, name: "Caruaru e Agreste", slug: "caruaru-e-agreste", desc: "Estudo de caso: AEE municipal/estadual, UFPE CAA/Caruaru, UPE e artesanato tátil do barro.", tags: ["Caruaru", "Agreste", "Alto do Moura"] }
    ]
  },
  {
    category: "PESQUISA E INOVAÇÃO",
    icon: "microscope",
    color: "cyan",
    modules: [
      { id: 56, name: "Tecnologia assistiva brasileira", slug: "tecnologia-assistiva-brasileira", desc: "Histórico de inovações nacionais: DOSVOX, MusiBRAILLE, Reglete Positiva TECE.", tags: ["TA Brasil", "DOSVOX", "Inovação"] },
      { id: 57, name: "Pesquisa científica", slug: "pesquisa-cientifica", desc: "Metodologia qualitativa, quantitativa, ensaios, ética CEP/CONEP e TCLE Acessível.", tags: ["Pesquisa Científica", "Ética", "CEP/CONEP"] },
      { id: 58, name: "Grandes questões de pesquisa", slug: "grandes-questoes-de-pesquisa", desc: "15 projetos estruturados de pesquisa acadêmica com problemas, hipóteses e metodologias.", tags: ["Projetos", "Pesquisa", "Hipóteses"] },
      { id: 59, name: "Linha do tempo", slug: "linha-do-tempo-historica", desc: "Consolidação dos 100 acontecimentos mais importantes de 1809 a 2026.", tags: ["Linha do Tempo", "História", "1809-2026"] },
      { id: 60, name: "Mapa final do conhecimento", slug: "mapa-final-do-conhecimento", desc: "Árvore hierárquica e conceitual completa de todo o conhecimento da enciclopédia.", tags: ["Mapa do Conhecimento", "Enciclopédia", "Síntese"] }
    ]
  }
];

// Helper to extract module text section from docs
const docsFiles = [
  '01_MODULOS_01_A_10_HISTORIA_E_CONCEITOS.md',
  '02_MODULOS_11_A_20_NEUROPSICOLOGIA_E_ALFABETIZACAO.md',
  '03_MODULOS_21_A_30_ESTUDO_TECE_TECNOLOGIA_E_VIDA_INDEPENDENTE.md',
  '04_MODULOS_31_A_40_INCLUSAO_DIREITOS_E_INTELIGENCIA_ARTIFICIAL.md',
  '05_MODULOS_41_A_50_LEGISLAÇÃO_ESPORTE_PARALIMPICO_E_ARTE.md',
  '06_MODULOS_51_A_60_NORDESTE_PERNAMBUCO_PESQUISA_E_MAPAS.md',
  '07_SINTESES_FINAIS_LINHAS_DO_TEMPO_TOP100_GLOSSARIO_E_PROPOSTAS.md'
];

const fileContents = docsFiles.map(f => fs.readFileSync(path.join(docsDir, f), 'utf8'));

// Build all modules array
const allModules = [];

categoryMap.forEach(cat => {
  cat.modules.forEach(mod => {
    let rawContent = "";
    // Search raw content in docs
    const targetHeader1 = `## ${mod.id < 10 ? '0' + mod.id : mod.id} — `;
    const targetHeader2 = `## ${mod.id} — `;
    
    fileContents.forEach(fc => {
      if (fc.includes(targetHeader1) || fc.includes(targetHeader2)) {
        const parts = fc.split(/## \d+ — /);
        parts.forEach(p => {
          if (p.toLowerCase().startsWith(mod.name.toLowerCase()) || p.startsWith(`${mod.id} `) || p.startsWith(`0${mod.id} `)) {
            rawContent = "## " + p;
          }
        });
      }
    });

    if (!rawContent) {
      // Fallback if synth volume
      if (mod.id === 59 || mod.id === 60) {
        rawContent = fileContents[5]; // Volume 6
      }
    }

    // Determine related modules (3 to 5 related)
    const relatedIds = [];
    if (mod.id > 1) relatedIds.push(mod.id - 1);
    if (mod.id < 60) relatedIds.push(mod.id + 1);
    if (mod.id + 5 <= 60) relatedIds.push(mod.id + 5);
    if (mod.id - 5 >= 1) relatedIds.push(mod.id - 5);

    allModules.push({
      id: mod.id,
      number: mod.id < 10 ? `0${mod.id}` : `${mod.id}`,
      name: mod.name,
      slug: mod.slug,
      category: cat.category,
      categoryColor: cat.color,
      icon: cat.icon,
      desc: mod.desc,
      topicCount: 14,
      tags: mod.tags,
      relatedIds: Array.from(new Set(relatedIds)).slice(0, 4),
      content: rawContent || `## ${mod.name}\n\nConteúdo completo do Módulo ${mod.id}.`
    });
  });
});

const dataset = {
  categories: categoryMap,
  modules: allModules,
  volumes: docsFiles.map((f, i) => ({ id: i + 1, filename: f }))
};

fs.writeFileSync(path.join(dataDir, 'modules-db.json'), JSON.stringify(dataset, null, 2), 'utf8');
console.log(`Successfully generated data/modules-db.json with ${allModules.length} modules across ${categoryMap.length} categories.`);
