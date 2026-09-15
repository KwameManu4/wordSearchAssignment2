'use client';

import Link from 'next/link'
import {phonemeDictionary} from '../data/Phonemes';
import { useState, useEffect } from 'react';
import '../../Styling/Wordle.css';
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';


const buildStandaloneHtml = (targetWord: string[]): string => {
  const gridRows = Array.from({ length: 6 }, (_, r) => {
    const cells = Array.from({ length: targetWord.length }, (_, c) => `<div class="cell" data-row="${r}" data-col="${c}"></div>`).join('');
    return `<div class="grid-row" data-row="${r}">${cells}</div>`;
  }).join('');

  const keyboardButtons = Object.entries(phonemeDictionary).map(([symbol, entry]) =>
    `<button class="phoneme-btn" data-symbol="${symbol}" title="${entry.label} (as in ${entry.example})">${symbol}</button>`
  ).join('');

  const targetWordData = JSON.stringify(targetWord);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phoneme Wordle</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #1a1a1a; color: #f5f5f5; text-align: center; padding: 2rem 1rem; }
  h1 { margin-bottom: 1.5rem; }
  .grid-board { display: flex; flex-direction: column; gap: 5px; align-items: center; margin-bottom: 2rem; }
  .grid-row { display: flex; gap: 5px; perspective: 1000px; }
  .cell { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border: 2px solid #f5f5f5; box-sizing: border-box; font-size: 0.9rem; text-transform: uppercase; }
  .cell-correct { background-color: green; color: white; }
  .cell-present { background-color: goldenrod; color: white; }
  .cell-absent { background-color: gray; color: white; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-15px); } 75% { transform: translateX(15px); } }
  .shake { animation: shake 0.1s; }
  @keyframes flip { 0% { transform: rotateX(0deg); } 50% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }
  .flip { animation: flip 0.5s ease; }
  .keyboard { display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 4px; max-width: 420px; margin: 1rem auto; }
  .phoneme-btn { padding: 6px; font-size: 0.8rem; cursor: pointer; background-color: #333333; color: #f5f5f5; border: none; border-radius: 4px; }
  .phoneme-btn:hover { background-color: #f5f5f5; color: #1a1a1a; }
  .backSpace-submit { display: flex; flex-direction: row; gap: 5px; align-items: center; justify-content: center; margin-top: 1rem; }
  .submit-btn, .backspace-btn { width: 110px; padding: 6px; font-size: 1.1rem; cursor: pointer; background-color: #333333; color: #f5f5f5; border: none; border-radius: 6px; }
  .submit-btn:hover, .backspace-btn:hover { background-color: #f5f5f5; color: #1a1a1a; }
  .message { min-height: 1.5rem; margin-top: 1rem; font-size: 1rem; }
</style>
</head>
<body>
  <h1>Phoneme Wordle</h1>
  <div class="grid-board">${gridRows}</div>
  <div class="keyboard">${keyboardButtons}</div>
  <div class="backSpace-submit">
    <button id="submit-btn" class="submit-btn">Submit</button>
    <button id="backspace-btn" class="backspace-btn">←</button>
  </div>
  <div class="message" id="message"></div>
  <script>
    var targetWord = ${targetWordData};
    var guessedWords = [];
    var currentGuess = [];

    var statusClass = { correct: 'cell-correct', present: 'cell-present', absent: 'cell-absent' };
    var statusRank = { absent: 0, present: 1, correct: 2 };

    function getGuessFeedback(guess) {
      return guess.map(function (phoneme, index) {
        if (phoneme === targetWord[index]) return 'correct';
        if (targetWord.indexOf(phoneme) !== -1) return 'present';
        return 'absent';
      });
    }

    function renderGuessedRows() {
      guessedWords.forEach(function (guess, rowIndex) {
        var feedback = getGuessFeedback(guess);
        guess.forEach(function (symbol, colIndex) {
          var cell = document.querySelector('.cell[data-row="' + rowIndex + '"][data-col="' + colIndex + '"]');
          if (cell) {
            cell.textContent = symbol;
            cell.className = 'cell ' + statusClass[feedback[colIndex]];
          }
        });
      });
    }

    function renderCurrentRow() {
      var rowIndex = guessedWords.length;
      for (var c = 0; c < targetWord.length; c++) {
        var cell = document.querySelector('.cell[data-row="' + rowIndex + '"][data-col="' + c + '"]');
        if (cell) cell.textContent = currentGuess[c] || '';
      }
    }

    function updateKeyStatuses() {
      var statuses = {};
      guessedWords.forEach(function (guess) {
        getGuessFeedback(guess).forEach(function (status, index) {
          var symbol = guess[index];
          if (!statuses[symbol] || statusRank[status] > statusRank[statuses[symbol]]) {
            statuses[symbol] = status;
          }
        });
      });
      document.querySelectorAll('.phoneme-btn').forEach(function (btn) {
        var symbol = btn.dataset.symbol;
        btn.className = 'phoneme-btn' + (statuses[symbol] ? ' ' + statusClass[statuses[symbol]] : '');
      });
    }

    function shakeCurrentRow() {
      var row = document.querySelector('.grid-row[data-row="' + guessedWords.length + '"]');
      if (!row) return;
      row.classList.add('shake');
      setTimeout(function () { row.classList.remove('shake'); }, 100);
    }

    function flipRow(rowIndex) {
      var row = document.querySelector('.grid-row[data-row="' + rowIndex + '"]');
      if (!row) return;
      Array.from(row.children).forEach(function (cell, i) {
        cell.style.animationDelay = (i * 0.2) + 's';
        cell.classList.add('flip');
      });
    }

    document.querySelectorAll('.phoneme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (currentGuess.length < targetWord.length) {
          currentGuess.push(btn.dataset.symbol);
          renderCurrentRow();
        }
      });
    });

    document.getElementById('backspace-btn').addEventListener('click', function () {
      currentGuess.pop();
      renderCurrentRow();
    });

    document.getElementById('submit-btn').addEventListener('click', function () {
      if (currentGuess.length === targetWord.length) {
        var submittedRowIndex = guessedWords.length;
        guessedWords.push(currentGuess);
        currentGuess = [];
        renderGuessedRows();
        flipRow(submittedRowIndex);
        updateKeyStatuses();
        renderCurrentRow();
        if (guessedWords[submittedRowIndex].every(function (s, i) { return s === targetWord[i]; })) {
          document.getElementById('message').textContent = 'You got it!';
        } else if (guessedWords.length >= 6) {
          document.getElementById('message').textContent = 'Out of guesses. The word was: ' + targetWord.join(' ');
        }
      } else {
        shakeCurrentRow();
      }
    });
  </script>
