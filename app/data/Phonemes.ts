import {useState, useEffect} from 'react';

export type PhonemeEntry = {
    label: string;
    example: string;
};


export const phonemeDictionary: Record<string, PhonemeEntry> = {
    b:{label: 'BEE', example: 'bed'},
    e:{label:'E', example: 'bed'},
    d:{label:'DE', example: 'dead'},
    æ:{label: 'A', example: 'bad'},
    ɐ:{label: 'UH', example: 'pup'},
    ɜː:{label: 'IR', example: 'bird'},
    ɐː:{label: 'AR', example: 'tart'},
    k:{label: 'KUR', example: 'mark'},
    ʉː:{label: 'OO', example: 'spoon'},
    t:{label: 'TE', example: 'tone'},
    əʉ:{label:'OA', example: 'moat'},
    æɪ:{label:'AE', example: 'trait'},
    ɑe:{label:'EYE', example: 'bike'},
    oɪ:{label: 'OI', example: 'toil'},
    ɪə:{label: 'EAR', example:'spear'},
    θ: {label: 'THI', example: 'thick'},
    ɪ: {label: 'I', example: 'bin'},
    tʃ:{label: 'CH', example: 'chose'},
    ð:{label: 'TH', example: 'then'},
    dʒ:{label:'JER', example:'jumper'},
    oː:{label: 'OR', example: 'torque'},
    p:{label:'PE', example: 'pencil'},
    g:{label:'GE', example: 'gain'},
    n:{label:'N', example: 'name'},
    m:{label: 'M', example:'main'},
    ŋ:{label: "NG", example:'sang'},
    f:{label: 'FE', example:'fang'},
    s:{label: 'S', example:'sank'},
    ʃ:{label: 'SH', example:'shot'},
    v:{label: 'VUR', example:'venom'},
    z:{label: 'Z', example:'zed'},
    l:{label: 'L', example:'label'},
    ɹ:{label: 'R', example:'grind'},
    w:{label: 'WUR',example:'word'},
    j:{label: 'JUR', example: 'jack'},
    h:{label:'H', example: 'happy'},
    iː:{label:'EE', example: 'sleek'},
    ɔ:{label:'O', example: 'bog'},
    ʊ:{label:'OO', example: 'sook'},
    æɔ:{label:'OW', example: 'about'},
    ʒ:{label:'ZH', example: 'pleasure'},
    ə:{label:'CHWA', example: 'teacher'},
};



export type WordSearchWord = {
    english: string;
    phonemes: string[];
};


export const wordList: WordSearchWord[] = [
    { english: 'bed', phonemes: ['b', 'e', 'd'] },
    { english: 'bid', phonemes: ['b', 'ɪ', 'd'] },
    { english: 'bad', phonemes: ['b', 'æ', 'd'] },
    { english: 'bud', phonemes: ['b', 'ɐ', 'd'] },
    { english: 'bird', phonemes: ['b', 'ɜː', 'd'] },
    { english: 'bark', phonemes: ['b', 'ɐː', 'k'] },
    { english: 'book', phonemes: ['b', 'ʊ', 'k'] },
    { english: 'boot', phonemes: ['b', 'ʉː', 't'] },
    { english: 'boat', phonemes: ['b', 'əʉ', 't'] },
    { english: 'bike', phonemes: ['b', 'ɑe', 'k'] },
    { english: 'bait', phonemes: ['b', 'æɪ', 't'] },
    { english: 'boil', phonemes: ['b', 'oɪ', 'l'] },
    { english: 'beard', phonemes: ['b', 'ɪə', 'd'] },
    { english: 'choice', phonemes: ['tʃ', 'oɪ', 's'] },
    { english: 'thin', phonemes: ['θ', 'ɪ', 'n'] },
    { english: 'then', phonemes: ['ð', 'e', 'n'] },
    { english: 'ship', phonemes: ['ʃ', 'ɪ', 'p'] },
    { english: 'chin', phonemes: ['tʃ', 'ɪ', 'n'] },
    { english: 'jam', phonemes: ['dʒ', 'æ', 'm'] },
    { english: 'yes', phonemes: ['j', 'e', 's'] },
    { english: 'win', phonemes: ['w', 'ɪ', 'n'] },
    { english: 'ring', phonemes: ['ɹ', 'ɪ', 'ŋ'] },
    { english: 'log', phonemes: ['l', 'ɔ', 'g'] },
    { english: 'fan', phonemes: ['f', 'æ', 'n'] },
    { english: 'van', phonemes: ['v', 'æ', 'n'] },
    { english: 'sun', phonemes: ['s', 'ɐ', 'n'] },
    { english: 'zip', phonemes: ['z', 'ɪ', 'p'] },
    { english: 'gum', phonemes: ['g', 'ɐ', 'm'] },
    { english: 'hat', phonemes: ['h', 'æ', 't'] },
    { english: 'fork', phonemes: ['f', 'oː', 'k'] },
];

