const logger = require('pino')();
const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler');

const kitchen = require('../kitchens');

const TASK_NAME = 'buildMenu';

const task = new AsyncTask(
  TASK_NAME,
  () => {
    return new Promise(async (resolve, reject) => {
      try {
        logger.info(`JOB: Starting AsyncTask ${TASK_NAME}`);

        await kitchen();

        logger.info(`JOB: Finishing AsyncTask ${TASK_NAME}`);

        return resolve(true);
      } catch (ex) {
        return reject(ex);
      }
    });
  },
  (ex) => {
    logger.error(`JOB: AsyncTask ${TASK_NAME} has failed`);
    logger.error(ex);

    return false;
  }
);

module.exports = new SimpleIntervalJob({ minutes: 15 }, task);
