// EduBraille - Enciclopédia Interativa sobre Deficiência Visual (App Logic)

let appData = {
  categories: [],
  modules: [],
  volumes: []
};

let activeFilterMode = 'modules'; // 'modules', 'timeline', 'theme'
let selectedThemeFilter = 'all';
let gameActiveState = null;

// LocalStorage Keys
const STORAGE_VISITED = 'edubraille_visited_slugs';
const STORAGE_LAST_VISITED = 'edubraille_last_visited_slug';
const STORAGE_FAVORITES = 'edubraille_favorite_slugs';

// Braille Unicode Mapping Dictionary (Letters a-z, numbers)
const brailleMap = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠞', 's': '⠱', 't': '⠞',
  'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  '0': '⠼⠚', '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊'
};

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  initGlobalEvents();
});

async function initApp() {
  try {
    const res = await fetch('data/modules-db.json');
    appData = await res.json();
    
    // Hash routing
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

  } catch (err) {
    console.error('Erro ao carregar banco de dados de módulos:', err);
    document.getElementById('main-content').innerHTML = `
      <div class="p-6 bg-red-950/60 border border-red-800 rounded-2xl text-red-300">
        <h2 class="font-heading font-bold text-xl mb-2">Erro ao inicializar o EduBraille</h2>
        <p class="text-sm">Certifique-se de que o arquivo <code>data/modules-db.json</code> está presente.</p>
      </div>
    `;
  }
}

// Router
function handleRoute() {
  const hash = window.location.hash || '#/';
  
  if (hash.startsWith('#/pesquisa/')) {
    const slug = hash.replace('#/pesquisa/', '');
    renderModuleView(slug);
  } else if (hash === '#/linha-do-tempo') {
    renderTimelineView();
  } else if (hash === '#/favoritos') {
    renderFavoritesView();
  } else if (hash === '#/jogos') {
    renderGamesView();
  } else {
    renderHomepageView();
  }

  // Update navigation active state
  updateNavActiveState(hash);
  window.scrollTo(0, 0);
}

function updateNavActiveState(hash) {
  const navHome = document.getElementById('nav-home');
  const navTimeline = document.getElementById('nav-timeline');
  const navFavorites = document.getElementById('nav-favorites');
  const navGames = document.getElementById('nav-games');

  [navHome, navTimeline, navFavorites, navGames].forEach(el => {
    if (el) el.classList.remove('bg-indigo-600', 'text-white');
  });

  if (hash.startsWith('#/pesquisa/')) {
    if (navHome) navHome.classList.add('text-white');
  } else if (hash === '#/linha-do-tempo') {
    if (navTimeline) navTimeline.classList.add('bg-indigo-600', 'text-white');
  } else if (hash === '#/favoritos') {
    if (navFavorites) navFavorites.classList.add('bg-indigo-600', 'text-white');
  } else if (hash === '#/jogos') {
    if (navGames) navGames.classList.add('bg-indigo-600', 'text-white');
  } else {
    if (navHome) navHome.classList.add('bg-indigo-600', 'text-white');
  }
}

// Storage Helpers
function getVisitedSlugs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_VISITED)) || [];
  } catch (e) {
    return [];
  }
}

function recordVisitedSlug(slug) {
  const visited = getVisitedSlugs();
  if (!visited.includes(slug)) {
    visited.push(slug);
    localStorage.setItem(STORAGE_VISITED, JSON.stringify(visited));
  }
  localStorage.setItem(STORAGE_LAST_VISITED, slug);
}

function getLastVisitedSlug() {
  return localStorage.getItem(STORAGE_LAST_VISITED) || null;
}

function getFavoriteSlugs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FAVORITES)) || [];
  } catch (e) {
    return [];
  }
}

function toggleFavoriteSlug(slug) {
  let favs = getFavoriteSlugs();
  if (favs.includes(slug)) {
    favs = favs.filter(s => s !== slug);
  } else {
    favs.push(slug);
  }
  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favs));
  return favs.includes(slug);
}

