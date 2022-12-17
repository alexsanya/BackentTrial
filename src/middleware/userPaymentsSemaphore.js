const logger = require('../logger');
const { HTTP_STATUS_CODES } = require('../common');

const paymentsInProgress = {}

// using semafor to prevent double-spending
const userPaymentsSemaphore = async (req, res, next) => {
  const { profile } = req
  if (paymentsInProgress[profile.id]) {
    return res.send(HTTP_STATUS_CODES.CONFLICT);
  }

  paymentsInProgress[profile.id] = true;
  logger.log(`[userPaymentsSemafor] locked for profile ${profile.id}`);
  next();
}

const userPaymentsUnlock = async (req, res, next) => {
  const { profile } = req
  paymentsInProgress[profile.id] = false

  logger.log(`[userPaymentsSemafor] unlocked for profile ${profile.id}`);
}


const errorHandler = async (err, req, res, next) => {
  const { profile } = req
  if (err.paymentError) {
    paymentsInProgress[profile.id] = false
    logger.log(`[userPaymentsSemafor][errorHandler] unlocked for profile ${profile.id}`);
  }
  res.status(err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.message)
}

module.exports = {
  userPaymentsSemaphore,
  userPaymentsUnlock,
  errorHandler
}
