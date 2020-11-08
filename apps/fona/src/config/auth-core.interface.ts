import { IFacebookConfig, IGooglePlusConfig, IJwtConfig } from '@lib/auth';
import { IAuthCoreConfig } from '@lib/auth/interfaces/auth-core.interface';
import { ICoreConfig } from '@lib/core';

export interface IConfig {
  core: ICoreConfig;
  auth: {
    fbConf: IFacebookConfig;
    ggConf: IGooglePlusConfig;
    jwtConf: IJwtConfig;
    authCoreConf: IAuthCoreConfig;
  };
}
