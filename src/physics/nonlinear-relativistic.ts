/**
 * T18: constrained nonlinear classical string evolution.
 *
 * Scope: a closed classical string in flat 2+1-dimensional Minkowski space,
 * conformal gauge, X^0 = tau, natural units, and periodic sigma. In this
 * gauge the embedding satisfies the wave equation while the nonlinear
 * physical content is carried by the pointwise conformal constraints.
 *
 * The solver transports the left- and right-moving unit tangent fields. A
 * periodic semi-Lagrangian shift with projection back to unit length keeps
 * the constraints explicit and observable instead of treating them as an
 * after-the-fact visual diagnostic.
 */

import type { BoundaryCondition, SimulationConfig, SimulationMetrics, StringParameters, StringState } from './core.js';
import type { WorldsheetPoint } from './relativistic.js';

export interface TangentField {
  x: Float64Array;
  y: Float64Array;
}

export interface NonlinearInitialData {
  left: TangentField;
  right: TangentField;
  center?: { x: number; y: number };
}

export interface ConformalConstraintReport {
  maxOrthogonalityResidual: number;
  maxNormalizationResidual: number;
  closureError: number;
  leftEndpointResidual: number;
  rightEndpointResidual: number;
  maxBoundaryEnergyFlux: number;
  residual: number;
}

export interface T18BoundaryContract {
  boundary: BoundaryCondition;
  topology: 'closed' | 'open' | 'anti-periodic-cell';
  leftEndpoint: 'periodic' | 'fixed' | 'free' | 'anti-periodic';
  rightEndpoint: 'periodic' | 'fixed' | 'free' | 'anti-periodic';
  fieldIdentification: 'periodic' | 'reflected' | 'anti-periodic';
}

export interface NonlinearStringState extends StringState {
  /** Target-space embedding samples at the current worldsheet time. */
  embeddingX: Float64Array;
  embeddingY: Float64Array;
  /** Target-space velocity samples at the current worldsheet time. */
  velocityX: Float64Array;
  velocityY: Float64Array;
  /** Rolling transverse projection history for the existing renderer. */
  worldsheet: WorldsheetPoint[][];
  constraints: ConformalConstraintReport;
}

export interface LoopTangentOptions {
  leftAmplitude?: number;
  rightAmplitude?: number;
  rightPhase?: number;
  leftPhase?: number;
  leftHarmonics?: TangentHarmonic[];
  rightHarmonics?: TangentHarmonic[];
}

export interface TangentHarmonic {
  /** Even harmonic number; even harmonics preserve antipodal closure. */
  harmonic: number;
  amplitude: number;
  phase?: number;
}

export interface T18PresetDefinition {
  label: string;
  description: string;
  options: LoopTangentOptions;
}

export interface T18PresetDiagnostics {
  name: string;
  label: string;
  leftHarmonics: Array<{ harmonic: number; amplitude: number }>;
  rightHarmonics: Array<{ harmonic: number; amplitude: number }>;
  projectedArea: number;
  radiusRms: number;
  boundingWidth: number;
  boundingHeight: number;
  velocityRms: number;
  maxSpeed: number;
  energy: number;
  constraintResidual: number;
}

export interface T18GeometricModeMixingReport {
  preset: string;
  sampleSteps: number;
  initialProjectedArea: number;
  evolvedProjectedArea: number;
  initialRadialHarmonics: number[];
  evolvedRadialHarmonics: number[];
  initialHigherHarmonicFraction: number;
  evolvedHigherHarmonicFraction: number;
}

/**
 * Closed-string presets for T18. Each tangent angle is built from the odd
 * base winding plus even harmonics, so f(sigma + L/2) = -f(sigma) and the
 * discrete loop closes exactly while the unit constraints remain exact.
 */
