import chalk from 'chalk';
import { Server } from 'node:http';
import { join } from 'node:path';
import { Adapter } from '@/adapter';
import { ConfigParser, configSchema } from '@/config';
import { Http } from '@/delivery/http';
import { Service } from '@/domain/service';
import { UseCase } from '@/domain/usecase';
import { Lib } from '@/lib';
import { ClientManager } from '@/lib/clients';
import { Logger } from '@/lib/logger';
import { AppInfo, AppParams, AppProcessType } from './types';

export class App {
  public static create(params: AppParams = {}): App {
    return new App(params);
  }

  constructor(private readonly params: AppParams = {}) {}

  private readonly name = 'Blog Test';
  private readonly package = require('../../package.json');
  private readonly version: string = this.package.version;
  private readonly color: string = '#ffcc00';

  private get mode(): string {
    return this.params.mode ?? 'production';
  }

  private get devMode(): boolean {
    return this.mode === 'development';
  }

  private get prodMode(): boolean {
    return this.mode === 'production';
  }

  private get workerCount(): number {
    return this.params.workerCount ?? 0;
  }

  private get rootPath(): string {
    return process.cwd();
  }

  private get dataPath(): string {
    return join(this.rootPath, './data');
  }

  private get processType(): AppProcessType {
    return this.params.processType ?? 'primary';
  }

  private get isPrimaryProcess(): boolean {
    return this.processType === 'primary';
  }

  private get isWorkerProcess(): boolean {
    return this.processType === 'worker';
  }

  private get multiProcessMode(): boolean {
    return this.params.multiProcessMode ?? false;
  }

  private get info(): AppInfo {
    return {
      name: this.name,
      version: this.version,
      color: this.color,
      mode: this.mode,
      prodMode: this.prodMode,
      devMode: this.devMode,
      rootPath: this.rootPath,
      dataPath: this.dataPath,
      workerCount: this.workerCount,
      isPrimaryProcess: this.isPrimaryProcess,
      isWorkerProcess: this.isWorkerProcess,
      multiProcessMode: this.multiProcessMode
    };
  }

  private onSig(): void {
    process.exit(0);
  }

  private handleExit(logger: Logger, httpServer: Server | null): void {
    const { info: appInfo } = this;

    if (this.isPrimaryProcess) {
      logger.info(`${chalk.hex(appInfo.color)(appInfo.name)} stopped.`);
    }
    if (httpServer) {
      httpServer.close();
    }
    process.exit(0);
  }

  private handleUncaughtException(logger: Logger, error: Error): void {
    logger.log({
      level: 'error',
      message: error.message,
      stack: error.stack
    });
  }

  private handleUnhandledRejection(
    logger: Logger,
    reason: unknown,
    promise: Promise<unknown>
  ): void {
    logger.error('Unhandled rejection:', reason);
    logger.error('Promise:', promise);
  }

  public async start(): Promise<{ logger: Logger }> {
    const {
      devMode,
      dataPath,
      info: appInfo,
      isPrimaryProcess,
      multiProcessMode
    } = this;
    const config = await ConfigParser.parse({ schema: configSchema });
    const logger = Logger.create({
      level: config.logger.level,
      files: isPrimaryProcess,
      dataPath
    });

    if (isPrimaryProcess) {
      logger.info(`${chalk.hex(appInfo.color)(appInfo.name)} starting...`);

      const { port } = config.http;
      const { version } = appInfo;

      logger.info(
        `${chalk.hex(appInfo.color)(appInfo.name)} ${chalk.gray(`[Version: ${version}]`)} ${chalk.blue(`[Port: ${port}]`)} ${devMode ? chalk.red('[Dev Mode]') : chalk.green('[Prod Mode]')}${multiProcessMode ? ` ${chalk.magenta('[Multi Process Mode]')}` : ''}\n` +
          `\tAPI URL:  ${chalk.gray.underline(`${config.http.baseUrl}/api/v1`)}\n` +
          `\tDocs URL: ${chalk.gray.underline(`${config.http.baseUrl}/api/v1/docs`)}`
      );
    }

    const lib = Lib.create();
    const clients = await ClientManager.connect({ appInfo, config, lib });

    const { gateway, repository } = Adapter.create({
      appInfo,
      config,
      lib,
      clients,
      logger
    });

    const service = Service.create({
      appInfo,
      config,
      lib,
      clients,
      logger,
      gateway,
      repository
    });

    const useCase = UseCase.create({
      appInfo,
      config,
      lib,
      clients,
      logger,
      gateway,
      repository,
      service
    });

    await useCase.app();

    const httpLogger = logger.child({ baseUrl: config.http.baseUrl });
    let httpServer: Server | null;

    if (
      (this.multiProcessMode && this.isWorkerProcess) ||
      (!this.multiProcessMode && this.isPrimaryProcess)
    ) {
      const http = Http.create({
        appInfo,
        config,
        lib,
        clients,
        logger,
        useCase,
        httpLogger
      });

      httpServer = http.server.start();
    } else {
      httpServer = null;
    }

    process.on(
      'uncaughtException',
      this.handleUncaughtException.bind(this, logger)
    );
    process.on(
      'unhandledRejection',
      this.handleUnhandledRejection.bind(this, logger)
    );
    process.on('SIGINT', this.onSig.bind(this));
    process.on('SIGQUIT', this.onSig.bind(this));
    process.on('SIGTERM', this.onSig.bind(this));
    process.on('exit', this.handleExit.bind(this, logger, httpServer));

    return { logger };
  }
}
