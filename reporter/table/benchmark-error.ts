import { type TableOptions } from '@/table-options.ts';
import { gray, red } from '📝/colors.ts';

export function benchmarkError(
  n: string,
  e: Error,
  options: TableOptions
): string {
  const { size, colors = true } = options;
  return (
    n.padEnd(size, ' ') +
    `${red(colors, 'error')}: ${e.message}${
      e.stack !== undefined ? '\n' + gray(colors, e.stack) : ''
    }`
  );
}
