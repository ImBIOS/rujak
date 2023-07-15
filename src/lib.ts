/* eslint-disable no-labels */
import { diff, now } from './time.ts';

function sort(a: number, b: number) {
  if (a > b) return 1;
  if (a < b) return -1;

  return 0;
}

function stats(
  n: number,
  t: boolean,
  avg: number,
  min: number,
  max: number,
  jit: number[],
  all: number[]
) {
  return {
    n,
    min,
    max,
    jit,
    p75: all[Math.ceil(n * (75 / 100)) - 1],
    p99: all[Math.ceil(n * (99 / 100)) - 1],
    avg: !t ? avg / n : Math.ceil(avg / n),
    p995: all[Math.ceil(n * (99.5 / 100)) - 1],
    p999: all[Math.ceil(n * (99.9 / 100)) - 1],
  };
}

export async function sync(t: number, fn: () => unknown, collect = false) {
  let n = 0;
  let avg = 0;
  let wavg = 0;
  let min = Infinity;
  let max = -Infinity;
  const all = [];
  const jit = new Array<number>(10);

  warmup: {
    let offset = 0;
    let iterations = 10;
    while (iterations-- !== 0) {
      const t1: number = now();

      const x = fn();
      jit[offset++] = diff(now(), t1);
      if (x instanceof Promise) return await (await x, async(t, fn, collect));
    }

    let c = 0;
    iterations = 4;
    let budget = 10 * 1e6;

    while (budget > 0 || iterations-- > 0) {
      const t1 = now();

      fn();
      const t2 = diff(now(), t1);
      if (t2 < 0) {
        iterations++;
        continue;
      }

      c++;
      wavg += t2;
      budget -= t2;
    }

    wavg /= c;
  }

  measure: {
    if (wavg > 10_000) {
      let iterations = 10;
      let budget = t * 1e6;

      while (budget > 0 || iterations-- > 0) {
        const t1 = now();

        fn();
        const t2 = diff(now(), t1);
        if (t2 < 0) {
          iterations++;
          continue;
        }

        n++;
        avg += t2;
        budget -= t2;
        all.push(t2);
        if (t2 < min) min = t2;
        if (t2 > max) max = t2;
      }
    } else {
      let iterations = 10;
      let budget = t * 1e6;

      if (!collect)
        while (budget > 0 || iterations-- > 0) {
          const t1 = now();
          for (let c = 0; c < 1e4; c++) fn();
          const t2 = diff(now(), t1) / 1e4;
          if (t2 < 0) {
            iterations++;
            continue;
          }

          n++;
          avg += t2;
          all.push(t2);
          budget -= t2 * 1e4;
          if (t2 < min) min = t2;
          if (t2 > max) max = t2;
        }
      else {
        const garbage = new Array(1e4);

        while (budget > 0 || iterations-- > 0) {
          const t1 = now();
          for (let c = 0; c < 1e4; c++) garbage[c] = fn();

          const t2 = diff(now(), t1) / 1e4;
          if (t2 < 0) {
            iterations++;
            continue;
          }

          n++;
          avg += t2;
          all.push(t2);
          budget -= t2 * 1e4;
          if (t2 < min) min = t2;
          if (t2 > max) max = t2;
        }
      }
    }
  }

  all.sort(sort);
  return stats(n, wavg > 10_000, avg, min, max, jit, all);
}

export async function async(t: number, fn: () => unknown, collect = false) {
  let n = 0;
  let avg = 0;
  let wavg = 0;
  let min = Infinity;
  let max = -Infinity;
  const all = [];
  const jit = new Array<number>(10);

  warmup: {
    let offset = 0;
    let iterations = 10;
    while (iterations-- !== 0) {
      const t1 = now();

      await fn();
      jit[offset++] = diff(now(), t1);
    }

    let c = 0;
    iterations = 4;
    let budget = 10 * 1e6;

    while (budget > 0 || iterations-- > 0) {
      const t1 = now();

      await fn();
      const t2 = diff(now(), t1);
      if (t2 < 0) {
        iterations++;
        continue;
      }

      c++;
      wavg += t2;
      budget -= t2;
    }

    wavg /= c;
  }

  measure: {
    if (wavg > 10_000) {
      let iterations = 10;
      let budget = t * 1e6;

      while (budget > 0 || iterations-- > 0) {
        const t1 = now();

        await fn();
        const t2 = diff(now(), t1);
        if (t2 < 0) {
          iterations++;
          continue;
        }

        n++;
        avg += t2;
        budget -= t2;
        all.push(t2);
        if (t2 < min) min = t2;
        if (t2 > max) max = t2;
      }
    } else {
      let iterations = 10;
      let budget = t * 1e6;

      if (!collect)
        while (budget > 0 || iterations-- > 0) {
          const t1 = now();
          for (let c = 0; c < 1e4; c++) await fn();

          const t2 = diff(now(), t1) / 1e4;
          if (t2 < 0) {
            iterations++;
            continue;
          }

          n++;
          avg += t2;
          all.push(t2);
          budget -= t2 * 1e4;
          if (t2 < min) min = t2;
          if (t2 > max) max = t2;
        }
      else {
        const garbage = new Array(1e4);

        while (budget > 0 || iterations-- > 0) {
          const t1 = now();
          for (let c = 0; c < 1e4; c++) garbage[c] = await fn();

          const t2 = diff(now(), t1) / 1e4;
          if (t2 < 0) {
            iterations++;
            continue;
          }

          n++;
          avg += t2;
          all.push(t2);
          budget -= t2 * 1e4;
          if (t2 < min) min = t2;
          if (t2 > max) max = t2;
        }
      }
    }
  }

  all.sort(sort);
  return stats(n, wavg > 10_000, avg, min, max, jit, all);
}
