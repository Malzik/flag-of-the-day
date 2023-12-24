// src/components/Header.tsx
import React, {useEffect, useState} from 'react';
import useDarkSide from "../../utils/useDarkSide";
import {NavLink, useNavigate} from "react-router-dom";
import useTranslations from "../../i18n/useTranslation";
import {useLocalStorage} from "../../utils/useLocalStorage";

const Header: React.FC = () => {
    let navigate = useNavigate();
    const [colorTheme, setTheme] = useDarkSide();
    const [darkSide, setDarkSide] = useState(colorTheme === 'light');
    const [profile, setProfile] = useLocalStorage('profile', '')
    const { init } = useTranslations()

    useEffect(() => {
        init(profile.lang)
    }, []);
    const toggleDarkMode = () => {
        setTheme(colorTheme);
        setDarkSide(!darkSide);
    };

    return (
        <header className="text-white p-2 flex justify-between items-center">
            <div className={'grow flex items-center justify-center'}>
                <NavLink to="/">
                    <img src="planete.png" alt="Planete" className="h-10 w-10" onClick={()=> navigate("/game")} />
                </NavLink>
            </div>
            <div
                className="cursor-pointer absolute inset-y-1 right-2 max-h-12"
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
