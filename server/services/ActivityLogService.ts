export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  icon: string;
  entityType?: string;
  entityId?: string;
}

export type ActivityLogParams = {
  action: string;
  user: string;
  details: string;
  icon?: string;
  entityType?: string;
  entityId?: string;
  id?: string;
  timestamp?: string;
};

export class ActivityLogService {
  static log(activityLogs: ActivityLogEntry[], params: ActivityLogParams) {
    const entry: ActivityLogEntry = {
      id: params.id || `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: params.timestamp || new Date().toISOString(),
      action: params.action,
      user: params.user,
      details: params.details,
      icon: params.icon || "info",
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.entityId ? { entityId: params.entityId } : {})
    };
    activityLogs.unshift(entry);
    return entry;
  }
}
