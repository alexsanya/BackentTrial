const _ = require('lodash');

const HTTP_STATUS_CODES = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LENGTH_REQUIRED: 411,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  OK: 200
}

const stripTimestamps = item => _.omit(item, ['createdAt', 'updatedAt']);

module.exports = {
  HTTP_STATUS_CODES,
  stripTimestamps
}

