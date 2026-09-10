'use client';

import {createContext, useContext, useState, useEffect} from 'react';

type ThemeContextType = {
    darkMode: boolean;
    toggleDarkMode: () => void;


};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}){
    const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
    setDarkMode(savedTheme === 'dark');
    } else {
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
}, []);

useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
}, [darkMode]);

const toggleDarkMode = () => {
    setDarkMode(prev => {
    const next = !prev;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
    });
};

return (
    <ThemeContext.Provider value = {{darkMode, toggleDarkMode}}>
        {children}
    </ThemeContext.Provider>
);
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}