// ==========================================
// 1. HOMEPAGE VIEW (MODULE MAP & MODES)
// ==========================================
function renderHomepageView() {
  const mainContent = document.getElementById('main-content');
  const visited = getVisitedSlugs();
  const lastVisitedSlug = getLastVisitedSlug();
  const lastVisitedMod = lastVisitedSlug ? appData.modules.find(m => m.slug === lastVisitedSlug) : null;

  mainContent.innerHTML = `
    <!-- HERO HEADER -->
    <div class="mb-10 text-center space-y-4">
      <div class="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold px-3 py-1 rounded-full">
        <span>EDUBRAILLE</span> • <span>É DE PERNAMBUCO</span>
      </div>
      <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
        Uma enciclopédia interativa sobre deficiência visual, Braille, educação, autonomia, tecnologia, esporte e inclusão.
      </h1>
      <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
        Explore os 60 Módulos de pesquisa acadêmica, científica e histórica divididos em 10 grandes áreas de conhecimento.
      </p>

      <!-- PROGRESS TRACKER & LAST VISITED BANNER -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 flex items-center gap-2">
          <i data-lucide="compass" class="w-4 h-4 text-emerald-400"></i>
          <span>Progresso da Pesquisa: <strong class="text-white">${visited.length} de 60 Módulos explorados</strong></span>
        </div>

        ${lastVisitedMod ? `
          <a href="#/pesquisa/${lastVisitedMod.slug}" class="bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <i data-lucide="history" class="w-4 h-4 text-indigo-400"></i>
            <span>Continuar pesquisando: <strong>${lastVisitedMod.name}</strong></span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        ` : ''}
      </div>
    </div>

    <!-- DYNAMIC SYSTEM NAVIGATION MODE SELECTOR (3 FORMS) -->
    <div class="mb-10 flex flex-wrap items-center justify-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl max-w-2xl mx-auto">
      <button onclick="setFilterMode('modules')" id="btn-mode-modules" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeFilterMode === 'modules' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
        <i data-lucide="grid" class="w-4 h-4 inline mr-1.5"></i> Explorar por Módulos
      </button>
      <button onclick="setFilterMode('timeline')" id="btn-mode-timeline" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeFilterMode === 'timeline' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
        <i data-lucide="clock" class="w-4 h-4 inline mr-1.5"></i> Linha do Tempo
      </button>
      <button onclick="setFilterMode('theme')" id="btn-mode-theme" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeFilterMode === 'theme' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
        <i data-lucide="filter" class="w-4 h-4 inline mr-1.5"></i> Explorar por Tema
      </button>
    </div>

    <!-- CONTENT DISPLAY AREA ACCORDING TO ACTIVE MODE -->
    <div id="homepage-mode-content">
      <!-- Mode content dynamically injected -->
    </div>
  `;

  renderHomepageModeContent();
  if (window.lucide) lucide.createIcons();
}

function setFilterMode(mode) {
  activeFilterMode = mode;
  renderHomepageView();
}

