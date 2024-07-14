import React from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";

interface LeaderboardPointsProps {
    leaderboard: any;
}

const LeaderboardPointsComponent: React.FC<LeaderboardPointsProps> = ({leaderboard}) => {
    const {t, init, status} = useTranslations()
    let leaderboardMode = LEADERBOARD_MODE.POINTS

    leaderboard.sort((a: any, b: any) => b.points - a.points)
    return (
        <div className={'w-full h-full text-center flex flex-col'}>
            {leaderboardMode}

            {leaderboard.map((player: {name:string, points:number}, index: number) => {
                return (
                    <div key={index} className={'flex justify-around'}>
                        <div>{player.name}</div>
                        <div>{player.points}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default LeaderboardPointsComponent;
