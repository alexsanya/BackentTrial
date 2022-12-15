const _ = require('lodash');
const express = require('express');
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

app.get('/contracts/:id', async (req, res) => {
  res.status(400).send("Contract id should be a number");
})

module.exports = app;
