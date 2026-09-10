'use client';

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { wordList, phonemeDictionary, WordSearchWord } from '../data/Phonemes';
import '../../Styling/WordSearch.css';
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';

const MIN_DIMENSION = 5;
const MAX_DIMENSION = 15;
const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 10;
const WORDS_PER_PUZZLE = 5;
const MAX_PLACEMENT_ATTEMPTS = 200;

// right, down, diagonal down-right, diagonal down-left
const DIRECTIONS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

type PlacedWord = {
  word: WordSearchWord;
  cells: [number, number][];
};

type Puzzle = {
  grid: string[][];
  placedWords: PlacedWord[];
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const generatePuzzle = (rows: number, cols: number): Puzzle => {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
  const selectedWords = shuffle(wordList).slice(0, WORDS_PER_PUZZLE);
  const placedWords: PlacedWord[] = [];

  selectedWords.forEach(word => {
    const length = word.phonemes.length;

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

      const minStartRow = 0;
      const maxStartRow = rows - 1 - dr * (length - 1);
      const minStartCol = dc < 0 ? (length - 1) * -dc : 0;
      const maxStartCol = dc > 0 ? cols - 1 - dc * (length - 1) : cols - 1;

      if (maxStartRow < minStartRow || maxStartCol < minStartCol) continue;

      const startRow = minStartRow + Math.floor(Math.random() * (maxStartRow - minStartRow + 1));
      const startCol = minStartCol + Math.floor(Math.random() * (maxStartCol - minStartCol + 1));

      const cells: [number, number][] = Array.from({ length }, (_, i) => [startRow + dr * i, startCol + dc * i]);
      const fits = cells.every(([r, c], i) => {
        const existing = grid[r][c];
        return existing === null || existing === word.phonemes[i];
      });

      if (fits) {
        cells.forEach(([r, c], i) => { grid[r][c] = word.phonemes[i]; });
        placedWords.push({ word, cells });
        break;
      }
    }
  });

  const phonemeKeys = Object.keys(phonemeDictionary);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = phonemeKeys[Math.floor(Math.random() * phonemeKeys.length)];
      }
    }
  }

  return { grid: grid as string[][], placedWords };
};

const isCellPlaced = (placedWords: PlacedWord[], row: number, col: number): boolean =>
  placedWords.some(pw => pw.cells.some(([r, c]) => r === row && c === col));

// Straight-line path (horizontal, vertical, or diagonal) between two cells, inclusive.
// Returns null if the two cells don't share a row, column, or diagonal.
const getLinePath = (start: [number, number], end: [number, number]): [number, number][] | null => {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  return Array.from({ length: steps + 1 }, (_, i) => [r1 + stepR * i, c1 + stepC * i]);
};

const cellsMatch = (a: [number, number][], b: [number, number][]): boolean =>
  a.length === b.length && a.every(([r, c], i) => r === b[i][0] && c === b[i][1]);

const pathMatchesWord = (path: [number, number][], wordCells: [number, number][]): boolean =>
  cellsMatch(path, wordCells) || cellsMatch(path, [...wordCells].reverse());

