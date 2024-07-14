import {RootState} from "../../store/store";
import {connect, ConnectedProps} from "react-redux";
import React from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";

interface LeaderboardPointsProps {
    leaderboard: any;
}

const LeaderboardPointsComponent: React.FC<LeaderboardPointsProps> = ({leaderboard}) => {
    const {t, init, status} = useTranslations()
    let leaderboardMode = LEADERBOARD_MODE.POINTS

    return (
        <div className={'w-full h-full text-center flex flex-col'}>
            {leaderboardMode}
        </div>
    )
}

export default LeaderboardPointsComponent;
