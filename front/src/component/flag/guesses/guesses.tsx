import React from 'react';

interface GuessesComponentProps {
    guesses: string[];
}
const GuessesComponent: React.FC<GuessesComponentProps> = ({ guesses }) => {

    return (
        <div className={'flex flex-col m-5 max-w-20'}>
            {guesses.map((guess: string, index: number) => (
                <span key={index}>{guess}</span>
            ))}
        </div>
    );
};

export default GuessesComponent;
