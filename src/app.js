const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const contractsRouter = require('./routers/contract');
const jobsRouter = require('./routers/jobs');
const balancesRouter = require('./routers/balances');
const admin = require('./routers/admin');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const errorHandler = async (err, req, res, next) => {
  res.status(err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.message)
}

const invalidPathHandler = (request, response, next) => {
  response.status(404)
  response.send('invalid path')
}

app.use(contractsRouter);
app.use(jobsRouter);
app.use(balancesRouter);
app.use(admin);
app.use(errorHandler);
app.use(invalidPathHandler);


module.exports = app;
