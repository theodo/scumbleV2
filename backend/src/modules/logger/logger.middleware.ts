import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { Environment } from 'src/env.validation';
import { CustomLogger } from './custom-logger.service';
import { nodeStorage } from './async-local-storage';

const generateId = () => {
  return randomBytes(16).toString('hex');
};

const computeRequestEndLogContent = (req: Request, res: Response, requestStartTime: number) => {
  const requestEndTime = new Date().getTime();
  const executionDurationMs = requestEndTime - requestStartTime;

  const { url, method } = req;
  const { statusCode, statusMessage } = res;
  const message = 'Ingoing request execution end';

  return { method, url, statusCode, statusMessage, executionDurationMs, message };
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {
    this.logger.setContext('LoggerMiddleware');
  }

  use(req: Request, res: Response, next: () => void): void {
    const traceId = generateId();

    const requestStartTime = new Date().getTime();
    res.on('finish', () => {
      if (process.env.NODE_ENV === Environment.Test) {
        return;
      }

      const requestEndLogContent = computeRequestEndLogContent(req, res, requestStartTime);
      this.logger.log(requestEndLogContent);
    });

    nodeStorage.run({ traceId }, () => {
      next();
    });
  }
}
