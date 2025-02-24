import { useState, useEffect, useRef } from 'react';
import './index.css';
import GameBoard from './components/GameBoard';
import QuestionModal from './components/QuestionModal';
import TeamPanel from './components/TeamPanel';
import FileUpload from './components/FileUpload';
import TeamSetup from './components/TeamSetup';
import { Question, Team, GameState } from './types/game';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

const DEFAULT_GAME_STATE: GameState = {
  teams: [],
  questions: [],
  categories: [],
  title: 'LSC Jeopardy',
  settings: {
    backgroundColor: '#1A365D',
    textColor: '#EDF2EF',
    fontFamily: 'Inter',
    soundEnabled: true,
  },
};

function App() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [gamePhase, setGamePhase] = useState<'upload' | 'setup' | 'play'>('upload');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('jeopardyGameState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setGameState(parsed);
      if (parsed.questions.length > 0 && parsed.teams.length > 0) {
        setGamePhase('play');
      } else if (parsed.questions.length > 0) {
        setGamePhase('setup');
      }
    }

    // Initialize audio
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      
      // Try to play audio automatically
      audioRef.current.play()
        .then(() => {
          setAudioInitialized(true);
        })
        .catch(() => {
          // If autoplay fails, show the play button
          setShowPlayButton(true);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jeopardyGameState', JSON.stringify(gameState));
  }, [gameState]);

  const initializeAudio = () => {
    if (audioRef.current && !audioInitialized) {
      audioRef.current.play()
        .then(() => {
          setAudioInitialized(true);
          setShowPlayButton(false);
        })
        .catch(error => {
          console.warn('Audio playback failed:', error);
          setShowPlayButton(true);
        });
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioMuted) {
        audioRef.current.play().catch(console.warn);
      } else {
        audioRef.current.pause();
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleQuestionsLoad = (questions: Question[]) => {
    const categories = Array.from(new Set(questions.map((q) => q.category)));
    setGameState((prev) => ({
      ...prev,
      questions,
      categories,
    }));
    setGamePhase('setup');
  };

  const handleTeamsSetup = (teams: Team[]) => {
    setGameState((prev) => ({
      ...prev,
      teams,
    }));
    setGamePhase('play');
    initializeAudio(); // Try to play audio when game starts
  };

  const handleQuestionAnswered = () => {
    if (!selectedQuestion) return;
    setGameState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q === selectedQuestion ? { ...q, isAnswered: true } : q
      ),
    }));
  };

  const handleScoreChange = (teamId: string, change: number) => {
    setGameState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId
          ? { ...team, score: team.score + change }
          : team
      ),
    }));
  };

  const handleTeamNameChange = (teamId: string, newName: string) => {
    setGameState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId ? { ...team, name: newName } : team
      ),
    }));
  };

  const handleTeamDelete = (teamId: string) => {
    setGameState((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team.id !== teamId),
    }));
  };

  const handleTitleChange = (newTitle: string) => {
    setGameState((prev) => ({
      ...prev,
      title: newTitle,
    }));
  };

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart? This will clear all current game progress.')) {
      setGameState(DEFAULT_GAME_STATE);
      setGamePhase('upload');
      setSelectedQuestion(null);
      localStorage.removeItem('jeopardyGameState');
      
      // Restart the theme song
      if (audioRef.current && !isAudioMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.warn('Audio playback failed:', error);
          setShowPlayButton(true);
        });
      }
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col items-center mb-8 w-full">
        {gamePhase === 'upload' && (
          <div className="w-full max-w-4xl mb-8">
            <img
              src="https://ntglsc.pages.dev/images/banner.png"
              alt="Jeopardy Banner"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        <div className="flex items-center justify-between w-full">
          <div className="flex-1" />
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              value={gameState.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-[#FFD700] focus:border-[#FFD700] outline-none transition-all duration-200 px-2 text-center"
            />
          </div>
          <div className="flex-1 flex justify-end gap-4">
            {showPlayButton && (
              <button
                onClick={initializeAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFB411] text-[#1A365D] hover:bg-[#FFD700] transition-colors"
                title="Play Theme Music"
              >
                Play Music
              </button>
            )}
            <button
              onClick={toggleAudio}
              className="p-2 rounded-full hover:bg-[#132F5F] transition-colors"
              title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isAudioMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            {gamePhase !== 'upload' && (
              <button
                onClick={handleRestart}
                className="p-2 rounded-full hover:bg-[#132F5F] transition-colors"
                title="Restart Game"
              >
                <RotateCcw size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'upload':
        return <FileUpload onQuestionsLoad={handleQuestionsLoad} />;
      case 'setup':
        return <TeamSetup onComplete={handleTeamsSetup} />;
      case 'play':
        return (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <GameBoard
                questions={gameState.questions}
                categories={gameState.categories}
                onQuestionSelect={setSelectedQuestion}
              />
            </div>
            <div className="w-full lg:w-96">
              <TeamPanel
                teams={gameState.teams}
                onScoreChange={handleScoreChange}
                onTeamNameChange={handleTeamNameChange}
                onTeamDelete={handleTeamDelete}
                onAddTeam={() => {
                  const newTeam: Team = {
                    id: Date.now().toString(),
                    name: `Team ${gameState.teams.length + 1}`,
                    score: 0,
                  };
                  setGameState(prev => ({
                    ...prev,
                    teams: [...prev.teams, newTeam],
                  }));
                }}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: gameState.settings.backgroundColor,
        color: gameState.settings.textColor,
        fontFamily: gameState.settings.fontFamily,
      }}
    >
      <audio
        ref={audioRef}
        src="/audio/this-is-jeopardy-1992-101soundboards.mp3"
        preload="auto"
        loop
      />
      
      <div className="container mx-auto py-8">
        {renderHeader()}
        {renderGameContent()}

        {selectedQuestion && (
          <QuestionModal
            question={selectedQuestion}
            teams={gameState.teams}
            onClose={() => setSelectedQuestion(null)}
            onAnswered={handleQuestionAnswered}
            onScoreChange={handleScoreChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;
