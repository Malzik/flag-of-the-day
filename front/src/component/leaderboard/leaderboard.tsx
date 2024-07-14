import {RootState} from "../../store/store";
import {getProfile, updateName} from "../../store/action/flag";
import {connect, ConnectedProps} from "react-redux";
import FlameCounter from "../../utils/FlameCounter";
import React, {useState} from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";
import LeaderboardStreakComponent from "./leaderboardStreak";
import LeaderboardPointsComponent from "./leaderboardPoints";

const mapStateToProps = (state: RootState) => ({
    loading: state.flag.loading,
    leaderboard: { streak:'', points: ''}
});

const mapDispatchToProps = { };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const LeaderboardComponent: React.FC<PropsFromRedux> = ({leaderboard, loading}) => {
    const {t, init, status} = useTranslations()
    const [leaderboardMode, setLeaderboardMode] = useState(LEADERBOARD_MODE.STREAK)

    return (
        <div className={'w-full h-full text-center flex flex-col'}>
            <div>{t('leaderboard.title')}</div>
            <div className='flex justify-around '>
                <span className={'cursor-pointer'} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.STREAK)}>{t('leaderboard.streak')}</span>
                <span className={'cursor-pointer'} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.POINTS)}>{t('leaderboard.points')}</span>
            </div>
            <div>
                {leaderboardMode === LEADERBOARD_MODE.STREAK ? <LeaderboardStreakComponent leaderboard={leaderboard.streak}/> : <LeaderboardPointsComponent leaderboard={leaderboard.points}/>}
            </div>
        </div>
    )
}

export default connector(LeaderboardComponent);
