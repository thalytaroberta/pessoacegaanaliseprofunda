const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 60 Module Titles & Categories Mapping
const modulesCatalog = [
  // Volume 1: Módulos 01 a 10
  { id: 1, number: "01", title: "A Pessoa Antes da Deficiência", category: "História e Conceitos", vol: 1, slug: "01-a-pessoa-antes-da-deficiencia" },
  { id: 2, number: "02", title: "Conceitos e Classificações da Deficiência Visual", category: "História e Conceitos", vol: 1, slug: "02-conceitos-e-classificacoes" },
  { id: 3, number: "03", title: "História da Deficiência Visual", category: "História e Conceitos", vol: 1, slug: "03-historia-da-deficiencia-visual" },
  { id: 4, number: "04", title: "História da Educação de Pessoas Cegas", category: "História e Conceitos", vol: 1, slug: "04-historia-da-educacao-de-cegos" },
  { id: 5, number: "05", title: "Charles Barbier e a Escrita Noturna", category: "História e Conceitos", vol: 1, slug: "05-charles-barbier-e-a-escrita-noturna" },
  { id: 6, number: "06", title: "Louis Braille", category: "História e Conceitos", vol: 1, slug: "06-louis-braille" },
  { id: 7, number: "07", title: "O Sistema Braille", category: "História e Conceitos", vol: 1, slug: "07-o-sistema-braille" },
  { id: 8, number: "08", title: "Internacionalização do Braille", category: "História e Conceitos", vol: 1, slug: "08-internacionalizacao-do-braille" },
  { id: 9, number: "09", title: "História do Braille no Brasil", category: "História e Conceitos", vol: 1, slug: "09-historia-do-braille-no-brasil" },
  { id: 10, number: "10", title: "Padronização do Braille Brasileiro", category: "História e Conceitos", vol: 1, slug: "10-padronizacao-do-braille-brasileiro" },

  // Volume 2: Módulos 11 a 20
  { id: 11, number: "11", title: "Psicologia e Experiência da Cegueira", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "11-psicologia-e-experiencia-da-cegueira" },
  { id: 12, number: "12", title: "A Pessoa por trás da Deficiência", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "12-a-pessoa-por-tras-da-deficiencia" },
  { id: 13, number: "13", title: "Desenvolvimento Infantil e Cognição", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "13-desenvolvimento-infantil-e-cognicao" },
  { id: 14, number: "14", title: "Neurociência da Deficiência Visual", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "14-neurociencia-da-deficiencia-visual" },
  { id: 15, number: "15", title: "Pré-Braille", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "15-pre-braille" },
  { id: 16, number: "16", title: "Modelos e Métodos Pedagógicos de Ensino do Braille", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "16-modelos-e-metodos-pedagogicos" },
  { id: 17, number: "17", title: "Expanded Core Curriculum — ECC", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "17-expanded-core-curriculum-ecc" },
  { id: 18, number: "18", title: "Modelo Integrado de Educação e Autonomia", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "18-modelo-integrado-de-educacao-e-autonomia" },
  { id: 19, number: "19", title: "Alfabetização Braille", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "19-alfabetizacao-braille" },
  { id: 20, number: "20", title: "Reglete, Punção e Instrumentos Tradicionais", category: "Neuropsicologia e Alfabetização", vol: 2, slug: "20-reglete-puncao-e-instrumentos-tradicionais" },

  // Volume 3: Módulos 21 a 30
  { id: 21, number: "21", title: "TECE e Aline Picolli Otalara", category: "Estudo TECE e Vida Independente", vol: 3, slug: "21-tece-e-aline-picolli-otalara" },
  { id: 22, number: "22", title: "A Reglete Positiva", category: "Estudo TECE e Vida Independente", vol: 3, slug: "22-a-reglete-positiva" },
  { id: 23, number: "23", title: "Máquina de Escrever Braille de Baixo Custo", category: "Estudo TECE e Vida Independente", vol: 3, slug: "23-maquina-de-escrever-braille-de-baixo-custo" },
  { id: 24, number: "24", title: "Tecnologia Assistiva", category: "Estudo TECE e Vida Independente", vol: 3, slug: "24-tecnologia-assistiva" },
  { id: 25, number: "25", title: "Matemática, Soroban e Ciências", category: "Estudo TECE e Vida Independente", vol: 3, slug: "25-matematica-soroban-e-ciencias" },
  { id: 26, number: "26", title: "Mapas, Gráficos e Representações Táteis", category: "Estudo TECE e Vida Independente", vol: 3, slug: "26-mapas-graficos-e-representacoes-tateis" },
  { id: 27, number: "27", title: "Musicografia Braille", category: "Estudo TECE e Vida Independente", vol: 3, slug: "27-musicografia-braille" },
  { id: 28, number: "28", title: "Orientação e Mobilidade", category: "Estudo TECE e Vida Independente", vol: 3, slug: "28-orientacao-e-mobilidade" },
  { id: 29, number: "29", title: "A Bengala e sua Aceitação", category: "Estudo TECE e Vida Independente", vol: 3, slug: "29-a-bengala-e-sua-aceitacao" },
  { id: 30, number: "30", title: "Vida Independente", category: "Estudo TECE e Vida Independente", vol: 3, slug: "30-vida-independente" },

  // Volume 4: Módulos 31 a 40
  { id: 31, number: "31", title: "Cozinha e Atividades da Vida Diária", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "31-cozinha-e-atividades-da-vida-diaria" },
  { id: 32, number: "32", title: "Cão-Guia", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "32-cao-guia" },
  { id: 33, number: "33", title: "Animais de Companhia e Apoio Emocional", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "33-animais-de-companhia-e-apoio-emocional" },
  { id: 34, number: "34", title: "Família e Deficiência Visual", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "34-familia-e-deficiencia-visual" },
  { id: 35, number: "35", title: "Educação Especial e AEE", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "35-educacao-especial-e-aee" },
  { id: 36, number: "36", title: "Acessibilidade", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "36-acessibilidade" },
  { id: 37, number: "37", title: "Informática e Braille Digital", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "37-informatica-e-braille-digital" },
  { id: 38, number: "38", title: "Inteligência Artificial e Deficiência Visual", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "38-inteligencia-artificial-e-deficiencia-visual" },
  { id: 39, number: "39", title: "Direitos Humanos e Modelos da Deficiência", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "39-direitos-humanos-e-modelos-da-deficiencia" },
  { id: 40, number: "40", title: "Legislação Internacional", category: "Inclusão, Direitos e Inteligência Artificial", vol: 4, slug: "40-legislacao-internacional" },

  // Volume 5: Módulos 41 a 50
  { id: 41, number: "41", title: "Legislação Brasileira", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "41-legislacao-brasileira" },
  { id: 42, number: "42", title: "Movimento Social das Pessoas Cegas", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "42-movimento-social-das-pessoas-cegas" },
  { id: 43, number: "43", title: "Capacitismo", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "43-capacitismo" },
  { id: 44, number: "44", title: "Esporte para Pessoas Cegas", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "44-esporte-para-pessoas-cegas" },
  { id: 45, number: "45", title: "Grandes Esportes", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "45-grandes-esportes" },
  { id: 46, number: "46", title: "Grandes Competições", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "46-grandes-competicoes" },
  { id: 47, number: "47", title: "Grandes Atletas Cegos", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "47-grandes-atletas-cegos" },
  { id: 48, number: "48", title: "Esporte, Identidade e Autonomia", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "48-esporte-identidade-e-autonomia" },
  { id: 49, number: "49", title: "Cultura, Lazer e Arte", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "49-cultura-lazer-e-arte" },
  { id: 50, number: "50", title: "Brasil Contemporâneo", category: "Legislação, Esporte Paralímpico e Arte", vol: 5, slug: "50-brasil-contemporaneo" },

  // Volume 6: Módulos 51 a 60
  { id: 51, number: "51", title: "Nordeste", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "51-nordeste" },
  { id: 52, number: "52", title: "Pernambuco", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "52-pernambuco" },
  { id: 53, number: "53", title: "Recife", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "53-recife" },
  { id: 54, number: "54", title: "Interior de Pernambuco", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "54-interior-de-pernambuco" },
  { id: 55, number: "55", title: "Caruaru e Agreste", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "55-caruaru-e-agreste" },
  { id: 56, number: "56", title: "Tecnologia Assistiva Produzida no Brasil", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "56-tecnologia-assistiva-produzida-no-brasil" },
  { id: 57, number: "57", title: "Pesquisa Científica", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "57-pesquisa-cientifica" },
  { id: 58, number: "58", title: "Grandes Questões de Pesquisa", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "58-grandes-questoes-de-pesquisa" },
  { id: 59, number: "59", title: "Linha do Tempo Final Consolidada", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "59-linha-do-tempo-final-consolidada" },
  { id: 60, number: "60", title: "Mapa Final do Conhecimento", category: "Nordeste, Pernambuco e Pesquisa", vol: 6, slug: "60-mapa-final-do-conhecimento" }
];

