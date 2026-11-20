/**
 * Bounded, anonymous-only smoke/load probe for BETV staging.
 * Never run high-volume probes against the production site.
 * Usage:
 *   node scripts/load-test-public.mjs --url=http://localhost:3000 --users=10 --seconds=10
 *   node scripts/load-test-public.mjs --url=https://staging.example.com --allow-remote --users=10
 */
const args = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--')).map(token => {
  const [key, ...rest] = token.slice(2).split('=');
  return [key, rest.length ? rest.join('=') : true];
}));
const base = args.url;
if (!base) {
  console.error('Provide --url=http://localhost:3000 (staging only).');
  process.exit(2);
}
let endpoint;
try {
  const target = new URL(base);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(target.hostname);
  if (!['http:', 'https:'].includes(target.protocol)) throw Error('Invalid protocol');
  if (!local && !args['allow-remote']) throw Error('Remote load testing requires --allow-remote');
  if (/(^|\.)billieilishtv\.site$/i.test(target.hostname)) throw Error('Production load testing is intentionally blocked');
  endpoint = new URL('/api/public-data?name=home-bootstrap&locale=pt-br', target);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const users = Math.min(30, Math.max(1, parseInt(args.users || '5', 10) || 5));
const seconds = Math.min(60, Math.max(1, parseInt(args.seconds || '10', 10) || 10));
const deadline = Date.now() + seconds * 1000;
const latencies = [];
let errors = 0;
let requests = 0;
const abortAfterMs = 8000;
async function simulatedVisitor() {
  while (Date.now() < deadline) {
    const started = performance.now();
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(abortAfterMs), headers: { Accept: 'application/json' } });
      if (!response.ok) errors += 1;
      else { await response.arrayBuffer(); latencies.push(performance.now() - started); }
    } catch (_) { errors += 1; }
    requests += 1;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}
console.log('Running limited public API probe against ' + endpoint.origin + ' with ' + users + ' visitors for ' + seconds + 's.');
await Promise.all(Array.from({ length: users }, simulatedVisitor));
latencies.sort((a, b) => a - b);
const p = percentile => latencies.length ? latencies[Math.max(0, Math.ceil(percentile * latencies.length) - 1)].toFixed(0) : 'n/a';
const errorRate = requests ? (100 * errors / requests) : 100;
console.log(JSON.stringify({
  requests, successful: latencies.length, errors,
  errorRatePercent: Number(errorRate.toFixed(2)),
  latencyP50ms: p(0.50), latencyP95ms: p(0.95), latencyP99ms: p(0.99),
  throughputRps: Number((requests / seconds).toFixed(2))
}, null, 2));
if (!requests || errorRate > 2) process.exitCode = 1;
