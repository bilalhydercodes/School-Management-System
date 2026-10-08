/**
 * Alpha Edu Hub — Test Result Logger & Context Tracker
 * 
 * Enforces structured test output format across all automated test suites:
 * {
 *   testName,
 *   role,
 *   institution,
 *   page,
 *   action,
 *   status,
 *   duration,
 *   apiFailures,
 *   consoleErrors,
 *   screenshots,
 *   trace,
 *   error
 * }
 */

import * as fs from 'fs';
import * as path from 'path';

export interface StructuredTestResult {
  testName: string;
  role: string;
  institution: string;
  page: string;
  action: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'WARNING';
  durationMs: number;
  apiFailures: Array<{
    url: string;
    method: string;
    status: number;
    errorText?: string;
  }>;
  consoleErrors: Array<{
    type: string;
    text: string;
  }>;
  screenshots: string[];
  trace?: string;
  error?: string;
  timestamp: string;
}

export class TestExecutionLogger {
  private static results: StructuredTestResult[] = [];
  private static logFilePath = path.resolve(process.cwd(), 'test-results/logs/test-execution.jsonl');

  public record(result: Partial<StructuredTestResult> & { testName: string; action: string; status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'WARNING' }) {
    TestExecutionLogger.record(result);
  }

  public static record(result: Partial<StructuredTestResult> & { testName: string; action: string; status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'WARNING' }) {
    const formatted: StructuredTestResult = {
      testName: result.testName,
      role: result.role || 'ANONYMOUS',
      institution: result.institution || 'GLOBAL',
      page: result.page || '/',
      action: result.action,
      status: result.status,
      durationMs: result.durationMs || (result as any).duration || 0,
      apiFailures: (result.apiFailures || []).map((f: any) =>
        typeof f === 'string'
          ? { url: f, method: 'GET/POST', status: 400, errorText: f }
          : f
      ),
      consoleErrors: (result.consoleErrors || []).map((c: any) =>
        typeof c === 'string' ? { type: 'error', text: c } : c
      ),
      screenshots: result.screenshots || [],
      trace: result.trace,
      error: result.error,
      timestamp: result.timestamp || new Date().toISOString(),
    };

    this.results.push(formatted);
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(this.logFilePath, JSON.stringify(formatted) + '\n', 'utf8');
    } catch (err) {
      console.error('[TestExecutionLogger] Failed to write log:', err);
    }
  }

  public static getAllResults(): StructuredTestResult[] {
    return [...this.results];
  }

  public static clear() {
    this.results = [];
  }
}