function renderHomepageModeContent() {
  const container = document.getElementById('homepage-mode-content');
  if (!container) return;

  if (activeFilterMode === 'modules') {
    // Mode 1: Categories Grid with Cards
    container.innerHTML = appData.categories.map(cat => `
      <section class="mb-12">
        <div class="flex items-center gap-3 mb-6 pb-2 border-b border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <i data-lucide="${cat.icon || 'book-open'}" class="w-4 h-4"></i>
          </div>
          <h2 class="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">${cat.category}</h2>
          <span class="text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">${cat.modules.length} Módulos</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          ${cat.modules.map(m => renderModuleCard(m.id)).join('')}
        </div>
      </section>
    `).join('');

  } else if (activeFilterMode === 'timeline') {
    // Mode 2: Timeline Summary
    renderTimelineViewInline(container);

  } else if (activeFilterMode === 'theme') {
    // Mode 3: Theme Filters
    const themes = [
      { id: 'all', label: 'Todos os Temas' },
      { id: 'Braille', label: 'Braille' },
      { id: 'História', label: 'História' },
      { id: 'Educação', label: 'Educação' },
      { id: 'Psicologia', label: 'Psicologia' },
      { id: 'Autonomia', label: 'Autonomia' },
      { id: 'Tecnologia', label: 'Tecnologia' },
      { id: 'IA', label: 'Inteligência Artificial' },
      { id: 'Esporte', label: 'Esporte' },
      { id: 'Direitos', label: 'Direitos' },
      { id: 'Cultura', label: 'Cultura' },
      { id: 'Pernambuco', label: 'Pernambuco' }
    ];

    const filteredMods = selectedThemeFilter === 'all' 
      ? appData.modules 
      : appData.modules.filter(m => m.tags.includes(selectedThemeFilter) || m.name.toLowerCase().includes(selectedThemeFilter.toLowerCase()) || m.desc.toLowerCase().includes(selectedThemeFilter.toLowerCase()));

    container.innerHTML = `
      <div class="mb-8">
        <div class="flex flex-wrap gap-2 justify-center mb-6">
          ${themes.map(t => `
            <button onclick="filterByTheme('${t.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${selectedThemeFilter === t.id ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}">
              ${t.label}
            </button>
          `).join('')}
        </div>
        <div class="text-xs text-slate-400 text-center mb-6">
          Exibindo ${filteredMods.length} de 60 Módulos para o tema selecionado
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          ${filteredMods.map(m => renderModuleCard(m.id)).join('')}
        </div>
      </div>
    `;
  }
  if (window.lucide) lucide.createIcons();
}

function filterByTheme(themeId) {
  selectedThemeFilter = themeId;
  renderHomepageModeContent();
}

