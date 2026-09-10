'use client';

import Link from 'next/link'
import {phonemeDictionary, targetWord} from '../data/Phonemes';
import { useState } from 'react';
import '../../Styling/Wordle.css';
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';


export default function Wordle() {

  const [guessedWords, setGuessedWords] = useState<string[][]>([]);

const [currentGuess, setCurrentGuess] = useState<string[]>([]);

const [isInvalidGuess, setIsInvalidGuess] = useState(false);

const [flippingRow, setFlippingRow] = useState<number | null> (null);

const handleBackSpace = () => {
  setCurrentGuess(prev => prev.slice(0,-1))
}

const handlePhonemeClick = (symbol:string) => {
    setCurrentGuess(prev=> prev.length < targetWord.length ? [...prev, symbol] : prev);
};

const handleSubmit = () => {
  if (currentGuess.length === targetWord.length) {
    const submittedRowIndex = guessedWords.length;
    setGuessedWords(prev => [...prev, currentGuess]);
    setCurrentGuess([]);
    setFlippingRow(submittedRowIndex);
  } else {
    (setIsInvalidGuess(true));
    setTimeout(()=> setIsInvalidGuess(false),500);
  }
};

type PhonemeStatus = 'correct' | 'present' | 'absent';

const statusColorMap: Record<PhonemeStatus, string> = {
  correct: 'cell-correct',
  present: 'cell-present',
  absent: 'cell-absent',
};

const getGuessFeedback = (guess:string[]): PhonemeStatus[]=> {
  return guess.map((phoneme, index) =>{
    if (phoneme === targetWord[index]){
      return 'correct';
    }else if (targetWord.includes(phoneme)){
      return 'present';
    }else {
      return 'absent';
    }

  });
};



const getCellValue = (rowIndex: number, columnIndex: number): string => {
  if (rowIndex < guessedWords.length){
    return guessedWords[rowIndex][columnIndex];
  }

  if (rowIndex === guessedWords.length){
    return currentGuess[columnIndex] ?? '';
  }

  return '';


}

const getCellStatus = (rowIndex: number, columnIndex: number): PhonemeStatus | null => {
  if (rowIndex < guessedWords.length) {
    const feedback = getGuessFeedback(guessedWords[rowIndex]);
    return feedback[columnIndex];
  }
  return null;
};

const getCellClassName = (rowIndex: number, columnIndex: number): string => {
  const status = getCellStatus(rowIndex, columnIndex);
  return status ? statusColorMap[status] : '';
};

const statusRank: Record<PhonemeStatus, number> = { absent: 0, present: 1, correct: 2 };

const getKeyStatuses = (): Record<string, PhonemeStatus> => {
  const statuses: Record<string, PhonemeStatus> = {};
  guessedWords.forEach(guess => {
    getGuessFeedback(guess).forEach((status, index) => {
      const symbol = guess[index];
      const existing = statuses[symbol];
      if (!existing || statusRank[status] > statusRank[existing]) {
        statuses[symbol] = status;
      }
    });
  });
  return statuses;
};




  
  return (
    <div className="page">
      <div className = "header-wordle">
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - Wordle</h1>
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

      


      <div className='grid-board'>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid-row ${rowIndex === guessedWords.length && isInvalidGuess ? 'shake' : ''}`}
          >
            {Array.from({ length: targetWord.length }).map((_, columnIndex) => (
              <div
                key={columnIndex}
                className={`${getCellClassName(rowIndex, columnIndex)} ${rowIndex === flippingRow ? 'flip' : ''}`}
                style={rowIndex === flippingRow ? { animationDelay: `${columnIndex * 0.2}s` } : {}}
              >
                {getCellValue(rowIndex, columnIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>


      <div className = 'keyboard'>
        {(() => { const keyStatuses = getKeyStatuses(); return Object.entries(phonemeDictionary).map(([symbol,entry]) => {
          const keyStatus = keyStatuses[symbol];
          return (
            <button
              className={`phoneme-btn ${keyStatus ? statusColorMap[keyStatus] : ''}`}
              title={`${entry.label} (as in ${entry.example})`}
              key={symbol}
              onClick={() => handlePhonemeClick(symbol)}>
              {symbol}
            </button>
          );
      }); })()}
      </div>

      <div className = 'backSpace-submit'>

        <button className = 'submit-btn' onClick={handleSubmit}>
        Submit
      </button>

      <button className = "backspace-btn" onClick={handleBackSpace}>
      ← 
      </button>

      </div>

      <Footer />

    </div>
  );
}
