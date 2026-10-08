'use client';

import {usePageVisit} from '../hooks/usePageVisit';

export default function PageVisitTracker(){
    usePageVisit();
    return null;
}