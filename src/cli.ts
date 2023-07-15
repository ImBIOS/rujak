/* eslint-disable @typescript-eslint/no-throw-literal */
import { type Benchmark } from '@/benchmark.ts';
import { type Report } from '@/report.ts';
import { type RunOptions } from '@/run-options.ts';
import process from 'node:process';
import { StringDecoder } from 'node:string_decoder';
import { gray } from '📝/colors.ts';
import { benchmarkError } from '📝/table/benchmark-error.ts';
import { benchmark } from '📝/table/benchmark.ts';
import { br } from '📝/table/br.ts';
import { header } from '📝/table/header.ts';
import { size as tableSize } from '📝/table/size.ts';
import { summary } from '📝/table/summary.ts';
import { async, sync } from './lib.ts';

let _gc = 0;
let g: string | null = null;
const summaries: Record<string, boolean> = {};
const benchmarks: Benchmark[] = [];
const groups = new Set<string>();
// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = (async () => {}).constructor;

type GroupOptions = {
  name?: string;
  summary?: boolean;
};

export function group(
  nameOrOptionsOrFn: string | GroupOptions | (() => void),
  fn?: () => void
): void {
  const o = {
    summary:
      (typeof nameOrOptionsOrFn !== 'string' &&
        'summary' in nameOrOptionsOrFn &&
        nameOrOptionsOrFn.summary) ??
      true,
    name:
      typeof nameOrOptionsOrFn === 'string'
        ? nameOrOptionsOrFn
        : 'name' in nameOrOptionsOrFn
        ? nameOrOptionsOrFn.name
        : `$rujak_group${++_gc}`,
  };

  g = o.name ?? null;
  groups.add(o.name ?? '');
  summaries[g ?? ''] = o.summary;
  if (fn !== undefined || Boolean(nameOrOptionsOrFn)) {
    if (fn !== undefined) {
      fn();
    } else {
      // provide default behavior if fn is null or undefined
    }
    g = null;
  }
}

export function bench(name: string, fn: () => unknown): void {
  if ([Function, AsyncFunction].includes(name.constructor)) {
    fn = name as unknown as () => unknown;
    name = fn.name;
  }
  if (![Function, AsyncFunction].includes(fn.constructor))
    throw new TypeError(`expected function, got ${fn.constructor.name}`);

  benchmarks.push({
    fn,
    name,
    group: g,
    time: 500,
    warmup: true,
    baseline: false,
    async: AsyncFunction === fn.constructor,
  });
}

export function baseline(name: string, fn: () => unknown): void {
  if ([Function, AsyncFunction].includes(name.constructor)) {
    fn = name as unknown as () => unknown;
    name = fn.name;
  }
  if (![Function, AsyncFunction].includes(fn.constructor))
    throw new TypeError(`expected function, got ${fn.constructor.name}`);

  benchmarks.push({
    fn,
    name,
    group: g,
    time: 500,
    warmup: true,
    baseline: true,
    async: AsyncFunction === fn.constructor,
  });
}

let _print: (...args: unknown[]) => void;

try {
  _print = console.log;
  if (typeof _print !== 'function') throw 1;
} catch {
  // @ts-expect-error - Unknown global
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  _print = print;
}

function log(...args: unknown[]): void {
  _print(...args);
}

function runtime() {
  if ('Bun' in globalThis) return 'bun';
  if ('Deno' in globalThis) return 'deno';
  if ('process' in globalThis) return 'node';
  if ('navigator' in globalThis) return 'browser';

  return 'unknown';
}

function version(): string {
  const runtimes: Record<string, () => string> = {
    unknown: () => '',
    browser: () => '',
    node: () => process.version,
    deno: () => (typeof Deno !== 'undefined' ? Deno.version.deno : ''),
    bun: () => process.versions.bun,
  };
  return runtimes[runtime()]();
}

function os() {
  const osMap: Record<string, () => string> = {
    unknown: () => 'unknown',

    browser: () => 'unknown',
    deno: () => (typeof Deno !== 'undefined' ? Deno.build.target : ''),
    bun: () => `${process.arch}-${process.platform}`,
    node: () => `${process.arch}-${process.platform}`,
  };
  const os = osMap[runtime()]();
  return os;
}

