export function size(names: string[]): number {
  let max = 9;
  for (const name of names) if (max < name.length) max = name.length;

  return 2 + max;
}
