const request = require("supertest");
const app = require("../../app.js");
const { seed } = require('../../../scripts/seedDb');
const { HTTP_STATUS_CODES, stripTimestamps } = require('../../common');

describe('Get contract by Id', () => {

  const getContract = (contractId, profileId) =>
    request(app)
      .get(`/contracts/${contractId}`)
      .set('profile_id', profileId)

  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should return contract by id if profile belongs to client', async () => {
    const contractId = 1;
    const profileId = 1;
    const response = await getContract(contractId, profileId)     
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(stripTimestamps(response.body)).toMatchSnapshot();
  });

  it('should return contract by id if profile belongs to contractor', async () => {
    const contractId = 1;
    const profileId = 5;
    const response = await getContract(contractId, profileId)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(stripTimestamps(response.body)).toMatchSnapshot();
  });


  it(`should return ${HTTP_STATUS_CODES.NOT_FOUND} if contract doesn't exists`, async () => {
    const contractId = 404;
    const profileId = 3;
    const response = await getContract(contractId, profileId)
      .expect(HTTP_STATUS_CODES.NOT_FOUND);
  });


  it(`should return ${HTTP_STATUS_CODES.BAD_REQUEST} if contractId is not a number`, async () => {
    const contractId = '1 or 1=1'; //SQL injection attempt
    const profileId = 3;
    const response = await getContract(contractId, profileId)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);
  });

  it(`should return ${HTTP_STATUS_CODES.FORBIDDEN} if contract doesn't belongs to caller's profile`, async () => {
    const contractId = 1;
    const profileId = 2;
    const response = await getContract(contractId, profileId)
      .expect(HTTP_STATUS_CODES.FORBIDDEN);
  });

});
