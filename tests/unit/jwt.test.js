const jsonwebtoken = require('jsonwebtoken');
const { generateJWT, verifyJWT } = require('../../src/jwt');

jest.mock('jsonwebtoken');

describe('JWT Utility Functions', () => {
  describe('generateJWT', () => {
    it('should generate a JWT token successfully', async () => {
      const payload = { id: 1, name: 'Test User' };
      const mockToken = 'mocked.jwt.token';

      jsonwebtoken.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const token = await generateJWT(payload);

      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        expect.any(Function)
      );
      expect(token).toBe(mockToken);
    });

    it('should reject with an error if token generation fails', async () => {
      const payload = { id: 1, name: 'Test User' };
      const mockError = new Error('Token generation failed');

      jsonwebtoken.sign.mockImplementation((payload, secret, options, callback) => {
        callback(mockError, null);
      });

      await expect(generateJWT(payload)).rejects.toThrow('Token generation failed');
    });
  });

  describe('verifyJWT', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {
        status: jest.fn(() => res),
        send: jest.fn(),
      };
      next = jest.fn();
    });

    it('should verify a valid JWT token and call next()', async () => {
      const mockToken = 'valid.jwt.token';
      const decodedToken = { id: 1, name: 'Test User' };

      req.headers['authorization'] = mockToken;

      jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
        callback(null, decodedToken);
      });

      await verifyJWT(req, res, next);

      expect(jsonwebtoken.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.JWT_SECRET,
        expect.any(Function)
      );
      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no authorization token is provided', async () => {
      await verifyJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ Message: 'authorization token not provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if the token is invalid or expired', async () => {
      const mockToken = 'invalid.jwt.token';
      const mockError = new Error('Invalid token');

      req.headers['authorization'] = mockToken;

      jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
        callback(mockError, null);
      });

      await verifyJWT(req, res, next);

      expect(jsonwebtoken.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.JWT_SECRET,
        expect.any(Function
      ));
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ Message: 'Invalid or expired token.' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
