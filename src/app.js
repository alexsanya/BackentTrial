const _ = require('lodash');
const express = require('express');
const { Op } = require("sequelize");
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


/**
 * Added regex to prevent sql injection
 * Added profile validation
 * @returns contract by id
 */
app.get('/contracts/:id(\\d+)/',getProfile ,async (req, res) =>{
    const {Contract, Profile} = req.app.get('models')
    const {id} = req.params
    const contract = await Contract.findOne({
      where: {id},
      include: [
        {
          model: Profile,
          required: false,
          as: 'Client',
          where: {
            id: req.profile.id
          }
        },
        {
          model: Profile,
          required: false,
          as: 'Contractor',
          where: {
            id: req.profile.id
          }
        }

      ]
    })
    if(!contract)  return res.status(404).end()
    if (!contract.Client && !contract.Contractor) return res.status(403).end()
    res.json(_.omit(contract.dataValues, ['Client', 'Contractor']))
})

// middleware is not needed here
app.get('/contracts/:id', async (req, res) => {
  res.status(400).send("Contract id should be a number");
})

app.get('/contracts', getProfile, async (req, res) => {

  const {Contract, Profile} = req.app.get('models')
  const { profile } = req;

  const withProfile = {
    include: {
      model: Profile,
      required: true,
      as: profile.type === 'client' ? 'Client' : 'Contractor',
      where: {
        id: profile.id
      }
    },
  }
  // check how many contracts in total
  const contractsNum = await Contract.count(withProfile);
  
  const { offset, limit} = req.query;

  const MAX_CONTRACTS_PER_REQUEST = +process.env.MAX_CONTRACTS_PER_REQUEST || 100;

  if ((contractsNum > MAX_CONTRACTS_PER_REQUEST) && (!limit || limit > MAX_CONTRACTS_PER_REQUEST)) {
    return res.status(411).send(
      `${contractsNum} entities in total, use offset and limit query params where limit <= ${MAX_CONTRACTS_PER_REQUEST}`
    );
  }
  
  const contracts = await Contract.findAll({
    where: {
      status: {
        [Op.not]: 'terminated',  
      }
    },
    limit,
    offset,
    ...withProfile
  });

  res.json(contracts.map(contract => _.omit(contract.dataValues, ['Client', 'Contractor'])))
})

module.exports = app;
