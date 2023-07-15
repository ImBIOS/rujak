export type Benchmark = {
  name: string;
  baseline: boolean;
  error?: Error;
  stats?: {
    n: number;
    avg: number;
    min: number;
    max: number;
    p75: number;
    p99: number;
    p995: number;
    p999: number;
    jit: number[];
  };
  group: string | null;
  fn: () => unknown;
  time: number;
  warmup: boolean;
  async: boolean;
};
