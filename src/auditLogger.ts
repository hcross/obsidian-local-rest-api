import { createHash } from 'crypto';
import { appendFile, rename } from 'fs/promises';
import { join } from 'path';

interface AuditEntry {
  ts: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  tokenHash: string;
  durationMs: number;
}

export class AuditLogger {
  private logPath: string;
  private maxEntries: number;
  private lineCount = 0;
  private enabled: boolean;

  constructor(vaultPath: string) {
    this.logPath = join(vaultPath, '.local-rest-api-audit.log');
    this.maxEntries = parseInt(process.env.OBSIDIAN_AUDIT_MAX_ENTRIES ?? '10000');
    this.enabled = process.env.OBSIDIAN_AUDIT_LOG !== 'false';
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex').substring(0, 16);
  }

  async log(entry: AuditEntry): Promise<void> {
    if (!this.enabled) return;
    await appendFile(this.logPath, JSON.stringify(entry) + '\n', { mode: 0o600 });
    this.lineCount++;
    if (this.lineCount >= this.maxEntries) await this._rotate();
  }

  private async _rotate(): Promise<void> {
    const rotated = this.logPath + '.' + Date.now() + '.bak';
    await rename(this.logPath, rotated);
    this.lineCount = 0;
  }
}
