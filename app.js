'use strict';

const AutoLoad = require('@fastify/autoload');
const helmet = require('@fastify/helmet');
const { fastifySchedulePlugin } = require('@fastify/schedule');

const fastifySqlite = require('fastify-sqlite');
const path = require('path');

const buildMenuJob = require('./jobs/buildMenu');

module.exports = async function (fastify, opts) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  });

  fastify.register(helmet);

  fastify.register(fastifySqlite, {
    dbFile: 'db/rss_feeder.sqlite',
  });

  fastify.register(fastifySchedulePlugin);

  fastify.ready().then(() => {
    fastify.scheduler.addSimpleIntervalJob(buildMenuJob);
  });
};
