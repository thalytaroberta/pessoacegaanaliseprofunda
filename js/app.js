// ============================================================
// PESSOA CEGA: ANÁLISE PROFUNDA — App Logic
// All data is pre-loaded via js/db-data.js (window.ENCYCLOPEDIA_DB)
// All markdown rendering via js/marked.local.js (window.marked)
// NO fetch(), NO async, NO CORS issues.
// ============================================================

(function() {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  var db = { modules: [], syntheses: '', project: '' };
  var activeModuleId = null;
  var ttsActive = false;

  // ── Markdown Renderer ──────────────────────────────────────
  function renderMD(text) {
    if (!text) return '<p style="color:#64748b">Nenhum conteúdo disponível.</p>';
    try {
      // marked v14 (downloaded from CDN)
      if (window.marked && typeof window.marked.parse === 'function') {
        return window.marked.parse(text);
      }
      if (typeof window.marked === 'function') {
        return window.marked(text);
      }
    } catch (e) {
      console.warn('marked error, using fallback:', e.message);
    }
    // Plain fallback
    return '<pre style="white-space:pre-wrap;color:#cbd5e1;font-size:14px;line-height:1.7;">' +
      text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
  }

  // ── DOM Helpers ────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function setHTML(id, html) {
    var node = el(id);
    if (node) node.innerHTML = html;
  }

  // ── Category Colors ────────────────────────────────────────
  var catColors = {
    'História e Conceitos': '#f59e0b',
    'Neuropsicologia e Alfabetização': '#818cf8',
    'Estudo TECE e Vida Independente': '#10b981',
    'Inclusão, Direitos e Inteligência Artificial': '#f472b6',
    'Legislação, Esporte Paralímpico e Arte': '#38bdf8',
    'Nordeste, Pernambuco e Pesquisa': '#fb923c'
  };

  function catColor(cat) {
    return catColors[cat] || '#6366f1';
  }

  // ── Sidebar ────────────────────────────────────────────────
  function renderSidebar() {
    var container = el('sidebar-list');
    if (!container || !db.modules.length) return;

    var html = db.modules.map(function(m) {
      var active = m.id === activeModuleId;
      var bg = active ? 'background:rgba(99,102,241,0.15);border-color:#6366f1;color:#a5b4fc;font-weight:600;' : '';
      return '<button type="button" onclick="APP.openModule(' + m.id + ')" ' +
        'style="width:100%;text-align:left;padding:6px 8px;border-radius:10px;border:1px solid transparent;' +
        'background:transparent;cursor:pointer;color:#94a3b8;font-size:11px;transition:all 0.15s;' + bg + '" ' +
        'onmouseover="if(' + m.id + '!==' + (activeModuleId||0) + ')this.style.background=\'rgba(30,41,59,0.8)\'" ' +
        'onmouseout="if(' + m.id + '!==' + (activeModuleId||0) + ')this.style.background=\'transparent\'">' +
        '<span style="font-family:JetBrains Mono,monospace;font-size:9px;font-weight:700;color:#818cf8;' +
        'background:rgba(99,102,241,0.1);padding:1px 5px;border-radius:4px;margin-right:6px;">Módulo ' + m.number + '</span>' +
        '<span>' + m.title + '</span>' +
        '</button>';
    }).join('');

    container.innerHTML = html;

    // Sidebar filter
    var filterInput = el('sidebar-filter');
    if (filterInput && !filterInput._hasListener) {
      filterInput._hasListener = true;
      filterInput.addEventListener('input', function() {
        var q = this.value.toLowerCase();
        var btns = container.querySelectorAll('button');
        btns.forEach(function(btn) {
          btn.style.display = btn.textContent.toLowerCase().includes(q) ? 'block' : 'none';
        });
      });
    }
  }

  // ── Search ─────────────────────────────────────────────────
  function setupSearch(inputId, dropdownId) {
    var input = el(inputId);
    var dropdown = el(dropdownId);
    if (!input) return;

    input.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      if (!dropdown) return;
      if (q.length < 2) { dropdown.style.display = 'none'; return; }

      var matches = db.modules.filter(function(m) {
        return m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (m.markdown && m.markdown.toLowerCase().includes(q));
      });

      if (!matches.length) {
        dropdown.innerHTML = '<div style="padding:16px;font-size:12px;color:#64748b;">Nenhum resultado para "' + q + '"</div>';
      } else {
        dropdown.innerHTML = matches.slice(0, 8).map(function(m) {
          return '<button type="button" onclick="APP.openModule(' + m.id + ');document.getElementById(\'' + dropdownId + '\').style.display=\'none\';" ' +
            'style="width:100%;text-align:left;padding:12px 16px;background:transparent;border:none;border-bottom:1px solid #1e293b;cursor:pointer;transition:background 0.15s;" ' +
            'onmouseover="this.style.background=\'rgba(30,41,59,0.8)\'" onmouseout="this.style.background=\'transparent\'">' +
            '<div style="font-size:10px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Módulo ' + m.number + ' · ' + m.category + '</div>' +
            '<div style="font-size:13px;font-weight:600;color:#f8fafc;">' + m.title + '</div>' +
            '</button>';
        }).join('');
      }
      dropdown.style.display = 'block';
    });
  }

  // ── CATALOG VIEW ───────────────────────────────────────────
  function renderCatalog() {
    activeModuleId = null;
    renderSidebar();

    // Group by category
    var groups = {};
    db.modules.forEach(function(m) {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });

    var html = '<div>' +

      // Hero
      '<div style="background:linear-gradient(135deg,rgba(30,27,74,0.8),rgba(15,23,42,0.9));' +
      'border:1px solid #1e293b;border-radius:24px;padding:40px 48px;margin-bottom:40px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
      '<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);' +
      'color:#818cf8;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:16px;letter-spacing:0.05em;">' +
      'PESSOA CEGA · ANÁLISE PROFUNDA</div>' +
      '<h1 style="font-family:Outfit,sans-serif;font-weight:800;font-size:clamp(24px,4vw,44px);color:#fff;line-height:1.2;margin-bottom:16px;">' +
      'Dossiê Acadêmico, Histórico e Científico sobre Deficiência Visual</h1>' +
      '<p style="font-size:15px;color:#94a3b8;max-width:720px;line-height:1.7;">' +
      'Selecione qualquer um dos <strong style="color:#e2e8f0;">60 Módulos de Estudo</strong> abaixo para ler o material de pesquisa completo — ' +
      'história, neurociência, pedagogia tátil, tecnologia assistiva, IA, Pernambuco e muito mais.</p>' +
      '</div>' +

      // Categories + cards
      Object.keys(groups).map(function(cat) {
        var mods = groups[cat];
        var color = catColor(cat);
        return '<section style="margin-bottom:40px;">' +

          '<div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid #1e293b;padding-bottom:12px;margin-bottom:20px;">' +
          '<div style="width:8px;height:32px;background:' + color + ';border-radius:4px;"></div>' +
          '<h2 style="font-family:Outfit,sans-serif;font-weight:700;font-size:20px;color:#fff;">' + cat + '</h2>' +
          '<span style="font-size:11px;color:#64748b;background:#0f172a;border:1px solid #1e293b;padding:2px 10px;border-radius:999px;">' + mods.length + ' Módulos</span>' +
          '</div>' +

          '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">' +
          mods.map(function(m) {
            return '<div onclick="APP.openModule(' + m.id + ')" ' +
              'style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:20px;cursor:pointer;' +
              'transition:all 0.2s;display:flex;flex-direction:column;justify-content:space-between;" ' +
              'onmouseover="this.style.borderColor=\'' + color + '\';this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 32px rgba(0,0,0,0.3)\'" ' +
              'onmouseout="this.style.borderColor=\'#1e293b\';this.style.transform=\'none\';this.style.boxShadow=\'none\'">' +

              '<div>' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
              '<span style="font-family:JetBrains Mono,monospace;font-size:10px;font-weight:700;color:' + color + ';' +
              'background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:3px 8px;border-radius:6px;">' +
              'Módulo ' + m.number + '</span>' +
              '<span style="font-size:10px;color:#475569;">14 Tópicos</span>' +
              '</div>' +
              '<h3 style="font-family:Outfit,sans-serif;font-weight:700;font-size:15px;color:#f1f5f9;margin-bottom:8px;line-height:1.4;">' + m.title + '</h3>' +
              '<p style="font-size:12px;color:#64748b;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + m.summary + '</p>' +
              '</div>' +

              '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">' +
              '<span style="font-size:10px;color:#475569;">Volume ' + m.vol + '</span>' +
              '<span style="font-size:12px;font-weight:600;color:' + color + ';">Ler Módulo →</span>' +
              '</div>' +
              '</div>';
          }).join('') +
          '</div>' +
          '</section>';
      }).join('') +
      '</div>';

    setHTML('main', html);
    window.scrollTo(0, 0);
  }

  // ── MODULE VIEW ────────────────────────────────────────────
  function renderModule(moduleId) {
    var mod = db.modules.find(function(m) { return m.id == moduleId; });
    if (!mod) { renderCatalog(); return; }

    activeModuleId = mod.id;
    renderSidebar();

    var prev = db.modules.find(function(m) { return m.id === mod.id - 1; });
    var next = db.modules.find(function(m) { return m.id === mod.id + 1; });
    var color = catColor(mod.category);

    var topicGrid = mod.topics.map(function(t) {
      return '<button type="button" onclick="APP.jumpTo(\'' + t.anchor + '\')" ' +
        'style="text-align:left;padding:8px 12px;background:#020617;border:1px solid #1e293b;border-radius:10px;' +
        'color:#94a3b8;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.15s;white-space:nowrap;overflow:hidden;" ' +
        'onmouseover="this.style.borderColor=\'' + color + '\';this.style.color=\'#f1f5f9\'" ' +
        'onmouseout="this.style.borderColor=\'#1e293b\';this.style.color=\'#94a3b8\'">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:' + color + ';flex-shrink:0;"></span>' +
        '<span style="overflow:hidden;text-overflow:ellipsis;">' + t.title + '</span>' +
        '</button>';
    }).join('');

    var prevBtn = prev ?
      '<button type="button" onclick="APP.openModule(' + prev.id + ')" ' +
      'style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:14px 20px;text-align:left;cursor:pointer;transition:all 0.2s;max-width:260px;" ' +
      'onmouseover="this.style.borderColor=\'#6366f1\'" onmouseout="this.style.borderColor=\'#1e293b\'">' +
      '<div style="font-size:10px;color:#475569;font-weight:700;text-transform:uppercase;margin-bottom:4px;">← Módulo Anterior</div>' +
      '<div style="font-size:12px;font-weight:600;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Módulo ' + prev.number + ': ' + prev.title + '</div>' +
      '</button>' : '<div></div>';

    var nextBtn = next ?
      '<button type="button" onclick="APP.openModule(' + next.id + ')" ' +
      'style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:14px 20px;text-align:right;cursor:pointer;transition:all 0.2s;max-width:260px;" ' +
      'onmouseover="this.style.borderColor=\'#6366f1\'" onmouseout="this.style.borderColor=\'#1e293b\'">' +
      '<div style="font-size:10px;color:#818cf8;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Próximo Módulo →</div>' +
      '<div style="font-size:12px;font-weight:600;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Módulo ' + next.number + ': ' + next.title + '</div>' +
      '</button>' : '<div></div>';

    var html = '<div style="max-width:900px;margin:0 auto;">' +

      // Back + breadcrumb
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #1e293b;">' +
      '<button type="button" onclick="APP.goHome()" style="background:none;border:none;cursor:pointer;color:#818cf8;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;" ' +
      'onmouseover="this.style.color=\'#a5b4fc\'" onmouseout="this.style.color=\'#818cf8\'">← Voltar ao Catálogo</button>' +
      '<span style="font-size:11px;color:#475569;">Volume ' + mod.vol + ' · ' + mod.category + '</span>' +
      '</div>' +

      // Module header
      '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:24px;padding:32px;margin-bottom:24px;box-shadow:0 12px 40px rgba(0,0,0,0.3);">' +
      '<div style="margin-bottom:12px;">' +
      '<span style="font-family:JetBrains Mono,monospace;font-size:10px;font-weight:700;color:' + color + ';background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);padding:4px 12px;border-radius:8px;">' +
      'MÓDULO ' + mod.number + ' DE 60</span>' +
      '</div>' +
      '<h1 style="font-family:Outfit,sans-serif;font-weight:800;font-size:clamp(20px,3vw,36px);color:#fff;line-height:1.2;margin-bottom:12px;">' + mod.title + '</h1>' +
      '<p style="font-size:13px;color:#94a3b8;line-height:1.7;border-left:3px solid ' + color + ';padding-left:12px;">' + mod.summary + '</p>' +
      '</div>' +

      // Topic index
      '<div style="background:rgba(15,23,42,0.8);border:1px solid #1e293b;border-radius:18px;padding:20px;margin-bottom:24px;">' +
      '<div style="font-size:11px;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">📋 Tópicos deste Módulo — Clique para ir diretamente</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">' +
      topicGrid +
      '</div>' +
      '</div>' +

      // Article body
      '<article id="article-body" style="background:#020617;border:1px solid #0f172a;border-radius:24px;padding:32px;margin-bottom:24px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
      renderMD(mod.markdown) +
      '</article>' +

      // Prev/Next
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:24px;border-top:1px solid #1e293b;">' +
      prevBtn + nextBtn +
      '</div>' +
      '</div>';

    setHTML('main', html);
    window.scrollTo(0, 0);
  }

  // ── SYNTHESES VIEW ─────────────────────────────────────────
  function renderSyntheses() {
    activeModuleId = null;
    renderSidebar();

    var html = '<div style="max-width:900px;margin:0 auto;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #1e293b;">' +
      '<h1 style="font-family:Outfit,sans-serif;font-weight:800;font-size:28px;color:#fff;">Sínteses Finais & Tabelas do Conhecimento</h1>' +
      '<button type="button" onclick="APP.goHome()" style="background:none;border:none;cursor:pointer;color:#818cf8;font-size:12px;font-weight:600;" ' +
      'onmouseover="this.style.color=\'#a5b4fc\'" onmouseout="this.style.color=\'#818cf8\'">← Voltar ao Catálogo</button>' +
      '</div>' +
      '<article style="background:#020617;border:1px solid #0f172a;border-radius:24px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
      renderMD(db.syntheses) +
      '</article></div>';

    setHTML('main', html);
    window.scrollTo(0, 0);
  }

  // ── PUBLIC API (accessed via inline onclick) ───────────────
  window.APP = {
    openModule: function(id) { renderModule(id); },
    goHome: function() { renderCatalog(); },
    openSyntheses: function() { renderSyntheses(); },
    jumpTo: function(anchorId) {
      var target = document.getElementById(anchorId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // ── INIT ───────────────────────────────────────────────────
  function init() {
    // Load DB from pre-loaded script
    if (window.ENCYCLOPEDIA_DB && window.ENCYCLOPEDIA_DB.modules && window.ENCYCLOPEDIA_DB.modules.length) {
      db = window.ENCYCLOPEDIA_DB;
      console.log('DB loaded:', db.modules.length, 'modules');
    } else {
      // Fetch fallback for web server
      fetch('data/encyclopedia-db.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          db = data;
          renderSidebar();
          renderCatalog();
        })
        .catch(function(e) {
          console.error('Fetch failed:', e);
          setHTML('main', '<div style="padding:40px;text-align:center;color:#f87171;">Erro ao carregar os módulos.<br>Abra via servidor web ou verifique data/encyclopedia-db.json</div>');
        });
      return;
    }

    renderSidebar();
    renderCatalog();

    // Header buttons
    var btnHome = el('btn-home');
    if (btnHome) btnHome.addEventListener('click', function() { APP.goHome(); });

    var btnSyntheses = el('btn-syntheses');
    if (btnSyntheses) btnSyntheses.addEventListener('click', function() { APP.openSyntheses(); });

    var btnPdf = el('btn-pdf');
    if (btnPdf) btnPdf.addEventListener('click', function() { window.print(); });

    var btnAudio = el('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', function() {
        if (!('speechSynthesis' in window)) return;
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          return;
        }
        var body = el('article-body');
        if (!body) { alert('Abra um módulo primeiro para ouvir a leitura.'); return; }
        var utt = new SpeechSynthesisUtterance(body.innerText.slice(0, 6000));
        utt.lang = 'pt-BR';
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      });
    }

    // Search
    setupSearch('global-search', 'search-dropdown');
    setupSearch('mobile-search', null);

    // ESC closes dropdown
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var dd = el('search-dropdown');
        if (dd) dd.style.display = 'none';
      }
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