const docsFiles = [
  '01_MODULOS_01_A_10_HISTORIA_E_CONCEITOS.md',
  '02_MODULOS_11_A_20_NEUROPSICOLOGIA_E_ALFABETIZACAO.md',
  '03_MODULOS_21_A_30_ESTUDO_TECE_TECNOLOGIA_E_VIDA_INDEPENDENTE.md',
  '04_MODULOS_31_A_40_INCLUSAO_DIREITOS_E_INTELIGENCIA_ARTIFICIAL.md',
  '05_MODULOS_41_A_50_LEGISLAÇÃO_ESPORTE_PARALIMPICO_E_ARTE.md',
  '06_MODULOS_51_A_60_NORDESTE_PERNAMBUCO_PESQUISA_E_MAPAS.md',
  '07_SINTESES_FINAIS_LINHAS_DO_TEMPO_TOP100_GLOSSARIO_E_PROPOSTAS.md'
];

const docTexts = docsFiles.map(file => {
  return fs.readFileSync(path.join(docsDir, file), 'utf8');
});

// Standard 14 topics per module
const standardTopics = [
  "Contexto",
  "História",
  "Conceitos fundamentais",
  "Principais pessoas",
  "Principais instituições",
  "Desenvolvimento internacional",
  "Desenvolvimento brasileiro",
  "Desenvolvimento no Nordeste",
  "Pernambuco",
  "Situação atual (até 2026)",
  "Controvérsias e debates",
  "Lacunas de pesquisa",
  "Conceitos que conectam este tópico a outros",
  "Referências do tópico"
];

