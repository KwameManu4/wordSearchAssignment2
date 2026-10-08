export type GenerationEventInput = {
    activityType: 'wordle' | 'wordsearch';
    status: 'success' | 'failed'; 
    failureReason?: string;
    wordListId?: number | null;
};


export async function recordGeneration(event: GenerationEventInput): Promise<void> {
    try {
        const res = await fetch('/api/generation-events', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(event),
        });
        if (!res.ok) {
            console.error('Generation event rejected:', res.status, await res.text());
        }
    } catch (error) {
        console.error('Error recording generation event:', error);
    }
}
