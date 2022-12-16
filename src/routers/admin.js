const express = require('express')
const router = express.Router()
const { HTTP_STATUS_CODES } = require('../common');

const getFormattedDate = date => {
  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", { month: "2-digit" });
  const day = date.toLocaleString("default", { day: "2-digit" });

  return `${year}-${month}-${day}`;
}

const getBestProfession = async (sequelize, start, end) => {
  const getProfessionSQL = `select Profiles.profession from Jobs
   join Contracts on Jobs.ContractId = Contracts.id
   join Profiles on Contracts.ContractorId = Profiles.id
   where Jobs.paymentDate between '${start}' and '${end}' 
   group by Profiles.profession
   order by sum(price) desc
   limit 1`;

  const { profession } = await sequelize.query(getProfessionSQL, { plain: true, raw: true });
  return profession;
}

const getBestClients = async (sequelize, start, end, limit) => {
  const getBestClientSQL = `select Profiles.* from Jobs
   join Contracts on Jobs.ContractId = Contracts.id
   join Profiles on Contracts.ClientId = Profiles.id
   where Jobs.paymentDate between '${start}' and '${end}' 
   group by Profiles.id
   order by sum(price) desc
   limit ${limit}`;
  
  const [ bestClients ] = await sequelize.query(getBestClientSQL, { raw: true });
  return bestClients;
}

// defer execution if last invocation was more recent than period ago
const throttle = (func, period) => {
  let lastCallTs;
  return (...args) => {
    console.log('Time since last call: ', Date.now()-lastCallTs);
    if (!lastCallTs || (Date.now()-lastCallTs) > period) {
      lastCallTs = Date.now();
      return func(...args);
    }
    return new Promise((resolve, reject) => {
      const timeToInvocation = lastCallTs + period - Date.now();
      console.log('Time to next invocation: ', timeToInvocation);
      setTimeout(() => {
        func(...args)
          .then(result => resolve(result))
          .catch(error => reject(error))
          .finally(() => {
            lastCallTs = Date.now();
          })
      }, timeToInvocation);
    });
  }
}

const datesIntervalMiddleware = (req, res, next) => {
  const { start, end } = req.query;
  if (!Date.parse(start) || !Date.parse(end)) {
    return res.status(400).send('Wrong date format');
  }

  // make sure params have date format to avoid SQL injections
  req.dateStart = getFormattedDate(new Date(start));
  req.dateEnd = getFormattedDate(new Date(end));

  next();
}

const THROTTLE_INTERVAL_MS = 1000; // there would be no more than one aggregation query per this interval
const throttledBestProfesionQuery = throttle(getBestProfession, THROTTLE_INTERVAL_MS);
const throttledBestClientsQuery = throttle(getBestClients, THROTTLE_INTERVAL_MS);

router.get('/admin/best-profession', datesIntervalMiddleware, async (req, res, next) => {
  const { dateStart, dateEnd } = req;
  console.log({ dateStart, dateEnd });

  const sequelize = req.app.get('sequelize');
  // deferring query to DB cause aggregation queries could be heavy
  const profession = await throttledBestProfesionQuery(sequelize, dateStart, dateEnd);
  res.status(200).json({ profession });

});

router.get('/admin/best-clients', datesIntervalMiddleware, async (req, res, next) => {
  const { dateStart, dateEnd } = req;
  console.log({ dateStart, dateEnd });

  const sequelize = req.app.get('sequelize');
  // deferring query to DB cause aggregation queries could be heavy
  const bestClients = await throttledBestClientsQuery(sequelize, dateStart, dateEnd, req.query.limit);
  res.status(200).json({ bestClients });
});

module.exports = router
