import { type Benchmark } from '@/benchmark.ts';
import { type TableOptions } from '@/table-options.ts';
import { cyan, gray, magenta, yellow } from '📝/colors.ts';
import { duration } from '📝/duration.ts';

export function benchmark(
  n: string,
  b: Benchmark,
  options: TableOptions
): string {
  const {
    size,
    avg = true,
    colors = true,
    minMax = true,
    percentiles = true,
  } = options;
  return (
    n.padEnd(size, ' ') +
    (!avg || b.stats == null
      ? ''
      : `${yellow(colors, duration(b.stats.avg))}/iter`.padStart(
          14 + 10 * Number(colors),
          ' '
        )) +
    (!minMax || b.stats == null
      ? ''
      : `(${cyan(colors, duration(b.stats.min))} … ${magenta(
          colors,
          duration(b.stats.max)
        )})`.padStart(24 + 2 * 10 * Number(colors), ' ')) +
    (!percentiles || b.stats == null
      ? ''
      : ` ${gray(colors, duration(b.stats.p75)).padStart(
          9 + 10 * Number(colors),
          ' '
        )} ${gray(colors, duration(b.stats.p99)).padStart(
          9 + 10 * Number(colors),
          ' '
        )} ${gray(colors, duration(b.stats.p995)).padStart(
          9 + 10 * Number(colors),
          ' '
        )}`)
  );
}
