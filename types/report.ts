import { type Benchmark } from './benchmark.ts';

export type Report = {
  cpu: string;
  runtime: string;

  benchmarks: Benchmark[];
};
