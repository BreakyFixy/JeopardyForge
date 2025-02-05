import React, { useState } from 'react';
import { Question, Team } from '../types/game';
import { X, Check, X as XIcon } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  teams: Team[];
  onClose: () => void;
  onAnswered: () => void;
  onScoreChange: (teamId: string, change: number) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  teams,
  onClose,
  onAnswered,
  onScoreChange,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowScoring(true);
  };

  const handleScoring = (correct: boolean) => {
    if (selectedTeamId) {
      const pointChange = correct ? question.points : -question.points;
      onScoreChange(selectedTeamId, pointChange);
      onAnswered();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#1A365D] rounded-xl max-w-4xl w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#EDF2EF] hover:text-[#8499B1] transition-colors z-10"
        >
          <X size={24} />
        </button>
        
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#EDF2EF]">{question.category}</h2>
            <p className="text-4xl font-bold text-[#FFB411]">
              ${question.points}
            </p>
          </div>

          <div className="space-y-6">
            {question.imageUrl && !imageError && (
              <div className="w-full flex justify-center">
                <div className="max-w-2xl w-full rounded-xl overflow-hidden shadow-xl bg-white p-2">
                  <img
                    src={question.imageUrl}
                    alt="Question visual"
                    className="w-full h-auto object-contain rounded-lg"
                    style={{ maxHeight: '400px' }}
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}

            <div className="bg-white text-black rounded-xl p-8 shadow-lg">
              <p className="text-3xl font-semibold leading-relaxed">
                {showAnswer ? question.answer : question.question}
              </p>
            </div>
          </div>

          <div className="pt-6">
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-[#8499B1] text-[#EDF2EF] px-8 py-4 rounded-lg hover:bg-[#1A365D] transition-all duration-200 font-semibold shadow-lg"
              >
                Show Answer
              </button>
            )}

            {showAnswer && !showScoring && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-[#EDF2EF]">Select Answering Team</h3>
                <div className="grid grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className="bg-[#8499B1] text-[#EDF2EF] hover:bg-[#1A365D] py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showScoring && selectedTeamId && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-[#EDF2EF]">
                  Was {teams.find(t => t.id === selectedTeamId)?.name}'s answer correct?
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleScoring(true)}
                    className="flex items-center gap-2 bg-green-600 text-[#EDF2EF] px-6 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 shadow-lg"
                  >
                    <Check size={20} />
                    Correct (+${question.points})
                  </button>
                  <button
                    onClick={() => handleScoring(false)}
                    className="flex items-center gap-2 bg-red-600 text-[#EDF2EF] px-6 py-3 rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-lg"
                  >
                    <XIcon size={20} />
                    Incorrect (-${question.points})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
