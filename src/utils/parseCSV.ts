import { Question } from '../types/game';

const isNoneValue = (value: string): boolean => value.trim().toLowerCase() === 'none';

export const parseCSV = (text: string): Question[] => {
  const lines = text
    .split('\n')
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
