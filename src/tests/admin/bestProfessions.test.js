const request = require("supertest");
const app = require("../../app.js");
const { seed } = require('../../../scripts/seedDb');
const { HTTP_STATUS_CODES } = require('../../common');

describe('Best professions', () => {
  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should provide best profession on short interval', async () => {
    const response = await request(app)
      .get(`/admin/best-profession?start=2020/08/09&end=2020/08/11`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(response.body.profession).toEqual('Musician');
  })

  it('should provide best profession on large interval', async () => {
    const response = await request(app)
      .get(`/admin/best-profession?start=2019/08/09&end=2021/08/11`)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK)
    expect(response.body.profession).toEqual('Programmer');
  })

  it(`should return ${HTTP_STATUS_CODES.BAD_REQUEST} if date format is wrong`, async () => {
    const response = await request(app)
      .get(`/admin/best-profession?start=2019/08/0x&end=2021/08/xx`)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST)
  })


})
