import React from 'react';
import { Team } from '../types/game';
import { Trash2 } from 'lucide-react';

interface TeamPanelProps {
  teams: Team[];
  onTeamNameChange: (teamId: string, newName: string) => void;
  onTeamDelete: (teamId: string) => void;
  onAddTeam: () => void;
}

const TeamPanel: React.FC<TeamPanelProps> = ({
  teams,
  onTeamNameChange,
  onTeamDelete,
  onAddTeam,
}) => {
  return (
    <div className="w-full max-w-md p-4">
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-[#8499B1] p-6 rounded-xl shadow-lg space-y-3 transition-all duration-200 hover:bg-[#1A365D]"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={team.name}
                onChange={(e) => onTeamNameChange(team.id, e.target.value)}
                className="font-bold text-lg bg-transparent border-b-2 border-transparent hover:border-[#FFB411] focus:border-[#FFB411] outline-none text-[#EDF2EF] transition-all duration-200"
              />
              <button
                onClick={() => onTeamDelete(team.id)}
                className="text-red-400 hover:text-red-300 transition-all duration-200"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-white rounded-lg py-3 px-4">
              <span className="text-4xl font-bold text-[#1A365D]">
                ${team.score}
              </span>
            </div>
          </div>
        ))}
        
        <button
          onClick={onAddTeam}
          className="w-full bg-[#8499B1] text-[#EDF2EF] py-3 rounded-lg hover:bg-[#1A365D] transition-all duration-200 font-semibold shadow-lg"
        >
          Add Team
        </button>
      </div>
    </div>
  );
};

export default TeamPanel;
