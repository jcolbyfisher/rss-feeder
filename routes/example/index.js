'use strict';

const feed = require('../../meals/allSides');
const toAtom = require('../../utils/toAtom');

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const data = await feed();
    return toAtom(data);
  });
};
