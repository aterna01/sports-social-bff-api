const {
  validateUser,
  validateNewEvent,
  validateEventParticipation,
  validateGetEvent,
} = require('../../src/schema');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  describe('validateUser', () => {
    it('should call next() for valid user data', () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password1!',
      };

      validateUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid user data', () => {
      req.body = {
        email: 'invalid-email',
        password: 'short',
      };

      validateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ Error: expect.any(Array) }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateNewEvent', () => {
    it('should call next() for valid event data', () => {
      req.body = {
        title: 'Football Match',
        sportType: 'football',
        date: '2025-05-11',
        time: '15:00',
        location: 'Stadium',
        postCode: '12345',
        description: 'Friendly match',
      };

      validateNewEvent(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid event data', () => {
      req.body = {
        title: '',
        sportType: 'invalid-sport',
        date: '',
        time: '',
        location: '',
        postCode: '',
      };

      validateNewEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ Error: expect.any(Array) }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateEventParticipation', () => {
    it('should call next() for valid participation data', () => {
      req.body = {
        title: 'Basketball Game',
        sportType: 'basketball',
        date: '2025-05-12',
        time: '18:00',
        location: 'Court',
        postCode: '54321',
      };

      validateEventParticipation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid participation data', () => {
      req.body = {
        title: '',
        sportType: 'invalid-sport',
        date: '',
        time: '',
        location: '',
        postCode: '',
      };

      validateEventParticipation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ Error: expect.any(Array) }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateGetEvent', () => {
    it('should call next() for valid query parameters', () => {
      req.query = {
        sportType: 'football',
        postCodeMajor: '123',
      };

      validateGetEvent(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid query parameters', () => {
      req.query = {
        sportType: 'invalid-sport',
        postCodeMajor: '',
      };

      validateGetEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ Error: expect.any(Array) }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
