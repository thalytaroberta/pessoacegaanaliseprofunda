// JavaScript Application Logic for Pessoa Cega: Análise Profunda

let db = {
  project: "PESSOA CEGA: ANÁLISE PROFUNDA",
  totalModules: 60,
  modules: [],
  syntheses: ""
};

let activeModuleId = 1;
let synth = window.speechSynthesis;
let utterance = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  initEvents();
});

function initDatabase() {
  if (window.ENCYCLOPEDIA_DB && window.ENCYCLOPEDIA_DB.modules) {
    db = window.ENCYCLOPEDIA_DB;
  } else {
    // Fallback fetch if db-data.js wasn't loaded
    fetch('data/encyclopedia-db.json')
      .then(res => res.json())
      .then(data => {
        db = data;
        renderSidebar();
        handleRoute();
      })
      .catch(err => console.error('Erro ao carregar dados:', err));
  }

  renderSidebar();
  
  // Listen for URL hash changes
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// Fallback Markdown Renderer
function safeRenderMarkdown(text) {
  if (!text) return '<p class="text-slate-400">Nenhum conteúdo disponível.</p>';
  
  if (window.marked && typeof window.marked.parse === 'function') {
    try {
      return window.marked.parse(text);
    } catch (e) {
      console.warn('marked.parse fallback:', e);
    }
  } else if (typeof window.marked === 'function') {
    try {
      return window.marked(text);
    } catch (e) {
      console.warn('marked() fallback:', e);
    }
  }

  // Pure JavaScript Fallback Markdown Parser
  let html = text
    .replace(/^## (.*$)/gim, '<h2 class="font-heading font-bold text-2xl text-white mt-8 mb-4 border-b border-slate-800 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="font-heading font-extrabold text-3xl text-indigo-400 mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-slate-200">$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-950/30 text-indigo-200 rounded-r-lg">$1</blockquote>')
    .replace(/^---$/gim, '<hr class="my-6 border-slate-800">')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
    .replace(/\n\n/gim, '</p><p class="my-4 text-slate-300 leading-relaxed text-base">')
    .replace(/\n/gim, '<br>');

  return `<div class="prose prose-invert max-w-none"><p class="my-4 text-slate-300 leading-relaxed text-base">${html}</p></div>`;
}

// Router
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
}

// Global Window Actions (Bound directly to buttons and cards)
window.navigateToModule = function(id) {
  window.location.hash = `#/modulo/${id}`;
  renderModuleReadingView(id);
};

window.navigateToCatalog = function() {
  window.location.hash = '#/';
  renderCatalogView();
};

window.navigateToSyntheses = function() {
  window.location.hash = '#/sinteses';
  renderSynthesesView();
};

window.scrollToTopic = function(anchorId) {
  const el = document.getElementById(anchorId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn("Tópico não encontrado:", anchorId);
  }
};

function renderSidebar() {
  const container = document.getElementById('sidebar-module-list');
  if (!container || !db.modules) return;

  container.innerHTML = db.modules.map(m => `
    <button type="button" onclick="navigateToModule(${m.id})" 
       class="sidebar-mod-item w-full text-left p-2 rounded-xl border border-transparent hover:bg-slate-800 hover:border-slate-700 transition ${m.id === activeModuleId ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-indigo-500/40' : 'text-slate-300'}">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Módulo ${m.number}</span>
        <span class="truncate text-xs">${m.title}</span>
      </div>
    </button>
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
  if (!mainArea || !db.modules) return;
  
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
              <div onclick="navigateToModule(${m.id})" class="cursor-pointer bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 shadow-lg flex flex-col justify-between group">
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
                  <button type="button" onclick="navigateToModule(${m.id})" class="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler Módulo Completo →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 2. DETAILED MODULE READING VIEW (#/modulo/:id)
// ==========================================
function renderModuleReadingView(moduleId) {
  const mainArea = document.getElementById('main-reading-area');
  const mod = db.modules.find(m => m.id == moduleId);

  if (!mod) {
    if (mainArea) mainArea.innerHTML = `<div class="p-8 text-white">Módulo ${moduleId} não encontrado.</div>`;
    return;
  }

  activeModuleId = mod.id;
  renderSidebar();

  const prevMod = db.modules.find(m => m.id === mod.id - 1);
  const nextMod = db.modules.find(m => m.id === mod.id + 1);

  const renderedHTML = safeRenderMarkdown(mod.markdown);

  mainArea.innerHTML = `
    <div class="space-y-8 max-w-4xl mx-auto">
      
      <!-- TOP NAVIGATION BAR INSIDE READING VIEW -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button type="button" onclick="navigateToCatalog()" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          ← Voltar ao Catálogo de Módulos
        </button>
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

      <!-- INTERACTIVE TOPIC INDEX (TABELA DE 14 TÓPICOS DO MÓDULO) -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 class="font-heading font-bold text-sm text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="list" class="w-4 h-4"></i> Tópicos deste Módulo (Clique para rolar até o tópico)
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${mod.topics.map(t => `
            <button type="button" onclick="scrollToTopic('${t.anchor}')" 
               class="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition truncate flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span class="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
              <span class="truncate">${t.title}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- READING MATERIAL BODY -->
      <article id="study-reading-body" class="markdown-body bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-900 shadow-2xl">
        ${renderedHTML}
      </article>

      <!-- BOTTOM MODULE NAVIGATION (PREV / NEXT) -->
      <div class="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
        ${prevMod ? `
          <button type="button" onclick="navigateToModule(${prevMod.id})" class="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-4 rounded-2xl text-left space-y-1 transition max-w-xs">
            <span class="text-[11px] text-slate-500 font-semibold uppercase">Módulo Anterior</span>
            <div class="text-xs font-bold text-white truncate">Módulo ${prevMod.number}: ${prevMod.title}</div>
          </button>
        ` : '<div></div>'}

        ${nextMod ? `
          <button type="button" onclick="navigateToModule(${nextMod.id})" class="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-4 rounded-2xl text-right space-y-1 transition max-w-xs">
            <span class="text-[11px] text-indigo-400 font-semibold uppercase">Próximo Módulo →</span>
            <div class="text-xs font-bold text-white truncate">Módulo ${nextMod.number}: ${nextMod.title}</div>
          </button>
        ` : '<div></div>'}
      </div>

    </div>
  `;

  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 3. SYNTHESES VIEW (#/sinteses)
// ==========================================
function renderSynthesesView() {
  const mainArea = document.getElementById('main-reading-area');
  if (!mainArea) return;

  mainArea.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 class="font-heading font-extrabold text-2xl text-white">Sínteses Finais & Tabelas do Conhecimento</h1>
        <button type="button" onclick="navigateToCatalog()" class="text-xs text-indigo-400 hover:underline">← Voltar ao Catálogo</button>
      </div>

      <article class="markdown-body bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-900 shadow-2xl">
        ${safeRenderMarkdown(db.syntheses)}
      </article>
    </div>
  `;
  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// SEARCH & AUDIO CONTROLS
// ==========================================
function initEvents() {
  setupSearch('encyclopedia-search', 'search-results-box');
  setupSearch('mobile-encyclopedia-search', 'search-results-box');

  const btnAudio = document.getElementById('btn-audio-read');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
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
  }

  const btnPdf = document.getElementById('btn-pdf-print');
  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      window.print();
    });
  }
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
      (m.markdown && m.markdown.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-4 text-xs text-slate-400">Nenhum módulo encontrado para "${q}".</div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 10).map(m => `
        <button type="button" onclick="navigateToModule(${m.id}); document.getElementById('${dropdownId}').classList.add('hidden');" 
           class="w-full text-left block p-3 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 transition">
          <div class="text-[10px] text-indigo-400 font-bold uppercase">Módulo ${m.number} • ${m.category}</div>
          <div class="text-sm font-semibold text-white">${m.title}</div>
        </button>
      `).join('');
    }
    dropdown.classList.remove('hidden');
  });
}
