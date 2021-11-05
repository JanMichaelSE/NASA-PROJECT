const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');
const { loadLaunchesData } = require('../../models/launches.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  })

  describe('Test GET /launches', () => {
    test('It should respond with 200 success ', async () => {
      const response = await request(app).get('/launches').expect(200);
    });
  });
  
  describe('Test POST /launch', () => {
    const completeLaunchData = {
      mission: 'Test Mission',
      rocket: 'Test Rockect',
      destination: 'Kepler-442 b',
      launchDate: 'January 3,2021',
    };
  
    const launchDataWithoutDate = {
      mission: 'Test Mission',
      rocket: 'Test Rockect',
      destination: 'Kepler-442 b',
    };
  
    const launchDataWithInvalidDate = {
      mission: 'Test Mission',
      rocket: 'Test Rockect',
      destination: 'Kepler-442 b',
      launchDate: 'Invalid_Date',
    };
  
    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);
  
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
  
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
  
    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });
  
    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Invalid launch date provided',
      });
    });
  });
});