export const T18_PRESETS: Readonly<Record<string, T18PresetDefinition>> = {
  pluck: {
    label: 'Smooth asymmetric loop',
    description: 'A gently lopsided closed loop; the T18 counterpart of a simple pluck.',
    options: {
      leftHarmonics: [{ harmonic: 2, amplitude: 0.18 }],
      rightHarmonics: [{ harmonic: 2, amplitude: 0.10 }],
      rightPhase: Math.PI / 3,
    },
  },
  sine: {
    label: 'Elliptic standing loop',
    description: 'Matched left/right distortions produce a clean standing elliptical shape.',
    options: {
      leftHarmonics: [{ harmonic: 2, amplitude: 0.34 }],
      rightHarmonics: [{ harmonic: 2, amplitude: 0.34 }],
      rightPhase: 0,
    },
  },
  thirdHarmonic: {
    label: 'Three-lobed loop',
    description: 'A higher even tangent harmonic creates a three-lobed target-space projection.',
    options: {
      leftHarmonics: [{ harmonic: 6, amplitude: 0.42 }],
      rightHarmonics: [{ harmonic: 6, amplitude: 0.30 }],
      rightPhase: Math.PI / 5,
    },
  },
  twoMode: {
    label: 'Mixed-harmonic loop',
    description: 'Two tangent harmonics combine into a deliberately non-elliptic loop.',
    options: {
      leftHarmonics: [
        { harmonic: 2, amplitude: 0.25 },
        { harmonic: 4, amplitude: 0.12, phase: Math.PI / 6 },
      ],
      rightHarmonics: [
        { harmonic: 2, amplitude: 0.19 },
        { harmonic: 4, amplitude: -0.10, phase: Math.PI / 5 },
      ],
      rightPhase: Math.PI / 4,
    },
  },
  gaussian: {
    label: 'High-curvature pair',
    description: 'Several aligned harmonics create two concentrated high-curvature regions.',
    options: {
      leftHarmonics: [
        { harmonic: 2, amplitude: 0.12 },
        { harmonic: 4, amplitude: 0.18 },
        { harmonic: 6, amplitude: 0.16 },
        { harmonic: 8, amplitude: 0.10 },
        { harmonic: 10, amplitude: 0.05 },
      ],
      rightHarmonics: [
        { harmonic: 2, amplitude: 0.08 },
        { harmonic: 4, amplitude: 0.14 },
        { harmonic: 6, amplitude: 0.13 },
        { harmonic: 8, amplitude: 0.08 },
        { harmonic: 10, amplitude: 0.04 },
      ],
      rightPhase: Math.PI / 7,
    },
  },
  travelingPulse: {
    label: 'Asymmetric travelling loop',
    description: 'Unequal left/right tangent sectors give the loop a strong travelling component.',
    options: {
      leftHarmonics: [
        { harmonic: 2, amplitude: 0.38 },
        { harmonic: 4, amplitude: 0.11, phase: Math.PI / 3 },
      ],
      rightHarmonics: [{ harmonic: 2, amplitude: 0.05 }],
      rightPhase: Math.PI / 2,
    },
  },
  doublePulse: {
    label: 'Counter-propagating lobes',
    description: 'Opposed left/right sectors create a moving two-lobe configuration.',
    options: {
      leftHarmonics: [
        { harmonic: 2, amplitude: 0.28, phase: Math.PI / 8 },
        { harmonic: 6, amplitude: 0.16, phase: Math.PI / 2 },
      ],
      rightHarmonics: [
        { harmonic: 2, amplitude: 0.28, phase: -Math.PI / 8 },
        { harmonic: 6, amplitude: -0.16, phase: Math.PI / 2 },
      ],
      rightPhase: Math.PI / 2,
    },
  },
  random: {
    label: 'Deterministic five-harmonic loop',
    description: 'A reproducible mixture of five even tangent harmonics for complex motion.',
    options: {
      leftHarmonics: [
        { harmonic: 2, amplitude: 0.18 },
        { harmonic: 4, amplitude: -0.13, phase: 0.4 },
        { harmonic: 6, amplitude: 0.10, phase: 1.1 },
        { harmonic: 8, amplitude: -0.07, phase: 1.8 },
        { harmonic: 10, amplitude: 0.05, phase: 2.4 },
      ],
      rightHarmonics: [
        { harmonic: 2, amplitude: 0.13, phase: 0.2 },
        { harmonic: 4, amplitude: -0.10, phase: 0.8 },
        { harmonic: 6, amplitude: 0.08, phase: 1.4 },
        { harmonic: 8, amplitude: -0.05, phase: 2.0 },
        { harmonic: 10, amplitude: 0.04, phase: 2.8 },
      ],
      rightPhase: Math.PI / 3,
    },
  },
};

export function getT18PresetDefinition(name: string): T18PresetDefinition {
  return T18_PRESETS[name] ?? T18_PRESETS.pluck;
}

export function getT18PresetNames(): string[] {
  return Object.keys(T18_PRESETS);
}

export function getT18BoundaryContract(boundary: BoundaryCondition): T18BoundaryContract {
  if (boundary === 'periodic') {
    return {
      boundary,
      topology: 'closed',
      leftEndpoint: 'periodic',
      rightEndpoint: 'periodic',
      fieldIdentification: 'periodic',
    };
  }
  if (boundary === 'anti-periodic') {
    return {
      boundary,
      topology: 'anti-periodic-cell',
      leftEndpoint: 'anti-periodic',
      rightEndpoint: 'anti-periodic',
      fieldIdentification: 'anti-periodic',
    };
  }
  return {
    boundary,
    topology: 'open',
    leftEndpoint: boundary === 'mixed' ? 'fixed' : boundary,
    rightEndpoint: boundary === 'mixed' ? 'free' : boundary,
    fieldIdentification: 'reflected',
  };
}

export function createT18PresetInitialData(N: number, name: string): NonlinearInitialData {
  return createConformalLoopInitialData(N, getT18PresetDefinition(name).options);
}

/**
 * Constraint-compatible open-string reference data. The two unit tangent
 * fields are mirrored across the transverse axis, so the embedding tangent
 * and velocity remain orthogonal and have squared magnitudes summing to one.
 * The endpoint angle selects fixed (theta = 0) or free (theta = pi/2) data.
 */
