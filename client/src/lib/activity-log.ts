/**
 * Activity logging is now handled server-side by the Express API.
 * This module provides a no-op implementation for compatibility.
 */

export type RecordActivityInput = {
  action: string;
  module: string;
  entityId?: string;
  entityTitle?: string;
  details?: string;
};

/**
 * No-op activity logger. The Express API records activity automatically.
 */
export async function recordLGUActivity(
  _input: RecordActivityInput | { session: unknown } & RecordActivityInput
): Promise<void> {
  // Server handles activity logging
  return;
}
