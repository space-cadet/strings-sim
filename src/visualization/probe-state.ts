/**
 * Bounded trajectory history for one selected worldsheet coordinate.
 * The buffer deliberately stores one scalar per completed solver step instead
 * of duplicating the complete worldsheet history.
 */
export interface ProbeSample {
  tau: number;
  y: number;
}

export class ProbeTrajectoryState {
  private samples: ProbeSample[] = [];

  constructor(
    public sigmaIndex: number,
    public sigma: number,
    private readonly maxSamples: number,
  ) {}

  select(sigmaIndex: number, sigma: number): void {
    this.sigmaIndex = sigmaIndex;
    this.sigma = sigma;
    this.samples = [];
  }

  record(tau: number, y: number): void {
    this.samples.push({ tau, y });
    if (this.samples.length > this.maxSamples) this.samples.shift();
  }

  clear(): void {
    this.samples = [];
  }

  snapshot(): readonly ProbeSample[] {
    return this.samples;
  }
}
