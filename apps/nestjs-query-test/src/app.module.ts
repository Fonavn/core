import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoItemModule } from './todo/todo.module';
import { TenantModule } from './tenant/tenant.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import masterDatabase from './config/master-database';
import loggerOptions from './config/logger';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
import { RequestTimeMiddleware } from '@lib/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join('./apps/fona/.env'),
      load: [masterDatabase, loggerOptions],
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
    GraphQLModule.forRoot({
      // set to true to automatically generate schema
      autoSchemaFile: true,
    }),
    TodoItemModule,
    TenantModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestTimeMiddleware).forRoutes('*');
  }
}
