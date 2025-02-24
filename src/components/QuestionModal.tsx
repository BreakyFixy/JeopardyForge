import React, { useState } from 'react';
import { Question, Team } from '../types/game';
import { Check, X } from 'lucide-react';

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
  const [attemptedTeams, setAttemptedTeams] = useState<Set<string>>(new Set());
  const [showScoring, setShowScoring] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    setCurrentAttemptId(teamId);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowScoring(false);
    onAnswered();
  };

  const handleScoring = (correct: boolean) => {
    if (!currentAttemptId) return;

    // Add current team to attempted teams
    const newAttemptedTeams = new Set(attemptedTeams);
    newAttemptedTeams.add(currentAttemptId);
    setAttemptedTeams(newAttemptedTeams);

    if (correct) {
      // If correct, award points and end the question
      onScoreChange(currentAttemptId, question.points);
      onAnswered();
      onClose();
    } else {
      // If incorrect, deduct points from current team
      onScoreChange(currentAttemptId, -question.points);
      
      // Find teams that haven't attempted yet
      const remainingTeams = teams.filter(team => !newAttemptedTeams.has(team.id));
      
      if (remainingTeams.length > 0) {
        // Reset for next team's attempt
        setCurrentAttemptId(null);
        setShowScoring(false);
      } else {
        // If no teams left, show answer
        handleShowAnswer();
      }
    }
  };

  const getAvailableTeams = () => {
    return teams.filter(team => !attemptedTeams.has(team.id));
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
            {/* Question text always visible */}
            <div className="bg-white text-black rounded-xl p-8 shadow-lg">
              <p className="text-3xl font-semibold leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Image section - Always show if available */}
            {question.imageUrl && !imageError && (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="max-w-2xl w-full rounded-xl overflow-hidden shadow-xl bg-white p-4">
                  <img
                    src={question.imageUrl}
                    alt="Question visual"
                    className="w-full h-auto object-contain rounded-lg mx-auto"
                    style={{ maxHeight: '400px' }}
                    onError={() => {
                      setImageError(true);
                      console.error('Failed to load image:', question.imageUrl);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Answer section */}
            {showAnswer && (
              <div className="bg-white text-black rounded-xl p-8 shadow-lg">
                <p className="text-3xl font-semibold leading-relaxed">
                  {question.answer}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6">
            {/* Team Selection - Only show if no current attempt */}
            {!currentAttemptId && !showAnswer && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-[#EDF2EF]">
                  {attemptedTeams.size === 0 
                    ? "Select Team to Answer"
                    : "Select Next Team to Answer"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {getAvailableTeams().map((team) => (
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

            {/* Scoring buttons - Only show after team selection and before answer reveal */}
            {currentAttemptId && !showAnswer && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-[#EDF2EF]">
                  Was {teams.find(t => t.id === currentAttemptId)?.name}'s answer correct?
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
                    <X size={20} />
                    Incorrect (-${question.points})
                  </button>
                </div>
              </div>
            )}

            {/* Show answer button - Only show if all teams have attempted or someone got it right */}
            {!showAnswer && getAvailableTeams().length === 0 && (
              <button
                onClick={handleShowAnswer}
                className="bg-[#8499B1] text-[#EDF2EF] px-8 py-4 rounded-lg hover:bg-[#1A365D] transition-all duration-200 font-semibold shadow-lg"
              >
                Show Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
