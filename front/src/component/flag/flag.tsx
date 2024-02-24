// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {fetchFlags, getFlagOfTheDay, guess, updateStep} from "../../store/action/flag";
import AutocompleteInput from './autocomplete/AutocompleteInput';
import {useLocalStorage} from "../../utils/useLocalStorage";
import {NavLink, useNavigate} from "react-router-dom";
import useTranslations from "../../i18n/useTranslation";
import HintsComponent from "./hints/hints";

const mapStateToProps = (state: RootState) => ({
    flags: state.flag.flags,
    loading: state.flag.loading,
    error: state.flag.error,
    maxStep: state.flag.maxStep,
    randomFlags: state.flag.randomFlags,
    step: state.flag.step,
    correctGuess: state.flag.correctGuess,
    isWin: state.flag.isWin
});

const mapDispatchToProps = {
    fetchFlags,
    getFlagOfTheDay,
    guess,
    updateStep
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const today = new Date().toLocaleDateString("en-US");

// @ts-ignore
const FlagComponent: React.FC<PropsFromRedux> = ({ flags, randomFlags, step, correctGuess, isWin, loading, error, getFlagOfTheDay, fetchFlags, guess, updateStep }) => {
    const [flagName, setFlagName] = useState("")
    const [guesses, setGuesses] = useState<string[]>([])
    const [hints, setHints] = useState<string[]>([])
    const [currentDay, setCurrentDay] = useLocalStorage('currentDay', undefined)
    const [profile, setProfile] = useLocalStorage('profile', '')
    const navigate = useNavigate()
    const {t, status} = useTranslations()

    const maxGuesses = 5
    let options: string[] = []
    if (flags) {
        options = flags.map((flag: any) => flag.name[profile.lang]).filter((option: any) => !guesses.includes(option))
    }

    useEffect(() => {
        setTimeout(() => {
            if (!currentDay[today]) {
                navigate('/')
                return
            }
            setGuesses(currentDay[today].guesses)
            setHints(currentDay[today].hints)
            updateStep(currentDay[today].guessed.length)
        })
    });

    useEffect(() => {
        if (!loading) {
            if (flagName.length > 0) {
                setCurrentDay({...currentDay, [today]: {...currentDay[today], hints: correctGuess[step].hints}})
                setHints(correctGuess[step].hints)
                if (correctGuess[step].correctGuess) {
                    setCurrentDay({
                        ...currentDay,
                        [today]: {
                            ...currentDay[today],
                            guesses: [],
                            hints: [],
                            guessed: [...currentDay[today].guessed, {step, flagName}]
                        }
                    })
                    updateStep(step + 1)
                    setGuesses([])
                    setHints([])
                }
            }
            if(correctGuess[step] && !correctGuess[step].correctGuess && guesses.length === maxGuesses) {
                setCurrentDay({...currentDay, [today]: {...currentDay[today], additionalInfo: {loose: true}}})
            }
        }
    }, [correctGuess, loading]);

    useEffect(() => {
        if (!currentDay[today]) {
            return
        }
        if (isWin && !currentDay[today].additionalInfo.win) {
            setProfile({...profile, streak: profile.streak+1})
            setCurrentDay({...currentDay, [today]: {...currentDay[today], additionalInfo: {win: true}, guesses: [], guessed:  [...currentDay[today].guessed, {step, flagName}]}})
        }

        if (currentDay[today].additionalInfo.win) {
            navigate('/win')
        }

        if (currentDay[today].additionalInfo.loose) {
            navigate('/loose')
        }
    }, [isWin, currentDay])

    const updateFlagName = (newFlagName: string) => {
        if (newFlagName.length > 0) {
            guess(step, [...guesses, newFlagName].length, newFlagName, profile.lang)
            setFlagName(newFlagName)
            setGuesses([...guesses, newFlagName])
            setCurrentDay({...currentDay, [today]: {...currentDay[today], guesses: [...guesses, newFlagName]}})
        }
    }

    if (status === 'loading' || loading) {
        return <p>{t('loading')}</p>;
    }

    if (error) {
        return <p>{t('error', {error})}</p>;
    }

    if (!flags || randomFlags.length === 0) {
        return null;
    }

    const getGuessedFlags = () => {
        const result = []
        for (let i = 0; i < 3; i++) {
            if (step > i) {
                result.push(randomFlags[i])
            } else {
                result.push('')
            }
        }
        return result
    }

    return (
        <div className={'w-full text-center text-black dark:text-white pt-2'}>
            <div className={'flex justify-center items-center md:w-2/6 mx-auto py-3'}>
                <NavLink to="/" className={'p-1 mr-16 shadow-lg dark:bg-slate-700 rounded'}>
                    <svg className="h-8 w-8" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <polyline points="5 12 3 12 12 3 21 12 19 12" />  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />  <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
                </NavLink>
                <div className={'text-2xl'}>{t('game.try', {guesses: guesses.length + 1, maxGuesses})}</div>
            </div>
            <div className={'flex justify-center items-center'}>
                {getGuessedFlags().map((flag: any, index) =>
                    flag.length > 0 ? <div key={index} className={'mx-2 mb-2 w-16'}>
                        <img src={flag} alt={t('game.guessedFlagAlt')} className={'border'}/>
                    </div>: <div key={index}></div>
                )}
            </div>
            <div key={randomFlags[step]} className={'flex flex-col items-center'}>
                <div className={'md:w-2/6'}>
                    <img
                        className={'px-4'}
                        src={randomFlags[step]}
                        height="120"
                        alt={t('game.flagAlt')} />
                    <AutocompleteInput options={options} onSelect={(option) => updateFlagName(option)} />
                    <HintsComponent hints={hints}></HintsComponent>
                </div>
            </div>
        </div>
    );
};

export default connector(FlagComponent);
