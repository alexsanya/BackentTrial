const express = require('express')
const router = express.Router()
const logger = require('../logger');
const { HTTP_STATUS_CODES } = require('../common');
const {getUnpaidJobsForProfile} = require('./common');
const {getProfile} = require('../middleware/getProfile')
const {userPaymentsSemafor, userPaymentsUnlock, errorHandler} = require('../middleware/userPaymentsSemafor');

const getProfileByUserId = async (req, res, next) => {
  const userId = +req.params.userId;
  const {Profile} = req.app.get('models');
  const profile = await Profile.findOne({
    where: {
      id: userId
    }
  });
  if (!profile) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).send(`User with id ${userId} doesn't exists`);
  }
  req.profile = profile;
  if (profile.type !== 'client') {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).send('This endpoint is only for clients profile');
  }
  next();
}

router.post('/balances/deposit/:userId', getProfileByUserId, userPaymentsSemafor, async (req, res, next) => {
  try {
    const { profile } = req;
    const amount = +req.body.amount;
    const unpaidJobs = await getUnpaidJobsForProfile(profile, req.app.get('models'));
    const totalToPay = unpaidJobs.reduce((acc, job) => acc + job.price, 0);
    const maxAllowed = Math.round(totalToPay * 0.25);
    logger.debug(`[deposit ]Limit: ${maxAllowed}`);
    if (amount > Math.trunc(totalToPay * 0.25)) {
      const message = `Amount should not exceed ${maxAllowed}`;
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).send(message);
      throw new Error(message);
    }
    
    const {Profile} = req.app.get('models');
    await Profile.update({
      balance: profile.balance + amount
    }, {
      where: {
        id: profile.id
      }
    });
    res.status(201).end();
    next();
  } catch(error) {
    logger.error(error);
    next({...error, paymentError: true})
  } 
}, userPaymentsUnlock);

router.use(errorHandler);

module.exports = router
