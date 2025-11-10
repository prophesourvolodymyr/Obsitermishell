import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import { Notice } from 'obsidian';
import { NodeFinder } from './utils/node-finder';

export class DaemonManager {
  private daemonProcess: ChildProcess | null = null;
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private restartTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private daemonPath: string;
  private nodePath: string;

  constructor(pluginDir: string) {
    this.daemonPath = path.join(pluginDir, 'daemon', 'index.js');
    this.nodePath = NodeFinder.findNodePath();
  }

  async start(): Promise<void> {
    if (this.daemonProcess && !this.daemonProcess.killed) {
      console.log('[Daemon] Already running');
      return;
    }

    try {
      console.log('[Daemon] Starting daemon:', this.daemonPath);
      console.log('[Daemon] Using Node.js:', this.nodePath);

      this.daemonProcess = spawn(this.nodePath, [this.daemonPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        env: process.env,
      });

      this.daemonProcess.stdout?.on('data', (data) => {
        console.log('[Daemon]', data.toString().trim());
      });

      this.daemonProcess.stderr?.on('data', (data) => {
        console.error('[Daemon Error]', data.toString().trim());
      });

      this.daemonProcess.on('exit', (code, signal) => {
        console.log(`[Daemon] Process exited with code ${code}, signal ${signal}`);

        if (!this.isShuttingDown && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`[Daemon] Attempting restart ${this.restartAttempts}/${this.maxRestartAttempts}`);

          // Wait 2 seconds before restarting
          this.restartTimeout = setTimeout(() => {
            this.start().catch(err => {
              console.error('[Daemon] Restart failed:', err);
              new Notice('Terminal daemon crashed. Please reload the plugin.');
            });
          }, 2000);
        } else if (this.restartAttempts >= this.maxRestartAttempts) {
          new Notice('Terminal daemon failed to start after multiple attempts. Please check console.');
        }

        this.daemonProcess = null;
      });

      this.daemonProcess.on('error', (err: NodeJS.ErrnoException) => {
        console.error('[Daemon] Failed to start:', err);

        if (err.code === 'ENOENT') {
          const message = `Terminal daemon failed: Node.js not found at "${this.nodePath}". Please install Node.js or check your PATH.`;
          console.error(message);
          new Notice(message, 10000);
        } else {
          new Notice(`Terminal daemon error: ${err.message}`);
        }
      });

      // Wait a bit for daemon to start listening
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset restart attempts on successful start
      this.restartAttempts = 0;

      console.log('[Daemon] Started successfully');

    } catch (err) {
      console.error('[Daemon] Start error:', err);
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.isShuttingDown = true;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.daemonProcess && !this.daemonProcess.killed) {
      console.log('[Daemon] Stopping daemon');

      return new Promise((resolve) => {
        if (!this.daemonProcess) {
          resolve();
          return;
        }

        this.daemonProcess.once('exit', () => {
          console.log('[Daemon] Stopped');
          this.daemonProcess = null;
          resolve();
        });

        // Try graceful shutdown first
        this.daemonProcess.kill('SIGTERM');

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.daemonProcess && !this.daemonProcess.killed) {
            console.log('[Daemon] Force killing daemon');
            this.daemonProcess.kill('SIGKILL');
          }
        }, 5000);
      });
    }
  }

  isRunning(): boolean {
    return this.daemonProcess !== null && !this.daemonProcess.killed;
  }

  async restart(): Promise<void> {
    await this.stop();
    this.isShuttingDown = false;
    await this.start();
  }
}
