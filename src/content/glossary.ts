export type LearningTab = 'learn' | 'glossary' | 'implementation';

export interface GlossaryEntry {
  id: string;
  term: string;
  symbol?: string;
  short: string;
  meaning: string;
  formula?: string;
  implementation?: string;
  experiment?: string;
  caveat?: string;
  related: string[];
  primaryTab: LearningTab;
}

export const glossaryEntries: GlossaryEntry[] = [
  {
    id: 'physical-picture',
    term: 'Reading the string',
    symbol: 'y(σ, τ)',
    short: 'A map of the string’s displacement at each position and time.',
    meaning: 'σ labels a position along the string, τ labels time, and y(σ, τ) tells us how far that position is displaced transversely. The simulator turns this function into a moving curve and a spacetime history.',
    experiment: 'Choose a normal-mode preset, press Play, and compare the curve now with its later worldsheet trace.',
    related: ['string-profile', 'worldsheet', 'normal-modes'],
    primaryTab: 'learn',
  },
  {
    id: 'string-profile',
    term: 'String profile',
    symbol: 'y(σ, τ₀)',
    short: 'The shape of the whole string right now.',
    meaning: 'The profile is one time-slice of the simulation. Moving horizontally follows the string from one end to the other; moving vertically measures transverse displacement from the equilibrium line.',
    implementation: 'The canvas draws the solver’s current array of displacement samples, with a smooth curve between adjacent grid points.',
    experiment: 'Pause the simulation, then use a different preset to see how a changed initial shape changes the profile.',
    related: ['physical-picture', 'worldsheet', 'boundary-conditions'],
    primaryTab: 'learn',
  },
  {
    id: 'worldsheet',
    term: 'Worldsheet',
    symbol: 'y(σ, τ)',
    short: 'The history of every point on the string, shown as a heatmap.',
    meaning: 'The worldsheet stacks many string profiles over time. Horizontal position is σ, vertical position is τ, and colour represents displacement. Diagonal features reveal travelling disturbances; repeating bands reveal standing modes.',
    implementation: 'The solver retains a rolling sequence of timestamped displacement arrays. The worldsheet renderer maps that history to a colour field over the visible time window.',
    experiment: 'Run a travelling-pulse preset and follow its diagonal colour trace. Then compare it with a standing-wave preset.',
    caveat: 'This is a visual history of a one-dimensional teaching model, not an embedded relativistic string worldsheet in target spacetime.',
    related: ['physical-picture', 'string-profile', 'normal-modes'],
    primaryTab: 'learn',
  },
  {
    id: 'normal-modes',
    term: 'Normal modes',
    short: 'Special standing-wave patterns allowed by the string’s boundary conditions.',
    meaning: 'A normal mode oscillates with a stable spatial shape. The fundamental has one broad arch; higher modes have more nodes, points that remain at zero displacement.',
    experiment: 'Compare Fundamental standing wave with Third normal mode. Count the interior nodes and watch how the frequency changes.',
    related: ['boundary-conditions', 'string-profile', 'wave-speed'],
    primaryTab: 'learn',
  },
  {
    id: 'tension',
    term: 'String tension',
    symbol: 'τ',
    short: 'Greater tension makes disturbances propagate faster.',
    meaning: 'Tension is the restoring force that pulls a displaced string back toward its equilibrium shape. Raising it increases the classical wave speed when mass density stays fixed.',
    formula: 'c = √(τ / μ)',
    implementation: 'In classical mode, the application recalculates wave speed and the conservative stable timestep after tension changes. In the linearized relativistic teaching mode, natural-unit parameters are fixed.',
    experiment: 'In Classical mode, raise tension and restart a travelling pulse. Compare how quickly it reaches the far end.',
    related: ['wave-speed', 'mass-density', 'courant-condition'],
    primaryTab: 'glossary',
  },
  {
    id: 'mass-density',
    term: 'Linear mass density',
    symbol: 'μ',
    short: 'More mass per unit length makes the classical string respond more slowly.',
    meaning: 'Mass density describes how much inertial mass the string has along its length. Increasing μ lowers the wave speed when tension is fixed.',
    formula: 'c = √(τ / μ)',
    related: ['tension', 'wave-speed'],
    primaryTab: 'glossary',
  },
  {
    id: 'boundary-conditions',
    term: 'Boundary conditions',
    short: 'Rules at the string’s ends that determine reflection and allowed standing waves.',
    meaning: 'Fixed ends force endpoint displacement to remain zero. Free ends allow the endpoint slope to vanish. Mixed ends combine the two. These rules change how pulses reflect and which normal modes fit on the string.',
    implementation: 'Every solver step applies the selected endpoint rule after calculating the interior update.',
    experiment: 'Send a pulse toward an end, then repeat with a different boundary condition and compare the reflected shape.',
    related: ['normal-modes', 'string-profile', 'wave-speed'],
    primaryTab: 'glossary',
  },
  {
    id: 'wave-speed',
    term: 'Wave speed',
    symbol: 'c',
    short: 'The speed at which small classical disturbances travel along the string.',
    meaning: 'For an ideal classical string, tension supplies the restoring force and mass density supplies inertia. Their ratio sets the speed of small transverse waves.',
    formula: 'c = √(τ / μ)',
    implementation: 'The live diagnostic reads the solver metric. The same speed determines a conservative timestep for the explicit classical update.',
    related: ['tension', 'mass-density', 'courant-condition'],
    primaryTab: 'glossary',
  },
  {
    id: 'courant-condition',
    term: 'Courant condition',
    symbol: 'λ = c Δτ / Δσ',
    short: 'A numerical-stability measure for the explicit time-stepping scheme.',
    meaning: 'The Courant number compares how far a disturbance can travel in one timestep with the grid spacing. It is a property of the numerical method, not a new physical observable of string theory.',
    formula: 'λ = c Δτ / Δσ ≤ 1',
    implementation: 'The simulator chooses a conservative timestep with λ = 0.5 for the current grid and wave speed. The solver also protects the relativistic update against a violated Courant limit.',
    caveat: 'Meeting the Courant condition prevents one kind of numerical instability; it does not by itself prove that a simulation represents full relativistic string dynamics.',
    related: ['wave-speed', 'finite-difference-update'],
    primaryTab: 'implementation',
  },
  {
    id: 'finite-difference-update',
    term: 'Finite-difference update',
    short: 'The numerical rule that advances the string one small timestep at a time.',
    meaning: 'The continuous wave equation is approximated on a grid of spatial samples and discrete timesteps. Each new displacement is calculated from nearby points and the preceding time state.',
    implementation: 'Each spatial Laplacian is evaluated from an immutable snapshot of the current displacement slice. This avoids accidentally reading an already-updated neighbouring point and preserves the intended central stencil.',
    related: ['courant-condition', 'worldsheet'],
    primaryTab: 'implementation',
  },
];

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return glossaryEntries.find(entry => entry.id === id);
}
