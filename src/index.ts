import cluster from 'node:cluster';
import os from 'node:os';
import { App } from '@/app';

(async () => {
  const mode = process.env.NODE_ENV ?? 'production';
  const workerCount = Number(process.env.WORKER_COUNT ?? os.cpus().length - 1);
  const processType = cluster.isPrimary ? 'primary' : 'worker';
  const multiProcessMode = process.env.MULTI_PROCESS_MODE === '1';
  const app = App.create({ mode, workerCount, processType, multiProcessMode });

  const { logger } = await app.start();

  if (multiProcessMode) {
    if (cluster.isPrimary) {
      for (let workerIndex = 0; workerIndex < workerCount; workerIndex++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        logger.info(`Worker ${String(worker.process.pid)} died.`);
      });
    } else if (cluster.isWorker) {
      logger.info(`Worker ${process.pid} started.`);
    }
  }
})();
