const request = require("supertest");
const app = require("../../app.js");
const { seed } = require('../../../scripts/seedDb');
const { Profile } = require('../../model');
const { HTTP_STATUS_CODES, stripTimestamps } = require('../../common');


const checkBalance = async (profileId, balance) => {
  const profile = await Profile.findOne({
    where: {
      id: profileId
    }
  })

  expect(profile.balance).toEqual(balance);
}


describe('Topup client`s balance', () => {
  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should topup balance', async () => {
    const profileId = 1;
    const response = await request(app)
      .post(`/balances/deposit/${profileId}`)
      .set('Content-Type', 'application/json')
      .send({ amount: 10 })
      .expect(HTTP_STATUS_CODES.CREATED);
    await checkBalance(profileId, 1160);
  })

  it('should not topup balance if profile is not client', async () => {
    const profileId = 8;
    const response = await request(app)
      .post(`/balances/deposit/${profileId}`)
      .set('Content-Type', 'application/json')
      .send({ amount: 10 })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);
    await checkBalance(profileId, 314);
  })

  it('should not topup balance if amount exceeds 25% from total contracts to pay', async () => {
    const profileId = 1;
    const response = await request(app)
      .post(`/balances/deposit/${profileId}`)
      .set('Content-Type', 'application/json')
      .send({ amount: 51 })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);
    await checkBalance(profileId, 1150);
  })


});
