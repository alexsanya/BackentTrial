
const _ = require('lodash');
const request = require("supertest");
const app = require("./app.js");
const { seed } = require('../scripts/seedDb');
const { HTTP_STATUS_CODES } = require('./constants');

describe('Get contracts by profile', () => {

  const getContracts = (profileId, query='') =>
    request(app)
      .get(`/contracts/${query}`)
      .set('profile_id', profileId)

  const stripTimestamps = item => _.omit(item, ['createdAt', 'updatedAt']);

  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should return contracts those belongs to clients profile', async () => {
    const profileId = 2;
    const response = await getContracts(profileId)     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK);
    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });

  it('should return contracts those belongs to contractors profile', async () => {
    const profileId = 8;
    const response = await getContracts(profileId)     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)

    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });

  it(`should return ${HTTP_STATUS_CODES.LENGTH_REQUIRED} if number of contracts exceeds treshold`, async () => {
    const profileId = 2;
    process.env.MAX_CONTRACTS_PER_REQUEST = 1;
    const response = await getContracts(profileId)     
      .expect(HTTP_STATUS_CODES.LENGTH_REQUIRED);
  });

  it('should cut contracts for clients profile if limit provided', async () => {
    const profileId = 2;
    process.env.MAX_CONTRACTS_PER_REQUEST = 1;
    const response = await getContracts(profileId, '?limit=1')     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)

    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });

  it('should cut contracts for contractors profile if limit provided', async () => {
    const profileId = 8;
    process.env.MAX_CONTRACTS_PER_REQUEST = 1;
    const response = await getContracts(profileId, '?limit=1')     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)

    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });

  it('should offset contracts for clients profile if offset provided', async () => {
    const profileId = 2;
    process.env.MAX_CONTRACTS_PER_REQUEST = 1;
    const response = await getContracts(profileId, '?limit=1&offset=1')     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)

    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });

  it('should offset contracts for contractors profile if offest provided', async () => {
    const profileId = 8;
    process.env.MAX_CONTRACTS_PER_REQUEST = 1;
    const response = await getContracts(profileId, '?limit=1&offset=1')     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    
    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  })




});
