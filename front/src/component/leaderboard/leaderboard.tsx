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
        let profile: any = localStorage.getItem('profile')
        let id = null
        if (profile) {
            profile = JSON.parse(profile)
            id = profile.id
        }
        store.dispatch(getLeaderboard(id))
    }, 50)
}
const LeaderboardComponent: React.FC<PropsFromRedux> = ({leaderboards, loading}) => {
    const {t, init, status} = useTranslations()
    const [leaderboardMode, setLeaderboardMode] = useState(LEADERBOARD_MODE.STREAK)
    const [points, setPoints] = useState(leaderboards.points)
    const [streak, setStreak] = useState(leaderboards.streak)
    const [streakStyle, setStreakStyle] = useState('underline')
    const [pointsStyle, setPointsStyle] = useState('')

    useEffect(() => {
        setPoints(leaderboards.points)
        setStreak(leaderboards.streak)
    }, [leaderboards])

    useEffect(() => {
        if (leaderboardMode === LEADERBOARD_MODE.STREAK) {
            setStreakStyle('underline')
            setPointsStyle('')
        } else {
            setStreakStyle('')
            setPointsStyle('underline')
        }
    }, [leaderboardMode])

    if (status === 'loading') {
        return (<div>{t('loading')}</div>)
    }

    return (
        <div className={'w-full h-full text-center flex flex-col mb-5 mt-5'}>
            <div className='text-2xl font-bold'>{t('leaderboard.title')}</div>
            <div className='flex justify-center gap-5 py-5'>
                <span>{t('leaderboard.sort_by')}</span>
                <span className={`cursor-pointer ${streakStyle}`} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.STREAK)}>{t('leaderboard.streak')}</span>
                <span className={`cursor-pointer ${pointsStyle}`} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.POINTS)}>{t('leaderboard.points')}</span>
            </div>
            <div className='flex justify-center'>
                {leaderboardMode === LEADERBOARD_MODE.STREAK
                    ? <LeaderboardStreakComponent leaderboard={streak}/>
                    : <LeaderboardPointsComponent leaderboard={points}/>}
            </div>
        </div>
    )
}

export default connector(LeaderboardComponent);