function renderModuleCard(moduleId) {
  const mod = appData.modules.find(m => m.id === moduleId);
  if (!mod) return '';

  const visited = getVisitedSlugs().includes(mod.slug);
  const favs = getFavoriteSlugs().includes(mod.slug);

  return `
    <div class="module-card bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between group shadow-lg">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
            Módulo ${mod.number}
          </span>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            ${visited ? `<span class="text-emerald-400 font-medium text-[11px] flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Visto</span>` : ''}
            ${favs ? `<i data-lucide="star" class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></i>` : ''}
          </div>
        </div>

        <h3 class="font-heading font-bold text-base text-white group-hover:text-indigo-300 transition-colors leading-snug">
          ${mod.name}
        </h3>

        <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          ${mod.desc}
        </p>
      </div>

      <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <span class="text-[11px] text-slate-500 font-medium">~${mod.topicCount} tópicos</span>
        <a href="#/pesquisa/${mod.slug}" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1.5 py-0.5">
          Explorar <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    </div>
  `;
}

// ==========================================
// 2. MODULE DETAIL VIEW (#/pesquisa/:slug)
// ==========================================
function renderModuleView(slug) {
  const mainContent = document.getElementById('main-content');
  const mod = appData.modules.find(m => m.slug === slug);

  if (!mod) {
    mainContent.innerHTML = `
      <div class="p-8 text-center space-y-4">
        <h2 class="font-heading font-bold text-2xl text-white">Módulo não encontrado</h2>
        <p class="text-slate-400 text-sm">O módulo especificado na URL não existe no banco de dados.</p>
        <a href="#/" class="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">Voltar aos Módulos</a>
      </div>
    `;
    return;
  }

  // Record history
  recordVisitedSlug(slug);

  const isFav = getFavoriteSlugs().includes(slug);
  const relatedModules = mod.relatedIds.map(id => appData.modules.find(m => m.id === id)).filter(Boolean);

  mainContent.innerHTML = `
    <!-- BREADCRUMB & BACK BUTTON -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <a href="#/" class="hover:text-white transition font-medium flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar aos módulos
        </a>
        <span>/</span>
        <span class="text-indigo-400 font-medium">${mod.category}</span>
        <span>/</span>
        <span class="text-slate-200 font-semibold truncate max-w-xs">Módulo ${mod.number}: ${mod.name}</span>
      </div>

      <!-- ACTION BUTTONS (FAVORITE & PDF) -->
      <div class="flex items-center gap-2">
        <button onclick="handleToggleFavorite('${mod.slug}')" id="btn-fav-toggle" class="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold ${isFav ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-300 hover:text-white'} flex items-center gap-1.5 transition">
          <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}"></i>
          <span>${isFav ? 'Favoritado' : 'Favoritar'}</span>
        </button>

        <button onclick="generateModulePDF()" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition">
          <i data-lucide="file-text" class="w-4 h-4 text-indigo-400"></i>
          <span>Gerar PDF / Imprimir</span>
        </button>
      </div>
    </div>

    <!-- MODULE HEADER -->
    <div class="mb-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 lg:p-8 space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md">
          Módulo ${mod.number} de 60
        </span>
        <span class="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
          ${mod.category}
        </span>
        <span class="text-xs text-slate-500">~14 Tópicos Acadêmicos</span>
      </div>

      <h1 class="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
        ${mod.name}
      </h1>

      <p class="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
        ${mod.desc}
      </p>
    </div>

    <!-- MARKDOWN CONTENT BODY -->
    <article class="markdown-body bg-slate-950 p-2 sm:p-4 rounded-2xl mb-12">
      ${marked.parse(mod.content)}
    </article>

    <!-- CONTINUE SUA PESQUISA (RELATED MODULES) -->
    <div class="pt-8 border-t border-slate-800 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-heading font-bold text-xl text-white">CONTINUE SUA PESQUISA</h3>
          <p class="text-xs text-slate-400">Módulos relacionados que complementam este estudo</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${relatedModules.map(rm => renderModuleCard(rm.id)).join('')}
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function handleToggleFavorite(slug) {
  const isFav = toggleFavoriteSlug(slug);
  const btn = document.getElementById('btn-fav-toggle');
  if (btn) {
    btn.className = `px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold ${isFav ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-300 hover:text-white'} flex items-center gap-1.5 transition`;
    btn.innerHTML = `<i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}"></i> <span>${isFav ? 'Favoritado' : 'Favoritar'}</span>`;
  }
  if (window.lucide) lucide.createIcons();
}

function generateModulePDF() {
  window.print();
}

// ==========================================
// 3. TIMELINE VIEW (#/linha-do-tempo)
// ==========================================
function renderTimelineView() {
  const mainContent = document.getElementById('main-content');
  renderTimelineViewInline(mainContent);
}

