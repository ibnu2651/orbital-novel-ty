import AsyncStorage from "@react-native-async-storage/async-storage";
import * as storage from "../async_storage/storage";
import { getAvailability } from "../nlb_api/nlb";

jest.mock("../nlb_api/nlb", () => {
  return {
    getAvailability: jest.fn()
      .mockResolvedValue(["Library1", "Library2", "Library3"])
      .mockResolvedValueOnce(["Library2", "Library3"])
      .mockResolvedValueOnce(["Library3"])
  };
});

describe('addBook Function Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a book and update libraries', async () => {
    const mockBook = { isbn: 'ISBN 1', title: 'Test Book', author: 'Test Author', bid: 'BID1' };
    let mockBooks = [];
    let mockLibraries = [
      { name: 'Library1', location: 'Location1', books: [] },
      { name: 'Library2', location: 'Location2', books: [] },
    ];

    // Mock AsyncStorage getItem to return the existing data
    AsyncStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case '@books':
          return JSON.stringify(mockBooks);
        case '@libraries':
          return JSON.stringify(mockLibraries);
        default:
          return null;
      }
    });

    // Mock AsyncStorage setItem to store the data
    AsyncStorage.setItem.mockImplementation((key, value) => {
      switch (key) {
        case '@books':
          mockBooks = value;
          break;
        case '@libraries':
          mockLibraries = value;
          break;
        default:
          break;
      }
    });

    // Call the addBook function
    await storage.addBook(mockBook);

    // Check if the book was added to AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@books', mockBooks);

    // Check if the book was added to the corresponding library
    expect(getAvailability).toHaveBeenCalledWith(mockBook.isbn);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@libraries', mockLibraries);
  });
});

describe('addManyBooks Function Test', () => {

  it('should add multiple books and update libraries', async () => {
    const mockBooks = [
      { isbn: 'ISBN 1', title: 'Book 1', author: 'Author 1', bid: 'BID1' },
      { isbn: 'ISBN 2', title: 'Book 2', author: 'Author 2', bid: 'BID2' },
      { isbn: 'ISBN 3', title: 'Book 3', author: 'Author 3', bid: 'BID3' },
    ];

    let mockBooksStorage = JSON.stringify([]);
    let mockLibraries = JSON.stringify([
      { name: 'Library1', location: 'Location1', books: [] },
      { name: 'Library2', location: 'Location2', books: [] },
      { name: 'Library3', location: 'Location3', books: [] },
    ]);

    // Mock AsyncStorage getItem to return the existing data
    AsyncStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case '@books':
          return mockBooksStorage;
        case '@libraries':
          return mockLibraries;
        default:
          return null;
      }
    });

    // Mock AsyncStorage setItem to store the data
    AsyncStorage.setItem.mockImplementation((key, value) => {
      switch (key) {
        case '@books':
          mockBooksStorage = value;
          break;
        case '@libraries':
          mockLibraries = value;
          break;
        default:
          break;
      }
    });

    // Call the addManyBooks function
    await storage.addManyBooks(mockBooks);

    // Check if the books were added to AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@books', JSON.stringify([...mockBooks]));

    // Check if the books were added to the corresponding libraries
    expect(getAvailability).toHaveBeenCalledTimes(3);
    expect(JSON.parse(mockLibraries)[0].books).toHaveLength(2);
    expect(JSON.parse(mockLibraries)[1].books).toHaveLength(2);
    expect(JSON.parse(mockLibraries)[2].books).toHaveLength(3);
    
  });
});

describe('removeBook Function Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should remove a book and update libraries', async () => {
    const mockBook = { isbn: 'ISBN 1', title: 'Test Book', author: 'Test Author', bid: 'BID1' };
    let mockBooksStorage = JSON.stringify([mockBook]);
    let mockLibraries = JSON.stringify([
      { name: 'Library1', location: 'Location1', books: [mockBook] },
      { name: 'Library2', location: 'Location2', books: [] },
    ]);

    // Mock AsyncStorage getItem to return the existing data
    AsyncStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case '@books':
          return mockBooksStorage;
        case '@libraries':
          return mockLibraries;
        default:
          return null;
      }
    });

    // Mock AsyncStorage setItem to store the data
    AsyncStorage.setItem.mockImplementation((key, value) => {
      switch (key) {
        case '@books':
          mockBooksStorage = value;
          break;
        case '@libraries':
          mockLibraries = value;
          break;
        default:
          break;
      }
    });

    // Call the removeBook function
    await storage.removeBook(mockBook);

    // Check if the book was removed from AsyncStorage
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@books', JSON.stringify([]));

    // Check if the book was removed from the corresponding library
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@libraries', JSON.stringify([
      { name: 'Library1', location: 'Location1', books: [] },
      { name: 'Library2', location: 'Location2', books: [] },
    ]));
    expect(JSON.parse(mockBooksStorage)).toHaveLength(0);
    expect(JSON.parse(mockLibraries)[0].books).toHaveLength(0);
  });
});