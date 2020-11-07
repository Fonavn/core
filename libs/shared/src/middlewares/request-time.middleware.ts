import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class RequestTimeMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) { }

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = new Date();

    // TODO use X-ray here
    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log({
        method, path: request.path, statusCode,
        contentLength, userAgent, ip,
        time: new Date().getTime() - startTime.getTime()
      },
        RequestTimeMiddleware.name,
      );
    });

    next();
  }
}
