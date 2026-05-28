export type HookName = "onShiftCreated" | "onContributorApplied";

export type HookPayloadMap = {
  onShiftCreated: { shiftId: string; organizationId: string };
  onContributorApplied: { shiftId: string; userId: string; organizationId: string };
};

type HookHandler<K extends HookName> = (payload: HookPayloadMap[K]) => Promise<void> | void;

export class HookRegistry {
  private readonly handlers: { [K in HookName]: HookHandler<K>[] } = {
    onShiftCreated: [],
    onContributorApplied: []
  };

  register<K extends HookName>(hookName: K, handler: HookHandler<K>) {
    this.handlers[hookName].push(handler);
  }

  async dispatch<K extends HookName>(hookName: K, payload: HookPayloadMap[K]) {
    for (const handler of this.handlers[hookName]) {
      await handler(payload);
    }
  }
}
