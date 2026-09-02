// JavaScript Web Application Logic for Pesquisa Profunda Deficiência Visual

let docsData = [];
let activeDocIndex = 0;
let currentFontSize = 100;
let synth = window.speechSynthesis;
let utterance = null;
let isSpeaking = false;

// Braille Unicode Mapping Dictionary (Letters a-z, numbers, special)
const brailleMap = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '{"s":"⠞","t":"⠞","u":"⠟","v":"⠧","w":"⠺","x":"⠭","y":"⠽","z":"⠵"}',
  's': '⠞', 't': '⠱', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  'à': 'à', 'á': '⠷', 'â': '⠮', 'ã': '⠯', 'é': '⠿', 'ê': '⠮', 'í': '⠌', 'ó': '⠪', 'ô': '⠹', 'õ': '⠻', 'ú': '⠾', 'ç': '⠯',
  '0': '⠼⠚', '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊',
  ' ': ' '
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadContent();
  initEvents();
  initBrailleConverter();
});

async function loadContent() {
  try {
    const res = await fetch('data/content.json');
    docsData = await res.json();
    renderSidebar();
    displayDocument(0);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('markdown-body').innerHTML = `
      <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300">
        <h3 class="font-bold text-lg">Erro ao carregar os dados da pesquisa</h3>
        <p class="text-sm mt-1">Certifique-se de que o arquivo <code>data/content.json</code> foi gerado corretamente.</p>
      </div>
    `;
  }
}

function renderSidebar() {
  const sidebarNav = document.getElementById('sidebar-nav');
  sidebarNav.innerHTML = '';

  const volumeTitles = [
    { title: 'Vol 1: História & Conceitos (01 a 10)', icon: 'book-open' },
    { title: 'Vol 2: Neuropsicologia & Alfabetização (11 a 20)', icon: 'brain' },
    { title: 'Vol 3: Estudo TECE & Autonomia (21 a 30)', icon: 'cpu' },
    { title: 'Vol 4: Inclusão, IA & Direitos (31 a 40)', icon: 'sparkles' },
    { title: 'Vol 5: Legislação & Esporte (41 a 50)', icon: 'trophy' },
    { title: 'Vol 6: Nordeste, Pernambuco & Pesquisa (51 a 60)', icon: 'map-pin' },
    { title: 'Vol 7: Sínteses Finais & Glossário', icon: 'file-text' }
  ];

  docsData.forEach((doc, idx) => {
    const meta = volumeTitles[idx] || { title: `Volume ${idx + 1}`, icon: 'file' };
    
    const item = document.createElement('div');
    item.className = 'space-y-1';
    
    const isSelected = idx === activeDocIndex;
    
    item.innerHTML = `
      <button onclick="displayDocument(${idx})" class="w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 ${isSelected ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}">
        <div class="flex items-center gap-2.5 truncate">
          <i data-lucide="${meta.icon}" class="w-4 h-4 text-indigo-400 flex-shrink-0"></i>
          <span class="truncate text-xs sm:text-sm">${meta.title}</span>
        </div>
      </button>
    `;
    
    sidebarNav.appendChild(item);
  });

  if (window.lucide) lucide.createIcons();
}

function displayDocument(index) {
  if (index < 0 || index >= docsData.length) return;
  
  activeDocIndex = index;
  renderSidebar();

  const doc = docsData[index];
  const markdownBody = document.getElementById('markdown-body');
  
  // Render Markdown using marked
  markdownBody.innerHTML = marked.parse(doc.content);

  // Update Header Title
  const titles = [
    "Módulos 01 a 10: História, Conceitos e o Sistema Braille",
    "Módulos 11 a 20: Neuropsicologia, Pedagogia e Alfabetização",
    "Módulos 21 a 30: Estudo de Caso TECE, Tecnologia e Vida Independente",
    "Módulos 31 a 40: Inclusão, Acessibilidade, IA e Direitos Humanos",
    "Módulos 41 a 50: Legislação Brasileira, Esporte Paralímpico e Arte",
    "Módulos 51 a 60: Nordeste, Pernambuco, Pesquisa e Mapa do Conhecimento",
    "Sínteses Finais: Linhas do Tempo, Top 100, Glossário e 20 Propostas de Pesquisa"
  ];

  document.getElementById('doc-title').innerText = titles[index] || doc.filename;
  document.getElementById('doc-volume-badge').innerHTML = `<i data-lucide="book-open" class="w-4 h-4"></i> Volume ${index + 1} de 7`;

  // Scroll to top
  document.getElementById('main-content').scrollTop = 0;
  if (window.lucide) lucide.createIcons();

  // Stop any ongoing speech
  stopTTS();
}

