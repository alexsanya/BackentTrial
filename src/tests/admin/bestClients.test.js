const request = require("supertest");
const app = require("../../app.js");
const { seed } = require('../../../scripts/seedDb');
const { HTTP_STATUS_CODES, stripTimestamps } = require('../../common');

describe('Best clients', () => {
  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should provide best clients', async () => {
    const response = await request(app)
      .get(`/admin/best-clients?start=2019/08/09&end=2022/08/11&limit=10`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(response.body.bestClients.map(item => stripTimestamps(item))).toMatchSnapshot();
  })

  it('should limit output', async () => {
    const response = await request(app)
      .get(`/admin/best-clients?start=2019/08/09&end=2022/08/11&limit=3`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(response.body.bestClients.map(item => stripTimestamps(item))).toMatchSnapshot();
  })

  it(`should return ${HTTP_STATUS_CODES.BAD_REQUEST} if date format is wrong`, async () => {
    const response = await request(app)
      .get(`/admin/best-clients?start=2019/08/x9&end=2022/08/xx&limit=3`)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST)
  })


})
