import React from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";

interface LeaderboardPointsProps {
    leaderboard: any;
}

const LeaderboardPointsComponent: React.FC<LeaderboardPointsProps> = ({leaderboard}) => {
    let leaderboardMode = LEADERBOARD_MODE.POINTS

    leaderboard.sort((a: any, b: any) => b.points - a.points)
    return (
        <div className={'w-2/3 h-full text-center flex flex-col align-middle'}>
            {leaderboard.map((player: {name:string, points:number, highlight:boolean}, index: number) => {
                return (
                    <div key={index} className={`flex justify-between ${player.highlight ? 'text-yellow-500' : ''}`}>
                        <div>{player.name}</div>
                        <div>{player.points}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default LeaderboardPointsComponent;