const compiledModules = modulesCatalog.map(item => {
  const fileText = docTexts[item.vol - 1] || docTexts[0];
  
  // Extract module block from docText
  let moduleMarkdown = "";
  const headerRegex = new RegExp(`## (?:MÓDULO |MODULO )?0?${item.id} — [^\\n]+`, 'i');
  const match = fileText.match(headerRegex);

  if (match) {
    const startIndex = match.index;
    const restText = fileText.slice(startIndex + match[0].length);
    const nextMatch = restText.match(/## (?:MÓDULO |MODULO )?\d+ — /i);
    if (nextMatch) {
      moduleMarkdown = fileText.slice(startIndex, startIndex + match[0].length + nextMatch.index);
    } else {
      moduleMarkdown = fileText.slice(startIndex);
    }
  } else {
    moduleMarkdown = `## Módulo ${item.number} — ${item.title}\n\nTexto acadêmico detalhado do Módulo ${item.number}.`;
  }

  // Embed anchor IDs in all ### 1. Contexto ... ### 14. Referências headings inside moduleMarkdown
  standardTopics.forEach((topicName, idx) => {
    const topicNum = idx + 1;
    const anchorId = `topico-${item.id}-${topicNum}`;
    
    // Replace ### 1. Contexto or ### 01. Contexto or ### Contexto with anchor ID HTML
    const subtopicRegex = new RegExp(`### (?:${topicNum}\\.|0${topicNum}\\.)?\\s*${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
    moduleMarkdown = moduleMarkdown.replace(subtopicRegex, `<h3 id="${anchorId}" class="scroll-mt-24 text-indigo-400 font-heading font-bold text-xl mt-8 mb-3 pb-1 border-b border-slate-800">${topicNum}. ${topicName}</h3>`);
  });

  // Parse topics list with anchors
  const topics = standardTopics.map((topicName, idx) => ({
    id: idx + 1,
    title: `${idx + 1}. ${topicName}`,
    anchor: `topico-${item.id}-${idx + 1}`
  }));

  // Summary preview
  const lines = moduleMarkdown.split('\n').map(l => l.trim());
  let firstParagraph = "";
  for (let l of lines) {
    if (l.length > 40 && !l.startsWith('<') && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('|')) {
      firstParagraph = l;
      break;
    }
  }
  if (!firstParagraph) {
    firstParagraph = `Estudo acadêmico aprofundado sobre ${item.title} no contexto internacional, brasileiro e pernambucano.`;
  }

  return {
    id: item.id,
    number: item.number,
    title: item.title,
    category: item.category,
    vol: item.vol,
    slug: item.slug,
    summary: firstParagraph.replace(/\*\*/g, '').trim(),
    topics: topics,
    markdown: moduleMarkdown
  };
});

// Syntheses document (Volume 7)
const synthesesMarkdown = docTexts[6] || "";

const fullEncyclopediaDB = {
  project: "PESSOA CEGA: ANÁLISE PROFUNDA",
  subtitle: "Pesquisa Acadêmica, Histórica, Científica e Documental sobre a Deficiência Visual",
  totalModules: compiledModules.length,
  modules: compiledModules,
  syntheses: synthesesMarkdown
};

fs.writeFileSync(path.join(dataDir, 'encyclopedia-db.json'), JSON.stringify(fullEncyclopediaDB, null, 2), 'utf8');
console.log(`Successfully generated data/encyclopedia-db.json with ${compiledModules.length} modules and embedded topic anchors!`);
