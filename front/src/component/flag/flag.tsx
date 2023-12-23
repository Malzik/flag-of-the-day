// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {fetchFlags, getFlagOfTheDay, guess, updateStep} from "../../store/action/flag";
import GuessesComponent from "./guesses/guesses";
import AutocompleteInput from '../autocomplete/AutocompleteInput';
import {useLocalStorage} from "../../utils/useLocalStorage";
import {useNavigate} from "react-router-dom";

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
    const [currentDay, setCurrentDay] = useLocalStorage('currentDay', undefined)
    const [profile, setProfile] = useLocalStorage('profile', '')
    const navigate = useNavigate()

    const maxGuesses = 5
    let options: string[] = []
    if (flags) {
        options = flags.map((flag: any) => flag.name).filter((option: any) => !guesses.includes(option))
    }

    useEffect(() => {
        setTimeout(() => {
            if (!currentDay[today]) {
                navigate('/')
                return
            }
            setGuesses(currentDay[today].guesses)
            updateStep(currentDay[today].guessed.length)
        })
    });

    useEffect(() => {
        if (!loading) {
            if (flagName.length > 0 && correctGuess[step]) {
                setCurrentDay({...currentDay, [today]: {...currentDay[today], guesses: [], guessed:  [...currentDay[today].guessed, {step, flagName}]}})
                updateStep(step + 1)
                setGuesses([])
            }
            if(!correctGuess[step] && guesses.length === maxGuesses) {
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
            setFlagName(newFlagName)
            setGuesses([...guesses, newFlagName])
            setCurrentDay({...currentDay, [today]: {...currentDay[today], guesses: [...guesses, newFlagName]}})
            guess(step, newFlagName)
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
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
        <div className={'w-full text-center text-black dark:text-white pt-6'}>
            <div className={'flex justify-center'}>
                {getGuessedFlags().map((flag: any, index) => (
                    <div key={index} className={'mx-2 my-6 w-20'}>
                        {flag.length > 0 ? <img src={flag} alt="Flag guessed" className={'border'}/> : <div></div>}
                    </div>
                ))}
            </div>
            {(
                <div key={randomFlags[step]} className={'flex flex-col items-center'}>
                    <img
                        className={'px-4 md:w-96'}
                        src={randomFlags[step]}
                        height="120"
                        alt="Flag to guess" />
                    <div className={'flex  mt-4'}>
                        <AutocompleteInput options={options} onSelect={(option) => updateFlagName(option)} />
                        <div>({guesses.length + 1} / {maxGuesses})</div>
                    </div>
                </div>
            )}
            <GuessesComponent guesses={guesses}></GuessesComponent>
        </div>
    );
};

export default connector(FlagComponent);