const buildStandaloneHtml = (puzzle: Puzzle): string => {
  const gridRows = puzzle.grid.map((row, r) => {
    const cells = row.map((phoneme, c) => {
      const placedClass = isCellPlaced(puzzle.placedWords, r, c) ? ' placed' : '';
      return `<div class="cell${placedClass}" data-row="${r}" data-col="${c}">${phoneme}</div>`;
    }).join('');
    return `<div class="row">${cells}</div>`;
  }).join('');

  const wordRows = puzzle.placedWords.map((pw, i) => {
    const phonemeCells = pw.word.phonemes.map(p => `<span class="ws-phoneme-cell">${p}</span>`).join('');
    return `<div class="ws-word-row" data-word-index="${i}">${phonemeCells}<span class="answer">${pw.word.english}</span></div>`;
  }).join('');

  const wordsData = JSON.stringify(puzzle.placedWords.map(pw => pw.cells));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phoneme Word Search</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #ffffff; color: #1a1a1a; text-align: center; padding: 2rem 1rem; }
  h1 { margin-bottom: 1.5rem; }
  .grid-board { display: flex; flex-direction: column; gap: 4px; align-items: center; margin-bottom: 2rem; user-select: none; }
  .row { display: flex; gap: 4px; }
  .cell { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 2px solid #1a1a1a; box-sizing: border-box; font-size: 0.9rem; text-transform: uppercase; cursor: pointer; }
  body.show-answers .placed { background-color: goldenrod; color: white; }
  .cell-selecting { background-color: #7fb3ff; color: white; }
  .cell-found { background-color: green; color: white; }
  .word-list-rows { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .ws-word-row { display: flex; align-items: center; gap: 4px; }
  .ws-phoneme-cell { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #1a1a1a; border-radius: 4px; font-size: 0.85rem; background-color: #eeeeee; }
  .ws-word-found .ws-phoneme-cell { background-color: green; color: white; border-color: green; }
  .answer { display: none; margin-left: 0.5rem; font-style: italic; opacity: 0.8; }
  body.show-answers .answer, .ws-word-found .answer { display: inline; }
  button { padding: 10px 20px; font-size: 1rem; cursor: pointer; background-color: #eeeeee; border: none; border-radius: 6px; margin-bottom: 2rem; }
</style>
</head>
<body>
  <h1>Phoneme Word Search</h1>
  <p>Drag across a word to find it.</p>
  <button id="toggle-answers">Show Answers</button>
  <div class="grid-board">${gridRows}</div>
  <div class="word-list-rows">${wordRows}</div>
  <script>
    document.getElementById('toggle-answers').addEventListener('click', function () {
      document.body.classList.toggle('show-answers');
      this.textContent = document.body.classList.contains('show-answers') ? 'Hide Answers' : 'Show Answers';
    });

    var wordsData = ${wordsData};
    var foundWords = new Set();
    var isDragging = false;
    var dragStart = null;
    var dragEnd = null;

    function getLinePath(start, end) {
      var dr = end[0] - start[0];
      var dc = end[1] - start[1];
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
      var steps = Math.max(Math.abs(dr), Math.abs(dc));
      var stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      var stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      var path = [];
      for (var i = 0; i <= steps; i++) path.push([start[0] + stepR * i, start[1] + stepC * i]);
      return path;
    }

    function cellsMatch(a, b) {
      if (a.length !== b.length) return false;
      return a.every(function (cell, i) { return cell[0] === b[i][0] && cell[1] === b[i][1]; });
    }

    function pathMatchesWord(path, wordCells) {
      return cellsMatch(path, wordCells) || cellsMatch(path, wordCells.slice().reverse());
    }

    function getCellEl(r, c) {
      return document.querySelector('.cell[data-row="' + r + '"][data-col="' + c + '"]');
    }

    function clearSelecting() {
      document.querySelectorAll('.cell-selecting').forEach(function (el) { el.classList.remove('cell-selecting'); });
    }

    function highlightPath(path) {
      clearSelecting();
      path.forEach(function (cell) {
        var el = getCellEl(cell[0], cell[1]);
        if (el) el.classList.add('cell-selecting');
      });
    }

    document.querySelectorAll('.cell').forEach(function (cellEl) {
      var r = parseInt(cellEl.dataset.row, 10);
      var c = parseInt(cellEl.dataset.col, 10);

      cellEl.addEventListener('mousedown', function () {
        isDragging = true;
        dragStart = [r, c];
        dragEnd = [r, c];
        highlightPath([dragStart]);
      });

      cellEl.addEventListener('mouseover', function () {
        if (!isDragging) return;
        dragEnd = [r, c];
        var path = getLinePath(dragStart, dragEnd);
        if (path) highlightPath(path);
      });
    });

    window.addEventListener('mouseup', function () {
      if (isDragging && dragStart && dragEnd) {
        var path = getLinePath(dragStart, dragEnd);
        if (path) {
          wordsData.forEach(function (cells, index) {
            if (!foundWords.has(index) && pathMatchesWord(path, cells)) {
              foundWords.add(index);
              cells.forEach(function (cell) {
                var el = getCellEl(cell[0], cell[1]);
                if (el) el.classList.add('cell-found');
              });
              var wordRow = document.querySelector('.ws-word-row[data-word-index="' + index + '"]');
              if (wordRow) wordRow.classList.add('ws-word-found');
            }
          });
        }
      }
      isDragging = false;
      dragStart = null;
      dragEnd = null;
      clearSelecting();
    });
  </script>
</body>
</html>`;
};

export default function WordSearch() {

  const [rows, setRows] = useState<number>(DEFAULT_ROWS);
  const [cols, setCols] = useState<number>(DEFAULT_COLS);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [foundWords, setFoundWords] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number] | null>(null);

  useEffect(() => {
    setPuzzle(generatePuzzle(DEFAULT_ROWS, DEFAULT_COLS));
  }, []);

  const handleGeneratePuzzle = () => {
    setPuzzle(generatePuzzle(rows, cols));
    setShowAnswers(false);
    setFoundWords(new Set());
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setDragStart([row, col]);
    setDragEnd([row, col]);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    setDragEnd([row, col]);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging && dragStart && dragEnd && puzzle) {
        const path = getLinePath(dragStart, dragEnd);
        if (path) {
          puzzle.placedWords.forEach((pw, index) => {
            if (!foundWords.has(index) && pathMatchesWord(path, pw.cells)) {
              setFoundWords(prev => new Set(prev).add(index));
            }
          });
        }
      }
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragStart, dragEnd, puzzle, foundWords]);

  const handleDimensionChange = (setter: (value: number) => void) => (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setter(Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, parsed)));
  };

  const isPlacedCell = (row: number, col: number): boolean => {
    if (!puzzle) return false;
    return isCellPlaced(puzzle.placedWords, row, col);
  };

  const isSelectingCell = (row: number, col: number): boolean => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    const path = getLinePath(dragStart, dragEnd);
    return path ? path.some(([r, c]) => r === row && c === col) : false;
  };

const isFoundCell = (row: number, col: number): boolean => {
    if (!puzzle) return false;
    return puzzle.placedWords.some((pw, index) => foundWords.has(index) && pw.cells.some(([r, c]) => r === row && c === col));
};

const downloadHtmlFile = () => {
    if (!puzzle) return;
    const html = buildStandaloneHtml(puzzle);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phoneme-word-search.html';
    link.click();
    URL.revokeObjectURL(url);
};

return (
    <div className="page">
    <div className = "header-wordsearch">
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - Word Search</h1>
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

    <div className='grid-size-control'>
        <label htmlFor="rows">Rows</label>
        <input
        id="rows"
        type="number"
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
        value={rows}
        onChange={(e) => handleDimensionChange(setRows)(e.target.value)}
        />

        <label htmlFor="cols">Cols</label>
        <input
        id="cols"
        type="number"
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
        value={cols}
        onChange={(e) => handleDimensionChange(setCols)(e.target.value)}
        />

        <button className='btn' onClick={handleGeneratePuzzle}>Generate Puzzle</button>
        <button className='btn' onClick={() => setShowAnswers(prev => !prev)}>
        {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>
        <button className='btn' onClick={downloadHtmlFile}>Download HTML</button>
    </div>

    <div className = 'grid-board'>
        {puzzle?.grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
            <div
                key={`${rowIndex}-${colIndex}`}
                className={[
                'cell',
                showAnswers && isPlacedCell(rowIndex, colIndex) ? 'cell-highlight' : '',
                isSelectingCell(rowIndex, colIndex) ? 'cell-selecting' : '',
                isFoundCell(rowIndex, colIndex) ? 'cell-found' : '',
                ].filter(Boolean).join(' ')}
                onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
            >
                {cell}
            </div>
            ))}
        </div>
        ))}
    </div>

    <div className='word-list'>
        <h2>Word List</h2>
        <div className='word-list-rows'>
        {puzzle?.placedWords.map((placedWord, i) => {
            const isFound = foundWords.has(i);
            return (
            <div key={i} className={`ws-word-row ${isFound ? 'ws-word-found' : ''}`}>
                {placedWord.word.phonemes.map((phoneme, j) => (
                <span
                    key={j}
                    className='ws-phoneme-cell'
                    title={`${phonemeDictionary[phoneme]?.label} (as in ${phonemeDictionary[phoneme]?.example})`}
                >
                    {phoneme}
                </span>
                ))}
                {(showAnswers || isFound) && <span className='ws-word-english'>{placedWord.word.english}</span>}
            </div>
            );
        })}
        </div>
    </div>

    <Footer />




    </div>
    
    );
}