const express = require('express')
const router = express.Router()
const { Op } = require("sequelize");
const {getProfile} = require('../middleware/getProfile')

router.get('/jobs/unpaid', getProfile, async (req, res) => {
  const {Contract, Profile, Job} = req.app.get('models')
  const { profile } = req

  // get all contracts numbers for profile
  const contractIds = await Contract.findAll({
    attributes: ['id'],
    where: {
      status: {
        [Op.not]: 'terminated',  //assuming the contract couldn't be terminated untill all jobs are payed
      }
    },
    include: {
      model: Profile,
      required: true,
      as: profile.type === 'client' ? 'Client' : 'Contractor',
      where: {
        id: profile.id
      }
    }
  }).then(results => results.map(item => item.dataValues.id))

  // get all unpayed jobs for list of contracts
  const jobs = await Job.findAll({
    where: {
      ContractId: {
        [Op.in]: contractIds
      },
      paid: {
        [Op.not]: true
      }
    }
  });

  res.status(200).json(jobs);
});

module.exports = router
