import { describe, it, expect } from 'vitest';
import { parseCSV } from '../parseCSV';

describe('parseCSV', () => {
  it('parses a CSV string into questions', () => {
    const csv = [
      'Math,Science',
      'What is 2+2?,What is H2O?',
      '4,Water',
      'none,none',
      'What is 3x3?,What planet is known as the Red Planet?',
      '9,Mars',
      'none,none'
    ].join('\n');

    const questions = parseCSV(csv);

    expect(questions).toHaveLength(4);
    expect(questions[0]).toEqual({
      category: 'Math',
      points: 200,
      question: 'What is 2+2?',
      answer: '4',
      imageUrl: undefined,
      isAnswered: false,
    });
    expect(questions[1].category).toBe('Science');
    expect(questions[2].points).toBe(400);
    expect(questions[3].category).toBe('Science');
  });
});
