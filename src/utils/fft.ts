/**
 * Fast Fourier Transform utility for frequency analysis
 * Computes the real-input FFT using the Cooley-Tukey algorithm
 */

/**
 * Compute the FFT of a real-valued input array
 * Returns the power spectrum (magnitude squared)
 */
export function computePowerSpectrum(signal: Float64Array): Float64Array {
  const N = signal.length;
  if (N <= 1) return new Float64Array(N);

  // Pad to power of 2
  const paddedN = nextPowerOf2(N);
  const padded = new Float64Array(paddedN);
  padded.set(signal);

  // Compute complex FFT
  const fftResult = fft(padded);
  
  // Compute power spectrum (|X[k]|²)
  const power = new Float64Array(paddedN / 2 + 1);
  for (let k = 0; k <= paddedN / 2; k++) {
    const re = fftResult[k * 2];
    const im = fftResult[k * 2 + 1];
    power[k] = re * re + im * im;
  }

  return power;
}

/** Find the dominant frequencies in the signal */
export function findDominantFrequencies(
  signal: Float64Array,
  sampleRate: number,
  count: number = 3
): Array<{ freq: number; amplitude: number }> {
  const power = computePowerSpectrum(signal);
  const N = power.length;
  const df = sampleRate / (2 * (N - 1));

  const peaks: Array<{ index: number; power: number }> = [];

  for (let i = 1; i < N - 1; i++) {
    if (power[i] > power[i - 1] && power[i] > power[i + 1] && power[i] > 0.01) {
      peaks.push({ index: i, power: power[i] });
    }
  }

  peaks.sort((a, b) => b.power - a.power);

  return peaks.slice(0, count).map(p => ({
    freq: p.index * df,
    amplitude: Math.sqrt(p.power),
  }));
}

/** Cooley-Tukey FFT (in-place, bit-reversed) */
function fft(real: Float64Array): Float64Array {
  const N = real.length;
  const complex = new Float64Array(2 * N);

  // Copy real input to complex array
  for (let i = 0; i < N; i++) {
    complex[2 * i] = real[i];
    complex[2 * i + 1] = 0;
  }

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < N; i++) {
    if (i < j) {
      [complex[2 * i], complex[2 * j]] = [complex[2 * j], complex[2 * i]];
      [complex[2 * i + 1], complex[2 * j + 1]] = [complex[2 * j + 1], complex[2 * i + 1]];
    }
    let bit = N >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
  }

  // FFT butterflies
  for (let len = 2; len <= N; len <<= 1) {
    const angle = -2 * Math.PI / len;
    const wlen_re = Math.cos(angle);
    const wlen_im = Math.sin(angle);

    for (let i = 0; i < N; i += len) {
      let w_re = 1;
      let w_im = 0;

      for (let k = 0; k < len / 2; k++) {
        const u_re = complex[2 * (i + k)];
        const u_im = complex[2 * (i + k) + 1];
        const v_re = w_re * complex[2 * (i + k + len / 2)] - w_im * complex[2 * (i + k + len / 2) + 1];
        const v_im = w_re * complex[2 * (i + k + len / 2) + 1] + w_im * complex[2 * (i + k + len / 2)];

        complex[2 * (i + k)] = u_re + v_re;
        complex[2 * (i + k) + 1] = u_im + v_im;
        complex[2 * (i + k + len / 2)] = u_re - v_re;
        complex[2 * (i + k + len / 2) + 1] = u_im - v_im;

        const next_w_re = w_re * wlen_re - w_im * wlen_im;
        w_im = w_re * wlen_im + w_im * wlen_re;
        w_re = next_w_re;
      }
    }
  }

  return complex;
}

function nextPowerOf2(n: number): number {
  return 1 << (32 - Math.clz32(n - 1));
}
