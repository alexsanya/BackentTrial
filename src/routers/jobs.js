const express = require('express')
const router = express.Router()
const { HTTP_STATUS_CODES } = require('../common');
const {getProfile} = require('../middleware/getProfile')
const {getUnpaidJobsForProfile} = require('./common');
const {userPaymentsSemafor, userPaymentsUnlock, errorHandler} = require('../middleware/userPaymentsSemafor');


router.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { profile } = req
  const unpaidJobs = await getUnpaidJobsForProfile(profile, req.app.get('models'));

  res.status(200).json(unpaidJobs);
});

router.post('/jobs/:job_id(\\d+)/pay', getProfile, userPaymentsSemafor, async (req, res, next) => {
  const { profile } = req
  const job_id = +req.params.job_id
  const {Job, Profile, Contract} = req.app.get('models')
  const sequelize = req.app.get('sequelize');

  const transaction = await sequelize.transaction();
  try {
    if (profile.type !== 'client') {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).send('This endpoint is only for clients profile');
      throw new Error('Wrong type of profile');
    }

    const unpaidJobs = await getUnpaidJobsForProfile(profile, req.app.get('models'));
    if (!unpaidJobs.some(job => job.dataValues.id === job_id)) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).send('This job is not belongs to client`s contract or not in progress');
      throw new Error('Wrong job id');
    }

    const job = await Job.findOne({
      where: {
        id: job_id
      },
      include: {
        model: Contract,
        required: true,
      }
    })
    
    console.log('Contractor ID: ', job.Contract.ContractorId);
    console.log('Price: ', job.price);
    console.log('Balance: ', profile.balance);

    if (job.price > profile.balance) {
      res.status(HTTP_STATUS_CODES.CONFLICT).send(`The balance is insufficient, needs to be at least ${job.price}`);
      throw new Error('Insufficient balance');
    }

    const contractor = await Profile.findOne({
      where: { id: job.Contract.ContractorId }
    });

    console.log('Contractor balance: ', contractor.balance);

    await Profile.update({
      balance: profile.balance - job.price
    }, {
      where: {
        id: profile.id
      },
      transaction
    });

    await Profile.update({
      balance: contractor.balance + job.price
    }, {
      where: {
        id: contractor.id
      },
      transaction
    });

    await Job.update({
      paid: true,
      paymentDate: new Date()
    }, {
      where: {
        id: job_id
      },
      transaction
    });

    await transaction.commit();
    res.status(201).end();
    next();
  } catch(error) {
    console.log(error);
    await transaction.rollback();
    next({...error, paymentError: true})
  } 

}, userPaymentsUnlock)

router.use(errorHandler);

module.exports = router
