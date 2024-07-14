import store, {RootState} from "../../store/store";
import {connect, ConnectedProps} from "react-redux";
import React, {useEffect, useState} from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";
import LeaderboardStreakComponent from "./leaderboardStreak";
import LeaderboardPointsComponent from "./leaderboardPoints";
import {getLeaderboard} from "../../store/action/flag";

const mapStateToProps = (state: RootState) => ({
    loading: state.flag.loading,
    leaderboards: state.flag.leaderboards
});

const mapDispatchToProps = { };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export async function loader() {
    return setTimeout(() => {
        store.dispatch(getLeaderboard())
    }, 50)
}
const LeaderboardComponent: React.FC<PropsFromRedux> = ({leaderboards, loading}) => {
    const {t, init, status} = useTranslations()
    const [leaderboardMode, setLeaderboardMode] = useState(LEADERBOARD_MODE.STREAK)
    const [points, setPoints] = useState(leaderboards.points)
    const [streak, setStreak] = useState(leaderboards.streak)

    useEffect(() => {
        setPoints(leaderboards.points)
        setStreak(leaderboards.streak)
    }, [leaderboards])
    return (
        <div className={'w-full h-full text-center flex flex-col'}>
            <div>{t('leaderboard.title')}</div>
            <div className='flex justify-around '>
                <span className={'cursor-pointer'} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.STREAK)}>{t('leaderboard.streak')}</span>
                <span className={'cursor-pointer'} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.POINTS)}>{t('leaderboard.points')}</span>
            </div>
            <div>
                {leaderboardMode === LEADERBOARD_MODE.STREAK
                    ? <LeaderboardStreakComponent leaderboard={streak}/>
                    : <LeaderboardPointsComponent leaderboard={points}/>}
            </div>
        </div>
    )
}

export default connector(LeaderboardComponent);
