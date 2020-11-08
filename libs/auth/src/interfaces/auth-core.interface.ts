export interface IAuthCoreConfig {
  port?: number;
  externalPort?: number;
  domain?: string;
  protocol?: 'http' | 'https';
  indexFile?: string;
  defaultDBConnOps?: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database?: string;
  };
}
