/**
 * Simple debug logger for troubleshooting.
 * Debug messages only print in development so production consoles stay quiet.
 */
export const logger = {
  debug(message: string, details?: unknown): void {
    if (import.meta.env.DEV) {
      console.debug(`[SMC] ${message}`, details ?? "");
    }
  },
  error(message: string, details?: unknown): void {
    console.error(`[SMC] ${message}`, details ?? "");
  },
};
