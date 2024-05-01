import React from 'react';

// @ts-ignore
const FlameCounter = ({ count }) => {
    return (
        <div className="relative inline-block">
            <img src="flame-icon.svg" alt="Flame" className="max-w-full h-auto min-w-16" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 font-bold text-3xl">
                {count}
            </div>
        </div>
    );
};

export default FlameCounter;
