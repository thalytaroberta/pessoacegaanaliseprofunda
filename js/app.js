// JavaScript Application Logic for Pessoa Cega: Análise Profunda

let db = {
  project: "",
  totalModules: 60,
  modules: [],
  syntheses: ""
};

let activeModuleId = 1;
let synth = window.speechSynthesis;
let utterance = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDatabase();
  initEvents();
});

async function loadDatabase() {
  try {
    const res = await fetch('data/encyclopedia-db.json');
    db = await res.json();
    
    renderSidebar();
    
    // Hash routing setup
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

  } catch (err) {
    console.error('Erro ao carregar banco de dados:', err);
    document.getElementById('main-reading-area').innerHTML = `
      <div class="p-6 bg-red-950/60 border border-red-800 rounded-2xl text-red-300">
        <h2 class="font-heading font-bold text-xl mb-2">Erro ao carregar o acervo acadêmico</h2>
        <p class="text-sm">Certifique-se de que o arquivo <code>data/encyclopedia-db.json</code> foi gerado.</p>
      </div>
    `;
  }
}

function handleRoute() {
  const hash = window.location.hash || '#/';

  if (hash.startsWith('#/modulo/')) {
    const target = hash.replace('#/modulo/', '');
    const mod = db.modules.find(m => m.id == target || m.slug === target || m.number === target);
    if (mod) {
      renderModuleReadingView(mod.id);
    } else {
      renderCatalogView();
    }
  } else if (hash === '#/sinteses') {
    renderSynthesesView();
  } else {
    renderCatalogView();
  }

  window.scrollTo(0, 0);
}

function renderSidebar() {
  const container = document.getElementById('sidebar-module-list');
  if (!container) return;

  container.innerHTML = db.modules.map(m => `
    <a href="#/modulo/${m.id}" onclick="renderModuleReadingView(${m.id})" 
       class="sidebar-mod-item block p-2 rounded-xl border border-transparent hover:bg-slate-800 hover:border-slate-700 transition ${m.id === activeModuleId ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-indigo-500/40' : 'text-slate-300'}">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Módulo ${m.number}</span>
        <span class="truncate text-xs">${m.title}</span>
      </div>
    </a>
  `).join('');

  // Sidebar Filter
  const filterInput = document.getElementById('sidebar-filter');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const items = container.querySelectorAll('.sidebar-mod-item');
      items.forEach(el => {
        const txt = el.innerText.toLowerCase();
        if (txt.includes(q)) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      });
    });
  }
}