async function cpu(): Promise<string> {
  return await {
    unknown: () => 'unknown',
    browser: () => 'unknown',
    node: async () => (await import('os')).cpus()[0].model,

    bun: async () => {
      try {
        if (process.platform === 'linux') {
          const fs = await import('fs');
          const buf = new Uint8Array(64 * 1024);
          const fd = fs.openSync('/proc/cpuinfo', 'r');
          const info = new TextDecoder()
            .decode(buf.subarray(0, fs.readSync(fd, buf)))
            .trim()
            .split('\n');

          fs.closeSync(fd);

          for (const line of info) {
            const [key, value] = line.split(':');
            if (
              /model name|Hardware|Processor|^cpu model|chip type|^cpu type/.test(
                key
              )
            )
              return value.trim();
          }
        }

        if (process.platform === 'darwin') {
          // @ts-expect-error - Unknown global
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { ptr, dlopen, CString } = Bun.FFI;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const sysctlbyname = dlopen('libc.dylib', {
            sysctlbyname: {
              args: ['ptr', 'ptr', 'ptr', 'ptr', 'isize'],
              returns: 'isize',
            },
          }).symbols.sysctlbyname;

          const buf = new Uint8Array(256);
          const len = new BigInt64Array([256n]);
          const cmd = new TextEncoder().encode('machdep.cpu.brand_string\0');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          if (Number(sysctlbyname(ptr(cmd), ptr(buf), ptr(len), 0, 0)) === -1)
            throw 0;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return new CString(ptr(buf)) as string;
        }
      } catch {}

      return 'unknown';
    },

    deno: async () => {
      const decoder = new StringDecoder('utf8');

      try {
        if (Deno.build.os === 'darwin') {
          const p = Deno.run({
            stdin: 'null',
            stderr: 'null',
            stdout: 'piped',
            cmd: ['sysctl', '-n', 'machdep.cpu.brand_string'],
          });

          return decoder.write(await p.output()).trim();
        }

        if (Deno.build.os === 'linux') {
          const info = new TextDecoder()
            .decode(Deno.readFileSync('/proc/cpuinfo'))
            .split('\n');

          for (const line of info) {
            const [key, value] = line.split(':');
            if (
              /model name|Hardware|Processor|^cpu model|chip type|^cpu type/.test(
                key
              )
            )
              return value.trim();
          }
        }

        if (Deno.build.os === 'windows') {
          const p = Deno.run({
            stdin: 'null',
            stderr: 'null',
            stdout: 'piped',
            cmd: ['wmic', 'cpu', 'get', 'name'],
          });

          return (
            decoder
              .write(await p.output())
              .split('\n')
              .at(-1)
              ?.trim() ?? 'undefined cpu'
          );
        }
      } catch {}

      return 'unknown';
    },
  }[runtime()]();
}

export async function run({
  avg = true,
  collect = false,
  colors = true,
  finalResult = true,
  json = false,
  minMax = true,
  percentiles = true,
  size = tableSize(benchmarks.map((b) => b.name)),
  ...restOpts
}: RunOptions): Promise<Report> {
  const opts = { colors, collect, json, size, ...restOpts };

  const report: Report = {
    benchmarks,
    cpu: await cpu(),
    runtime: `${`${runtime()} ${version()}`.trim()} (${os()})`,
  };

  if (!json) {
    log(gray(colors, `cpu: ${report.cpu}`));
    log(gray(colors, `runtime: ${report.runtime}`));

    log('');
    log(header(opts));
    log(br(opts));
  }

  for (const group of groups) {
    if (!json) {
      if (!group.startsWith('$rujak_group')) log(`• ${group}`);
      log(gray(colors, br(opts)));
    }

    for (const b of benchmarks) {
      if (group !== b.group) continue;

      try {
        b.stats = !b.async
          ? await sync(b.time, b.fn, collect)
          : await async(b.time, b.fn, collect);

        if (!json) {
          log(benchmark(b.name, b, opts));
        }
      } catch (err) {
        if (err instanceof Error) {
          b.error = { name: err.name, stack: err.stack, message: err.message };
          if (!json) log(benchmarkError(b.name, err, opts));
        } else {
          throw err;
        }
      }
    }

    if (summaries[group] && !json)
      log(
        '\n' +
          summary(
            benchmarks.filter((b) => group === b.group),
            opts
          )
      );
  }

  if (json)
    log(
      JSON.stringify(
        report,
        null,
        typeof opts.json !== 'number' ? 0 : opts.json
      )
    );

  return report;
}
