import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Question } from '../types/game';

interface FileUploadProps {
  onQuestionsLoad: (questions: Question[]) => void;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ValidationError {
  message: string;
  details?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onQuestionsLoad }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isNoneValue = (url: string): boolean => {
    return url.trim().toLowerCase() === 'none';
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;
    
    try {
      const urlObj = new URL(url);
      
      // Check for common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      // Check for common image hosting patterns
      const imageHostingPatterns = [
        /imgur\.com/,
        /\.cloudinary\.com/,
        /images\.unsplash\.com/,
        /\.googleusercontent\.com/,
        /\.amazonaws\.com.*\.(jpg|jpeg|png|gif|webp|bmp|svg)/i,
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)\?/i, // URLs with query parameters
      ];
      
      const matchesHostingPattern = imageHostingPatterns.some(pattern => 
        pattern.test(url)
      );

      // Check for data URLs
      const isDataUrl = url.startsWith('data:image/');

      return hasImageExtension || matchesHostingPattern || isDataUrl;
    } catch {
      return false; // Invalid URL format
    }
  };

  const tryImageHeadRequest = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // This allows the request but limits what we can check
      });
      return true;
    } catch {
      // If HEAD request fails, we'll fall back to the URL pattern validation
      return false;
    }
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;
    
    // First check if it's a valid URL format with image patterns
    if (!isValidImageUrl(url)) {
      return false;
    }

    try {
      // Try HEAD request as a secondary validation
      // But don't fail if it doesn't work (due to CORS)
      await tryImageHeadRequest(url);
      return true;
    } catch {
      // If the HEAD request fails, still return true if the URL pattern was valid
      return isValidImageUrl(url);
    }
  };

  const validateCSV = async (lines: string[]): Promise<ValidationError | null> => {
    if (lines.length < 2) {
      return { message: 'CSV file must contain at least a header row and one set of questions.' };
    }

    const categories = lines[0].split(',').map(cat => cat.trim()).filter(Boolean);
    if (categories.length === 0) {
      return { message: 'No valid categories found in the header row.' };
    }

    // Filter out empty lines before checking the structure
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const dataRows = nonEmptyLines.slice(1);

    // Check if we have complete sets of three rows (question, answer, image)
    if (dataRows.length % 3 !== 0) {
      return {
        message: 'Invalid CSV format.',
        details: [
          'Each question must have three rows:',
          '1. Question text',
          '2. Answer text',
          '3. Include an Image URL or type the word "none" in the cell'
        ]
      };
    }

    const errors: string[] = [];

    // Validate each row has the correct number of columns
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim());
      if (row.length !== categories.length) {
        errors.push(`Row ${i + 2} has ${row.length} columns, but should have ${categories.length} columns.`);
      }
    }

    // Validate image URLs (only if they're not empty or 'none')
    const imageRows = dataRows.filter((_, index) => index % 3 === 2);
    for (let i = 0; i < imageRows.length; i++) {
      const urls = imageRows[i].split(',').map(url => url.trim());
      for (let j = 0; j < urls.length; j++) {
        if (urls[j] && !isNoneValue(urls[j]) && !(await validateImageUrl(urls[j]))) {
          errors.push(`Invalid image URL in row ${(i * 3) + 4}, column ${j + 1}: ${urls[j]}`);
        }
      }
    }

    // Check for empty questions or answers (but not image URLs)
    const questionRows = dataRows.filter((_, index) => index % 3 === 0);
    const answerRows = dataRows.filter((_, index) => index % 3 === 1);
    
    questionRows.forEach((row, i) => {
      const cells = row.split(',').map(cell => cell.trim());
      cells.forEach((cell, j) => {
        if (!cell) {
          errors.push(`Empty question in row ${(i * 3) + 2}, column ${j + 1}`);
        }
      });
    });

    answerRows.forEach((row, i) => {
      const cells = row.split(',').map(cell => cell.trim());
      cells.forEach((cell, j) => {
        if (!cell) {
          errors.push(`Empty answer in row ${(i * 3) + 3}, column ${j + 1}`);
        }
      });
    });

    return errors.length > 0 
      ? { 
          message: 'Validation errors found in CSV file:',
          details: errors
        }
      : null;
  };

  const parseCSV = (text: string): Question[] => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const categories = lines[0].split(',').map(cat => cat.trim());
    const questions: Question[] = [];
    
    // Process sets of three lines (question, answer, image)
    for (let i = 1; i < lines.length; i += 3) {
      const questionRow = lines[i]?.split(',').map(q => q.trim());
      const answerRow = lines[i + 1]?.split(',').map(a => a.trim());
      const imageRow = lines[i + 2]?.split(',').map(img => img.trim());
      
      // Skip if we don't have complete question and answer rows
      if (!questionRow || !answerRow) break;

      const rowIndex = Math.floor((i - 1) / 3);
      const pointValue = (rowIndex + 1) * 200;

      categories.forEach((category, index) => {
        const question = questionRow[index];
        const answer = answerRow[index];
        const imageUrl = imageRow?.[index];

        if (question && answer) {
          questions.push({
            category,
            points: pointValue,
            question,
            answer,
            imageUrl: imageUrl && !isNoneValue(imageUrl) ? imageUrl : undefined,
            isAnswered: false,
          });
        }
      });
    }

    return questions;
  };

  const generatePreview = (text: string): PreviewData => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    const headers = lines[0].split(',').map(header => header.trim());
    const previewRows = lines
      .slice(1)
      .map(line => line.split(',').map(cell => cell.trim()));
    return { headers, rows: previewRows };
  };

  const processFile = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError({
        message: 'Invalid file type',
        details: ['Please upload a CSV file.']
      });
      return;
    }

    setError(null);
    setParsedQuestions(null);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const validationError = await validateCSV(lines);
      if (validationError) {
        setError(validationError);
        if (fileInput.current) {
          fileInput.current.value = '';
        }
        return;
      }

      const preview = generatePreview(text);
      setPreview(preview);
      
      const questions = parseCSV(text);
      if (questions.length > 0) {
        setParsedQuestions(questions);
      } else {
        setError({
          message: 'No valid questions found in the CSV file.',
          details: ['Please ensure the file follows the correct format.']
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setError({
        message: 'Multiple files detected',
        details: ['Please upload only one CSV file at a time.']
      });
      return;
    }

    const file = files[0];
    await processFile(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleConfirmLoad = () => {
    if (parsedQuestions) {
      onQuestionsLoad(parsedQuestions);
      setPreview(null);
      setParsedQuestions(null);
      setError(null);
    }
  };

  const handleCancelLoad = () => {
    setPreview(null);
    setParsedQuestions(null);
    setError(null);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-4xl w-full">
          <h3 className="font-semibold mb-2">{error.message}</h3>
          {error.details && (
            <ul className="list-disc list-inside space-y-1">
              {error.details.map((detail, index) => (
                <li key={index} className="text-sm">{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!preview ? (
        <div className="max-w-4xl w-full">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 cursor-pointer transition-all duration-200 ${
              isDragging 
                ? 'border-[#FFB411] bg-[#8499B1]/10' 
                : 'border-[#8499B1] hover:border-[#FFB411]'
            }`}
            onClick={() => fileInput.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-[#8499B1]/10 rounded-lg flex items-center justify-center">
                <div className="text-2xl font-semibold text-[#FFB411]">
                  Drop your CSV file here
                </div>
              </div>
            )}
            
            <Upload className="mx-auto h-16 w-16 text-[#8499B1] mb-6" />
            <h2 className="text-2xl font-semibold mb-6 text-center text-[#EDF2EF]">
              Drop your CSV file here or click to browse
            </h2>
            
            <div className="max-w-2xl mx-auto bg-[#8499B1]/10 p-8 rounded-lg">
              <h3 className="text-xl font-medium text-[#EDF2EF] mb-4 text-left">CSV Format Instructions:</h3>
              <ul className="space-y-4 text-lg text-[#EDF2EF] text-left">
                <li className="flex items-start">
                  <span className="font-medium mr-2">Row 1:</span> Category names (any number of columns)
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Following rows:</span> Must be in sets of three:
                </li>
                <li className="ml-8 text-base">1. Question text for each category</li>
                <li className="ml-8 text-base">2. Answer text for each category</li>
                <li className="ml-8 text-base">3. Include an Image URL or type the word "none" in the cell</li>
              </ul>
            </div>
            
            <input
              type="file"
              ref={fileInput}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="bg-[#8499B1] rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-[#EDF2EF]">Preview</h3>
            <button
              onClick={handleCancelLoad}
              className="text-[#EDF2EF] hover:text-[#1A365D] p-2"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-[#1A365D]">
              <thead className="sticky top-0 bg-[#1A365D]">
                <tr>
                  {preview.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-base font-semibold text-[#EDF2EF] uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#8499B1] divide-y divide-[#1A365D]">
                {preview.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 3 === 0 ? 'bg-[#1A365D]/20' : rowIndex % 3 === 1 ? 'bg-[#1A365D]/10' : 'bg-[#1A365D]/5'}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-base text-[#EDF2EF]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleCancelLoad}
              className="px-6 py-3 text-lg border border-[#EDF2EF] rounded-md text-[#EDF2EF] hover:bg-[#1A365D] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLoad}
              className="px-6 py-3 text-lg bg-[#1A365D] text-[#EDF2EF] rounded-md hover:bg-[#FFB411] hover:text-[#1A365D] transition-colors"
            >
              Load Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
