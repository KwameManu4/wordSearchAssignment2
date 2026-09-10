import { PhonemeEntry } from '../data/Phonemes';

type PhonemeChipProps = {
    symbol: string;
    entry: PhonemeEntry;
};

export default function PhonemeChip({ symbol, entry }: PhonemeChipProps) {
    return (
        <span className="phoneme-chip" title={`${entry.label} (as in ${entry.example})`}>
            /{symbol}/ <span className="phoneme-chip-label">{entry.label}</span>
        </span>
    );
}