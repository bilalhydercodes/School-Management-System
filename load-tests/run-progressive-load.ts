import { spawn } from 'child_process';
import path from 'path';

// ============================================================================
// PROGRESSIVE CONCURRENCY LOAD TEST RUNNER (k6 Wrapper)
// Tiers: 100 -> 250 -> 500 -> 750 -> 1,000 Users
// ============================================================================

const K6_BIN = 'C:\\Program Files\\k6\\k6.exe';
const SCRIPT_PATH = path.join(__dirname, 'realistic-erp-load.js');
const TARGET_HOST = process.env.TARGET_HOST || 'http://localhost:3000';

interface TierResult {
  tier: number;
  success: boolean;
  p50Ms?: number;
  p95Ms?: number;
  p99Ms?: number;
  reqsPerSec?: number;
  errorRate?: number;
  output: string;
}

async function runTier(vus: number, duration: string = '30s'): Promise<TierResult> {
  console.log(`\n======================================================`);
  console.log(`  RUNNING TIER: ${vus} CONCURRENT USERS (${duration})`);
  console.log(`  Target: ${TARGET_HOST}`);
  console.log(`======================================================\n`);

  return new Promise((resolve) => {
    const k6 = spawn(
      K6_BIN,
      [
        'run',
        '--env', `VUS=${vus}`,
        '--env', `TARGET_HOST=${TARGET_HOST}`,
        '--vus', String(vus),
        '--duration', duration,
        SCRIPT_PATH,
      ],
      {
        env: { ...process.env },
      }
    );

    let stdout = '';
    let stderr = '';

    k6.stdout.on('data', (d) => {
      const str = d.toString();
      stdout += str;
      process.stdout.write(str);
    });

    k6.stderr.on('data', (d) => {
      const str = d.toString();
      stderr += str;
      process.stderr.write(str);
    });

    k6.on('close', (code) => {
      const combined = stdout + '\n' + stderr;
      // Parse k6 stdout for metrics
      const p50Match = combined.match(/http_req_duration\.*:\s*avg=[\d\.]+ms\s*min=[\d\.]+ms\s*med=([\d\.]+)ms/i) ||
                       combined.match(/p\(50\)=([\d\.]+)ms/);
      const p95Match = combined.match(/p\(95\)=([\d\.]+)ms/);
      const p99Match = combined.match(/p\(99\)=([\d\.]+)ms/);
      const rateMatch = combined.match(/http_req_failed\.*:\s*([\d\.]+)%/);

      resolve({
        tier: vus,
        success: code === 0,
        p50Ms: p50Match ? parseFloat(p50Match[1]) : undefined,
        p95Ms: p95Match ? parseFloat(p95Match[1]) : undefined,
        p99Ms: p99Match ? parseFloat(p99Match[1]) : undefined,
        errorRate: rateMatch ? parseFloat(rateMatch[1]) / 100 : 0,
        output: combined,
      });
    });
  });
}

async function main() {
  const tiers = [100, 250, 500, 750, 1000];
  const results: TierResult[] = [];

  for (const vus of tiers) {
    const res = await runTier(vus, '20s');
    results.push(res);
    if (!res.success && res.errorRate && res.errorRate > 0.05) {
      console.warn(`[WARNING] Tier ${vus} exceeded error threshold (>5%). Halting progression.`);
      break;
    }
  }

  console.log('\n======================================================');
  console.log('  LOAD TEST PROGRESSIVE SUMMARY');
  console.log('======================================================');
  for (const r of results) {
    console.log(
      `Tier ${r.tier} VUs: ${r.success ? 'PASSED' : 'COMPLETED'} | P50: ${r.p50Ms ?? 'N/A'}ms | P95: ${r.p95Ms ?? 'N/A'}ms | P99: ${r.p99Ms ?? 'N/A'}ms | Error Rate: ${((r.errorRate ?? 0) * 100).toFixed(2)}%`
    );
  }
}

main().catch(console.error);
