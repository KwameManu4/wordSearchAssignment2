'use client';

import Link from 'next/link'
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';


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
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWordListId, setSelectedWordListId] = useState<number | null>(null);
    const [newWordEnglish, setNewWordEnglish] = useState('');
    const [phoneme, setPhoneme] = useState<Phoneme[]>([]);
    const [newSymbol, setSymbol] = useState('');
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

    

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
        fetchWord();
      }
    };

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
        <h1 style={{ fontSize: 32 }}>Assessment 2: Backend API - Manage my Words</h1>
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

      <div style ={{padding:'1rem'}}>
        <h2>Word List</h2>
        <div style ={{marginBottom: '1rem'}}>
          <input
          type = "text"
          value = {newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder = "Enter new Word"
          />
          <button onClick={addWord}>Add word</button>
        </div>
      </div>

      <ul>
  {wordLists.map((list) => (
    <li key={list.id}>
      <span onClick={() => setSelectedWordListId(list.id)}>{list.name}</span>
      <button onClick={() => deleteWordList(list.id)}> Delete </button>
    </li>
  ))}
</ul>

{selectedWordListId !== null && (
  <div>
    <h2>Words in this list</h2>
    <ul>
      {words.map((word) => (
        <li key={word.id}>
          <span onClick = {()=> setSelectedWordId(word.id)}>{word.english}</span>
          <button onClick ={()=> deleteWord(word.id)}>Delete</button>
          </li>
      ))}
    </ul>
    
    <input
    type = 'text'
    value = {newWordEnglish}
    onChange={(e)=> setNewWordEnglish(e.target.value)}
    placeholder = "Enter new word"
    />
    <button onClick={addNewWord}> Add word to list</button>





  </div>
)}

{selectedWordId !== null && (
  <div>
    <h2>Phonemes for this word</h2>
    <ul>
      {phoneme.map((p) => (
        <li key = {p.id}>
          {p.symbol}
          <button onClick = {()=> deletePhoneme(p.id)}>Delete</button>
          </li>
      ))}
    </ul>

    <input
    type = "text"
    value = {newSymbol}
    onChange={(e) => setSymbol(e.target.value)}
    placeholder="Enter phoneme symbol"
    />
    <button onClick = {addPhoneme}>Add phoneme</button>
    </div>
)}

      <Footer />
    </div>
  );
}
