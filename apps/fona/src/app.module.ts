import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@lib/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import masterDatabase from './config/master-database';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from '@lib/core';
import authCore from './config/auth-core';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import { TodoModule } from './todos/todos.module';
import { TenantModule } from '@lib/tenant';
import entities from './config/tenant-entity';
import adminRoutes from './config/admin-route';
import logger from './config/logger';
import { RequestTimeMiddleware } from '@lib/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join('./apps/fona/.env'),
      load: [masterDatabase, authCore, logger],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return config.get('winston');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return config.get('database');
      },
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CoreModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return config.get('core');
      },
      inject: [ConfigService],
    }),
    AuthModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return config.get('auth.fbConf');
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return config.get('auth.ggConf');
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return config.get('auth.jwtConf');
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return config.get('auth.authCoreConf');
        },
        inject: [ConfigService],
      },
    ),
    TenantModule.forRoot(entities, adminRoutes),
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestTimeMiddleware).forRoutes('*');
  }
}
