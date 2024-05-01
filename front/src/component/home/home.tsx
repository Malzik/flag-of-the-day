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
const mapStateToProps = (state: RootState) => ({
    id: state.flag.profile?.id,
    streak: state.flag.profile?.streak,
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
const HomeComponent: React.FC<PropsFromRedux> = ({ id, streak, loading, error, getProfile }) => {
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
        <div className={'w-full text-center text-black dark:text-white pt-6 mt-24 container mx-auto'}>
            <div className={'font-extrabold dark:text-white text-4xl'}>
                {t('home.title')}
            </div>
            <div className={'mt-36 flex justify-center text-2xl text-black'}>
                <div className={'flex hover:shadow-inner hover:shadow-2xl dark:bg-slate-100 rounded-lg'}>
                    <button onClick={()=> startGame()} disabled={loading || error}
                            className={'p-6 rounded-l-lg border-2 border-r-0 border-black dark:border-slate-300 font-semibold disabled:cursor-wait'}>
                        {t('home.startGame')}
                    </button>
                    <div className={'p-2 rounded-r-lg border-2 border-l-1 border-black dark:border-slate-300 font-semibold'}>
                        <FlameCounter count={streak ?? 0}></FlameCounter>
                    </div>
                </div>
            </div>
            <div className={'w-3/4 md:w-1/4 mx-auto'}>
                <div className={'flex mt-24 justify-around items-center'}>
                        <div className={'flex items-center shadow-md p-2 rounded-md'}>
                            <img src="https://flagcdn.com/fr.svg" alt="French flag"
                                 className={`px-2 rounded ${currentLang === 'fr' ? "h-6" : "h-4 grayscale"}`}
                                 onClick={() => updateLang('fr')}/>
                            <img src="https://flagcdn.com/gb.svg" alt="UK flag"
                                 className={`px-2 rounded ${currentLang === 'en' ? "h-6" : "h-4 grayscale"}`}
                                 onClick={() => updateLang('en')}/>
                        </div>
                        <div
                            className="cursor-pointer shadow-md py-1 rounded-md"
                            onClick={toggleDarkMode}
                        >
                            {darkSide ? (
                                <button role="img" aria-label="Sun" className="text-yellow-500 text-3xl w-14">☀️</button>
                            ) : (
                                <button role="img" aria-label="Moon" className="text-gray-500 text-3xl w-14">🌙</button>
                            )}
                        </div>
                </div>
            </div>
        </div>
    );
};

export default connector(HomeComponent);
