import store, {RootState} from "../../store/store";
import {connect, ConnectedProps} from "react-redux";
import React, {useEffect, useState} from "react";
import useTranslations from "../../i18n/useTranslation";
import {LEADERBOARD_MODE} from "../../store/model/flag";
import {getLeaderboard} from "../../store/action/flag";
import {Button} from "../ui/button";
import LeaderboardListComponent from "./leaderboardList";
import Loader from "../ui/Loader";

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

const shadowStyle = "[box-shadow:0_6px_0_0_#1b6ff8,0_8px_0_0_#1b70f841]"

const buttonUnselectedStyle = {
    buttonClass: 'bg-blue-500 border-b-[1px] border-blue-400 h-8 md:h-12 ' + shadowStyle,
    labelClass: 'text-white'
}
const buttonSelectedStyle = {
    buttonClass: 'bg-white border border-blue-500 h-8 md:h-12 ' + shadowStyle,
    labelClass: 'text-black'
}
const LeaderboardComponent: React.FC<PropsFromRedux> = ({leaderboards, loading}) => {
    const {t, init, status} = useTranslations()
    const [leaderboardMode, setLeaderboardMode] = useState(LEADERBOARD_MODE.STREAK)
    const [streakStyle, setStreakStyle] = useState(buttonSelectedStyle)
    const [pointsStyle, setPointsStyle] = useState(buttonUnselectedStyle)

    useEffect(() => {
        if (leaderboardMode === LEADERBOARD_MODE.STREAK) {
            setStreakStyle(buttonSelectedStyle)
            setPointsStyle(buttonUnselectedStyle)
        } else {
            setStreakStyle(buttonUnselectedStyle)
            setPointsStyle(buttonSelectedStyle)
        }
    }, [leaderboardMode])

    if (status === 'loading') {
        return (<div>{t('loading')}</div>)
    }

    return (
        <div className={'w-full h-full text-center bg-blue-300 flex flex-col'}>
            <div
                className={'py-3 flex-1 flex flex-col gap-5 text-black dark:text-white bg-slate-100 dark:bg-slate-800 rounded-t-xl'}>
                <div className='text-3xl font-bold md:py-3'>{t('leaderboard.title')}</div>
                <div className='flex justify-center gap-5 w-80 md:w-full mx-auto'>
                    <Button label={t('leaderboard.streak')} buttonClass={streakStyle.buttonClass} labelClass={streakStyle.labelClass} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.STREAK)}></Button>
                    <Button label={t('leaderboard.points')} buttonClass={pointsStyle.buttonClass} labelClass={pointsStyle.labelClass} onClick={() => setLeaderboardMode(LEADERBOARD_MODE.POINTS)}></Button>
                </div>
                {loading ? <div className={'py-8'}><Loader/></div> : <LeaderboardListComponent leaderboards={leaderboards} property={leaderboardMode as 'points' | 'streak'}/>}
            </div>
        </div>
    )
}

export default connector(LeaderboardComponent);
