import express from 'express';
import { AbstractServer } from './abstract';
import { ServerParams } from './types';

export class Server extends AbstractServer {
  public static create(params: ServerParams): Server {
    return new Server(params);
  }

  public start() {
    const { config, router } = this;
    const app = express();

    router.registerRoutes(app);

    return app.listen(config.http.port, config.http.host);
  }
}
