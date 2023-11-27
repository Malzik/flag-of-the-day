// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {fetchFlags, getFlagOfTheDay, guess} from "../../store/action/flag";
import GuessesComponent from "./guesses/guesses";
import AutocompleteInput from '../autocomplete/AutocompleteInput';
import normalizeString from "../../utils/normalize";
import {Flag} from "../../store/model/flag";

const mapStateToProps = (state: RootState) => ({
    flags: state.flag.flags,
    loading: state.flag.loading,
    error: state.flag.error,
    maxStep: state.flag.maxStep,
    randomFlags: state.flag.randomFlags
});

const mapDispatchToProps = {
    fetchFlags,
    getFlagOfTheDay,
    guess
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const FlagComponent: React.FC<PropsFromRedux> = ({ flags, randomFlags, maxStep, loading, error, getFlagOfTheDay, fetchFlags, guess }) => {
    const [step, setStep] = useState(0)
    const [flagName, setFlagName] = useState("")
    const [flagError, setError] = useState("")
    const [win, setWin] = useState(false)
    const [guesses, setGuesses] = useState<string[]>([])
    const [guessed, setGuessed] = useState<string[]>(['question-mark-svgrepo-com.svg', 'question-mark-svgrepo-com.svg', 'question-mark-svgrepo-com.svg'])

    const maxGuesses = 5
    useEffect(() => {
        getFlagOfTheDay();
        fetchFlags();
    }, [fetchFlags, getFlagOfTheDay]);

    const sendGuess = (name: string) => {
        setError("")
        setGuesses([...guesses, name])
        guess(step, name)
        if(false) {
            if(step === maxStep - 1) {
                setWin(true)
            }
            guessed[step] = flags.filter((flag: Flag) => flag.name === name)
            setGuesses([])
            setStep(step + 1)
        } else {
            if(guesses.length + 1 === maxGuesses) {
                setError('You loose')
            }
        }
        setFlagName("")
    }

    const updateFlagName = (newFlagName: string) => {
        if (newFlagName.length > 0) {
            setFlagName(newFlagName)
            sendGuess(newFlagName)
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    console.log(randomFlags)
    if (!flags || randomFlags.length === 0) {
        return null;
    }

    let options: string[] = []
    if (flags) {
        options = flags.map((flag: any) => flag.name)
    }

    if (win) {
        return <p>C'est gagne pour aujourdhui</p>;
    }

    if (flagError === 'You loose') {
        return <p>C'est perdu</p>;
    }

    return (
        <div className={'w-full text-center text-black dark:text-white pt-6'}>
            <div className={'flex justify-center'}>
                {guessed.map((flag: any, index) => (
                    <img src={flag}  alt="Flag guessed" key={index} className={'p-2 h-1/4 w-1/4'}/>
                ))}
            </div>
            {(
                <div key={randomFlags[step]} className={'flex flex-col items-center'}>
                    <img
                        className={'px-4'}
                        src={randomFlags[step]}
                        height="120"
                        alt="Flag to guess" />
                    <div className={'flex'}>
                        <AutocompleteInput options={options} onSelect={(option) => updateFlagName(option)} />
                        <button onClick={() => sendGuess(flagName)}> ({guesses.length + 1} / {maxGuesses})</button>
                    </div>
                </div>
            )}
            <GuessesComponent guesses={guesses}></GuessesComponent>
        </div>
    );
};

export default connector(FlagComponent);
