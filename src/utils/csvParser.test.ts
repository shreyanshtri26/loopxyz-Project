import { parseCSV, fetchCSV } from './csvParser';
import { DataRow } from '../types';

// Mock fetch for testing fetchCSV
global.fetch = jest.fn();

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('should parse CSV string into an array of data objects', () => {
      const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,0,2,0\n24,0,0,4,0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 },
        { number: 24, mod3: 0, mod4: 0, mod5: 4, mod6: 0 }
      ]);
    });

    it('should handle empty CSV', () => {
      const csvString = 'number,mod3,mod4,mod5,mod6\n';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([]);
    });

    it('should handle CSV with single row', () => {
      const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,0,2,0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 }
      ]);
    });

    it('should convert all values to numbers', () => {
      const csvString = 'number,mod3,mod4\n12.5,1.5,2.25';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12.5, mod3: 1.5, mod4: 2.25 }
      ]);
      
      // Check types
      expect(typeof result[0].number).toBe('number');
      expect(typeof result[0].mod3).toBe('number');
      expect(typeof result[0].mod4).toBe('number');
    });
    
    it('should handle CSV with spaces', () => {
      const csvString = 'number, mod3, mod4\n 12, 0, 0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, ' mod3': 0, ' mod4': 0 }
      ]);
    });
    
    it('should handle CSV with quoted values', () => {
      const csvString = 'number,mod3,mod4\n"12","0","0"';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: 0 }
      ]);
    });
    
    it('should handle CSV with empty values', () => {
      const csvString = 'number,mod3,mod4\n12,,0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: NaN, mod4: 0 }
      ]);
      
      // Check types - empty value should be NaN
      expect(isNaN(result[0].mod3)).toBe(true);
    });
    
    it('should handle CSV with non-numeric values', () => {
      const csvString = 'number,mod3,mod4\n12,abc,0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: NaN, mod4: 0 }
      ]);
      
      // Check types - non-numeric value should be NaN
      expect(isNaN(result[0].mod3)).toBe(true);
    });
    
    it('should handle CSV with mixed line endings (CRLF, LF)', () => {
      const csvString = 'number,mod3,mod4\r\n12,0,0\n24,0,0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: 0 },
        { number: 24, mod3: 0, mod4: 0 }
      ]);
    });
    
    it('should handle CSV with negative numbers', () => {
      const csvString = 'number,mod3,mod4\n-12,-3,-4';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: -12, mod3: -3, mod4: -4 }
      ]);
    });
    
    it('should handle CSV with exponential notation', () => {
      const csvString = 'number,mod3,mod4\n1e2,3e-1,4e+0';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 100, mod3: 0.3, mod4: 4 }
      ]);
    });
    
    it('should handle CSV with varying number of columns', () => {
      const csvString = 'number,mod3,mod4\n12,0\n24,0,0,extra';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: undefined },
        { number: 24, mod3: 0, mod4: 0 }
      ]);
    });
    
    it('should trim whitespace from values but preserve headers as-is', () => {
      const csvString = ' number , mod3 ,mod4\n 12 , 0 , 0 ';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { ' number ': 12, ' mod3 ': 0, 'mod4': 0 }
      ]);
    });
    
    it('should handle CSV with very large numbers', () => {
      const csvString = 'number,mod3,mod4\n9007199254740991,9007199254740991,9007199254740991';
      const result = parseCSV(csvString);
      
      expect(result).toEqual([
        { number: 9007199254740991, mod3: 9007199254740991, mod4: 9007199254740991 }
      ]);
    });
  });

  describe('fetchCSV', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch and parse CSV file', async () => {
      const mockCsvText = 'number,mod3,mod4\n12,0,0\n24,0,0';
      const mockResponse = { text: jest.fn().mockResolvedValue(mockCsvText) };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchCSV('/data/test.csv');
      
      expect(fetch).toHaveBeenCalledWith('/data/test.csv');
      expect(result).toEqual([
        { number: 12, mod3: 0, mod4: 0 },
        { number: 24, mod3: 0, mod4: 0 }
      ]);
    });

    it('should return empty array on fetch error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await fetchCSV('/data/test.csv');
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching CSV:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle different file paths', async () => {
      const mockCsvText = 'number,mod3,mod4\n12,0,0';
      const mockResponse = { text: jest.fn().mockResolvedValue(mockCsvText) };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Test with different file path
      await fetchCSV('/different/path.csv');
      expect(fetch).toHaveBeenCalledWith('/different/path.csv');
      
      // Test with relative path
      await fetchCSV('./relative/path.csv');
      expect(fetch).toHaveBeenCalledWith('./relative/path.csv');
      
      // Test with absolute URL
      await fetchCSV('https://example.com/data.csv');
      expect(fetch).toHaveBeenCalledWith('https://example.com/data.csv');
    });
    
    it('should handle response with no content', async () => {
      const mockResponse = { text: jest.fn().mockResolvedValue('') };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await fetchCSV('/data/test.csv');
      
      expect(result).toEqual([]);
      
      consoleSpy.mockRestore();
    });
    
    it('should handle malformed CSV data gracefully', async () => {
      const mockResponse = { text: jest.fn().mockResolvedValue('not,valid,csv\ndata,missing,column') };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await fetchCSV('/data/test.csv');
      
      // Should still return parsed data, even if it might not be what's expected
      expect(result.length).toBeGreaterThan(0);
      
      consoleSpy.mockRestore();
    });
    
    it('should handle CSV with only headers', async () => {
      const mockResponse = { text: jest.fn().mockResolvedValue('number,mod3,mod4') };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await fetchCSV('/data/test.csv');
      
      expect(result).toEqual([]);
    });
    
    it('should handle empty response correctly', async () => {
      const mockResponse = { text: jest.fn().mockResolvedValue('') };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await fetchCSV('/data/test.csv');
      
      expect(result).toEqual([]);
    });
  });
}); 