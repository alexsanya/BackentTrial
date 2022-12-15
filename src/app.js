const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const contractsRouter = require('./routers/contract');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(contractsRouter);

module.exports = app;
