'use client';

import Link from 'next/link'
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';


export default function About() {

  return (
    <div className="page">

      <div className = "header-about">
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - About</h1>
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
        <p>This is a phoneme-based activity builder made for Speech Pathology teachers
          and students. The idea is to make it easy to whip up quick classroom games that
          focus on specific speech sounds, using proper IPA phoneme symbols instead of
          standard spelling.
        </p>
      </div>

      <div className='assessment-note'>
        <p>Right now, this is Assessment 1 of the project, so everything you&apos;re seeing is
          frontend only — there&apos;s no database or backend yet, and the words are fixed
          rather than customizable. That part&apos;s coming in a later assessment.
        </p>
      </div>

      

      <div className='how-it-works'>
        <h2>About me</h2>
        <div className='how-it-works-steps'>
          <div className='step'>
            <p>Elijah Manu</p>
            <p>Student Number: 21624236</p>
          </div>
        </div>
      </div>

      <div className='phoneme-teaser'>
        <h2>Video walkthrough</h2>
        <div className='video-placeholder'>
          <video controls src="/videos/about-walkthrough.mp4" className='walkthrough-video' />
        </div>
      </div>

      <Footer />

    </div>
  );
}
