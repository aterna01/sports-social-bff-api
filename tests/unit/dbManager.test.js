const { MongoClient } = require('mongodb');
const dbManager = require("../../src/dbManager");

jest.mock('mongodb');

describe('dbManager', () => {
  const mockCollection = {
    insertMany: jest.fn(),
    insertOne: jest.fn(),
    replaceOne: jest.fn(),
    find: jest.fn(),
    drop: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn(() => mockCollection),
  };

  const mockClient = {
    connect: jest.fn(),
    db: jest.fn(() => mockDb),
    close: jest.fn(),
  };

  beforeEach(() => {
    MongoClient.mockImplementation(() => mockClient);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbManager.closeClient();
  });

  describe('insertMany', () => {
    it('should insert multiple documents into the collection', async () => {
      const documents = [{ name: 'doc1' }, { name: 'doc2' }];
      mockCollection.insertMany.mockResolvedValue({ insertedCount: 2 });

      const result = await dbManager.insertMany('testCollection', documents);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.insertMany).toHaveBeenCalledWith(documents);
      expect(result.insertedCount).toBe(2);
    });
  });

  describe('insertOne', () => {
    it('should insert a single document into the collection', async () => {
      const document = { name: 'doc1' };
      mockCollection.insertOne.mockResolvedValue({ insertedId: '12345' });

      const result = await dbManager.insertOne('testCollection', document);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(document);
      expect(result.insertedId).toBe('12345');
    });
  });

  describe('replaceOne', () => {
    it('should replace a document in the collection', async () => {
      const filter = { name: 'doc1' };
      const replacement = { name: 'doc2' };
      mockCollection.replaceOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await dbManager.replaceOne('testCollection', filter, replacement);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.replaceOne).toHaveBeenCalledWith(filter, replacement);
      expect(result.modifiedCount).toBe(1);
    });
  });

  describe('find', () => {
    it('should find documents in the collection when query is passed', async () => {
      const query = { name: 'doc1' };
      const mockDocuments = [{ name: 'doc1' }];
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocuments),
      });

      const result = await dbManager.find('testCollection', query);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.find).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockDocuments);
    });

    it('should find documents in the collection when query is not passed', async () => {
      const query = {}; // Default query
      const mockDocuments = [{ name: 'doc1' }];
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocuments),
      });

      const result = await dbManager.find('testCollection');

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.find).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('dropCollection', () => {
    it('should drop the collection', async () => {
      await dbManager.dropCollection('testCollection');

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.drop).toHaveBeenCalled();
    });
  });

  describe('closeClient', () => {
    it('should close the MongoDB client', async () => {
      await dbManager.closeClient();

      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});