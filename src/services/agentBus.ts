export type AgentEvent = {
  type: string;
  message: string;
  timestamp: number;
  data?: any;
};

const bus = new EventTarget();

export const emitAgentEvent = (event: AgentEvent) => {
  bus.dispatchEvent(new CustomEvent('agent-event', { detail: event }));
};

export const subscribeAgentEvents = (
  callback: (event: AgentEvent) => void
) => {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<AgentEvent>;
    callback(ce.detail);
  };
  bus.addEventListener('agent-event', handler);
  return () => bus.removeEventListener('agent-event', handler);
};
