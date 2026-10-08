'use client'
import { useState } from 'react';
import Link from 'next/link';
import styles from '../../styling/Hamburgermenu.module.css';
import { useTheme } from './ThemeContext';

const HamburgerMenu = () => {
const [isOpen, setIsOpen] = useState(false);
const { darkMode, toggleDarkMode } = useTheme();

const toggleMenu = () => {
    setIsOpen(!isOpen);
};

return (
    <div className={styles.container}>
    <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
    </div>
    <nav className={isOpen ? styles.menuOpen : styles.menu}>
        <ul>
        <li><Link href="/settings" onClick={() => setIsOpen(false)}>Settings</Link></li>
        <li>
            <button className={styles.menuToggleBtn} onClick={toggleDarkMode}>
                {darkMode ? 'Light' : 'Dark'} Mode
            </button>
        </li>
        </ul>
    </nav>
    </div>
    );
};

export default HamburgerMenu;