export function createOpenT18InitialData(
  N: number,
  boundary: Extract<BoundaryCondition, 'fixed' | 'free' | 'mixed'> = 'fixed',
  options: LoopTangentOptions = {},
): NonlinearInitialData {
  if (N < 16) throw new Error('An open T18 string requires at least 16 samples.');
  const contract = getT18BoundaryContract(boundary);
  const left = { x: new Float64Array(N), y: new Float64Array(N) };
  const right = { x: new Float64Array(N), y: new Float64Array(N) };
  const rightEndpointAngle = contract.rightEndpoint === 'free' ? Math.PI / 2 : 0;
  const leftEndpointAngle = contract.leftEndpoint === 'free' ? Math.PI / 2 : 0;
  const perturbation = (
    fraction: number,
    harmonics: TangentHarmonic[] | undefined,
    fallback: number,
    phase: number,
  ): number => fallback + (harmonics ?? []).reduce(
    (sum, term) => sum + term.amplitude * Math.sin(term.harmonic * Math.PI * fraction + (term.phase ?? phase)),
    0,
  );
  for (let i = 0; i < N; i++) {
    const fraction = i / (N - 1);
    const baseAngle = leftEndpointAngle + (rightEndpointAngle - leftEndpointAngle) * fraction;
    const envelope = Math.sin(Math.PI * fraction);
    const leftAngle = baseAngle + envelope * perturbation(fraction, options.leftHarmonics, 0.28, options.leftPhase ?? 0);
    const rightAngle = -baseAngle + envelope * perturbation(fraction, options.rightHarmonics, -0.28, options.rightPhase ?? 0);
    left.x[i] = Math.cos(leftAngle);
    left.y[i] = Math.sin(leftAngle);
    right.x[i] = Math.cos(rightAngle);
    right.y[i] = Math.sin(rightAngle);
  }
  return { left, right, center: { x: 0, y: 0 } };
}

/**
 * One anti-periodic reference cell. The doubled-domain solver extends both
 * tangent fields with a sign flip across the cell boundary, so the second
 * cell retraces the first with reversed tangent and closes at length 2L.
 */
export function createAntiPeriodicT18InitialData(N: number, options: LoopTangentOptions = {}): NonlinearInitialData {
  if (N < 16) throw new Error('An anti-periodic T18 cell requires at least 16 samples.');
  const left = { x: new Float64Array(N), y: new Float64Array(N) };
  const right = { x: new Float64Array(N), y: new Float64Array(N) };
  for (let i = 0; i < N; i++) {
    const theta = 2 * Math.PI * i / N;
    const leftAngle = tangentAngle(theta, options.leftPhase ?? 0.18, 0.38, options.leftHarmonics);
    const rightAngle = tangentAngle(theta, options.rightPhase ?? -0.42, 0.24, options.rightHarmonics);
    left.x[i] = Math.cos(leftAngle);
    left.y[i] = Math.sin(leftAngle);
    right.x[i] = Math.cos(rightAngle);
    right.y[i] = Math.sin(rightAngle);
  }
  return { left, right, center: { x: 0, y: 0 } };
}

function harmonicAmplitudes(field: TangentField, maxHarmonic: number): Array<{ harmonic: number; amplitude: number }> {
  const amplitudes: Array<{ harmonic: number; amplitude: number }> = [];
  const N = field.x.length;
  for (let harmonic = 2; harmonic <= maxHarmonic; harmonic += 2) {
    let cosine = 0;
    let sine = 0;
    for (let i = 0; i < N; i++) {
      const theta = 2 * Math.PI * i / N;
      const tangentAngle = Math.atan2(field.y[i], field.x[i]);
      const baseAngle = theta;
      const residual = Math.atan2(Math.sin(tangentAngle - baseAngle), Math.cos(tangentAngle - baseAngle));
      cosine += residual * Math.cos(harmonic * theta);
      sine += residual * Math.sin(harmonic * theta);
    }
    amplitudes.push({ harmonic, amplitude: 2 * Math.hypot(cosine, sine) / N });
  }
  return amplitudes;
}

function radialHarmonics(x: Float64Array, y: Float64Array, maxHarmonic: number): number[] {
  const N = x.length;
  const radius = new Float64Array(N);
  for (let i = 0; i < N; i++) radius[i] = Math.hypot(x[i], y[i]);
  const result: number[] = [];
  for (let harmonic = 1; harmonic <= maxHarmonic; harmonic++) {
    let cosine = 0;
    let sine = 0;
    for (let i = 0; i < N; i++) {
      const theta = 2 * Math.PI * harmonic * i / N;
      cosine += radius[i] * Math.cos(theta);
      sine += radius[i] * Math.sin(theta);
    }
    result.push(Math.hypot(cosine, sine) / N);
  }
  return result;
}

function higherHarmonicFraction(harmonics: number[]): number {
  const total = harmonics.reduce((sum, value) => sum + value ** 2, 0);
  const higher = harmonics.slice(2).reduce((sum, value) => sum + value ** 2, 0);
  return total === 0 ? 0 : higher / total;
}

function projectedArea(x: Float64Array, y: Float64Array): number {
  let twiceArea = 0;
  for (let i = 0; i < x.length; i++) {
    const next = (i + 1) % x.length;
    twiceArea += x[i] * y[next] - x[next] * y[i];
  }
  return twiceArea / 2;
}

/**
 * Measure the physical/geometric information used by the T18 preset audit.
 * Energy is included as a conservation sanity check; it is deliberately not
 * treated as a distinctness signal because unit tangent data normalise it.
 */
