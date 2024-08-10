import {RootState} from "../../store/store";
import {connect, ConnectedProps} from "react-redux";
import React from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";
interface LeaderboardStreakProps {
    leaderboard: any;
}

const LeaderboardStreakComponent: React.FC<LeaderboardStreakProps> = ({leaderboard}) => {
    let leaderboardMode = LEADERBOARD_MODE.STREAK

    leaderboard.sort((a: any, b: any) => b.streak - a.streak)

    return (
        <div className={'w-2/3 h-full text-center flex flex-col align-middle'}>
            {leaderboard.map((player: {name:string, streak:number, highlight:boolean}, index: number) => {
                return (
                    <div key={index} className={`flex justify-between ${player.highlight ? 'text-yellow-500' : ''}`}>
                        <div>{player.name}</div>
                        <div>{player.streak}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default LeaderboardStreakComponent;
