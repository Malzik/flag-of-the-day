import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function useDarkSide(): [Theme, React.Dispatch<React.SetStateAction<Theme>>] {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme') as Theme;
        return storedTheme || 'light';
    });

    const colorTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(colorTheme);
        root.classList.add(theme);

        localStorage.setItem('theme', theme);
    }, [theme, colorTheme]);

    return [colorTheme, setTheme];
}