export function measureT18PresetDiagnostics(N = 128): T18PresetDiagnostics[] {
  return getT18PresetNames().map(name => {
    const definition = getT18PresetDefinition(name);
    const data = createT18PresetInitialData(N, name);
    const solver = new NonlinearRelativisticStringSolver({
      N,
      dt: 0,
      dx: 2 / N,
      mode: 'nonlinear',
      boundary: 'periodic',
      params: { L: 2, tau: 1, mu: 1, gamma: 0 },
    });
    solver.initialize(data);
    const state = solver.getState();
    const embedding = solver.getEmbedding();
    let radiusSquared = 0;
    let velocitySquared = 0;
    let maxSpeed = 0;
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 0; i < N; i++) {
      radiusSquared += embedding.x[i] ** 2 + embedding.y[i] ** 2;
      const speed = Math.hypot(state.velocityX[i], state.velocityY[i]);
      velocitySquared += speed ** 2;
      maxSpeed = Math.max(maxSpeed, speed);
      xMin = Math.min(xMin, embedding.x[i]);
      xMax = Math.max(xMax, embedding.x[i]);
      yMin = Math.min(yMin, embedding.y[i]);
      yMax = Math.max(yMax, embedding.y[i]);
    }
    return {
      name,
      label: definition.label,
      leftHarmonics: harmonicAmplitudes(data.left, 10),
      rightHarmonics: harmonicAmplitudes(data.right, 10),
      projectedArea: projectedArea(embedding.x, embedding.y),
      radiusRms: Math.sqrt(radiusSquared / N),
      boundingWidth: xMax - xMin,
      boundingHeight: yMax - yMin,
      velocityRms: Math.sqrt(velocitySquared / N),
      maxSpeed,
      energy: solver.getMetrics().totalEnergy,
      constraintResidual: solver.getConstraintReport().residual,
    };
  });
}

/**
 * A bounded nonlinear observable for T18: the radial profile is a nonlinear
 * function of the reconstructed embedding. Its higher-harmonic fraction can
 * change during characteristic transport even though the left/right tangent
 * fields themselves remain separately transported. This is geometric mode
 * mixing, not a string interaction or quantum transition.
 */
export function measureT18GeometricModeMixing(
  name = 'twoMode',
  N = 128,
  sampleSteps = 32,
): T18GeometricModeMixingReport {
  const solver = new NonlinearRelativisticStringSolver({
    N,
    dt: 0,
    dx: 2 / N,
    mode: 'nonlinear',
    boundary: 'periodic',
    params: { L: 2, tau: 1, mu: 1, gamma: 0 },
  });
  solver.initialize(createT18PresetInitialData(N, name));
  const initial = solver.getEmbedding();
  const initialRadialHarmonics = radialHarmonics(initial.x, initial.y, 8);
  const initialProjectedArea = projectedArea(initial.x, initial.y);
  solver.stepN(sampleSteps);
  const evolved = solver.getEmbedding();
  const evolvedRadialHarmonics = radialHarmonics(evolved.x, evolved.y, 8);
  return {
    preset: name,
    sampleSteps,
    initialProjectedArea,
    evolvedProjectedArea: projectedArea(evolved.x, evolved.y),
    initialRadialHarmonics,
    evolvedRadialHarmonics,
    initialHigherHarmonicFraction: higherHarmonicFraction(initialRadialHarmonics),
    evolvedHigherHarmonicFraction: higherHarmonicFraction(evolvedRadialHarmonics),
  };
}

const UNIT_TOLERANCE = 1e-10;

function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length === 0) throw new Error('A conformal tangent cannot have zero length.');
  return { x: x / length, y: y / length };
}

function tangentAngle(
  theta: number,
  phase: number,
  fallbackAmplitude: number,
  harmonics?: TangentHarmonic[],
): number {
  const terms = harmonics ?? [{ harmonic: 2, amplitude: fallbackAmplitude }];
  for (const term of terms) {
    if (!Number.isInteger(term.harmonic) || term.harmonic < 2 || term.harmonic % 2 !== 0) {
      throw new Error('T18 tangent harmonics must be positive even integers.');
    }
  }
  return theta + phase + terms.reduce(
    (sum, term) => sum + term.amplitude * Math.sin(term.harmonic * theta + (term.phase ?? 0)),
    0,
  );
}

function cloneField(field: TangentField): TangentField {
  return { x: new Float64Array(field.x), y: new Float64Array(field.y) };
}

function validateField(field: TangentField, N: number, label: string): void {
  if (field.x.length !== N || field.y.length !== N) {
    throw new Error(`${label} tangent field must contain exactly ${N} samples.`);
  }
  for (let i = 0; i < N; i++) {
    const norm = Math.hypot(field.x[i], field.y[i]);
    if (Math.abs(norm - 1) > UNIT_TOLERANCE) {
      throw new Error(`${label} tangent ${i} violates the unit constraint by ${Math.abs(norm - 1)}.`);
    }
  }
}

/**
 * Make closed-loop initial data with exact discrete zero mean for both unit
 * tangent fields. Even harmonic perturbations preserve the antipodal pairing
 * f(sigma + L/2) = -f(sigma), so the reconstructed embedding closes exactly.
 */
