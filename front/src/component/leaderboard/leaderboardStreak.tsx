import {RootState} from "../../store/store";
import {connect, ConnectedProps} from "react-redux";
import React from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";
interface LeaderboardStreakProps {
    leaderboard: any;
}

const LeaderboardStreakComponent: React.FC<LeaderboardStreakProps> = ({leaderboard}) => {
    const {t, init, status} = useTranslations()
    let leaderboardMode = LEADERBOARD_MODE.STREAK

    return (
        <div className={'w-full h-full text-center flex flex-col'}>
            {leaderboardMode}
        </div>
    )
}

export default LeaderboardStreakComponent;
