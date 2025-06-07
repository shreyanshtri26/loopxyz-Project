import { DataRow } from '../types';

/**
 * Parses CSV string into an array of data rows
 * @param csv The CSV string to parse
 * @returns Array of data objects
 */
export const parseCSV = (csv: string): DataRow[] => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj: any, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

/**
 * Fetches and parses a CSV file
 * @param filePath Path to the CSV file
 * @returns Promise resolving to array of data objects
 */
export const fetchCSV = async (filePath: string): Promise<DataRow[]> => {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
  }
}; 