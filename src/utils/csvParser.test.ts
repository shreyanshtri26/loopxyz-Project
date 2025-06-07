import { parseCSV, fetchCSV } from './csvParser';
import { DataRow } from '../types';

describe('CSV Parser', () => {
  it('should parse CSV string into data rows', () => {
    const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,0,2,0\n24,0,0,4,0';
    
    const expected: DataRow[] = [
      { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 },
      { number: 24, mod3: 0, mod4: 0, mod5: 4, mod6: 0 }
    ];
    
    const result = parseCSV(csvString);
    
    expect(result).toEqual(expected);
  });
  
  it('should handle empty CSV string', () => {
    const csvString = '';
    
    const result = parseCSV(csvString);
    
    expect(result).toEqual([]);
  });
  
  it('should handle CSV with only headers', () => {
    const csvString = 'number,mod3,mod4,mod5,mod6';
    
    const result = parseCSV(csvString);
    
    expect(result).toEqual([]);
  });
  
  it('should convert string values to numbers', () => {
    const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,0,2,0';
    
    const result = parseCSV(csvString);
    
    expect(typeof result[0].number).toBe('number');
    expect(typeof result[0].mod3).toBe('number');
    expect(typeof result[0].mod4).toBe('number');
    expect(typeof result[0].mod5).toBe('number');
    expect(typeof result[0].mod6).toBe('number');
  });

  it('should handle whitespace in CSV string', () => {
    const csvString = ' number , mod3 , mod4 , mod5 , mod6 \n 12 , 0 , 0 , 2 , 0 ';
    
    const expected: DataRow[] = [
      { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 }
    ];
    
    const result = parseCSV(csvString);
    
    expect(result).toEqual(expected);
  });

  it('should handle missing values in CSV string', () => {
    const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,,2,0';
    
    const result = parseCSV(csvString);
    
    expect(result[0].mod4).toBe(0);
  });

  it('should handle special characters in CSV string', () => {
    const csvString = 'number,mod3,mod4,mod5,mod6\n12,0,0,2,0\n"24","0","0","4","0"';
    
    const expected: DataRow[] = [
      { number: 12, mod3: 0, mod4: 0, mod5: 2, mod6: 0 },
      { number: 24, mod3: 0, mod4: 0, mod5: 4, mod6: 0 }
    ];
    
    const result = parseCSV(csvString);
    
    expect(result).toEqual(expected);
  });

  it('should handle large dataset', () => {
    const rows = 1000;
    let csvString = 'number,mod3,mod4,mod5,mod6\n';
    
    for (let i = 1; i <= rows; i++) {
      csvString += `${i},${i % 3},${i % 4},${i % 5},${i % 6}\n`;
    }
    
    const result = parseCSV(csvString);
    
    expect(result.length).toBe(rows);
    expect(result[0].number).toBe(1);
    expect(result[rows - 1].number).toBe(rows);
  });

  describe('fetchCSV', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve('number,mod3,mod4,mod5,mod6\n12,0,0,2,0')
        })
      ) as jest.Mock;
    });

    it('should fetch and parse CSV file', async () => {
      const result = await fetchCSV('/data/dataset.csv');
      
      expect(result.length).toBe(1);
      expect(result[0].number).toBe(12);
      expect(global.fetch).toHaveBeenCalledWith('/data/dataset.csv');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Failed to fetch'))
      );
      
      const result = await fetchCSV('/data/dataset.csv');
      
      expect(result).toEqual([]);
    });
  });
}); 