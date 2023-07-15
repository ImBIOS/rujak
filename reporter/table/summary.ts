import { type Benchmark } from '@/benchmark.ts';
import { bold, cyan, gray, green, red } from '📝/colors.ts';

export function summary(
  benchmarks: Benchmark[],
  { colors = true } = {}
): string {
  console.log('summary', { benchmarks, colors });
  benchmarks = benchmarks.filter((b) => b.error == null);
  benchmarks.sort((a, b) => (a.stats?.avg ?? 0) - (b.stats?.avg ?? 0));
  const baseline = benchmarks.find((b) => b.baseline) ?? benchmarks[0];

  return (
    bold(colors, 'summary') +
    (baseline.group == null || baseline.group.startsWith?.('$rujak_group')
      ? ''
      : gray(colors, ` for ${baseline.group}`)) +
    `\n  ${bold(colors, cyan(colors, baseline.name))}` +
    benchmarks
      .filter((b) => b !== baseline)
      .map((b) => {
        const diff = Number(
          ((1 / (baseline.stats?.avg ?? 1)) * (b.stats?.avg ?? 1)).toFixed(2)
        );
        const invDiff = Number(
          ((1 / (b.stats?.avg ?? 1)) * (baseline.stats?.avg ?? 1)).toFixed(2)
        );
        const colorFmt = diff < 1 ? red : green;
        return `\n   ${colorFmt(colors, String(diff >= 1 ? diff : invDiff))}x ${
          diff < 1 ? 'slower' : 'faster'
        } than ${bold(colors, cyan(colors, b.name))}`;
      })
      .join('')
  );
}
