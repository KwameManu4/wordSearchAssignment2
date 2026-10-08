'use client';

import Link from 'next/link'
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';
import '../../styling/Manage.css';
import { phonemeDictionary } from '../data/Phonemes';


import {useState, useEffect} from 'react';

type WordList = {
    id:number;
    name: string;
}

type Word = {
  id:number;
  english: string;
  wordListId:number;
}

type Phoneme = {
  id: number;
  symbol: string;
  wordId: number;
}

export default function Manage() {

    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [newListName, setNewListName] = useState('');
    const [editingListId, setEditingListId] = useState<number | null>(null);
    const [editListName, setEditListName] = useState('');
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWordListId, setSelectedWordListId] = useState<number | null>(null);
    const [newWordEnglish, setNewWordEnglish] = useState('');
    const [editingWordId, setEditingWordId] = useState<number | null>(null);
    const [editWordEnglish, setEditWordEnglish] = useState('');
    const [phoneme, setPhoneme] = useState<Phoneme[]>([]);
    const [newSymbol, setSymbol] = useState('');
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
    const [showPhonemeKeyboard, setShowPhonemeKeyboard] = useState(false);

    

    const fetchWordList = async () => {
      try{
        const res = await fetch ('/api/wordlist');
        if (res.ok) {
          const data = await res.json();
          setWordLists(data);
        }
      } catch(error) {
        console.error('Error fetching Word List:', error);
      }
    };

    const deleteWordList = async (id: number) => {
      const res = await fetch(`/api/wordlist?id=${id}`,{
        method: 'DELETE',
      });
      if(res.ok){
        if(selectedWordListId === id){
          setSelectedWordListId(null);
          setSelectedWordId(null);
          setWords([]);
          setPhoneme([]);
        }
        fetchWordList();
      }
    }

    const selectWordList = (id: number) => {
      if (id === selectedWordListId) return;
      setSelectedWordListId(id);
      setWords([]);
      setSelectedWordId(null);
      setPhoneme([]);
      setSymbol('');
      setShowPhonemeKeyboard(false);
      setEditingWordId(null);
      setEditWordEnglish('');
      setNewWordEnglish('');
    };

    const startEditList = (list: WordList) => {
      setEditingListId(list.id);
      setEditListName(list.name);
    }

    const saveListEdit = async (id: number) => {
      if (!editListName) return;

      const res = await fetch(`/api/wordlist?id=${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: editListName}),
      });
      if (res.ok){
        setEditingListId(null);
        setEditListName('');
        fetchWordList();
      }
    }

    useEffect(() => {
      fetchWordList()

    }, []);

    const addWord = async () => {
      if (!newListName) return;

      const res = await fetch('/api/wordlist', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name:newListName}),
      });
      if (res.ok){
        setNewListName('');
        fetchWordList();
      }
    }

    const fetchWord = async () => {
      try{
        const res = await fetch(`/api/words?wordListId=${selectedWordListId}`);
        if (res.ok){
          const data = await res.json();
          setWords(data);
        }
      } catch(error){
        console.error('Error fetching Word', error);
      }
    };
    
    const deleteWord = async (id:number) => {
      const res = await fetch(`/api/words?id=${id}`,{
        method: 'DELETE',

      });
      if(res.ok){
        if(selectedWordId === id){
          setSelectedWordId(null);
        }
        fetchWord();
      }
    };

    const startEditWord = (word: Word) => {
      setEditingWordId(word.id);
      setEditWordEnglish(word.english);
    }

    const saveWordEdit = async (id: number) => {
      if (!editWordEnglish) return;

      const res = await fetch(`/api/words?id=${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({english: editWordEnglish}),
      });
      if (res.ok){
        setEditingWordId(null);
        setEditWordEnglish('');
        fetchWord();
      }
    }

    useEffect(() =>{
      if (selectedWordListId === null) return;

      fetchWord()

    },[selectedWordListId])

    const addNewWord = async () => {
      if (!newWordEnglish || !selectedWordListId) return;

      const res = await fetch('/api/words',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({english: newWordEnglish, wordListId:selectedWordListId})
      });
      if (res.ok){
        setNewWordEnglish('');
        fetchWord();
      }
    }

    useEffect(() => {
      if (selectedWordId === null) return;
      setSymbol('');
      fetchPhoneme();
    },[selectedWordId]);

    

    const addPhoneme = async () => {
      if (!selectedWordId || !newSymbol) return;

      const res = await fetch('/api/Phoneme',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({wordId: selectedWordId, symbol:newSymbol, position:phoneme.length})
      });
      if (res.ok){
        setSymbol('');
        fetchPhoneme();
      }
      
    }

    const fetchPhoneme = async () => {
      try{
        const res = await fetch(`/api/Phoneme?wordId=${selectedWordId}`);
        if(res.ok){
          const data = await res.json();
          setPhoneme(data);
        }
        }catch(error){
          console.error('Error fetching Phoneme', error)
      }
    }

    const deletePhoneme = async (id:number) => {
      const res = await fetch(`/api/Phoneme?id=${id}`,{
        method:'DELETE',
      });
      if(res.ok){
        fetchPhoneme();
      }
    };









    return (
    <div className="page">
      <div className = "header-settings">
        <h1 style={{ fontSize: 32 }}>Assessment 3:  Manage my Words</h1>
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

      <div className="manage-section">
        <h2>Word List</h2>
        <div className="manage-add-row">
          <input
          className="manage-input"
          type = "text"
          value = {newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder = "Enter new list"
          />
          <button className="manage-btn" onClick={addWord}>Add List</button>
        </div>

        <ul className="manage-list">
          {wordLists.length === 0 && <li className="manage-empty">No word lists yet</li>}
          {wordLists.map((list) => (
            <li key={list.id} className={`manage-list-item${selectedWordListId === list.id ? ' selected' : ''}`}>
              {editingListId === list.id ? (
                <>
                  <input
                  className="manage-input"
                  type = "text"
                  value = {editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                  />
                  <button className="manage-btn" onClick={() => saveListEdit(list.id)}>Save</button>
                </>
              ) : (
                <>
                  <span className="manage-list-item-name" onClick={() => selectWordList(list.id)}>{list.name}</span>
                  <button className="manage-btn" onClick={() => startEditList(list)}>Edit</button>
                  <button className="manage-btn manage-btn-delete" onClick={() => deleteWordList(list.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

{selectedWordListId !== null && (
  <div className="manage-section">
    <h2>Words in this list</h2>
    <ul className="manage-list">
      {words.length === 0 && <li className="manage-empty">No words in this list yet</li>}
      {words.map((word) => (
        <li key={word.id} className={`manage-list-item${selectedWordId === word.id ? ' selected' : ''}`}>
          {editingWordId === word.id ? (
            <>
              <input
              className="manage-input"
              type = "text"
              value = {editWordEnglish}
              onChange={(e) => setEditWordEnglish(e.target.value)}
              />
              <button className="manage-btn" onClick={() => saveWordEdit(word.id)}>Save</button>
            </>
          ) : (
            <>
              <span className="manage-list-item-name" onClick = {()=> setSelectedWordId(word.id)}>{word.english}</span>
              <button className="manage-btn" onClick={() => startEditWord(word)}>Edit</button>
              <button className="manage-btn manage-btn-delete" onClick ={()=> deleteWord(word.id)}>Delete</button>
            </>
          )}
          </li>
      ))}
    </ul>

    <div className="manage-add-row">
      <input
      className="manage-input"
      type = 'text'
      value = {newWordEnglish}
      onChange={(e)=> setNewWordEnglish(e.target.value)}
      placeholder = "Enter new word"
      />
      <button className="manage-btn" onClick={addNewWord}>Add word to list</button>
    </div>
  </div>
)}

{selectedWordId !== null && (
  <div className="manage-section">
    <h2>Phonemes for this word</h2>
    <ul className="manage-list">
      {phoneme.length === 0 && <li className="manage-empty">No phonemes yet</li>}
      {phoneme.map((p) => (
        <li key = {p.id} className="manage-list-item">
          <span className="manage-list-item-name">{p.symbol}</span>
          <button className="manage-btn manage-btn-delete" onClick = {()=> deletePhoneme(p.id)}>Delete</button>
          </li>
      ))}
    </ul>

    <div className="manage-add-row">
      <input
      className="manage-input"
      type = "text"
      value = {newSymbol}
      onChange={(e) => setSymbol(e.target.value)}
      onFocus={() => setShowPhonemeKeyboard(true)}
      onBlur={() => setShowPhonemeKeyboard(false)}
      placeholder="Enter phoneme symbol"
      />
      <button className="manage-btn" onClick = {addPhoneme}>Add phoneme</button>
    </div>

    {showPhonemeKeyboard && (
      <div className="manage-mini-keyboard" onMouseDown={(e) => e.preventDefault()}>
        {Object.entries(phonemeDictionary).map(([symbol, entry]) => (
          <button
          key={symbol}
          title={`${entry.label} (as in ${entry.example})`}
          onClick={() => setSymbol(symbol)}>
            {symbol}
          </button>
        ))}
      </div>
    )}
    </div>
)}

      <Footer />
    </div>
  );
}
