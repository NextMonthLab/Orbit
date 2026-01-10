import { ViewEngineLog, ViewEngineLogSchema } from "@shared/orbitViewEngine";

const logs: ViewEngineLog[] = [];
const MAX_LOGS = 1000;

export function logViewEngineEvent(event: Omit<ViewEngineLog, "timestamp">): void {
  const log: ViewEngineLog = {
    ...event,
    timestamp: new Date().toISOString()
  };

  try {
    ViewEngineLogSchema.parse(log);
  } catch (e) {
    console.error("[ViewEngine] Invalid log event:", e);
  }

  logs.push(log);
  
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[ViewEngine]", JSON.stringify({
      intent: log.intent,
      view_selected: log.view_selected,
      reason_codes: log.reason_codes,
      missing_slots: log.missing_slots,
      schema_valid: log.schema_valid,
      error: log.error
    }, null, 2));
  }
}

export function getRecentLogs(count: number = 50): ViewEngineLog[] {
  return logs.slice(-count);
}

export function clearLogs(): void {
  logs.length = 0;
}

export function getLogStats(): {
  total: number;
  byIntent: Record<string, number>;
  byView: Record<string, number>;
  errorRate: number;
} {
  const byIntent: Record<string, number> = {};
  const byView: Record<string, number> = {};
  let errors = 0;

  logs.forEach(log => {
    byIntent[log.intent] = (byIntent[log.intent] || 0) + 1;
    if (log.view_selected) {
      byView[log.view_selected] = (byView[log.view_selected] || 0) + 1;
    }
    if (log.error) {
      errors++;
    }
  });

  return {
    total: logs.length,
    byIntent,
    byView,
    errorRate: logs.length > 0 ? errors / logs.length : 0
  };
}
