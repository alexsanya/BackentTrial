const isTestMode = process.env.NODE_ENV === 'test';

const logger = {
  log: (...args) => !isTestMode && console.log(...args),
  debug: (...args) => !isTestMode && console.log(...args),
  error: (...args) => console.error(...args)
}
module.exports = logger;