</body>
</html>`;
};

export default function Wordle() {

  const [guessedWords, setGuessedWords] = useState<string[][]>([]);

const [currentGuess, setCurrentGuess] = useState<string[]>([]);

const [isInvalidGuess, setIsInvalidGuess] = useState(false);

const [flippingRow, setFlippingRow] = useState<number | null> (null);

const [targetWord, setTargetWord] = useState<string[]>([]);

const fetchTargetWord = async () => {
  try{
    const res = await fetch ('/api/words')
    if (res.ok) {
      const allWords = await res.json();

      if (allWords.length === 0) return;
      const word = allWords[0];

      const phonemeRes = await fetch(`/api/Phoneme?wordId=${word.id}`);
      if (phonemeRes.ok) {
        const phonemes = await phonemeRes.json();
        setTargetWord(phonemes.map((p: {symbol: string}) => p.symbol));
      }
    }
  }catch(error){
    console.error('Error fetching words', error)
  }
};

useEffect(() => {
  fetchTargetWord();
}, []);

const handleBackSpace = () => {
  setCurrentGuess(prev => prev.slice(0,-1))
}

const downloadHtmlFile = () => {
  if (targetWord.length === 0) return;
  const html = buildStandaloneHtml(targetWord);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'phoneme-wordle.html';
  link.click();
  URL.revokeObjectURL(url);
};

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

      <button className='btn download-html-btn' onClick={downloadHtmlFile}>Download HTML</button>


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
