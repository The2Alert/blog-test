export type AppProcessType = 'primary' | 'worker';

export interface AppParams {
  mode?: string;
  workerCount?: number;
  multiProcessMode?: boolean;
  processType?: AppProcessType;
}

export interface AppInfo {
  name: string;
  version: string;
  color: string;
  mode: string;
  prodMode: boolean;
  devMode: boolean;
  rootPath: string;
  dataPath: string;
  workerCount: number;
  isPrimaryProcess: boolean;
  isWorkerProcess: boolean;
  multiProcessMode: boolean;
}
