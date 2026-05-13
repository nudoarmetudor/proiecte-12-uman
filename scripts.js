const CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxBS_-DkwJX0eaheyBDrfF0_wdShCO_DlFQtlssbNdyVKAtt6YH1zyAGmmIiySc7ADo/exec',
  seedEvaluationsFile: 'evaluari.json',
  localFallbackStorageKey: 'portal-peer-review-fallback-v2',
  remoteRefreshDelayMs: 1800
};

const CRITERIA = [
  {
    key: 'relevanta',
    title: 'Relevanța problemei abordate',
    weight: 15,
    prompt: 'Site-ul abordează o problemă reală și relevantă pentru societate sau pentru un anumit grup de utilizatori.'
  },
  {
    key: 'claritate',
    title: 'Claritatea scopului și a mesajului',
    weight: 10,
    prompt: 'Scopul site-ului și mesajul transmis sunt clare și ușor de înțeles.'
  },
  {
    key: 'publicTinta',
    title: 'Adecvarea pentru publicul-țintă',
    weight: 15,
    prompt: 'Site-ul este bine adaptat publicului-țintă pentru care a fost creat.'
  },
  {
    key: 'utilitate',
    title: 'Utilitatea și valoarea informațională',
    weight: 15,
    prompt: 'Informațiile oferite de site sunt utile, relevante și bine organizate.'
  },
  {
    key: 'navigare',
    title: 'Structura și navigarea',
    weight: 10,
    prompt: 'Site-ul este ușor de navigat, iar structura lui este clară.'
  },
  {
    key: 'design',
    title: 'Design vizual și atractivitate',
    weight: 10,
    prompt: 'Designul vizual al site-ului este atractiv, coerent și susține bine conținutul.'
  },
  {
    key: 'tehnic',
    title: 'Calitatea tehnică a realizării',
    weight: 10,
    prompt: 'Site-ul funcționează corect din punct de vedere tehnic și oferă o experiență stabilă.'
  },
  {
    key: 'originalitate',
    title: 'Originalitate și impact general',
    weight: 15,
    prompt: 'Proiectul este original și are potențial real de impact sau utilitate.'
  }
];

const grid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('searchInput');
const statsCounter = document.getElementById('statsCounter');
const errorBox = document.getElementById('errorBox');
const emptyState = document.getElementById('emptyState');
const categoryFilters = document.getElementById('categoryFilters');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const heroDescription = document.getElementById('heroDescription');

const evaluationModal = document.getElementById('evaluationModal');
const evaluationForm = document.getElementById('evaluationForm');
const criteriaContainer = document.getElementById('criteriaContainer');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

const commentsModal = document.getElementById('commentsModal');
const commentsModalTitle = document.getElementById('commentsModalTitle');
const commentsModalSubtitle = document.getElementById('commentsModalSubtitle');
const commentsModalBody = document.getElementById('commentsModalBody');
const closeCommentsModalBtn = document.getElementById('closeCommentsModalBtn');

const toast = document.getElementById('toast');

let allStudents = [];
let seedEvaluations = [];
let fallbackEvaluations = [];
let remoteSummaryByProject = {};
let remoteStatus = 'unconfigured';

let activeCategory = 'Toate';
let currentProjectId = null;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'proiect';
}

function normalizeUrl(rawUrl = '') {
  let url = String(rawUrl).trim();

  if (!url || url.toLowerCase() === 'placeholder') {
    return '';
  }

  const markdownMatch = url.match(/\((https?:\/\/[^\s)]+)\)/i);

  if (markdownMatch) {
    url = markdownMatch[1];
  }

  url = url.replace(/^\[|\]$/g, '').trim();

  if (!/^https?:\/\//i.test(url) && url) {
    url = 'https://' + url.replace(/^\/+/, '');
  }

  return url;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function getJsonUrl(fileName) {
  return new URL(`./${fileName}`, window.location.href).href;
}

function round(value, decimals = 2) {
  return Number(Number(value || 0).toFixed(decimals));
}