export function createConformalLoopInitialData(N: number, options: LoopTangentOptions = {}): NonlinearInitialData {
  if (N < 16 || N % 2 !== 0) throw new Error('A conformal loop requires an even grid of at least 16 samples.');
  const leftAmplitude = options.leftAmplitude ?? 0.22;
  const rightAmplitude = options.rightAmplitude ?? 0.16;
  const rightPhase = options.rightPhase ?? Math.PI / 3;
  const left = { x: new Float64Array(N), y: new Float64Array(N) };
  const right = { x: new Float64Array(N), y: new Float64Array(N) };

  for (let i = 0; i < N; i++) {
    const theta = 2 * Math.PI * i / N;
    const leftAngle = tangentAngle(theta, options.leftPhase ?? 0, leftAmplitude, options.leftHarmonics);
    const rightHarmonics = options.rightHarmonics ?? [{ harmonic: 2, amplitude: rightAmplitude, phase: Math.PI / 2 }];
    const rightAngle = tangentAngle(theta, rightPhase, rightAmplitude, rightHarmonics);
    left.x[i] = Math.cos(leftAngle);
    left.y[i] = Math.sin(leftAngle);
    right.x[i] = Math.cos(rightAngle);
    right.y[i] = Math.sin(rightAngle);
  }
  return { left, right, center: { x: 0, y: 0 } };
}

export class NonlinearRelativisticStringSolver {
  private readonly N: number;
  private readonly L: number;
  private readonly ds: number;
  private readonly dt: number;
  private readonly courant: number;
  private readonly tension: number;
  private readonly boundary: BoundaryCondition;
  private readonly leftBoundarySign: number;
  private readonly rightBoundarySign: number;
  private readonly embeddingSampleCount: number;
  private left: TangentField;
  private right: TangentField;
  private center = { x: 0, y: 0 };
  private time = 0;
  private readonly history: Array<{ t: number; y: Float64Array }> = [];
  private readonly maxHistory = 200;
  private state: NonlinearStringState;
  private initialEnergy = 0;

  constructor(config: SimulationConfig, courant = 0.5) {
    if (config.N < 16 || (config.boundary === 'periodic' && config.N % 2 !== 0)) {
      throw new Error(config.boundary === 'periodic'
        ? 'T18 periodic strings require an even grid of at least 16 samples.'
        : 'T18 open strings require at least 16 samples.');
    }
    if (!(courant > 0 && courant <= 1)) throw new Error('The T18 Courant number must be in (0, 1].');
    this.N = config.N;
    this.L = config.params.L;
    this.boundary = config.boundary;
    this.ds = this.boundary === 'periodic' || this.boundary === 'anti-periodic'
      ? this.L / this.N
      : this.L / (this.N - 1);
    this.courant = courant;
    this.dt = this.courant * this.ds;
    this.tension = 1;
    this.leftBoundarySign = this.boundary === 'periodic' || this.boundary === 'fixed' || this.boundary === 'mixed' ? 1 : -1;
    this.rightBoundarySign = this.boundary === 'periodic' || this.boundary === 'fixed' ? 1 : -1;
    this.embeddingSampleCount = this.boundary === 'anti-periodic' ? 2 * this.N : this.N;
    const defaultData = this.boundary === 'periodic'
      ? createConformalLoopInitialData(this.N)
      : this.boundary === 'anti-periodic'
        ? createAntiPeriodicT18InitialData(this.N)
        : createOpenT18InitialData(this.N, this.boundary);
    this.left = defaultData.left;
    this.right = defaultData.right;
    this.state = {
      y: new Float64Array(this.N),
      v: new Float64Array(this.N),
      t: 0,
      embeddingX: new Float64Array(this.embeddingSampleCount),
      embeddingY: new Float64Array(this.embeddingSampleCount),
      velocityX: new Float64Array(this.N),
      velocityY: new Float64Array(this.N),
      worldsheet: [],
      constraints: {
        maxOrthogonalityResidual: Infinity,
        maxNormalizationResidual: Infinity,
        closureError: Infinity,
        leftEndpointResidual: Infinity,
        rightEndpointResidual: Infinity,
        maxBoundaryEnergyFlux: Infinity,
        residual: Infinity,
      },
    };
    this.initialize();
  }

  initialize(data?: NonlinearInitialData): void {
    const initialData = data ?? (this.boundary === 'periodic'
      ? createConformalLoopInitialData(this.N)
      : this.boundary === 'anti-periodic'
        ? createAntiPeriodicT18InitialData(this.N)
        : createOpenT18InitialData(this.N, this.boundary));
    validateField(initialData.left, this.N, 'Left-moving');
    validateField(initialData.right, this.N, 'Right-moving');
    this.validateBoundaryData(initialData);
    this.left = cloneField(initialData.left);
    this.right = cloneField(initialData.right);
    this.center = { ...(initialData.center ?? { x: 0, y: 0 }) };
    this.time = 0;
    this.history.length = 0;
    this.reconstructState();
    this.history.push({ t: 0, y: new Float64Array(this.state.y) });
    this.updateWorldsheet();
    this.initialEnergy = this.getMetrics().totalEnergy;
  }

  setBoundary(boundary: BoundaryCondition): void {
    if (boundary !== this.boundary) {
      throw new Error('T18 boundary type is selected when the solver is constructed; create a new solver to change topology.');
    }
  }

  getBoundary(): BoundaryCondition {
    return this.boundary;
  }

