// src/components/FlagComponent.tsx
import React from 'react';
// @ts-ignore
const GuessesComponent = ({ guesses }) => {

    return (
        <div className={'flex flex-col text-left m-5'}>
            {guesses.map((guess: string, index: number) => (
                <span key={index}>{guess}</span>
            ))}
        </div>
    );
};

export default GuessesComponent;