function safeAverage(values) {
  const valid = values
    .map(Number)
    .filter(value => Number.isFinite(value));

  if (!valid.length) {
    return 0;
  }

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function scoreLabel(score) {
  if (score >= 4.5) return 'Excelent';
  if (score >= 4.0) return 'Foarte bun';
  if (score >= 3.5) return 'Bun';
  if (score >= 3.0) return 'Acceptabil';
  return 'În dezvoltare';
}

function metricColor(score) {
  if (score >= 4.2) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 3.5) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (score >= 3.0) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

async function fetchJsonOptional(fileName, fallback = []) {
  try {
    const response = await fetch(getJsonUrl(fileName), { cache: 'no-store' });

    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch {
    return fallback;
  }
}

async function fetchJsonRequired(fileName) {
  const response = await fetch(getJsonUrl(fileName), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${fileName}: HTTP ${response.status}`);
  }

  return response.json();
}

function normalizeStudents(data) {
  if (!Array.isArray(data)) {
    throw new Error('elevi.json trebuie să conțină un array.');
  }

  return data
    .map((student, index) => {
      const nume = String(student.nume || '').trim();
      const categorie = String(student.categorie || student.categoria || 'Necategorizat').trim();
      const url = normalizeUrl(student.url || '');
      const id = String(student.id || `${slugify(nume)}-${index + 1}`).trim();
      const urlValid = isValidHttpUrl(url);

      let domain = 'link indisponibil';

      try {
        if (urlValid) {
          domain = new URL(url).hostname.replace(/^www\./, '');
        }
      } catch {
        domain = 'link indisponibil';
      }

      return {
        id,
        nume,
        categorie,
        url,
        urlValid,
        domain
      };
    })
    .filter(student => student.id && student.nume)
    .sort((a, b) => a.nume.localeCompare(b.nume, 'ro', { sensitivity: 'base' }));
}

function normalizeEvaluations(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item, index) => {
      const normalized = {
        id: item.id || `eval-${index + 1}`,
        projectId: String(item.projectId || '').trim(),
        evaluatorName: String(item.evaluatorName || 'Evaluator anonim').trim(),
        evaluatorClass: String(item.evaluatorClass || '').trim(),
        visitedSite: String(item.visitedSite || 'Da').trim(),
        submittedAt: item.submittedAt || new Date().toISOString(),
        strengthComment: String(item.strengthComment || '').trim(),
        improvementComment: String(item.improvementComment || '').trim(),
        audienceComment: String(item.audienceComment || '').trim(),
        generalComment: String(item.generalComment || '').trim()
      };

      CRITERIA.forEach(criteria => {
        const raw = Number(item[criteria.key]);
        normalized[criteria.key] = Math.min(5, Math.max(1, Number.isFinite(raw) ? raw : 3));
      });

      return normalized;
    })
    .filter(item => item.projectId);
}

function loadFallbackEvaluations() {
  try {
    const stored = localStorage.getItem(CONFIG.localFallbackStorageKey) || '[]';
    return normalizeEvaluations(JSON.parse(stored));
  } catch {
    return [];
  }
}

function saveFallbackEvaluation(evaluation) {
  fallbackEvaluations.push(evaluation);
  localStorage.setItem(CONFIG.localFallbackStorageKey, JSON.stringify(fallbackEvaluations));
}

function isAppsScriptConfigured() {
  return (
    typeof CONFIG.appsScriptUrl === 'string' &&
    CONFIG.appsScriptUrl.trim() !== '' &&
    CONFIG.appsScriptUrl.startsWith('https://script.google.com/macros/s/')
  );
}

function buildSummaryFromEvaluations(projectEvaluations) {
  if (!projectEvaluations.length) {
    return {
      count: 0,
      weightedScore: 0,
      criterionAverages: Object.fromEntries(CRITERIA.map(criteria => [criteria.key, 0])),
      scoreLabel: 'Fără evaluări',
      summary: 'Acest proiect nu are încă evaluări. După completarea chestionarelor, aici va apărea sinteza feedback-ului colectat.',
      topStrength: 'Nicio evaluare disponibilă',
      mainImprovement: 'Nicio recomandare disponibilă'
    };
  }

  const criterionAverages = {};

  CRITERIA.forEach(criteria => {
    criterionAverages[criteria.key] = round(
      safeAverage(projectEvaluations.map(item => item[criteria.key]))
    );
  });

  const weightedScore = round(
    CRITERIA.reduce(
      (sum, criteria) => sum + criterionAverages[criteria.key] * (criteria.weight / 100),
      0
    )
  );

  const sortedCriteria = [...CRITERIA].sort(
    (a, b) => criterionAverages[b.key] - criterionAverages[a.key]
  );

  const lowestCriteria = [...CRITERIA].sort(
    (a, b) => criterionAverages[a.key] - criterionAverages[b.key]
  );

  const topStrength = sortedCriteria[0]?.title || 'Punct forte';
  const mainImprovement = lowestCriteria[0]?.title || 'Direcție de îmbunătățire';

  const lastGeneralComment = projectEvaluations
    .map(item => item.generalComment)
    .filter(Boolean)
    .slice(-1)[0] || '';

  const summary = [
    `Evaluatorii apreciază în principal ${topStrength.toLowerCase()}.`,
    `Principala direcție de consolidare este ${mainImprovement.toLowerCase()}.`,
    lastGeneralComment
      ? `Observație recentă: „${lastGeneralComment.slice(0, 140)}${lastGeneralComment.length > 140 ? '…' : ''}”`
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return {
    count: projectEvaluations.length,
    weightedScore,
    criterionAverages,
    scoreLabel: scoreLabel(weightedScore),
    summary,
    topStrength,
    mainImprovement
  };
}

function buildSeedSummaryMap() {
  const allEvaluations = [...seedEvaluations, ...fallbackEvaluations];

  return Object.fromEntries(
    allStudents.map(student => {
      const evaluations = allEvaluations.filter(item => item.projectId === student.id);
      return [student.id, buildSummaryFromEvaluations(evaluations)];
    })
  );
}

function sanitizeRemoteComments(comments = []) {
  if (!Array.isArray(comments)) {
    return [];
  }

  return comments.map((item, index) => ({
    evaluatorName: String(item.evaluatorName || `Evaluator ${index + 1}`).trim(),
    evaluatorClass: String(item.evaluatorClass || '').trim(),
    visitedSite: String(item.visitedSite || '').trim(),
    submittedAt: item.submittedAt || '',
    strengthComment: String(item.strengthComment || '').trim(),
    improvementComment: String(item.improvementComment || '').trim(),
    audienceComment: String(item.audienceComment || '').trim(),
    generalComment: String(item.generalComment || '').trim()
  }));
}

function sanitizeRemoteSummary(summary = {}) {
  const criterionAverages = {};

  CRITERIA.forEach(criteria => {
    criterionAverages[criteria.key] = round(
      Number(summary.criterionAverages?.[criteria.key] || 0)
    );
  });

  return {
    count: Number(summary.count || 0),
    weightedScore: round(Number(summary.weightedScore || 0)),
    criterionAverages,
    scoreLabel: String(summary.scoreLabel || scoreLabel(Number(summary.weightedScore || 0))),
    summary: String(summary.summary || 'Sinteza evaluărilor nu este disponibilă încă.'),
    topStrength: String(summary.topStrength || 'N/A'),
    mainImprovement: String(summary.mainImprovement || 'N/A'),
    comments: sanitizeRemoteComments(summary.comments || [])
  };
}

function getProjectSummary(projectId) {
  if (remoteStatus === 'ready' && remoteSummaryByProject[projectId]) {
    return remoteSummaryByProject[projectId];
  }

  const seedMap = buildSeedSummaryMap();

  return seedMap[projectId] || buildSummaryFromEvaluations([]);
}

function getProjectComments(projectId) {
  const remoteComments = remoteSummaryByProject[projectId]?.comments;

  if (Array.isArray(remoteComments) && remoteComments.length) {
    return remoteComments;
  }

  return [...seedEvaluations, ...fallbackEvaluations]
    .filter(item => item.projectId === projectId)
    .map((item, index) => ({
      evaluatorName: item.evaluatorName || `Evaluator ${index + 1}`,
      evaluatorClass: item.evaluatorClass || '',
      submittedAt: item.submittedAt || '',
      strengthComment: item.strengthComment || '',
      improvementComment: item.improvementComment || '',
      audienceComment: item.audienceComment || '',
      generalComment: item.generalComment || ''
    }));
}

function getCategories(data) {
  return [
    'Toate',
    ...Array.from(new Set(data.map(item => item.categorie)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ro', { sensitivity: 'base' }))
  ];
}

function renderCategoryFilters(categories) {
  categoryFilters.innerHTML = '';

  categories.forEach(category => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = `chip px-4 py-2 rounded-full text-sm font-semibold ${category === activeCategory ? 'active' : ''}`;
    button.textContent = category;

    button.addEventListener('click', () => {
      activeCategory = category;
      renderCategoryFilters(categories);
      applyFilters();
    });

    categoryFilters.appendChild(button);
  });
}

function renderCriteriaInputs() {
  criteriaContainer.innerHTML = '';

  CRITERIA.forEach((criteria, index) => {
    const wrapper = document.createElement('div');

    wrapper.className = 'likert-row';

    wrapper.innerHTML = `
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="text-sm font-extrabold text-slate-900">
            ${index + 1}. ${escapeHtml(criteria.title)}
          </span>

          <span class="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
            Pondere: ${criteria.weight}%
          </span>
        </div>

        <p class="text-sm text-slate-600 leading-relaxed">
          ${escapeHtml(criteria.prompt)}
        </p>
      </div>

      <div class="likert-options flex items-center gap-2">
        ${[1, 2, 3, 4, 5].map(value => `
          <label class="likert-cell cursor-pointer">
            <input
              type="radio"
              name="${escapeHtml(criteria.key)}"
              value="${value}"
              required
              class="sr-only peer"
            >

            <span class="w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-sm font-extrabold text-slate-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 hover:border-blue-400">
              ${value}
            </span>
          </label>
        `).join('')}
      </div>
    `;

    criteriaContainer.appendChild(wrapper);
  });
}

function updateStats(filteredStudents) {
  const totalProjects = allStudents.length;
  const visible = filteredStudents.length;
  const summaries = allStudents.map(student => getProjectSummary(student.id));
  const totalEvaluations = summaries.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const evaluatedProjects = summaries.filter(item => Number(item.count || 0) > 0).length;
  const syncSource = remoteStatus === 'ready'
    ? 'Google Sheets + Apps Script'
    : 'fallback local / JSON';

  statsCounter.innerHTML = `
    <i class="fa-solid fa-chart-simple text-blue-600"></i>
    <span>
      Afișate: ${visible} / ${totalProjects} • Evaluări: ${totalEvaluations} • Proiecte evaluate: ${evaluatedProjects}
    </span>
  `;

  heroDescription.textContent = `Platforma centralizează ${totalProjects} proiecte web și ${totalEvaluations} evaluări peer-to-peer. Sursa curentă pentru dashboard: ${syncSource}.`;
}

function render(data) {
  grid.innerHTML = '';

  if (!data.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const abstractImages = [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
  ];

  data.forEach((student, index) => {
    const summary = getProjectSummary(student.id);
    const card = document.createElement('article');

    card.className = 'project-card bg-white rounded-3xl overflow-hidden border border-slate-200 flex flex-col animate-fade-in shadow-sm';
    card.style.animationDelay = `${index * 0.04}s`;

    const imageSrc = `${abstractImages[index % abstractImages.length]}?q=80&w=700&auto=format&fit=crop`;

    card.innerHTML = `
      <div class="relative h-44 bg-slate-100 overflow-hidden">
        <img
          src="${imageSrc}"
          alt=""
          class="w-full h-full object-cover"
          loading="lazy"
        >

        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>

        <div class="absolute left-4 right-4 bottom-4 flex items-center justify-between gap-3">
          <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-extrabold text-slate-800">
            ${escapeHtml(student.categorie)}
          </span>

          <span class="px-3 py-1 rounded-full ${remoteStatus === 'ready' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'} text-xs font-extrabold">
            ${remoteStatus === 'ready' ? 'Sync live' : 'Fallback'}
          </span>
        </div>
      </div>

      <div class="p-5 flex flex-col flex-1 gap-5">
        <div>
          <h3 class="text-xl font-black text-slate-900 leading-tight mb-2">
            ${escapeHtml(student.nume)}
          </h3>

          <p class="text-sm text-slate-500 flex items-center gap-2">
            <i class="fa-brands fa-github"></i>
            <span>GitHub Pages • ${escapeHtml(student.domain)}</span>
          </p>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div class="score-pill border ${metricColor(summary.weightedScore)} px-4 py-2 rounded-2xl font-extrabold">
            ${escapeHtml(summary.scoreLabel)} • ${summary.weightedScore}/5
          </div>

          <div class="text-right">
            <div class="text-xs uppercase tracking-[0.16em] font-bold text-slate-400">
              Evaluări
            </div>

            <div class="text-2xl font-black text-slate-900">
              ${summary.count}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="metric-bar rounded-2xl border border-slate-200 p-3 bg-slate-50">
            <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">
              Relevanță
            </div>

            <div class="text-lg font-black text-slate-900">
              ${summary.criterionAverages.relevanta || 0}
            </div>
          </div>

          <div class="metric-bar rounded-2xl border border-slate-200 p-3 bg-slate-50">
            <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">
              Utilitate
            </div>

            <div class="text-lg font-black text-slate-900">
              ${summary.criterionAverages.utilitate || 0}
            </div>
          </div>

          <div class="metric-bar rounded-2xl border border-slate-200 p-3 bg-slate-50">
            <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">
              Tehnic
            </div>

            <div class="text-lg font-black text-slate-900">
              ${summary.criterionAverages.tehnic || 0}
            </div>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
          <div class="flex items-center justify-between gap-3 mb-2">
            <div class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Comentariu general agregat
            </div>

            <button
              type="button"
              data-comments-id="${escapeHtml(student.id)}"
              class="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              Vezi comentariile
              <i class="fa-solid fa-comments text-[11px]"></i>
            </button>
          </div>

          <div class="line-clamp-3 leading-relaxed">
            ${escapeHtml(summary.summary)}
          </div>
        </div>

        <div class="mt-auto flex flex-col sm:flex-row gap-3">
          ${
            student.urlValid
              ? `
                <a
                  href="${escapeHtml(student.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  Deschide proiectul
                </a>
              `
              : `
                <button
                  type="button"
                  disabled
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-200 text-slate-500 font-bold cursor-not-allowed"
                >
                  <i class="fa-solid fa-link-slash"></i>
                  Link indisponibil
                </button>
              `
          }

          <button
            type="button"
            data-evaluate-id="${escapeHtml(student.id)}"
            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
          >
            <i class="fa-solid fa-pen-to-square"></i>
            Evaluează
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function applyFilters() {
  const term = searchInput.value.toLowerCase().trim();

  const filtered = allStudents.filter(student => {
    const summary = getProjectSummary(student.id);

    const textPool = [
      student.nume,
      student.categorie,
      student.url,
      student.domain,
      summary.topStrength,
      summary.mainImprovement,
      summary.summary
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = textPool.includes(term);
    const matchesCategory = activeCategory === 'Toate' || student.categorie === activeCategory;

    return matchesSearch && matchesCategory;
  });

  updateStats(filtered);
  render(filtered);
}

function openEvaluationModal(projectId) {
  const project = allStudents.find(item => item.id === projectId);

  if (!project) {
    return;
  }

  currentProjectId = projectId;

  modalTitle.textContent = `Evaluare: ${project.nume}`;
  modalSubtitle.textContent = `Evaluezi proiectul din categoria „${project.categorie}”. Vizitează site-ul, revino în portal și completează formularul.`;

  evaluationForm.reset();

  evaluationModal.classList.add('show');
  evaluationModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const evaluatorNameInput = document.getElementById('evaluatorName');

  if (evaluatorNameInput) {
    evaluatorNameInput.focus();
  }
}

function closeEvaluationModal() {
  evaluationModal.classList.remove('show');
  evaluationModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentProjectId = null;
}

function openCommentsModal(projectId) {
  const project = allStudents.find(item => item.id === projectId);

  if (!project) {
    return;
  }

  const comments = getProjectComments(projectId);

  commentsModalTitle.textContent = `Comentarii: ${project.nume}`;
  commentsModalSubtitle.textContent = `Proiect din categoria „${project.categorie}”. Număr de comentarii disponibile: ${comments.length}.`;

  if (!comments.length) {
    commentsModalBody.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
        <i class="fa-regular fa-comment-dots text-4xl text-slate-400 mb-4"></i>

        <h3 class="text-lg font-extrabold text-slate-800 mb-2">
          Nu există comentarii individuale disponibile
        </h3>

        <p class="text-sm text-slate-600 leading-relaxed">
          Pentru acest proiect există doar sinteza agregată sau nu a fost încă trimisă nicio evaluare.
        </p>
      </div>
    `;
  } else {
    commentsModalBody.innerHTML = comments.map((comment, index) => `
      <article class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div>
            <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-1">
              Evaluarea ${index + 1}
            </div>

            <h3 class="text-lg font-extrabold text-slate-900">
              ${escapeHtml(comment.evaluatorName)}
            </h3>

            <p class="text-sm text-slate-500">
              ${escapeHtml(comment.evaluatorClass || 'Clasa nu a fost indicată')}
            </p>
          </div>

          <div class="text-xs text-slate-400 font-semibold">
            ${comment.submittedAt ? escapeHtml(new Date(comment.submittedAt).toLocaleString('ro-RO')) : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div class="font-bold text-emerald-800 mb-2">
              Punct forte
            </div>

            <p class="text-emerald-900 leading-relaxed">
              ${escapeHtml(comment.strengthComment || 'Nu a fost completat.')}
            </p>
          </div>

          <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div class="font-bold text-amber-800 mb-2">
              De îmbunătățit
            </div>

            <p class="text-amber-900 leading-relaxed">
              ${escapeHtml(comment.improvementComment || 'Nu a fost completat.')}
            </p>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div class="font-bold text-blue-800 mb-2">
              Public-țintă
            </div>

            <p class="text-blue-900 leading-relaxed">
              ${escapeHtml(comment.audienceComment || 'Nu a fost completat.')}
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div class="font-bold text-slate-800 mb-2">
              Comentariu general
            </div>

            <p class="text-slate-700 leading-relaxed">
              ${escapeHtml(comment.generalComment || 'Nu a fost completat.')}
            </p>
          </div>
        </div>
      </article>
    `).join('');
  }

  commentsModal.classList.add('show');
  commentsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCommentsModal() {
  commentsModal.classList.remove('show');
  commentsModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showToast(message, duration = 3200) {
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast._timer);

  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function buildEvaluationFromForm(formData) {
  const project = allStudents.find(item => item.id === currentProjectId);

  const evaluation = {
    id: `eval-${Date.now()}`,
    projectId: currentProjectId,
    projectName: project?.nume || '',
    projectCategory: project?.categorie || '',
    projectUrl: project?.url || '',
    evaluatorName: String(formData.get('evaluatorName') || '').trim(),
    evaluatorClass: String(formData.get('evaluatorClass') || '').trim(),
    visitedSite: String(formData.get('visitedSite') || '').trim(),
    strengthComment: String(formData.get('strengthComment') || '').trim(),
    improvementComment: String(formData.get('improvementComment') || '').trim(),
    audienceComment: String(formData.get('audienceComment') || '').trim(),
    generalComment: String(formData.get('generalComment') || '').trim(),
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  CRITERIA.forEach(criteria => {
    evaluation[criteria.key] = Number(formData.get(criteria.key));
  });

  return evaluation;
}

function validateEvaluation(evaluation) {
  if (!evaluation.projectId) {
    return 'Proiectul selectat lipsește.';
  }

  if (!evaluation.evaluatorName) {
    return 'Numele evaluatorului este obligatoriu.';
  }

  if (!evaluation.visitedSite) {
    return 'Confirmarea explorării site-ului este obligatorie.';
  }

  for (const criteria of CRITERIA) {
    if (![1, 2, 3, 4, 5].includes(Number(evaluation[criteria.key]))) {
      return `Completează scorul pentru criteriul „${criteria.title}”.`;
    }
  }

  if (
    !evaluation.strengthComment ||
    !evaluation.improvementComment ||
    !evaluation.audienceComment ||
    !evaluation.generalComment
  ) {
    return 'Toate comentariile sunt obligatorii pentru un feedback formativ complet.';
  }

  return '';
}

function loadSummaryViaJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `portalPeerReviewJsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout la încărcarea sintezelor Apps Script.'));
    }, 12000);

    window[callbackName] = payload => {
      clearTimeout(timeout);
      cleanup();
      resolve(payload);
    };

    const url = new URL(CONFIG.appsScriptUrl);

    url.searchParams.set('action', 'summary');
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('_ts', Date.now().toString());

    script.src = url.toString();

    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Nu s-a putut încărca scriptul JSONP de la Apps Script.'));
    };

    document.body.appendChild(script);
  });
}

async function refreshRemoteSummaries() {
  if (!isAppsScriptConfigured()) {
    remoteStatus = 'unconfigured';
    remoteSummaryByProject = {};
    return;
  }

  remoteStatus = 'loading';

  try {
    const payload = await loadSummaryViaJsonp();

    if (!payload || payload.ok !== true || typeof payload.projects !== 'object') {
      throw new Error('Răspuns invalid de la Apps Script.');
    }

    remoteSummaryByProject = {};

    Object.entries(payload.projects).forEach(([projectId, summary]) => {
      remoteSummaryByProject[projectId] = sanitizeRemoteSummary(summary);
    });

    remoteStatus = 'ready';
  } catch (error) {
    console.error(error);
    remoteSummaryByProject = {};
    remoteStatus = 'unavailable';
  }
}

async function submitEvaluationRemote(evaluation) {
  const params = new URLSearchParams();

  Object.entries(evaluation).forEach(([key, value]) => {
    params.set(key, value == null ? '' : String(value));
  });

  const requestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: params.toString()
  };

  try {
    const response = await fetch(CONFIG.appsScriptUrl, {
      ...requestInit,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Apps Script HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn('POST CORS indisponibil sau răspuns invalid. Încerc fallback no-cors.', error);

    await fetch(CONFIG.appsScriptUrl, {
      ...requestInit,
      mode: 'no-cors'
    });
  }
}

async function handleEvaluationSubmit(evaluation) {
  if (isAppsScriptConfigured()) {
    await submitEvaluationRemote(evaluation);

    showToast('Evaluarea a fost trimisă către Google Sheets. Reîncarc sintezele agregate...', 4200);

    closeEvaluationModal();

    await new Promise(resolve => setTimeout(resolve, CONFIG.remoteRefreshDelayMs));

    await refreshRemoteSummaries();
    applyFilters();

    return;
  }

  saveFallbackEvaluation(evaluation);
  closeEvaluationModal();
  applyFilters();

  showToast('Apps Script nu este încă configurat. Evaluarea a fost salvată local ca fallback.');
}

async function init() {
  try {
    renderCriteriaInputs();

    const [studentsData, seedData] = await Promise.all([
      fetchJsonRequired('elevi.json'),
      fetchJsonOptional(CONFIG.seedEvaluationsFile, [])
    ]);

    allStudents = normalizeStudents(studentsData);

    seedEvaluations = normalizeEvaluations(seedData)
      .filter(item => allStudents.some(student => student.id === item.projectId));

    fallbackEvaluations = loadFallbackEvaluations()
      .filter(item => allStudents.some(student => student.id === item.projectId));

    await refreshRemoteSummaries();

    errorBox.classList.add('hidden');

    renderCategoryFilters(getCategories(allStudents));
    applyFilters();
  } catch (error) {
    console.error('Eroare la inițializare:', error);

    grid.innerHTML = '';
    emptyState.classList.add('hidden');
    errorBox.classList.remove('hidden');

    statsCounter.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
      <span>Date indisponibile</span>
    `;
  }
}

evaluationForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(evaluationForm);
  const evaluation = buildEvaluationFromForm(formData);
  const validationMessage = validateEvaluation(evaluation);

  if (validationMessage) {
    showToast(validationMessage);
    return;
  }

  const submitButton = evaluationForm.querySelector('button[type="submit"]');
  const oldButtonHtml = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin mr-2"></i>
    Se trimite...
  `;

  try {
    await handleEvaluationSubmit(evaluation);
  } catch (error) {
    console.error(error);
    showToast('Trimiterea a eșuat. Verifică URL-ul Web App-ului și permisiunile lui.');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = oldButtonHtml;
  }
});

closeModalBtn.addEventListener('click', closeEvaluationModal);
cancelModalBtn.addEventListener('click', closeEvaluationModal);

evaluationModal.addEventListener('click', event => {
  if (event.target === evaluationModal) {
    closeEvaluationModal();
  }
});

closeCommentsModalBtn.addEventListener('click', closeCommentsModal);

commentsModal.addEventListener('click', event => {
  if (event.target === commentsModal) {
    closeCommentsModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') {
    return;
  }

  if (evaluationModal.classList.contains('show')) {
    closeEvaluationModal();
  }

  if (commentsModal.classList.contains('show')) {
    closeCommentsModal();
  }
});

searchInput.addEventListener('input', applyFilters);

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  activeCategory = 'Toate';

  renderCategoryFilters(getCategories(allStudents));
  applyFilters();
});

grid.addEventListener('click', event => {
  const commentsButton = event.target.closest('[data-comments-id]');
  const evaluateButton = event.target.closest('[data-evaluate-id]');

  if (commentsButton) {
    event.preventDefault();
    event.stopPropagation();

    const projectId = commentsButton.getAttribute('data-comments-id');
    openCommentsModal(projectId);
    return;
  }

  if (evaluateButton) {
    event.preventDefault();
    event.stopPropagation();

    const projectId = evaluateButton.getAttribute('data-evaluate-id');
    openEvaluationModal(projectId);
  }
});

init();