  setParameters(_params: StringParameters): void {
    // T18 uses fixed natural-unit tension and density. The UI disables these
    // controls and the length control while this mode is selected.
  }

  getCourantNumber(): number {
    return this.courant;
  }

  getGridSpacing(): number {
    return this.ds;
  }

  getTimeStep(): number {
    return this.dt;
  }

  getInitialEnergy(): number {
    return this.initialEnergy;
  }

  getConstraintReport(): ConformalConstraintReport {
    return { ...this.state.constraints };
  }

  getEmbedding(): { x: Float64Array; y: Float64Array } {
    return { x: new Float64Array(this.state.embeddingX), y: new Float64Array(this.state.embeddingY) };
  }

  getState(): NonlinearStringState {
    return this.state;
  }

  getMetrics(): SimulationMetrics {
    let kineticEnergy = 0;
    let potentialEnergy = 0;
    for (let i = 0; i < this.N; i++) {
      const rpX = (this.left.x[i] + this.right.x[i]) / 2;
      const rpY = (this.left.y[i] + this.right.y[i]) / 2;
      const velocityX = (this.left.x[i] - this.right.x[i]) / 2;
      const velocityY = (this.left.y[i] - this.right.y[i]) / 2;
      kineticEnergy += 0.5 * this.tension * (velocityX ** 2 + velocityY ** 2) * this.ds;
      potentialEnergy += 0.5 * this.tension * (rpX ** 2 + rpY ** 2) * this.ds;
    }
    return {
      totalEnergy: kineticEnergy + potentialEnergy,
      kineticEnergy,
      potentialEnergy,
      waveSpeed: 1,
      fundamentalFreq: 1 / this.L,
    };
  }

  getSpatialCoords(): Float64Array {
    const coords = new Float64Array(this.N);
    for (let i = 0; i < this.N; i++) coords[i] = i * this.ds;
    return coords;
  }

