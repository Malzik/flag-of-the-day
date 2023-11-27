// src/components/FlagComponent.tsx
import React from 'react';
// @ts-ignore
const GuessesComponent = ({ guesses }) => {

    return (
        <div className={'flex flex-col'}>
            {guesses.map((guess: string, index: number) => (
                <span key={index}>{guess}</span>
            ))}
        </div>
    );
};

export default GuessesComponent;