// ==========================================
// 1. CATALOG VIEW (#/)
// ==========================================
function renderCatalogView() {
  const mainArea = document.getElementById('main-reading-area');
  
  // Group by categories
  const categories = {};
  db.modules.forEach(m => {
    if (!categories[m.category]) categories[m.category] = [];
    categories[m.category].push(m);
  });

  mainArea.innerHTML = `
    <div class="space-y-10">
      <!-- HERO BANNER -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-4 shadow-2xl">
        <div class="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold px-3 py-1 rounded-full">
          <span>PESSOA CEGA</span> • <span>ANÁLISE PROFUNDA</span>
        </div>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight max-w-4xl">
          Dossiê Acadêmico, Histórico e Científico sobre Deficiência Visual
        </h1>
        <p class="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Selecione qualquer um dos <strong>60 Módulos de Estudo</strong> abaixo para ler o material de pesquisa completo, incluindo contextos históricos, neurociência, pedagogia tátil, tecnologia assistiva, IA e Pernambuco.
        </p>
      </div>

      <!-- CATEGORIES AND MODULE CARDS -->
      ${Object.keys(categories).map(catName => `
        <section class="space-y-4">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <i data-lucide="book" class="w-5 h-5 text-indigo-400"></i>
            <h2 class="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">${catName}</h2>
            <span class="text-xs text-slate-500 font-medium bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">${categories[catName].length} Módulos</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${categories[catName].map(m => `
              <div onclick="window.location.hash='#/modulo/${m.id}'" class="cursor-pointer bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 shadow-lg flex flex-col justify-between group">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      Módulo ${m.number}
                    </span>
                    <span class="text-[11px] text-slate-500">14 Tópicos</span>
                  </div>

                  <h3 class="font-heading font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    ${m.title}
                  </h3>

                  <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    ${m.summary}
                  </p>
                </div>

                <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">Volume ${m.vol}</span>
                  <span class="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler Módulo Completo →
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 2. DETAILED MODULE READING VIEW (#/modulo/:id)
// ==========================================
function renderModuleReadingView(moduleId) {
  const mainArea = document.getElementById('main-reading-area');
  const mod = db.modules.find(m => m.id == moduleId);

  if (!mod) {
    mainArea.innerHTML = `<div class="p-8 text-white">Módulo ${moduleId} não encontrado.</div>`;
    return;
  }

  activeModuleId = mod.id;
  renderSidebar();

  // Find prev and next modules
  const prevMod = db.modules.find(m => m.id === mod.id - 1);
  const nextMod = db.modules.find(m => m.id === mod.id + 1);

  mainArea.innerHTML = `
    <div class="space-y-8 max-w-4xl mx-auto">
      
      <!-- TOP NAVIGATION BAR INSIDE READING VIEW -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <a href="#/" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          ← Voltar ao Catálogo de Módulos
        </a>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span>Volume ${mod.vol}</span> • <span>${mod.category}</span>
        </div>
      </div>

      <!-- MODULE HEADER -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-lg">
            MÓDULO ${mod.number} DE 60
          </span>
        </div>

        <h1 class="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
          ${mod.title}
        </h1>

        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed border-l-2 border-indigo-500 pl-3">
          ${mod.summary}
        </p>
      </div>

      <!-- INTERACTIVE TOPIC INDEX (TABELA DE 14 TÓPICOS) -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 class="font-heading font-bold text-sm text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="list" class="w-4 h-4"></i> Tópicos deste Módulo de Estudo (Clique para ir ao tópico)
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${mod.topics.map(t => `
            <a href="#${t.anchor}" onclick="scrollToTopic('${t.anchor}')" 
               class="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition truncate flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="truncate">${t.title}</span>
            </a>
          `).join('')}
        </div>
      </div>

      <!-- READING MATERIAL BODY (MARKDOWN) -->
      <article id="study-reading-body" class="markdown-body bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-900 shadow-2xl">
        ${marked.parse(mod.markdown)}
      </article>

      <!-- BOTTOM MODULE NAVIGATION (PREV / NEXT) -->
      <div class="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
        ${prevMod ? `
          <a href="#/modulo/${prevMod.id}" class="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-4 rounded-2xl text-left space-y-1 transition max-w-xs">
            <span class="text-[11px] text-slate-500 font-semibold uppercase">Módulo Anterior</span>
            <div class="text-xs font-bold text-white truncate">Módulo ${prevMod.number}: ${prevMod.title}</div>
          </a>
        ` : '<div></div>'}

        ${nextMod ? `
          <a href="#/modulo/${nextMod.id}" class="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-4 rounded-2xl text-right space-y-1 transition max-w-xs">
            <span class="text-[11px] text-indigo-400 font-semibold uppercase">Próximo Módulo →</span>
            <div class="text-xs font-bold text-white truncate">Módulo ${nextMod.number}: ${nextMod.title}</div>
          </a>
        ` : '<div></div>'}
      </div>

    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function scrollToTopic(anchorId) {
  const el = document.getElementById(anchorId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==========================================
// 3. SYNTHESES VIEW (#/sinteses)
// ==========================================
function renderSynthesesView() {
  const mainArea = document.getElementById('main-reading-area');
  mainArea.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 class="font-heading font-extrabold text-2xl text-white">Sínteses Finais & Tabelas do Conhecimento</h1>
        <a href="#/" class="text-xs text-indigo-400 hover:underline">← Voltar ao Catálogo</a>
      </div>

      <article class="markdown-body bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-900 shadow-2xl">
        ${marked.parse(db.syntheses)}
      </article>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// SEARCH & AUDIO CONTROLS
// ==========================================
function initEvents() {
  setupSearch('encyclopedia-search', 'search-results-box');
  setupSearch('mobile-encyclopedia-search', 'search-results-box');

  // Audio Reader Button
  document.getElementById('btn-audio-read').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura em voz alta.');
      return;
    }

    if (synth.speaking) {
      synth.cancel();
      return;
    }

    const textToRead = document.getElementById('study-reading-body')?.innerText || "Selecione um módulo para ouvir a leitura.";
    utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 5000));
    utterance.lang = 'pt-BR';
    synth.speak(utterance);
  });

  // PDF Print Button
  document.getElementById('btn-pdf-print').addEventListener('click', () => {
    window.print();
  });
}

function setupSearch(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (q.length < 2) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = db.modules.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.summary.toLowerCase().includes(q) || 
      m.category.toLowerCase().includes(q) ||
      m.markdown.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-4 text-xs text-slate-400">Nenhum módulo encontrado para "${q}".</div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 10).map(m => `
        <a href="#/modulo/${m.id}" onclick="document.getElementById('${dropdownId}').classList.add('hidden');" 
           class="block p-3 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 transition">
          <div class="text-[10px] text-indigo-400 font-bold uppercase">Módulo ${m.number} • ${m.category}</div>
          <div class="text-sm font-semibold text-white">${m.title}</div>
        </a>
      `).join('');
    }
    dropdown.classList.remove('hidden');
  });
}
