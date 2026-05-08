import { useState, useCallback } from 'react';
import {
  upstreamKeys,
  platformKeys,
  modelCatalog,
  routeStrategies,
  callLogs,
  asyncTasks,
  creditTransactions,
  rechargeApplications,
  teamMembers,
  webhookConfigs,
  securitySettings,
  customers,
  workspaces,
  adminLogs,
  systemSettings,
  dashboardStats,
  type UpstreamKey,
  type PlatformKey,
  type ModelEntry,
  type RouteStrategy,
  type CallLog,
  type AsyncTask,
  type CreditTransaction,
  type RechargeApplication,
  type TeamMember,
  type WebhookConfig,
  type SecuritySetting,
  type Customer,
  type Workspace,
  type AdminLog,
  type SystemSetting,
  type DashboardStats,
} from '@/lib/mockData';

const STORAGE_KEY = 'ainexus_mock_data';

interface MockDataState {
  upstreamKeys: UpstreamKey[];
  platformKeys: PlatformKey[];
  modelCatalog: ModelEntry[];
  routeStrategies: RouteStrategy[];
  callLogs: CallLog[];
  asyncTasks: AsyncTask[];
  creditTransactions: CreditTransaction[];
  rechargeApplications: RechargeApplication[];
  teamMembers: TeamMember[];
  webhookConfigs: WebhookConfig[];
  securitySettings: SecuritySetting;
  customers: Customer[];
  workspaces: Workspace[];
  adminLogs: AdminLog[];
  systemSettings: SystemSetting[];
  dashboardStats: DashboardStats;
}

const defaultState: MockDataState = {
  upstreamKeys,
  platformKeys,
  modelCatalog,
  routeStrategies,
  callLogs,
  asyncTasks,
  creditTransactions,
  rechargeApplications,
  teamMembers,
  webhookConfigs,
  securitySettings,
  customers,
  workspaces,
  adminLogs,
  systemSettings,
  dashboardStats,
};

function loadFromStorage(): MockDataState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveToStorage(state: MockDataState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function simulateFailure(): boolean {
  return Math.random() < 0.05;
}

export function useMockData() {
  const [state, setState] = useState<MockDataState>(() => {
    return loadFromStorage() || defaultState;
  });

  const persist = useCallback((newState: MockDataState) => {
    setState(newState);
    saveToStorage(newState);
  }, []);

  const createItem = useCallback(
    <T extends { id: string }>(key: keyof MockDataState, item: T): Promise<T> => {
      return new Promise((resolve, reject) => {
        simulateDelay().then(() => {
          if (simulateFailure()) {
            reject(new Error('模拟请求失败，请重试'));
            return;
          }
          setState((prev) => {
            const current = prev[key] as unknown as T[];
            const updated = [...current, item];
            const newState = { ...prev, [key]: updated as unknown as MockDataState[typeof key] };
            saveToStorage(newState);
            return newState;
          });
          resolve(item);
        });
      });
    },
    []
  );

  const updateItem = useCallback(
    <T extends { id: string }>(key: keyof MockDataState, id: string, updates: Partial<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        simulateDelay().then(() => {
          if (simulateFailure()) {
            reject(new Error('模拟请求失败，请重试'));
            return;
          }
          setState((prev) => {
            const current = prev[key] as unknown as T[];
            const index = current.findIndex((item: T) => item.id === id);
            if (index === -1) {
              return prev;
            }
            const updated = [...current];
            updated[index] = { ...updated[index], ...updates };
            const newState = { ...prev, [key]: updated as unknown as MockDataState[typeof key] };
            saveToStorage(newState);
            return newState;
          });
          resolve({ ...updates, id } as T);
        });
      });
    },
    []
  );

  const deleteItem = useCallback(
    <T extends { id: string }>(key: keyof MockDataState, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        simulateDelay().then(() => {
          if (simulateFailure()) {
            reject(new Error('模拟请求失败，请重试'));
            return;
          }
          setState((prev) => {
            const current = prev[key] as unknown as T[];
            const updated = current.filter((item: T) => item.id !== id);
            const newState = { ...prev, [key]: updated as unknown as MockDataState[typeof key] };
            saveToStorage(newState);
            return newState;
          });
          resolve();
        });
      });
    },
    []
  );

  const getUpstreamKeys = useCallback(() => state.upstreamKeys, [state.upstreamKeys]);
  const getPlatformKeys = useCallback(() => state.platformKeys, [state.platformKeys]);
  const getModelCatalog = useCallback(() => state.modelCatalog, [state.modelCatalog]);
  const getRouteStrategies = useCallback(() => state.routeStrategies, [state.routeStrategies]);
  const getCallLogs = useCallback(() => state.callLogs, [state.callLogs]);
  const getAsyncTasks = useCallback(() => state.asyncTasks, [state.asyncTasks]);
  const getCreditTransactions = useCallback(() => state.creditTransactions, [state.creditTransactions]);
  const getRechargeApplications = useCallback(() => state.rechargeApplications, [state.rechargeApplications]);
  const getTeamMembers = useCallback(() => state.teamMembers, [state.teamMembers]);
  const getWebhookConfigs = useCallback(() => state.webhookConfigs, [state.webhookConfigs]);
  const getSecuritySettings = useCallback(() => state.securitySettings, [state.securitySettings]);
  const getCustomers = useCallback(() => state.customers, [state.customers]);
  const getWorkspaces = useCallback(() => state.workspaces, [state.workspaces]);
  const getAdminLogs = useCallback(() => state.adminLogs, [state.adminLogs]);
  const getSystemSettings = useCallback(() => state.systemSettings, [state.systemSettings]);
  const getDashboardStats = useCallback(() => state.dashboardStats, [state.dashboardStats]);

  const resetData = useCallback(() => {
    persist(defaultState);
  }, [persist]);

  return {
    state,
    persist,
    createItem,
    updateItem,
    deleteItem,
    getUpstreamKeys,
    getPlatformKeys,
    getModelCatalog,
    getRouteStrategies,
    getCallLogs,
    getAsyncTasks,
    getCreditTransactions,
    getRechargeApplications,
    getTeamMembers,
    getWebhookConfigs,
    getSecuritySettings,
    getCustomers,
    getWorkspaces,
    getAdminLogs,
    getSystemSettings,
    getDashboardStats,
    resetData,
  };
}