function initEvents() {
  // Sidebar Toggle Mobile
  const sidebar = document.getElementById('sidebar');
  document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
  });
  document.getElementById('btn-close-sidebar').addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  // Search Input
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    const matches = [];
    docsData.forEach((doc, docIdx) => {
      const lines = doc.content.split('\n');
      lines.forEach((line, lineIdx) => {
        if (line.toLowerCase().includes(query) && (line.startsWith('#') || line.startsWith('##') || line.startsWith('###'))) {
          matches.push({
            docIdx,
            lineText: line.replace(/#+/g, '').trim(),
            fullLine: line
          });
        }
      });
    });

    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="p-4 text-xs text-slate-400">Nenhum resultado encontrado para "${query}".</div>`;
    } else {
      searchResults.innerHTML = matches.slice(0, 10).map(m => `
        <button onclick="displayDocument(${m.docIdx}); document.getElementById('search-results').classList.add('hidden');" 
                class="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-800/60 last:border-0 transition">
          <div class="text-xs text-indigo-400 font-semibold">Volume ${m.docIdx + 1}</div>
          <div class="text-sm font-medium text-white">${m.lineText}</div>
        </button>
      `).join('');
    }
    searchResults.classList.remove('hidden');
  });

  // High Contrast Mode Toggle
  document.getElementById('btn-contrast').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
  });

  // Font Resizer Controls
  document.getElementById('btn-font-add').addEventListener('click', () => {
    if (currentFontSize < 160) {
      currentFontSize += 10;
      document.getElementById('markdown-body').style.fontSize = `${currentFontSize}%`;
    }
  });

  document.getElementById('btn-font-sub').addEventListener('click', () => {
    if (currentFontSize > 80) {
      currentFontSize -= 10;
      document.getElementById('markdown-body').style.fontSize = `${currentFontSize}%`;
    }
  });

  // Text to Speech (TTS) Controls
  document.getElementById('btn-tts').addEventListener('click', () => {
    const ttsBar = document.getElementById('tts-bar');
    ttsBar.classList.toggle('hidden');
    if (!ttsBar.classList.contains('hidden')) {
      startTTS();
    } else {
      stopTTS();
    }
  });

  document.getElementById('tts-play-pause').addEventListener('click', () => {
    if (isSpeaking) {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        document.getElementById('tts-play-pause').innerHTML = '<i data-lucide="play" class="w-5 h-5"></i>';
      } else if (synth.paused) {
        synth.resume();
        document.getElementById('tts-play-pause').innerHTML = '<i data-lucide="pause" class="w-5 h-5"></i>';
      }
      if (window.lucide) lucide.createIcons();
    } else {
      startTTS();
    }
  });

  document.getElementById('tts-stop').addEventListener('click', stopTTS);

  // Braille Modal Toggle
  document.getElementById('btn-braille-modal').addEventListener('click', () => {
    document.getElementById('braille-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-braille-modal').addEventListener('click', () => {
    document.getElementById('braille-modal').classList.add('hidden');
  });
}

function startTTS() {
  if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta síntese de voz.');
    return;
  }
  synth.cancel();

  const textToRead = document.getElementById('markdown-body').innerText.slice(0, 4000); // Read first section
  utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.lang = 'pt-BR';
  utterance.rate = parseFloat(document.getElementById('tts-rate').value) || 1;

  utterance.onstart = () => {
    isSpeaking = true;
    document.getElementById('tts-status').innerText = 'Lendo o módulo em voz alta...';
    document.getElementById('tts-play-pause').innerHTML = '<i data-lucide="pause" class="w-5 h-5"></i>';
    if (window.lucide) lucide.createIcons();
  };

  utterance.onend = () => {
    isSpeaking = false;
    document.getElementById('tts-status').innerText = 'Leitura concluída.';
    document.getElementById('tts-play-pause').innerHTML = '<i data-lucide="play" class="w-5 h-5"></i>';
    if (window.lucide) lucide.createIcons();
  };

  synth.speak(utterance);
}

function stopTTS() {
  if (synth) synth.cancel();
  isSpeaking = false;
  document.getElementById('tts-bar').classList.add('hidden');
}

function initBrailleConverter() {
  const input = document.getElementById('braille-input-text');
  const output = document.getElementById('braille-output');

  function convertToBraille(text) {
    return text.toLowerCase().split('').map(char => brailleMap[char] || char).join(' ');
  }

  input.addEventListener('input', (e) => {
    output.innerText = convertToBraille(e.target.value);
  });

  output.innerText = convertToBraille(input.value);
}
