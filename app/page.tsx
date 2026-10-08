'use client';

import HamburgerMenu from './Components/HamburgerMenu';
import Link from 'next/link'
import PhonemeChip from './Components/PhonemeChip';
import Footer from './Components/Footer';
import { phonemeDictionary } from './data/Phonemes';

const teaserSymbols = ['θ', 'tʃ', 's', 'ʃ', 'ð'];

export default function Home() {

  return (

    <div className="page">
      <div className = "header-home">
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - Home</h1>
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

        <Link href="/dashboard"
        className="btn">
            DASHBOARD
        </Link>

        <Link href="/about"
        className="btn">
          ABOUT
        </Link>

        <HamburgerMenu/>

      </div>

      <div className='Home-paragraph'>
        <p>This tool helps Speech Pathology teachers build phoneme-based classroom activies
          an interactive Wordle which is fixed currently for now. A phoneme Word Search, preview it,
          and export it as a ready to play activity for students.
        </p>
      </div>

      <div className='how-it-works'>
        <h2>How it works</h2>
        <div className='how-it-works-steps'>
          <div className='step'>
            <span className='step-number'>1</span>
            <p>Pick an activity — Wordle or Word Search.</p>
          </div>
          <div className='step'>
            <span className='step-number'>2</span>
            <p>Hover over phoneme buttons to see their English sound.</p>
          </div>
          <div className='step'>
            <span className='step-number'>3</span>
            <p>Play, then export as a ready-to-use HTML activity.</p>
          </div>
        </div>
      </div>

      <div className='phoneme-teaser'>
        <h2>Phoneme hints, at a glance</h2>
        <p>Every phoneme button shows its English sound on hover — try one below.</p>
        <div className='phoneme-teaser-row'>
          {teaserSymbols.map(symbol => (
            <PhonemeChip key={symbol} symbol={symbol} entry={phonemeDictionary[symbol]} />
          ))}
        </div>
      </div>

      <Footer />

    </div>



  );
}
