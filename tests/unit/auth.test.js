const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { authRouter } = require('../../src/routes/auth');
const { insertOne, find } = require('../../src/dbManager');
const { generateJWT } = require('../../src/jwt');

jest.mock('../../src/dbManager');
jest.mock('bcryptjs');
jest.mock('../../src/jwt');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('authRouter', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      find.mockResolvedValue([]); // No existing user
      bcrypt.hash.mockResolvedValue('hashedPassword');
      insertOne.mockResolvedValue();

      const response = await request(app).post('/auth/register').send(mockUser);

      expect(find).toHaveBeenCalledWith('users', { email: mockUser.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 8);
      expect(insertOne).toHaveBeenCalledWith('users', {
        email: mockUser.email,
        password: 'hashedPassword',
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        Message: `The new user with email ${mockUser.email} was successfully registered`,
      });
    });

    it('should return 409 if the user already exists', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      find.mockResolvedValue([{ email: mockUser.email }]); // User already exists

      const response = await request(app).post('/auth/register').send(mockUser);

      expect(find).toHaveBeenCalledWith('users', { email: mockUser.email });
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        Message: `The user with email ${mockUser.email} already exists`,
      });
    });

    it('should return 500 on internal server error', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/register').send(mockUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        Error: 'An internal error occurred, please try again later',
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user successfully and return a token', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      const mockDbRecord = { email: mockUser.email, password: 'hashedPassword', id: 1 };
      find.mockResolvedValue([mockDbRecord]);
      bcrypt.compare.mockResolvedValue(true);
      generateJWT.mockResolvedValue('mockedToken');

      const response = await request(app).post('/auth/login').send(mockUser);

      expect(find).toHaveBeenCalledWith('users', { email: mockUser.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUser.password, mockDbRecord.password);
      expect(generateJWT).toHaveBeenCalledWith({ email: mockDbRecord.email, id: mockDbRecord.id });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ authToken: 'mockedToken' });
    });

    it('should return a 500 error', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      const mockDbRecord = { email: mockUser.email, password: 'hashedPassword', id: 1 };
      find.mockResolvedValue([mockDbRecord]);
      bcrypt.compare.mockResolvedValue(true);
      generateJWT.mockRejectedValue(new Error('JWT error')); // Simulate JWT generation error

      const response = await request(app).post('/auth/login').send(mockUser);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ Error: "An internal error occurred, please try again later" });
    });

    it('should return 401 if the user does not exist', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      find.mockResolvedValue([]); // No user found

      const response = await request(app).post('/auth/login').send(mockUser);

      expect(find).toHaveBeenCalledWith('users', { email: mockUser.email });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ Error: 'Invalid username or password.' });
    });

    it('should return 401 if the password is incorrect', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      const mockDbRecord = { email: mockUser.email, password: 'hashedPassword', id: 1 };
      find.mockResolvedValue([mockDbRecord]);
      bcrypt.compare.mockResolvedValue(false); // Password mismatch

      const response = await request(app).post('/auth/login').send(mockUser);

      expect(bcrypt.compare).toHaveBeenCalledWith(mockUser.password, mockDbRecord.password);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ Error: 'Invalid username or password.' });
    });

    it('should return 500 on internal server error during login', async () => {
      const mockUser = { email: 'test@example.com', password: 'Password1!' };
      find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/login').send(mockUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        Error: 'An internal error occurred, please try again later',
      });
    });
  });
});
