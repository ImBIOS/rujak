const time = (() => {
  const ceil = Math.ceil;

  try {
    Bun.nanoseconds();

    return {
      now: Bun.nanoseconds,
      diff: (a: number, b: number) => a - b,
    };
  } catch {}

  try {
    process.hrtime.bigint();
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    if ('Deno' in globalThis) throw 0;

    return {
      now: () => Number(process.hrtime.bigint()),
      diff: (a: number, b: number) => Number(a - b),
    };
  } catch {}

  try {
    Deno.core.ops.op_bench_now();

    return {
      now: () => Deno.core.ops.op_bench_now() as number,
      diff: (a: number, b: number) => a - b,
    };
  } catch {}

  try {
    Deno.core.ops.op_now();

    return {
      now: () => ceil(1e6 * Deno.core.ops.op_now()),
      diff: (a: number, b: number) => a - b,
    };
  } catch {}

  try {
    // @ts-expect-error - Unknown global
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    $.agent.monotonicNow();

    return {
      // @ts-expect-error - Unknown global
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      now: () => ceil(1e6 * $.agent.monotonicNow()),
      diff: (a: number, b: number) => a - b,
    };
  } catch {}

  return {
    now: () => ceil(1e6 * performance.now()),
    diff: (a: number, b: number) => a - b,
  };
})();

export const now: () => number = time.now;
export const diff = time.diff;
