import React from 'react';
import {coupeSvg} from "../ui/svg";

export interface Leaderboards {
    points: { name: string; points: number; highlight: boolean }[];
    streak: { name: string; streak: number; highlight: boolean }[];
}

interface LeaderboardProps {
    leaderboards: Leaderboards;
    property: 'points' | 'streak';
}

const LeaderboardListComponent: React.FC<LeaderboardProps> = ({leaderboards, property}) => {
    const playerHighlightStyle = 'text-yellow-500 font-bold';

    const selectedLeaderboard = leaderboards[property];

    const sortedLeaderboard = [...selectedLeaderboard].sort((a, b) => {
        const aValue = a[property as keyof typeof a];
        const bValue = b[property as keyof typeof b];
        // @ts-ignore
        return bValue - aValue;
    });

    const displayIndex = (index: number) => {
        switch (index) {
            case 0 :
                return (<svg className={"w-8 fill-[#FCDC12]"} viewBox="0 0 1280.000000 1280.000000">{coupeSvg}</svg>)
            case 1 :
                return (<svg className={"w-8 fill-[#C0C0C0]"} viewBox="0 0 1280.000000 1280.000000">{coupeSvg}</svg>)
            case 2 :
                return (<svg className={"w-8 fill-[#CE8946]"} viewBox="0 0 1280.000000 1280.000000">{coupeSvg}</svg>)
            default :
                return (index + 1)

        }
    }

    return (
        <div className="h-full text-center flex flex-col justify-center w-4/5 md:w-3/6 mx-auto">
            {sortedLeaderboard.map((player, index) => (
                <div
                    key={index}
                    className={`flex justify-between items-center py-1.5 text-lg ${player.highlight ? playerHighlightStyle : ''}`}
                >
                    <span className={`text-sm w-8 ${player.highlight ? '' : 'text-gray-500 font-semibold'}`}>
                        {displayIndex(index)}
                    </span>
                    <span className="text-left flex-1">{player.name}</span>
                    <span className="text-right flex items-center">{(player as any)[property]}</span>
                </div>
            ))}
        </div>
    );
};

export default LeaderboardListComponent;