  getWorldsheetBounds(): { tMin: number; tMax: number; yMin: number; yMax: number } {
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const sample of this.history) {
      for (const value of sample.y) {
        yMin = Math.min(yMin, value);
        yMax = Math.max(yMax, value);
      }
    }
    if (!Number.isFinite(yMin)) return { tMin: 0, tMax: 1, yMin: -1, yMax: 1 };
    const padding = Math.max((yMax - yMin) * 0.1, 0.05);
    const tMax = Math.max(this.dt, this.time);
    return { tMin: Math.max(0, tMax - this.maxHistory * this.dt), tMax, yMin: yMin - padding, yMax: yMax + padding };
  }

  step(): void {
    const previousVelocityX = this.state.velocityX[0];
    const previousVelocityY = this.state.velocityY[0];
    this.left = this.shiftUnitTangent(this.left, this.courant, 'left');
    this.right = this.shiftUnitTangent(this.right, -this.courant, 'right');
    this.enforceOpenEndpointRelations();
    this.time += this.dt;
    this.reconstructState();
    // The sigma=0 point is not a fixed endpoint. Integrate its translational
    // zero mode as well as reconstructing the closed spatial shape, otherwise
    // pinning it at the origin would corrupt the small-amplitude wave limit.
    this.center.x += 0.5 * this.dt * (previousVelocityX + this.state.velocityX[0]);
    this.center.y += 0.5 * this.dt * (previousVelocityY + this.state.velocityY[0]);
    this.reconstructState();
    this.history.push({ t: this.time, y: new Float64Array(this.state.y) });
    if (this.history.length > this.maxHistory) this.history.shift();
    this.updateWorldsheet();
  }

  stepN(count: number): void {
    for (let i = 0; i < count; i++) this.step();
  }

  private shiftUnitTangent(field: TangentField, offset: number, channel: 'left' | 'right'): TangentField {
    const shifted = { x: new Float64Array(this.N), y: new Float64Array(this.N) };
    for (let i = 0; i < this.N; i++) {
      if (this.boundary === 'anti-periodic') {
        const position = i * this.ds + offset * this.ds;
        const projected = normalize(
          this.sampleAntiPeriodicTangent(channel, position, 'x'),
          this.sampleAntiPeriodicTangent(channel, position, 'y'),
        );
        shifted.x[i] = projected.x;
        shifted.y[i] = projected.y;
        continue;
      }
      if (this.boundary !== 'periodic') {
        const position = i * this.ds + offset * this.ds;
        const projected = normalize(
          this.sampleOpenTangent(channel, position, 'x'),
          this.sampleOpenTangent(channel, position, 'y'),
        );
        shifted.x[i] = projected.x;
        shifted.y[i] = projected.y;
        continue;
      }
      const position = ((i + offset) % this.N + this.N) % this.N;
      const lower = Math.floor(position);
      const fraction = position - lower;
      const sample = (array: Float64Array, index: number): number => array[(index % this.N + this.N) % this.N];
      const cubic = (array: Float64Array): number => {
        const p0 = sample(array, lower - 1);
        const p1 = sample(array, lower);
        const p2 = sample(array, lower + 1);
        const p3 = sample(array, lower + 2);
        return p1 + 0.5 * fraction * (
          p2 - p0 + fraction * (2 * p0 - 5 * p1 + 4 * p2 - p3 + fraction * (3 * (p1 - p2) + p3 - p0))
        );
      };
      const projected = normalize(
        cubic(field.x),
        cubic(field.y),
      );
      shifted.x[i] = projected.x;
      shifted.y[i] = projected.y;
    }
    return shifted;
  }

  private sampleOpenTangent(channel: 'left' | 'right', coordinate: number, component: 'x' | 'y'): number {
    let source = channel;
    let sign = 1;
    let position = coordinate;
    for (let reflection = 0; reflection < 8 && (position < 0 || position > this.L); reflection++) {
      if (position < 0) {
        position = -position;
        source = source === 'left' ? 'right' : 'left';
        sign *= this.leftBoundarySign;
      } else if (position > this.L) {
        position = 2 * this.L - position;
        source = source === 'left' ? 'right' : 'left';
        sign *= this.rightBoundarySign;
      }
    }
    const coordinateIndex = position / this.ds;
    const lower = Math.floor(coordinateIndex);
    const fraction = coordinateIndex - lower;
    const array = this[source][component];
    const sample = (index: number): number => array[Math.max(0, Math.min(this.N - 1, index))];
    const p0 = sample(lower - 1);
    const p1 = sample(lower);
    const p2 = sample(lower + 1);
    const p3 = sample(lower + 2);
    return sign * (p1 + 0.5 * fraction * (
      p2 - p0 + fraction * (2 * p0 - 5 * p1 + 4 * p2 - p3 + fraction * (3 * (p1 - p2) + p3 - p0))
    ));
  }

  private sampleAntiPeriodicTangent(channel: 'left' | 'right', coordinate: number, component: 'x' | 'y'): number {
    const cell = Math.floor(coordinate / this.L);
    const position = coordinate - cell * this.L;
    const cellSign = cell % 2 === 0 ? 1 : -1;
    const array = this[channel][component];
    const coordinateIndex = position / this.ds;
    const lower = Math.floor(coordinateIndex);
    const fraction = coordinateIndex - lower;
    const sample = (index: number): number => {
      const wrappedCell = Math.floor(index / this.N);
      const wrappedIndex = index - wrappedCell * this.N;
      return (wrappedCell % 2 === 0 ? 1 : -1) * array[wrappedIndex];
    };
    const p0 = sample(lower - 1);
    const p1 = sample(lower);
    const p2 = sample(lower + 1);
    const p3 = sample(lower + 2);
    return cellSign * (p1 + 0.5 * fraction * (
      p2 - p0 + fraction * (2 * p0 - 5 * p1 + 4 * p2 - p3 + fraction * (3 * (p1 - p2) + p3 - p0))
    ));
  }

  private enforceOpenEndpointRelations(): void {
    if (this.boundary === 'periodic' || this.boundary === 'anti-periodic') return;
    this.right.x[0] = this.leftBoundarySign * this.left.x[0];
    this.right.y[0] = this.leftBoundarySign * this.left.y[0];
    const last = this.N - 1;
    this.right.x[last] = this.rightBoundarySign * this.left.x[last];
    this.right.y[last] = this.rightBoundarySign * this.left.y[last];
  }

  private reconstructState(): void {
    const embeddingX = this.state.embeddingX;
    const embeddingY = this.state.embeddingY;
    const velocityX = this.state.velocityX;
    const velocityY = this.state.velocityY;
    embeddingX[0] = this.center.x;
    embeddingY[0] = this.center.y;
    let maxOrthogonalityResidual = 0;
    let maxNormalizationResidual = 0;
    let sumRPrimeX = 0;
    let sumRPrimeY = 0;

    for (let i = 0; i < this.N; i++) {
      const rPrimeX = (this.left.x[i] + this.right.x[i]) / 2;
      const rPrimeY = (this.left.y[i] + this.right.y[i]) / 2;
      const currentVelocityX = (this.left.x[i] - this.right.x[i]) / 2;
      const currentVelocityY = (this.left.y[i] - this.right.y[i]) / 2;
      velocityX[i] = currentVelocityX;
      velocityY[i] = currentVelocityY;
      sumRPrimeX += rPrimeX;
      sumRPrimeY += rPrimeY;
      maxOrthogonalityResidual = Math.max(maxOrthogonalityResidual, Math.abs(rPrimeX * currentVelocityX + rPrimeY * currentVelocityY));
      maxNormalizationResidual = Math.max(maxNormalizationResidual, Math.abs(rPrimeX ** 2 + rPrimeY ** 2 + currentVelocityX ** 2 + currentVelocityY ** 2 - 1));
      if (i > 0) {
        embeddingX[i] = embeddingX[i - 1] + this.ds * ((this.left.x[i - 1] + this.right.x[i - 1]) / 2);
        embeddingY[i] = embeddingY[i - 1] + this.ds * ((this.left.y[i - 1] + this.right.y[i - 1]) / 2);
      }
    }

    if (this.boundary === 'anti-periodic') {
      const lastBase = this.N - 1;
      embeddingX[this.N] = embeddingX[lastBase] + this.ds * ((this.left.x[lastBase] + this.right.x[lastBase]) / 2);
      embeddingY[this.N] = embeddingY[lastBase] + this.ds * ((this.left.y[lastBase] + this.right.y[lastBase]) / 2);
      for (let i = 1; i < this.N; i++) {
        const source = i - 1;
        embeddingX[this.N + i] = embeddingX[this.N + i - 1] - this.ds * ((this.left.x[source] + this.right.x[source]) / 2);
        embeddingY[this.N + i] = embeddingY[this.N + i - 1] - this.ds * ((this.left.y[source] + this.right.y[source]) / 2);
      }
    }

    this.state.y.set(embeddingY.subarray(0, this.N));
    this.state.v.set(velocityY);
    this.state.t = this.time;
    const closureError = this.boundary === 'periodic'
      ? Math.hypot(sumRPrimeX * this.ds, sumRPrimeY * this.ds)
      : this.boundary === 'anti-periodic'
        ? Math.hypot(
          embeddingX[this.embeddingSampleCount - 1] - this.ds * ((this.left.x[this.N - 1] + this.right.x[this.N - 1]) / 2) - this.center.x,
          embeddingY[this.embeddingSampleCount - 1] - this.ds * ((this.left.y[this.N - 1] + this.right.y[this.N - 1]) / 2) - this.center.y,
        )
        : 0;
    const leftRPrimeX = (this.left.x[0] + this.right.x[0]) / 2;
    const leftRPrimeY = (this.left.y[0] + this.right.y[0]) / 2;
    const leftVelocityX = (this.left.x[0] - this.right.x[0]) / 2;
    const leftVelocityY = (this.left.y[0] - this.right.y[0]) / 2;
    const rightIndex = this.N - 1;
    const rightRPrimeX = (this.left.x[rightIndex] + this.right.x[rightIndex]) / 2;
    const rightRPrimeY = (this.left.y[rightIndex] + this.right.y[rightIndex]) / 2;
    const rightVelocityX = (this.left.x[rightIndex] - this.right.x[rightIndex]) / 2;
    const rightVelocityY = (this.left.y[rightIndex] - this.right.y[rightIndex]) / 2;
    const endpointResidual = (endpoint: 'left' | 'right', rPrimeX: number, rPrimeY: number, velocityX: number, velocityY: number): number => {
      if (this.boundary === 'periodic' || this.boundary === 'anti-periodic') return 0;
      const endpointType = endpoint === 'left'
        ? getT18BoundaryContract(this.boundary).leftEndpoint
        : getT18BoundaryContract(this.boundary).rightEndpoint;
      return endpointType === 'fixed'
        ? Math.hypot(velocityX, velocityY)
        : Math.hypot(rPrimeX, rPrimeY);
    };
    const leftEndpointResidual = endpointResidual('left', leftRPrimeX, leftRPrimeY, leftVelocityX, leftVelocityY);
    const rightEndpointResidual = endpointResidual('right', rightRPrimeX, rightRPrimeY, rightVelocityX, rightVelocityY);
    const leftFlux = Math.abs(leftRPrimeX * leftVelocityX + leftRPrimeY * leftVelocityY);
    const rightFlux = Math.abs(rightRPrimeX * rightVelocityX + rightRPrimeY * rightVelocityY);
    const maxBoundaryEnergyFlux = this.boundary === 'periodic' || this.boundary === 'anti-periodic' ? 0 : Math.max(leftFlux, rightFlux);
    this.state.constraints = {
      maxOrthogonalityResidual,
      maxNormalizationResidual,
      closureError,
      leftEndpointResidual,
      rightEndpointResidual,
      maxBoundaryEnergyFlux,
      residual: Math.max(
        maxOrthogonalityResidual,
        maxNormalizationResidual,
        closureError,
        leftEndpointResidual,
        rightEndpointResidual,
      ),
    };
  }

  private validateBoundaryData(data: NonlinearInitialData): void {
    if (this.boundary === 'periodic' || this.boundary === 'anti-periodic') return;
    const contract = getT18BoundaryContract(this.boundary);
    const residualAt = (index: number, endpoint: 'left' | 'right'): number => {
      const rPrimeX = (data.left.x[index] + data.right.x[index]) / 2;
      const rPrimeY = (data.left.y[index] + data.right.y[index]) / 2;
      const velocityX = (data.left.x[index] - data.right.x[index]) / 2;
      const velocityY = (data.left.y[index] - data.right.y[index]) / 2;
      const endpointType = endpoint === 'left' ? contract.leftEndpoint : contract.rightEndpoint;
      return endpointType === 'fixed'
        ? Math.hypot(velocityX, velocityY)
        : Math.hypot(rPrimeX, rPrimeY);
    };
    const leftResidual = residualAt(0, 'left');
    const rightResidual = residualAt(this.N - 1, 'right');
    if (Math.max(leftResidual, rightResidual) > UNIT_TOLERANCE) {
      throw new Error(`T18 ${this.boundary} initial data violate an endpoint condition.`);
    }
  }

  private updateWorldsheet(): void {
    const stride = Math.max(1, Math.floor(this.N / 50));
    const worldsheet: WorldsheetPoint[][] = [];
    for (let i = 0; i < this.N; i += stride) {
      const sigma = i * this.ds;
      worldsheet.push(this.history.map(sample => ({ t: sample.t, x: sigma, y: sample.y[i] })));
    }
    this.state.worldsheet = worldsheet;
  }
}
