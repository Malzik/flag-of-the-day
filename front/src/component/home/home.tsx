// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import store, {RootState} from "../../store/store";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../../utils/useLocalStorage";
import {fetchFlags, getFlagOfTheDay, getProfile} from "../../store/action/flag";
import FlameCounter from "../../utils/FlameCounter";
import useTranslations from "../../i18n/useTranslation";
import useDarkSide from "../../utils/useDarkSide";
import { Button } from '../ui/button';
import HistoryComponent from "./history/history";
const mapStateToProps = (state: RootState) => ({
    id: state.flag.profile?.id,
    streak: state.flag.profile?.streak,
    points: state.flag.profile?.points,
    history: state.flag.profile?.history,
    loading: state.flag.loading,
    error: state.flag.error
});

const mapDispatchToProps = { getProfile };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export async function loader() {
    return setTimeout(() => {
        // @ts-ignore
        store.dispatch(fetchFlags())
        let profile: any = localStorage.getItem('profile')
        let id = null
        let lang = 'en'
        if (profile) {
            profile = JSON.parse(profile)
            id = profile.id
            lang = profile.lang
        }
        // @ts-ignore
        store.dispatch(getFlagOfTheDay(id, lang))
    }, 50)
}

const today = new Date().toLocaleDateString("en-US");
const HomeComponent: React.FC<PropsFromRedux> = ({ id, streak, points, history, loading, error, getProfile }) => {
    let navigate = useNavigate();
    const [colorTheme, setTheme] = useDarkSide();
    const [darkSide, setDarkSide] = useState(colorTheme === 'light');
    const [profile, setProfile] = useLocalStorage('profile', '')
    const [currentDay, setCurrentDay] = useLocalStorage('currentDay', '')
    const [currentLang, setCurrentLang] = useState(navigator.language.split('-')[0])
    const {t, init, status} = useTranslations()

    useEffect(() => {
        if (!profile.id && id) {
            setProfile({...profile, lang: profile.lang || currentLang, id})
        }
        getProfile(profile.id || null)
        setCurrentLang(profile.lang || currentLang)
    }, []);

    useEffect(() => {
        setProfile({...profile, lang: profile.lang || currentLang, id})
    }, [id]);

    const toggleDarkMode = () => {
        setTheme(colorTheme);
        setDarkSide(!darkSide);
    };
    const startGame = () => {
        if (!currentDay[today]) {
            setCurrentDay({[today]: { guessed: [], guesses: []}})
        }
        navigate("/game")
    }

    if (status === 'loading') {
        return (<div>{t('loading')}</div>)
    }

    const updateLang = (lang: string) => {
        init(lang)
        setProfile({...profile, lang})
        setCurrentLang(lang)
    }

    return (
        <div className={'w-full h-full text-center bg-blue-300 flex flex-col'}>
            <div className='flex justify-between px-5 py-4 md:py-6 items-center container mx-auto'>
                <span className={'font-extrabold'}>
                {t('home.title')}
                </span>
                <FlameCounter count={streak ?? 0} points={points}/>
            </div>
            <div
                className={'py-5 flex-1 flex flex-col gap-5 text-2xl text-black dark:text-white bg-slate-100 dark:bg-slate-800 rounded-t-xl'}>
                <div className='flex justify-between px-5 container mx-auto'>
                    <div className={'flex items-center shadow-md p-2 rounded-md'}>
                        <img src="https://flagcdn.com/fr.svg" alt="French flag"
                             className={`px-2 rounded ${currentLang === 'fr' ? "h-6" : "h-4 grayscale"}`}
                             onClick={() => updateLang('fr')}/>
                        <img src="https://flagcdn.com/gb.svg" alt="UK flag"
                             className={`px-2 rounded ${currentLang === 'en' ? "h-6" : "h-4 grayscale"}`}
                             onClick={() => updateLang('en')}/>
                    </div>
                    <div>
                        <button onClick={toggleDarkMode} className='button w-12 h-12 bg-blue-500 rounded-full cursor-pointer select-none
                            active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
                            active:border-b-[0px]
                            transition-all duration-150 [box-shadow:0_8px_0_0_#1b6ff8,0_13px_0_0_#1b70f841]
                            border-[1px] border-blue-400'>
                            {darkSide ?
                                (<span
                                    className='flex flex-col justify-center items-center h-full text-white font-bold text-lg '>☀️</span>)
                                : (<span
                                    className='flex flex-col justify-center items-center h-full text-white font-bold text-lg '>🌙</span>)
                            }
                        </button>
                    </div>
                </div>
                {!!history ?
                    <div className={'container mx-auto flex flex-col gap-3 md:gap-5 flex-1'}>
                        <h2>{t('home.lastScore')}</h2>
                        <div className='flex-1 w-full flex flex-col gap-4 px-5'>
                            {history?.map((day, key) => (<HistoryComponent history={day} key={key}/>))}
                        </div>
                    </div> : <div className={"mt-16 mb-32"}>{t('home.welcome')}</div>
                }
                <div className='shrink-0'>
                    <Button label={t('home.startGame')} onClick={() => startGame()}></Button>
                </div>
            </div>
        </div>
    )
        ;
};

export default connector(HomeComponent);
