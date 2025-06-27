import React, { useRef, useState } from 'react';
import { CircleCheck, Squircle, Upload } from 'lucide-react';
import { Question } from '../types/game';

interface FileUploadProps {
  onQuestionsLoad: (questions: Question[]) => void;
}

interface ValidationError {
  message: string;
  details?: string[];
}

interface UploadStatus {
  success: boolean;
  message: string;
  details?: string[];
  questionCount?: number;
  categoryCount?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onQuestionsLoad }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const isNoneValue = (url: string): boolean => {
    return url.trim().toLowerCase() === 'none';
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;
    
    try {
      const urlObj = new URL(url);
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      const imageHostingPatterns = [
        /imgur\.com/,
        /\.cloudinary\.com/,
        /images\.unsplash\.com/,
        /\.googleusercontent\.com/,
        /\.amazonaws\.com.*\.(jpg|jpeg|png|gif|webp|bmp|svg)/i,
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)\?/i,
      ];
      
      const matchesHostingPattern = imageHostingPatterns.some(pattern => 
        pattern.test(url)
      );

      const isDataUrl = url.startsWith('data:image/');

      return hasImageExtension || matchesHostingPattern || isDataUrl;
    } catch {
      return false;
    }
  };

  const tryImageHeadRequest = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;
    
    try {
      await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '' || isNoneValue(url)) return true;

    if (!isValidImageUrl(url)) {
      return false;
    }

    try {
      const result = await tryImageHeadRequest(url);
      return result;
    } catch {
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

    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const dataRows = nonEmptyLines.slice(1);

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

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim());
      if (row.length !== categories.length) {
        errors.push(`Row ${i + 2} has ${row.length} columns, but should have ${categories.length} columns.`);
      }
    }

    const imageRows = dataRows.filter((_, index) => index % 3 === 2);
    for (let i = 0; i < imageRows.length; i++) {
      const urls = imageRows[i].split(',').map(url => url.trim());
      for (let j = 0; j < urls.length; j++) {
        if (urls[j] && !isNoneValue(urls[j]) && !(await validateImageUrl(urls[j]))) {
          errors.push(`Invalid image URL in row ${(i * 3) + 4}, column ${j + 1}: ${urls[j]}`);
        }
      }
    }

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
    
    for (let i = 1; i < lines.length; i += 3) {
      const questionRow = lines[i]?.split(',').map(q => q.trim());
      const answerRow = lines[i + 1]?.split(',').map(a => a.trim());
      const imageRow = lines[i + 2]?.split(',').map(img => img.trim());
      
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

  const processFile = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus({
        success: false,
        message: 'Invalid file type',
        details: ['Please upload a CSV file.']
      });
      return;
    }

    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const validationError = await validateCSV(lines);
      if (validationError) {
        setUploadStatus({
          success: false,
          message: validationError.message,
          details: validationError.details
        });
        if (fileInput.current) {
          fileInput.current.value = '';
        }
        return;
      }

      const questions = parseCSV(text);
      if (questions.length > 0) {
        const categories = Array.from(new Set(questions.map(q => q.category)));
        setUploadStatus({
          success: true,
          message: 'CSV file successfully uploaded!',
          questionCount: questions.length,
          categoryCount: categories.length
        });
        onQuestionsLoad(questions);
      } else {
        setUploadStatus({
          success: false,
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
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setUploadStatus({
        success: false,
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

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      {uploadStatus && (
        <div
          className={`mb-6 p-6 rounded-lg max-w-4xl w-full ${
            uploadStatus.success
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {uploadStatus.success ? (
              <CircleCheck className="h-6 w-6" />
            ) : (
              <Squircle className="h-6 w-6" />
            )}
            <h3 className="text-lg font-semibold">{uploadStatus.message}</h3>
          </div>
          
          {uploadStatus.success ? (
            <div className="mt-2 text-green-600">
              <p>Successfully loaded:</p>
              <ul className="list-disc list-inside mt-1">
                <li>{uploadStatus.categoryCount} categories</li>
                <li>{uploadStatus.questionCount} questions</li>
              </ul>
            </div>
          ) : (
            uploadStatus.details && (
              <ul className="list-disc list-inside space-y-1 mt-2">
                {uploadStatus.details.map((detail, index) => (
                  <li key={index} className="text-sm">{detail}</li>
                ))}
              </ul>
            )
          )}
        </div>
      )}

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
          {isDragging ? (
            <div className="absolute inset-0 bg-[#8499B1]/10 rounded-lg flex items-center justify-center">
              <div className="text-2xl font-semibold text-[#FFB411]">
                Drop your CSV file here
              </div>
            </div>
          ) : (
            <>
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
                <div className="mt-6 text-[#EDF2EF] text-base">
                  OR you can download the Game Template CSV file by clicking{' '}
                  <a 
                    href="/Jeopardy_Upload_Template.csv" 
                    download
                    className="text-[#FFB411] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    here
                  </a>
                </div>
              </div>
            </>
          )}
          
          <input
            type="file"
            ref={fileInput}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
