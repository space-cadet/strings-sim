import './docs.css';
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

function navigation(): string {
  return `<nav class="site-tabs" aria-label="Primary navigation">${tabNames.map(([id, label]) => {
    const current = id === pageKind ? ' aria-current="page"' : '';
    return `<a href="${relativeRoutes[id]}"${current}>${label}</a>`;
  }).join('')}</nav>`;
}

function glossaryCard(entry: GlossaryEntry, detailed = true): string {
  const formula = entry.formula ? `<p class="formula">${escapeHtml(entry.formula)}</p>` : '';
  const implementation = detailed && entry.implementation ? `<p><strong>In this app:</strong> ${escapeHtml(entry.implementation)}</p>` : '';
  const experiment = detailed && entry.experiment ? `<p class="try-this"><strong>Try this:</strong> ${escapeHtml(entry.experiment)}</p>` : '';
  const caveat = detailed && entry.caveat ? `<p class="caveat"><strong>Keep in mind:</strong> ${escapeHtml(entry.caveat)}</p>` : '';
  const symbol = entry.symbol ? `<span class="entry-symbol">${escapeHtml(entry.symbol)}</span>` : '';
  return `<article class="glossary-card" id="${entry.id}">
    <div class="card-heading"><h2>${escapeHtml(entry.term)}</h2>${symbol}</div>
    <p class="lead">${escapeHtml(entry.short)}</p>
    <p>${escapeHtml(entry.meaning)}</p>${formula}${implementation}${experiment}${caveat}
  </article>`;
}

function learnPage(): string {
  const physical = glossaryEntries.find(entry => entry.id === 'physical-picture')!;
  const profile = glossaryEntries.find(entry => entry.id === 'string-profile')!;
  const worldsheet = glossaryEntries.find(entry => entry.id === 'worldsheet')!;
  const modes = glossaryEntries.find(entry => entry.id === 'normal-modes')!;
  return `<main class="learning-page">
    <section class="hero-copy">
      <p class="eyebrow">Start here</p>
      <h1>Learn to read a vibrating string</h1>
      <p class="intro">Use the Simulator to change one thing at a time, then return here to interpret the profile and its history. This is a classical and linearized teaching model—useful for intuition, not a full quantum string calculation.</p>
    </section>
    <section class="lesson-grid" aria-label="Learning sequence">
      <article class="lesson-step" id="physical-picture"><span>01</span><h2>The physical picture</h2><p>${escapeHtml(physical.meaning)}</p><a href="../">Open the Simulator</a></article>
      <article class="lesson-step" id="normal-modes"><span>02</span><h2>Discover wave behaviour</h2><p>${escapeHtml(modes.meaning)} Reflections, travelling pulses, and interference become visible when you compare presets and boundary conditions.</p><p class="try-this"><strong>Try this:</strong> ${escapeHtml(modes.experiment!)}</p></article>
      <article class="lesson-step" id="worldsheet"><span>03</span><h2>Use the worldsheet as a bridge</h2><p>The profile is the string now. The worldsheet is the history of every point on the string. The upcoming probe trajectory will show the history of one selected position.</p><p class="try-this"><strong>Try this:</strong> ${escapeHtml(worldsheet.experiment!)}</p></article>
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
    <section class="method-note" id="model-boundary"><h2>A teaching model, stated plainly</h2><p>The simulator visualises classical and linearized transverse-string dynamics. It is designed to build intuition about waves, modes, and worldsheets; it does not compute a full interacting quantum string theory.</p></section>
    <section class="glossary-list">${entries.map(entry => glossaryCard(entry)).join('')}</section>
  </main>`;
}

const content = pageKind === 'learn' ? learnPage() : pageKind === 'glossary' ? glossaryPage() : implementationPage();
pageRoot.innerHTML = `<header class="docs-header"><a class="site-brand" href="../">String Motion Simulator</a>${navigation()}</header>${content}<footer class="docs-footer">A visual guide to waves, worldsheets, and the numerical model behind the simulator.</footer>`;
