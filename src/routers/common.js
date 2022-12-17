const { Op } = require('sequelize');

const getUnpaidJobsForProfile = async (profile, models) => {
  const {Contract, Profile, Job} = models;
  // get all contracts numbers for profile
  const contractIds = await Contract.findAll({
    attributes: ['id'],
    where: {
      status: 'in_progress',
    },
    include: {
      model: Profile,
      required: true,
      as: profile.type === 'client' ? 'Client' : 'Contractor',
      where: {
        id: profile.id
      },
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

  return jobs;
}

module.exports = {
  getUnpaidJobsForProfile
}
