import './docs.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { glossaryEntries, type GlossaryEntry, type LearningTab } from './content/glossary';

type PageKind = LearningTab;

const pageRoot = document.getElementById('docs-app');
const pageKind = document.body.dataset.page as PageKind | undefined;

if (!pageRoot || !pageKind) {
  throw new Error('Documentation page requires #docs-app and a valid data-page value.');
}

const relativeRoutes: Record<PageKind | 'simulator', string> = {
  simulator: '../',
  learn: '../learn/',
  glossary: '../glossary/',
  implementation: '../implementation/',
};

const tabNames: Array<[PageKind | 'simulator', string]> = [
  ['simulator', 'Simulator'],
  ['learn', 'Learn'],
  ['glossary', 'Glossary'],
  ['implementation', 'How it works'],
];

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

/** Render inline LaTex written as \\(...\\) while escaping every non-mathematical fragment. */
function renderMathText(value: string): string {
  return value.split(/(\\\([\s\S]*?\\\))/g).map(fragment => {
    const match = fragment.match(/^\\\(([\s\S]*?)\\\)$/);
    return match
      ? katex.renderToString(match[1], { displayMode: false, throwOnError: false })
      : escapeHtml(fragment);
  }).join('');
}

function navigation(): string {
  return `<nav class="site-tabs" aria-label="Primary navigation">${tabNames.map(([id, label]) => {
    const current = id === pageKind ? ' aria-current="page"' : '';
    return `<a href="${relativeRoutes[id]}"${current}>${label}</a>`;
  }).join('')}</nav>`;
}

function glossaryCard(entry: GlossaryEntry, detailed = true): string {
  const formula = entry.formula ? `<p class="formula">${renderMathText(entry.formula)}</p>` : '';
  const implementation = detailed && entry.implementation ? `<p><strong>In this app:</strong> ${renderMathText(entry.implementation)}</p>` : '';
  const experiment = detailed && entry.experiment ? `<p class="try-this"><strong>Try this:</strong> ${renderMathText(entry.experiment)}</p>` : '';
  const caveat = detailed && entry.caveat ? `<p class="caveat"><strong>Keep in mind:</strong> ${renderMathText(entry.caveat)}</p>` : '';
  const symbol = entry.symbol ? `<span class="entry-symbol">${renderMathText(entry.symbol)}</span>` : '';
  return `<article class="glossary-card" id="${entry.id}">
    <div class="card-heading"><h2>${escapeHtml(entry.term)}</h2>${symbol}</div>
    <p class="lead">${renderMathText(entry.short)}</p>
    <p>${renderMathText(entry.meaning)}</p>${formula}${implementation}${experiment}${caveat}
  </article>`;
}

function learnPage(): string {
  const physical = glossaryEntries.find(entry => entry.id === 'physical-picture')!;
  const profile = glossaryEntries.find(entry => entry.id === 'string-profile')!;
  const worldsheet = glossaryEntries.find(entry => entry.id === 'worldsheet')!;
  const modes = glossaryEntries.find(entry => entry.id === 'normal-modes')!;
  const probe = glossaryEntries.find(entry => entry.id === 'probe-trajectory')!;
  const initialConditions = glossaryEntries.find(entry => entry.id === 'initial-conditions')!;
  const boundaries = glossaryEntries.find(entry => entry.id === 'boundary-conditions')!;
  const damping = glossaryEntries.find(entry => entry.id === 'damping')!;
  return `<main class="learning-page">
    <section class="hero-copy">
      <p class="eyebrow">Start here</p>
      <h1>Learn to read a vibrating string</h1>
      <p class="intro">Use the Simulator to change one thing at a time, then return here to interpret the profile and its history. This is a classical and linearized teaching model—useful for intuition, not a full quantum string calculation.</p>
    </section>
    <section class="lesson-grid" aria-label="Learning sequence">
      <article class="lesson-step" id="physical-picture"><span>01</span><h2>The physical picture</h2><p>${renderMathText(physical.meaning)}</p><a href="../">Open the Simulator</a></article>
      <article class="lesson-step" id="initial-conditions"><span>02</span><h2>Separate shape from motion</h2><p>${renderMathText(initialConditions.meaning)}</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(initialConditions.experiment!)}</p></article>
      <article class="lesson-step" id="normal-modes"><span>03</span><h2>Discover standing modes</h2><p>${renderMathText(modes.meaning)} Reflections, travelling pulses, and interference become visible when you compare presets and boundary conditions.</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(modes.experiment!)}</p></article>
      <article class="lesson-step" id="boundary-conditions"><span>04</span><h2>Change the end rule</h2><p>${renderMathText(boundaries.meaning)}</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(boundaries.experiment!)}</p></article>
      <article class="lesson-step" id="worldsheet"><span>05</span><h2>Use the worldsheet as a bridge</h2><p>The profile is the string now. The worldsheet is the history of every point on the string. The probe trajectory follows one selected coordinate as ${renderMathText('\\(y(\\sigma_\\ast,\\tau)\\)')}.</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(worldsheet.experiment!)}</p></article>
      <article class="lesson-step" id="probe-trajectory"><span>06</span><h2>Follow one point through time</h2><p>${renderMathText(probe.meaning)}</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(probe.experiment!)}</p></article>
      <article class="lesson-step" id="damping"><span>07</span><h2>Track a controlled loss</h2><p>${renderMathText(damping.meaning)}</p><p class="try-this"><strong>Try this:</strong> ${renderMathText(damping.experiment!)}</p></article>
    </section>
    <section class="concept-pair">
      ${glossaryCard(profile, false)}
      ${glossaryCard(worldsheet, false)}
    </section>
  </main>`;
}

function glossaryPage(): string {
  const entries = glossaryEntries.filter(entry => entry.primaryTab === 'glossary');
  return `<main class="documentation-page">
    <section class="hero-copy"><p class="eyebrow">Reference</p><h1>Mathematical glossary</h1><p class="intro">Short definitions in the interface lead here for the physical meaning, formulae, and how the current simulator uses each quantity.</p></section>
    <section class="glossary-list">${entries.map(entry => glossaryCard(entry)).join('')}</section>
  </main>`;
}

function implementationPage(): string {
  const entries = glossaryEntries.filter(entry => entry.primaryTab === 'implementation');
  return `<main class="documentation-page">
    <section class="hero-copy"><p class="eyebrow">Method</p><h1>How the simulator works</h1><p class="intro">The app advances a discretised transverse-string model. These notes explain the numerical choices and their limits in plain language.</p></section>
    <section class="method-note" id="model-boundary"><h2>A teaching model, stated plainly</h2><p>The T17 reference path visualises classical and linearized transverse-string dynamics. It is designed to build intuition about waves, modes, and numerical worldsheets; it does not compute a full interacting quantum string theory. The separate T18 mode adds a bounded classical closed-string target-space embedding with explicit conformal-gauge constraints.</p><p>The periodic option in the reference path is a closed-boundary case for the linear wave equation. T18 is a separate flat-spacetime classical model and does not add quantization, string interactions, scattering amplitudes, or open-string endpoints.</p></section>
    <section class="glossary-list">${entries.map(entry => glossaryCard(entry)).join('')}</section>
  </main>`;
}

const content = pageKind === 'learn' ? learnPage() : pageKind === 'glossary' ? glossaryPage() : implementationPage();
pageRoot.innerHTML = `<header class="docs-header"><a class="site-brand" href="../">String Motion Simulator</a>${navigation()}</header>${content}<footer class="docs-footer">A visual guide to waves, worldsheets, and the numerical model behind the simulator.</footer>`;
