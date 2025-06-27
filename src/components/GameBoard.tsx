import React from 'react';
import { Question } from '../types/game';
import { playClick } from '../utils/sounds';
import { Image as ImageIcon } from 'lucide-react';

interface GameBoardProps {
  questions: Question[];
  categories: string[];
  onQuestionSelect: (question: Question) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ questions, categories, onQuestionSelect }) => {
  const maxPointValue = Math.max(...questions.map(q => q.points));
  const numRows = maxPointValue / 200;
  const pointValues = Array.from({ length: numRows }, (_, i) => (i + 1) * 200);

  const questionsByGrid = categories.reduce((acc, category) => {
    acc[category] = {};
    pointValues.forEach(points => {
      acc[category][points] = questions.find(
        q => q.category === category && q.points === points
      );
    });
    return acc;
  }, {} as Record<string, Record<number, Question | undefined>>);

  const gridCols = categories.length;

  return (
    <div className="w-full max-w-7xl p-4">
      <div 
        className="grid gap-6"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-[#132F5F] text-[#EDF2EF] p-4 h-24 flex items-center justify-center text-center font-bold rounded-xl shadow-lg"
            style={{
              border: '2px solid #1A365D',
              boxShadow: '0 0 0 2px #A3333D'
            }}
          >
            <div className="relative z-10 text-xl">
              {category}
            </div>
          </div>
        ))}

        {pointValues.map(points => (
          categories.map(category => {
            const question = questionsByGrid[category][points];
            return (
              <button
                key={`${category}-${points}`}
                className={`relative overflow-hidden ${
                  question?.isAnswered
                    ? 'bg-[#132F5F]/50 opacity-50'
                    : question
                    ? 'bg-[#132F5F] hover:bg-[#1A365D] hover:border-[#FFB411] active:bg-[#0A1F3F]'
                    : ''
                } text-[#EDF2EF] p-4 h-24 flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg transition-all duration-200 border-2 ${
                  question && !question.isAnswered ? 'border-[#FFB411]/30' : 'border-[#1A365D]'
                }`}
                onClick={() => {
                  if (question && !question.isAnswered) {
                    playClick();
                    onQuestionSelect(question);
                  }
                }}
                disabled={!question || question.isAnswered}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-[#FFB411]">${points}</span>
                  {question?.imageUrl && (
                    <ImageIcon size={16} className="text-[#FFB411] opacity-75" />
                  )}
                </div>
                {!question?.isAnswered && question && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A1F3F]/30" />
                )}
              </button>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