function renderTimelineViewInline(container) {
  const eras = [
    { era: "Antiguidade e Idade Média", period: "Pré-1784", desc: "Abandono, caridade e os primeiros abrigos asilares (Hôpital des Quinze-Vingts)." },
    { era: "Séculos XVIII e XIX", period: "1784 – 1820", desc: "Valentin Haüy, INJA em Paris (1784) e as primeiras impressões em relevo linear." },
    { era: "Invenção do Braille", period: "1824 – 1837", desc: "Louis Braille cria a cela de 6 pontos (1824) e publica o código oficial (1829/1837)." },
    { era: "Expansão no Brasil", period: "1850 – 1854", desc: "José Álvares de Azevedo traz o Braille para o Brasil; D. Pedro II funda o Imperial Instituto (1854)." },
    { era: "Profissionalização", period: "1940 – 1970", desc: "Invenção da técnica Hoover (1944), Goalball (1946), Perkins Brailler (1951) e Soroban." },
    { era: "Tecnologia e Direitos", period: "1970 – 2000", desc: "Optacon, Kurzweil OCR, DOSVOX (1993), Declaração de Salamanca (1994), JAWS e NVDA." },
    { era: "Era Digital e Inteligência Artificial", period: "2006 – 2026", desc: "Convenção da ONU (2006), LBI (2015), Be My AI, GPT-4o e acessibilidade digital WCAG 2.2." }
  ];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center space-y-2">
        <h1 class="font-heading font-extrabold text-3xl text-white">Linha do Tempo da Deficiência Visual</h1>
        <p class="text-sm text-slate-400">Evolução histórica da emancipação, escrita tátil, direitos e tecnologia de 1800 a 2026.</p>
      </div>

      <div class="relative border-l-2 border-indigo-500/30 ml-4 sm:ml-8 space-y-8 py-4">
        ${eras.map((e, idx) => `
          <div class="relative pl-6 sm:pl-8 group">
            <div class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:bg-indigo-500 transition"></div>
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-indigo-500/40 transition">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-xs font-bold text-indigo-400">${e.period}</span>
                <span class="text-[11px] text-slate-500">Etapa ${idx + 1} de 7</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-white">${e.era}</h3>
              <p class="text-xs sm:text-sm text-slate-300">${e.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="text-center pt-4">
        <a href="#/pesquisa/linha-do-tempo-historica" class="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition">
          Ver Tabela Consolidada com os 100 Acontecimentos <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 4. FAVORITES VIEW (#/favoritos)
// ==========================================
function renderFavoritesView() {
  const mainContent = document.getElementById('main-content');
  const favSlugs = getFavoriteSlugs();
  const favMods = favSlugs.map(s => appData.modules.find(m => m.slug === s)).filter(Boolean);

  mainContent.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 class="font-heading font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
            <i data-lucide="star" class="w-6 h-6 text-amber-400 fill-amber-400"></i> Meus Módulos Favoritos
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Módulos marcados por você para consulta rápida (salvo no navegador)</p>
        </div>
        <span class="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          ${favMods.length} Módulos
        </span>
      </div>

      ${favMods.length === 0 ? `
        <div class="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <i data-lucide="star" class="w-10 h-10 text-slate-600 mx-auto"></i>
          <h3 class="font-heading font-bold text-lg text-white">Nenhum módulo favoritado ainda</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">Ao navegar pelos módulos da enciclopédia, clique no botão "☆ Favoritar" para salvá-los aqui.</p>
          <a href="#/" class="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">Explorar Módulos</a>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          ${favMods.map(m => renderModuleCard(m.id)).join('')}
        </div>
      `}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 5. GAMES AREA (#/jogos)
// ==========================================
function renderGamesView() {
  const mainContent = document.getElementById('main-content');

  mainContent.innerHTML = `
    <div class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full">
          <i data-lucide="gamepad-2" class="w-3.5 h-3.5"></i> JOGOS EDUBRAILLE
        </div>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Aprendizagem Interativa e Desafios Tátil-Braille
        </h1>
        <p class="text-sm text-slate-400">
          Aprenda e fixe o código Braille e os conceitos de acessibilidade de forma lúdica e interativa.
        </p>
      </div>

      <!-- GAME TABS SELECTOR -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        
        <!-- Game 1 Card -->
        <button onclick="startBrailleChallengeGame()" class="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-left space-y-3 group transition shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
            ⠃
          </div>
          <h3 class="font-heading font-bold text-lg text-white group-hover:text-indigo-300">Desafio Célula Braille</h3>
          <p class="text-xs text-slate-400">Identifique os pontos corretos das letras e números da cela Braille.</p>
          <span class="inline-block text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">Jogar Agora →</span>
        </button>

        <!-- Game 2 Card -->
        <button onclick="startBrailleMemoryGame()" class="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-left space-y-3 group transition shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <i data-lucide="grid" class="w-5 h-5"></i>
          </div>
          <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-300">Memória Braille</h3>
          <p class="text-xs text-slate-400">Encontre os pares entre a letra em tinta e o glifo tátil Braille.</p>
          <span class="inline-block text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">Jogar Agora →</span>
        </button>

        <!-- Game 3 Card -->
        <button onclick="startAccessibilityQuizGame()" class="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 text-left space-y-3 group transition shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
          <div class="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <i data-lucide="help-circle" class="w-5 h-5"></i>
          </div>
          <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-300">Quiz Enciclopédico</h3>
          <p class="text-xs text-slate-400">Teste seus conhecimentos sobre a história, leis e esportes para cegos.</p>
          <span class="inline-block text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">Jogar Agora →</span>
        </button>

      </div>

      <!-- ACTIVE GAME BOARD DISPLAY CONTAINER -->
      <div id="game-board-container" class="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 hidden">
        <!-- Active Game Layout Injected -->
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// GAME 1: Desafio Célula Braille
function startBrailleChallengeGame() {
  const container = document.getElementById('game-board-container');
  container.classList.remove('hidden');

  const questions = [
    { letter: 'A', braille: '⠁', options: ['⠁', '⠃', '⠉', '⠙'], correct: 0 },
    { letter: 'B', braille: '⠃', options: ['⠁', '⠃', '⠑', '⠋'], correct: 1 },
    { letter: 'C', braille: '⠉', options: ['⠉', '⠙', '⠑', '⠋'], correct: 0 },
    { letter: 'L', braille: '⠇', options: ['⠇', '⠍', '⠝', '⠕'], correct: 0 },
    { letter: 'M', braille: '⠍', options: ['⠇', '⠍', '⠏', '⠟'], correct: 1 }
  ];

  let currentQ = 0;
  let score = 0;

  function renderQ() {
    if (currentQ >= questions.length) {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <h3 class="font-heading font-bold text-2xl text-emerald-400">Parabéns! Desafio Concluído!</h3>
          <p class="text-sm text-slate-300">Você acertou ${score} de ${questions.length} questões do Desafio Célula Braille.</p>
          <button onclick="startBrailleChallengeGame()" class="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">Jogar Novamente</button>
        </div>
      `;
      return;
    }

    const q = questions[currentQ];
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <span class="text-xs font-bold text-indigo-400">Desafio Célula Braille • Questão ${currentQ + 1} de ${questions.length}</span>
          <span class="text-xs text-slate-400">Pontuação: ${score}</span>
        </div>

        <div class="text-center space-y-3">
          <span class="text-xs text-slate-400 uppercase font-semibold">Qual o símbolo Braille correto para a letra:</span>
          <div class="text-5xl font-heading font-extrabold text-white">${q.letter}</div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          ${q.options.map((opt, i) => `
            <button onclick="answerChallengeGame(${i}, ${q.correct})" class="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-6 rounded-xl text-4xl font-mono text-indigo-400 hover:text-white transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.answerChallengeGame = (selected, correct) => {
    if (selected === correct) score++;
    currentQ++;
    renderQ();
  };

  renderQ();
}

// GAME 2: Memória Braille
function startBrailleMemoryGame() {
  const container = document.getElementById('game-board-container');
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="text-center space-y-4">
      <h3 class="font-heading font-bold text-xl text-emerald-400">Jogo da Memória Braille</h3>
      <p class="text-xs text-slate-300">Encontre os pares correspondentes entre as letras em tinta e os caracteres Braille.</p>
      <div class="grid grid-cols-4 gap-3 max-w-md mx-auto pt-4" id="memory-cards-grid">
        <!-- Cards -->
      </div>
    </div>
  `;

  const pairs = [
    { id: 1, val: 'A', type: 'text' }, { id: 1, val: '⠁', type: 'braille' },
    { id: 2, val: 'B', type: 'text' }, { id: 2, val: '⠃', type: 'braille' },
    { id: 3, val: 'C', type: 'text' }, { id: 3, val: '⠉', type: 'braille' },
    { id: 4, val: 'E', type: 'text' }, { id: 4, val: '⠑', type: 'braille' }
  ].sort(() => Math.random() - 0.5);

  let flipped = [];
  let matched = [];

  const grid = document.getElementById('memory-cards-grid');
  grid.innerHTML = pairs.map((card, idx) => `
    <button onclick="flipMemoryCard(${idx})" id="mcard-${idx}" class="h-20 bg-slate-950 border border-slate-800 rounded-xl text-2xl font-bold text-transparent flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-emerald-500">
      ?
    </button>
  `).join('');

  window.flipMemoryCard = (idx) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;

    const btn = document.getElementById(`mcard-${idx}`);
    btn.innerText = pairs[idx].val;
    btn.className = 'h-20 bg-emerald-950 border border-emerald-500 rounded-xl text-2xl font-mono text-emerald-300 flex items-center justify-center shadow-lg';
    flipped.push(idx);

    if (flipped.length === 2) {
      const c1 = pairs[flipped[0]];
      const c2 = pairs[flipped[1]];

      if (c1.id === c2.id) {
        matched.push(flipped[0], flipped[1]);
        flipped = [];
        if (matched.length === pairs.length) {
          setTimeout(() => {
            alert('Parabéns! Você encontrou todos os pares Braille!');
          }, 300);
        }
      } else {
        setTimeout(() => {
          flipped.forEach(i => {
            const b = document.getElementById(`mcard-${i}`);
            b.innerText = '?';
            b.className = 'h-20 bg-slate-950 border border-slate-800 rounded-xl text-2xl font-bold text-slate-500 flex items-center justify-center';
          });
          flipped = [];
        }, 800);
      }
    }
  };
}

// GAME 3: Accessibility Quiz
function startAccessibilityQuizGame() {
  const container = document.getElementById('game-board-container');
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="space-y-6 text-center">
      <h3 class="font-heading font-bold text-xl text-amber-400">Quiz Enciclopédico de Acessibilidade</h3>
      <p class="text-xs text-slate-300">Quem criou o Sistema Braille no ano de 1824 em Paris?</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button onclick="alert('Incorreto! Valentin Haüy criou a primeira escola (INJA) em 1784.')" class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white hover:border-amber-500">Valentin Haüy</button>
        <button onclick="alert('Correto! Louis Braille inventou a cela de 6 pontos aos 15 anos em 1824.'); startAccessibilityQuizGame();" class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white hover:border-amber-500">Louis Braille</button>
        <button onclick="alert('Incorreto! Charles Barbier criou a Escrita Noturna militar.')" class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white hover:border-amber-500">Charles Barbier</button>
        <button onclick="alert('Incorreto! José Álvares de Azevedo trouxe o Braille para o Brasil em 1850.')" class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white hover:border-amber-500">José Álvares de Azevedo</button>
      </div>
    </div>
  `;
}

// ==========================================
// GLOBAL EVENTS & KEYBOARD SAFETY
// ==========================================
function initGlobalEvents() {
  // Global Search Inputs Setup
  setupSearchInput('global-search-input', 'search-dropdown');
  setupSearchInput('mobile-search-input', 'search-dropdown');

  // ESC Key closes search dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('search-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
    }
  });
}

function setupSearchInput(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  if (!input || !dropdown) return;

  // Typing event - NO preventDefault!
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = appData.modules.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.desc.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query) ||
      m.tags.some(t => t.toLowerCase().includes(query))
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-4 text-xs text-slate-400">Nenhum módulo encontrado para "${query}".</div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 8).map(m => `
        <a href="#/pesquisa/${m.slug}" onclick="document.getElementById('${dropdownId}').classList.add('hidden');" 
           class="block p-3 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 transition">
          <div class="text-[10px] text-indigo-400 font-bold uppercase">Módulo ${m.number} • ${m.category}</div>
          <div class="text-sm font-semibold text-white">${m.name}</div>
        </a>
      `).join('');
    }
    dropdown.classList.remove('hidden');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstMatch = dropdown.querySelector('a');
      if (firstMatch) {
        firstMatch.click();
      }
    }
  });
}
