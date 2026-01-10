interface RenderEvent {
  nm_event_type: 'render_event';
  nm_evidence_key: string;
  nm_component: string;
  nm_component_type: string;
  nm_component_version: string;
  nm_timestamp: string;
  nm_policy_version: string;
  nm_contract_version: string;
  nm_orbit_slug?: string;
  nm_fallback_used?: boolean;
  nm_props_hash?: string;
  nm_additional?: Record<string, string | number | boolean>;
}

interface HealthEvent {
  nm_event_type: 'health_check';
  nm_evidence_key: string;
  nm_status: 'pass' | 'fail' | 'warn';
  nm_timestamp: string;
  nm_message?: string;
}

type EvidenceEvent = RenderEvent | HealthEvent;

const CONTRACT_VERSION = '1.0.0';
const POLICY_VERSION = 'orbitBehaviourContract.v1';
const eventLog: EvidenceEvent[] = [];
const MAX_LOG_SIZE = 1000;

function hashProps(props: Record<string, any>): string {
  const str = JSON.stringify(props);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export interface RenderEventOptions {
  componentType?: string;
  componentVersion?: string;
  fallbackUsed?: boolean;
  props?: Record<string, any>;
  orbitSlug?: string;
  additional?: Record<string, string | number | boolean>;
}

export function logRenderEvent(
  evidenceKey: string,
  component: string,
  options: RenderEventOptions = {}
): void {
  const {
    componentType = 'primary',
    componentVersion = '1.0.0',
    fallbackUsed = false,
    props,
    orbitSlug,
    additional,
  } = options;

  const event: RenderEvent = {
    nm_event_type: 'render_event',
    nm_evidence_key: evidenceKey,
    nm_component: component,
    nm_component_type: componentType,
    nm_component_version: componentVersion,
    nm_timestamp: new Date().toISOString(),
    nm_policy_version: POLICY_VERSION,
    nm_contract_version: CONTRACT_VERSION,
    nm_orbit_slug: orbitSlug,
    nm_fallback_used: fallbackUsed,
    nm_props_hash: props ? hashProps(props) : undefined,
    nm_additional: additional,
  };

  eventLog.push(event);
  
  if (eventLog.length > MAX_LOG_SIZE) {
    eventLog.shift();
  }

  if (fallbackUsed) {
    console.warn(`[Evidence] FALLBACK USED: ${evidenceKey}`, event);
  } else if (import.meta.env.DEV) {
    console.debug(`[Evidence] ${evidenceKey}`, event);
  }
}

export function logHealthCheck(
  evidenceKey: string,
  status: 'pass' | 'fail' | 'warn',
  message?: string
): void {
  const event: HealthEvent = {
    nm_event_type: 'health_check',
    nm_evidence_key: evidenceKey,
    nm_status: status,
    nm_timestamp: new Date().toISOString(),
    nm_message: message,
  };

  eventLog.push(event);
  
  if (eventLog.length > MAX_LOG_SIZE) {
    eventLog.shift();
  }

  if (import.meta.env.DEV) {
    console.debug(`[Health] ${evidenceKey}: ${status}`, message);
  }
}

export function getEventLog(): EvidenceEvent[] {
  return [...eventLog];
}

export function getRecentEvents(count: number = 100): EvidenceEvent[] {
  return eventLog.slice(-count);
}

export function getEventsByKey(evidenceKey: string): EvidenceEvent[] {
  return eventLog.filter(e => 
    ('nm_evidence_key' in e && e.nm_evidence_key === evidenceKey)
  );
}

export function hasRendered(evidenceKey: string): boolean {
  return eventLog.some(e => 
    e.nm_event_type === 'render_event' && e.nm_evidence_key === evidenceKey
  );
}

export function clearEventLog(): void {
  eventLog.length = 0;
}

export function getContractVersion(): string {
  return CONTRACT_VERSION;
}

export function exportEvidencePack(): {
  policyVersion: string;
  contractVersion: string;
  exportedAt: string;
  eventCount: number;
  events: EvidenceEvent[];
  fallbackCount: number;
  renderEvents: RenderEvent[];
  healthEvents: HealthEvent[];
} {
  const renderEvents = eventLog.filter((e): e is RenderEvent => e.nm_event_type === 'render_event');
  const healthEvents = eventLog.filter((e): e is HealthEvent => e.nm_event_type === 'health_check');
  const fallbackCount = renderEvents.filter(e => e.nm_fallback_used).length;
  
  return {
    policyVersion: POLICY_VERSION,
    contractVersion: CONTRACT_VERSION,
    exportedAt: new Date().toISOString(),
    eventCount: eventLog.length,
    events: [...eventLog],
    fallbackCount,
    renderEvents,
    healthEvents,
  };
}

export function getPolicyVersion(): string {
  return POLICY_VERSION;
}

export function hasFallbacksUsed(): boolean {
  return eventLog.some(e => 
    e.nm_event_type === 'render_event' && e.nm_fallback_used === true
  );
}
