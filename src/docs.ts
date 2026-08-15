import './docs.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { glossaryEntries, type GlossaryEntry, type LearningTab } from './content/glossary';
import { formatOccupations, getT19State, summarizeT19State, T19_EXAMPLES } from './content/free-string';

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

function t19StateCard(id: string): string {
  const state = getT19State(id);
  const summary = summarizeT19State(state);
  const status = summary.physicalInScope ? 'Matched example in scope' : 'Level mismatch — not accepted in this explorer';
  const statusClass = summary.physicalInScope ? 'state-valid' : 'state-invalid';
  const mass = summary.massSquared === null
    ? 'Mass-squared is withheld until the levels match.'
    : `M² = ${summary.massSquared}`;
  return `<article class="quantum-state-card ${statusClass}" aria-live="polite">
    <div class="card-heading"><h3>${escapeHtml(state.label)}</h3><span class="state-status">${status}</span></div>
    <p>${escapeHtml(state.description)}</p>
    <div class="occupation-grid">
      <div><strong>Left sector</strong><code>${escapeHtml(formatOccupations(state.left))}</code><span>Level N<sub>L</sub> = ${summary.leftLevel}</span></div>
      <div><strong>Right sector</strong><code>${escapeHtml(formatOccupations(state.right))}</code><span>Level N<sub>R</sub> = ${summary.rightLevel}</span></div>
    </div>
    <p class="state-mass"><strong>${mass}</strong> <span>(α′ = 1; bosonic closed-string convention)</span></p>
  </article>`;
}

function t19Section(): string {
  return `<section class="learning-extension" id="t19">
    <div class="extension-heading"><p class="eyebrow">T19 · finite state explorer</p><h2>Free quantum-string modes</h2></div>
    <p>This is a small bookkeeping model for a free bosonic closed string, not a quantum time-evolution engine. It uses flat 26-dimensional spacetime, light-cone oscillator notation, α′ = 1, modes n = 1…4, and occupations 0…2 in each left/right sector.</p>
    <div class="method-note compact-note"><p><strong>Displayed physical-state rule:</strong> the weighted oscillator levels must match, <em>N<sub>L</sub> = N<sub>R</sub></em>. The selector flags unequal examples instead of silently treating them as valid. The finite truncation is a teaching boundary, not the full Hilbert space.</p></div>
    <label class="state-selector" for="t19-example-select">Choose a bounded example
      <select id="t19-example-select" aria-controls="t19-state-output">
        ${Object.values(T19_EXAMPLES).map(state => `<option value="${state.id}">${escapeHtml(state.label)}</option>`).join('')}
      </select>
    </label>
    <div id="t19-state-output">${t19StateCard('vacuum')}</div>
    <p class="caveat">A selected oscillator state is not the same object as the classical profile in the Simulator, and it does not predict a measurement distribution by itself. T20 uses these states only as conceptual in/out labels.</p>
  </section>`;
}

function topologyDiagram(id: string, title: string, description: string, drawing: string): string {
  return `<figure class="topology-figure">
    <svg viewBox="0 0 360 190" role="img" aria-labelledby="${id}-title ${id}-description">
      <title id="${id}-title">${escapeHtml(title)}</title>
      <desc id="${id}-description">${escapeHtml(description)}</desc>
      ${drawing}
    </svg>
    <figcaption><strong>${escapeHtml(title)}</strong> — ${escapeHtml(description)}</figcaption>
  </figure>`;
}

function t20Section(): string {
  const propagation = topologyDiagram(
    't20-propagation',
    'Free propagation: strip topology',
    'One incoming free-string state propagates to one outgoing free-string state across a strip-like worldsheet.',
    `<path class="topology-surface" d="M45 35 Q180 15 315 35 L315 155 Q180 175 45 155 Z" />
     <path class="topology-line" d="M75 142 C130 112 230 78 285 48" />
     <path class="topology-line faint" d="M75 48 C130 78 230 112 285 142" />
     <text x="55" y="25" class="topology-label">in</text><text x="296" y="25" class="topology-label">out</text>
     <text x="157" y="181" class="topology-caption">cylinder / strip</text>`,
  );
  const splitJoin = topologyDiagram(
    't20-split-join',
    'Splitting or joining: pair of pants',
    'A single incoming string branches into two outgoing strings, or the same surface is read in reverse as a joining process.',
    `<path class="topology-surface" d="M132 28 C100 43 95 72 111 94 C124 111 124 125 105 145 C91 160 104 171 125 171 L235 171 C256 171 269 160 255 145 C236 125 236 111 249 94 C265 72 260 43 228 28 C205 17 155 17 132 28 Z" />
     <path class="topology-line" d="M180 25 C180 62 180 92 151 123" />
     <path class="topology-line" d="M180 92 C180 110 202 125 220 146" />
     <path class="topology-line" d="M180 92 C180 110 158 125 140 146" />
     <text x="171" y="18" class="topology-label">in</text><text x="126" y="184" class="topology-label">out</text><text x="218" y="184" class="topology-label">out</text>
     <text x="145" y="108" class="topology-caption">split / join</text>`,
  );
  const loop = topologyDiagram(
    't20-loop',
    'Loop correction: added handle',
    'A higher-genus worldsheet adds a handle to the propagation surface; this diagram does not evaluate the corresponding loop amplitude.',
    `<path class="topology-surface" d="M55 54 C55 22 104 18 125 43 C139 60 151 60 166 43 C187 18 236 22 236 54 L236 136 C236 168 187 172 166 147 C151 130 139 130 125 147 C104 172 55 168 55 136 Z" />
     <ellipse class="topology-hole" cx="145" cy="95" rx="27" ry="38" />
     <path class="topology-line" d="M75 142 C115 119 175 119 216 142" />
     <text x="61" y="43" class="topology-label">in</text><text x="220" y="43" class="topology-label">out</text>
     <text x="125" y="181" class="topology-caption">genus 1 / handle</text>`,
  );
  return `<section class="learning-extension" id="t20">
    <div class="extension-heading"><p class="eyebrow">T20 · conceptual topology</p><h2>Perturbative string interactions</h2></div>
    <p>In perturbative string theory, an interaction is represented by a worldsheet surface connecting free in/out states. These diagrams explain the topology vocabulary; they do not add a local splitting rule to T18.</p>
    <div class="topology-grid">${propagation}${splitJoin}${loop}</div>
    <div class="method-note compact-note"><p><strong>What is not calculated:</strong> no scattering amplitude, path integral, moduli-space integral, loop correction, non-perturbative process, or probability is computed here. The free states shown conceptually are the finite T19 examples above.</p><p><a href="#t19">Return to the T19 state explorer</a> and compare a free-state label with the topology that could connect in/out states in a separate perturbative calculation.</p></div>
  </section>`;
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
    ${t19Section()}
    ${t20Section()}
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

const t19Select = document.getElementById('t19-example-select') as HTMLSelectElement | null;
const t19Output = document.getElementById('t19-state-output');
t19Select?.addEventListener('change', () => {
  if (t19Output) t19Output.innerHTML = t19StateCard(t19Select.value);
});
