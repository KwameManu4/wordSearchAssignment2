'use client';

import Link from 'next/link'
import HamburgerMenu from './../Components/HamburgerMenu';
import Footer from './../Components/Footer';

export default function Settings() {

  return (
    <div className="page">
      <div className = "header-settings">
        <h1 style={{ fontSize: 32 }}>Assessment 1: Frontend design and usability - Settings</h1>
      </div>
    
      <div className='navbar'>

        

        <Link href="/"
          className="btn">
            HOME
            </Link>

        <Link href="/wordle"
        className="btn">
          WORDLE
          </Link>

        <Link href="/wordsearch"
        className="btn">
          WORD SEARCH
        </Link>

        <Link href="/manage"
        className="btn">
            MANAGE
        </Link>

        <Link href="/about"
        className="btn">
          ABOUT
        </Link>

        <HamburgerMenu/>

      </div>

      <Footer />

    </div>

  );
}
