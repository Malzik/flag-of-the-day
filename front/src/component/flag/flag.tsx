// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {fetchFlags, getFlagOfTheDay, guess, updateStep} from "../../store/action/flag";
import GuessesComponent from "./guesses/guesses";
import AutocompleteInput from '../autocomplete/AutocompleteInput';
import {Flag} from "../../store/model/flag";
import ConfettiExplosion from "react-confetti-explosion";
import {useLocalStorage} from "../../utils/useLocalStorage";
import {useNavigate} from "react-router-dom";

const mapStateToProps = (state: RootState) => ({
    flags: state.flag.flags,
    loading: state.flag.loading,
    error: state.flag.error,
    maxStep: state.flag.maxStep,
    randomFlags: state.flag.randomFlags,
    step: state.flag.step,
    correctGuess: state.flag.correctGuess
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

const FlagComponent: React.FC<PropsFromRedux> = ({ flags, randomFlags, step, maxStep, correctGuess, loading, error, getFlagOfTheDay, fetchFlags, guess, updateStep }) => {
    const [flagName, setFlagName] = useState("")
    const [guesses, setGuesses] = useState<string[]>([])
    const [currentDay, setCurrentDay] = useLocalStorage('currentDay', '')
    const navigate = useNavigate()

    const maxGuesses = 5
    let options: string[] = []
    if (flags) {
        options = flags.map((flag: any) => flag.name).filter((option: any) => !guesses.includes(option))
    }

    setTimeout(() => {
        if(currentDay[today] && currentDay[today].guessed.length === 3) {
            navigate('/win')
        }
    })

    useEffect(() => {
        getFlagOfTheDay();
        fetchFlags();
        if (currentDay[today]) {
            if (currentDay[today].guessed) {
                updateStep(currentDay[today].guessed.length)
            }
            if (currentDay[today].additionalInfo) {
                if (currentDay[today].additionalInfo.loose) {
                    navigate('/loose')
                }
                if (currentDay[today].additionalInfo.win) {
                    navigate('/win')
                }
            }
        }
    }, [fetchFlags, getFlagOfTheDay]);

    const sendGuess = (name: string) => {
        setGuesses([...guesses, name])
        guess(step, name)
    }

    const updateFlagName = (newFlagName: string) => {
        if (newFlagName.length > 0) {
            setFlagName(newFlagName)
            sendGuess(newFlagName)
        }
    }

    const setItemInLocalStorage = (step: number, flagName: string) => {
        if (currentDay[today]) {
            const guessed = [...currentDay[today].guessed, {step, flagName}]
            setCurrentDay({...currentDay, [today]: {...currentDay[today], guessed}})
        } else {
            setCurrentDay({...currentDay, [today]: {guessed: [{step, flagName}]}})
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

    setTimeout(() => {
        if(guesses.length === maxGuesses) {
            navigate('/loose')
            return
        }
        if (correctGuess[step]) {
            setItemInLocalStorage(step, flagName)
            updateStep(step + 1)
            setGuesses([])
        }
    }, 50)

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
