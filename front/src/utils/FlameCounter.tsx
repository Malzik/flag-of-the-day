import React from 'react';

// @ts-ignore
const FlameCounter = ({ count }) => {
    return (
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-md shadow-md">
            <span className='text-sm p-2'>Séries</span>
            <div className='relative border-l w-full p-2'>
            <img src="flame-icon.svg" alt="Flame" className="w-8 h-8" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-bold text-xl">
                {count}
            </div>
            </div>
        </div>
    );
};

export default FlameCounter;
