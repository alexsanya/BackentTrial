const request = require("supertest");
const app = require("../../app.js");
const { seed } = require('../../../scripts/seedDb');
const { Profile, Job } = require('../../model');
const { HTTP_STATUS_CODES, stripTimestamps } = require('../../common');

const checkState = async ({ profileId, jobId, contractorId, clientBalance, contractorBalance, isPayed }) => {
  const profile = await Profile.findOne({
    where: {
      id: profileId
    }
  })
  const job = await Job.findOne({
    where: {
      id: jobId
    }
  })
  const contractor = await Profile.findOne({
    where: {
      id: contractorId
    }
  })

  expect(profile.balance).toEqual(clientBalance);
  expect(job.paid).toEqual(isPayed || null);
  expect(contractor.balance).toEqual(contractorBalance);
}

describe('Get unpaid jobs', () => {
  beforeEach(async () => {
    await seed(); //reset database before each test
    console.log('Database been reset');
  });

  it('should return all unpaid jobs for profile', async () => {
    const profileId = 2;
    const response = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', profileId)
      .expect('Content-Type', /json/)
      .expect(HTTP_STATUS_CODES.OK);
    expect(response.body.map(stripTimestamps)).toMatchSnapshot();
  });


  it('should update balances of client, contractor and job status', async () => {
    const profileId = 1;
    const jobId = 2;
    const contractorId = 6;

    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', profileId)
      .expect(HTTP_STATUS_CODES.CREATED);

    await checkState({
      profileId,
      jobId,
      contractorId,
      clientBalance: 949,
      contractorBalance: 1415,
      isPayed: true
    });
  });

  it('should not let to pay if profile type is not a client', async () => {
    const profileId = 5;
    const jobId = 2;
    const contractorId = 6;

    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', profileId)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);

    await checkState({
      profileId,
      jobId,
      contractorId,
      clientBalance: 64,
      contractorBalance: 1214,
      isPayed: false
    });

  });

  it('should not let to pay if job is payed already', async () => {
    const profileId = 4;
    const jobId = 6;
    const contractorId = 7;

    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', profileId)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);

    await checkState({
      profileId,
      jobId,
      contractorId,
      clientBalance: 1.3,
      contractorBalance: 22,
      isPayed: true
    });

  });

  it('should not let to pay if clients balance is insufficient', async () => {
    const profileId = 4;
    const jobId = 5;
    const contractorId = 7;

    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', profileId)
      .expect(HTTP_STATUS_CODES.CONFLICT);

    await checkState({
      profileId,
      jobId,
      contractorId,
      clientBalance: 1.3,
      contractorBalance: 22,
      isPayed: false
    });

  });

  it('should not let to pay if contract doesnt belongs to client', async () => {
    const profileId = 2;
    const jobId = 2;
    const contractorId = 6;

    await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set('profile_id', profileId)
      .expect(HTTP_STATUS_CODES.BAD_REQUEST);

    await checkState({
      profileId,
      jobId,
      contractorId,
      clientBalance: 231.11,
      contractorBalance: 1214,
      isPayed: false
    });

  })
});
