// src/components/Header.tsx
import React, { useState } from 'react';
import useDarkSide from "../../utils/useDarkSide";

const Header: React.FC = () => {
    const [colorTheme, setTheme] = useDarkSide();
    const [darkSide, setDarkSide] = useState(colorTheme === 'light');

    const toggleDarkMode = () => {
        setTheme(colorTheme);
        setDarkSide(!darkSide);
    };

    return (
        <header className="text-white p-2 flex justify-between items-center">
            <div className={'grow flex items-center justify-center'}>
                <img src="planete.png" alt="Planete" className="h-10 w-10" />
            </div>
            <div
                className="cursor-pointer absolute inset-y-1 right-2"
                onClick={toggleDarkMode}
            >
                {darkSide ? (
                    <button role="img" aria-label="Sun" className="text-yellow-500 text-3xl h-10 w-10">☀️</button>
                ) : (
                    <button role="img" aria-label="Moon" className="text-gray-500 text-3xl h-10 w-10">🌙</button>
                )}
            </div>
        </header>
    );
};

export default Header;
