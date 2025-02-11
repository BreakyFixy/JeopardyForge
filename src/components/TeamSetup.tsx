import React, { useState, useRef } from 'react';
import { Team } from '../types/game';
import { Plus, Trash2 } from 'lucide-react';

interface TeamSetupProps {
  onComplete: (teams: Team[]) => void;
}

const TeamSetup: React.FC<TeamSetupProps> = ({ onComplete }) => {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Team 1', score: 0 },
    { id: '2', name: 'Team 2', score: 0 },
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addTeam = () => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name: `Team ${teams.length + 1}`,
      score: 0,
    };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(team => team.id !== id));
  };

  const updateTeamName = (id: string, newName: string) => {
    setTeams(teams.map(team => 
      team.id === id ? { ...team, name: newName } : team
    ));
  };

  const playStartSound = async () => {
    try {
      if (audioRef.current) {
        // Reset the audio to the start
        audioRef.current.currentTime = 0;
        
        // Try to play the sound
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleStart = async () => {
    if (teams.length < 1) {
      alert('Please add at least one team to start the game.');
      return;
    }

    try {
      // First, try to load the audio
      if (audioRef.current) {
        await audioRef.current.load();
      }

      // Start the game
      onComplete(teams);

      // Play the sound after a brief delay to ensure smooth transition
      setTimeout(() => {
        playStartSound();
      }, 100);
    } catch (error) {
      console.error('Error during game start:', error);
      // Still start the game even if audio fails
      onComplete(teams);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <audio
        ref={audioRef}
        src="/Sounds/this-is-jeopardy-1992-101soundboards.mp3"
        preload="auto"
      />
      
      <h2 className="text-3xl font-bold mb-8 text-center text-[#EDF2EF]">Set Up Teams</h2>
      
      <div className="space-y-4 mb-8">
        {teams.map(team => (
          <div key={team.id} className="flex items-center gap-4 bg-[#8499B1] p-4 rounded-lg shadow-lg">
            <input
              type="text"
              value={team.name}
              onChange={(e) => updateTeamName(team.id, e.target.value)}
              className="flex-1 border-b-2 border-transparent hover:border-[#FFB411] focus:border-[#FFB411] outline-none text-lg bg-transparent text-[#EDF2EF] font-medium transition-all duration-200"
              placeholder="Enter team name"
            />
            <button
              onClick={() => removeTeam(team.id)}
              className="text-red-400 hover:text-red-300 p-2 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={addTeam}
          className="flex items-center justify-center gap-2 bg-[#8499B1] text-[#EDF2EF] px-4 py-3 rounded-lg w-full transition-all duration-200 font-medium hover:bg-[#1A365D]"
        >
          <Plus size={20} />
          Add Another Team
        </button>

        <button
          onClick={handleStart}
          className="bg-[#8499B1] text-[#EDF2EF] px-4 py-3 rounded-lg w-full font-semibold transition-all duration-200 shadow-lg hover:bg-[#1A365D]"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default TeamSetup;
