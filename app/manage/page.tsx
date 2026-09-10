'use client';

import Link from 'next/link'
import HamburgerMenu from '../Components/HamburgerMenu';
import Footer from '../Components/Footer';


import {useState, useEffect} from 'react';

type WordList = {
    id:number;
    name: string;
}

export default function Manage() {

    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [newListName, setNewListName] = useState('');

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
        {wordLists.map((list)=> 
        <li key={list.id}>{list.name}</li>
        )}
      </ul>



      

      <Footer />

    </div>


  );
}
