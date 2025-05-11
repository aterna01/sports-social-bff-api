const request = require('supertest');
const express = require('express');
const { eventRouter } = require('../../src/routes/event');
const { insertOne, find, replaceOne } = require('../../src/dbManager');
const { verifyJWT } = require('../../src/jwt');

jest.mock('../../src/dbManager');
jest.mock('../../src/jwt');

const app = express();
app.use(express.json());
app.use('/event', eventRouter);

describe('eventRouter', () => {
  beforeAll(() => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate('2025-05-10T12:00:00Z');
        }
        return new RealDate(...args);
      }
    };
  });

  afterAll(() => {
    global.Date = Date; // Restore the original Date constructor
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /event/create', () => {
    it('should create a new event successfully', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });
      find.mockResolvedValue([]); // No existing event
      insertOne.mockResolvedValue();

      const eventData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
        description: 'Friendly match',
      };

      const response = await request(app).post('/event/create').send(eventData);

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(insertOne).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        Message: `The new event with title ${eventData.title} was successfully created`,
      });
    });

    it('should return 404 if the event already exists', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });
      find.mockResolvedValue([{ title: 'Football Match' }]); // Event already exists

      const eventData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
        description: 'Friendly match',
      };

      const response = await request(app).post('/event/create').send(eventData);

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ Error: 'This event already exists' });
    });

    it('should return 500 on internal server error', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });
      find.mockRejectedValue(new Error('Database error'));

      const eventData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
        description: 'Friendly match',
      };

      const response = await request(app).post('/event/create').send(eventData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        Error: 'An internal error occurred, please try again later',
      });
    });
  });

  describe('POST /event/participate', () => {
    it('should add the user as a participant successfully', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });

      const mockEvent = {
        title: 'Football Match',
        participants: [],
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
      };

      find.mockResolvedValue([mockEvent]);
      replaceOne.mockResolvedValue();

      const participationData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
      };

      const response = await request(app).post('/event/participate').send(participationData);

      expect(replaceOne).toHaveBeenCalledWith('events', expect.any(Object), expect.objectContaining({
        participants: ['test@example.com']
      }));
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        Message: 'The new participant test@example.com registered for the event Football Match',
      });
    });

    it('should return 404 if the event is in the past', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });

      const mockEvent = {
        title: 'Old Event',
        participants: [],
        date: '2020-01-01', // Past date
        time: '10:00',
        location: 'Stadium',
        postCode: '12345',
      };

      find.mockResolvedValue([mockEvent]);

      const participationData = {
        title: 'Old Event',
        sportType: 'football',
        date: '2020-01-01',
        time: '10:00',
        location: 'Stadium',
        postCode: '12345',
      };

      const response = await request(app).post('/event/participate').send(participationData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        Error: 'The event is in the past so no participation is allowed',
      });
    });

    it('should return 404 if the event does not exist', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });
      find.mockResolvedValue([]); // Event not found

      const participationData = {
        title: 'Nonexistent Event',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
      };

      const response = await request(app).post('/event/participate').send(participationData);

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        Error: `The event with provided title Nonexistent Event does not exist`,
      });
    });

    it('should return 404 if the user is already a participant', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });
      const mockEvent = {
        title: 'Football Match',
        participants: ['test@example.com'],
        date: '2025-05-15',
      };
      find.mockResolvedValue([mockEvent]);

      const participationData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
      };

      const response = await request(app).post('/event/participate').send(participationData);

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        Error: 'The user is already registered as partipant for this event',
      });
    });

    it('should return 500 error when Mongodb fails', async () => {
      verifyJWT.mockImplementation((req, res, next) => {
        req.user = { email: 'test@example.com' };
        next();
      });

      find.mockRejectedValue(new Error('Database error'));

      const participationData = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-15',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
      };

      const response = await request(app).post('/event/participate').send(participationData);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        Error: 'An internal error occurred, please try again later',
      });
    });
  });

  describe('GET /event/get', () => {
    it('should return a list of events', async () => {
      const mockEvents = [
        { title: 'Football Match', sportType: 'football', location: 'Stadium' },
      ];
      find.mockResolvedValue(mockEvents);

      const response = await request(app).get('/event/get').query({ sportType: 'football' });

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ Events: mockEvents });
    });

    it('should handle query parameters correctly', async () => {
      const mockEvents = [
        { title: 'Basketball Game', sportType: 'basketball', location: 'Court' },
      ];
      find.mockResolvedValue(mockEvents);

      const response = await request(app).get('/event/get').query({ sportType: 'basketball', postCodeMajor: '123' });

      expect(find).toHaveBeenCalledWith('events', expect.any(Object));
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ Events: mockEvents });
    });
  });
});
