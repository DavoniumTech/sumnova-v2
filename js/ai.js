import { showToast } from './ui.js';
import { saveSummaryRecord } from './firestore.js';

let currentGeneratedResult = null;
let currentSourceText = '';
let currentSummaryType = 'quick';

const BACKEND_SUMMARIZE_ENDPOINT = '/api/summarize';

export function initWorkspace() {
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-text-btn');
    const copyBtn = document.getElementById('copy-result-btn');
    const saveBtn = document.getElementById('save-summary-btn');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const textEl = document.getElementById('source-text');
            const typeEl = document.getElementById('summary-type');
            const text = textEl ? textEl.value.trim() : '';
            const summaryType = typeEl ? typeEl.value : 'quick';

            if (!text) {
                showToast('Please enter or paste text to summarize.', 'error');
                return;
            }

            if (text.length < 10) {
                showToast('Text is too short for intelligent summarization.', 'error');
                return;
            }

            currentSourceText = text;
            currentSummaryType = summaryType;

            setLoadingState(true);
            try {
                const result = await generateSummary(text, summaryType);
                currentGeneratedResult = result;
                renderResult(result);
                if (copyBtn) copyBtn.classList.remove('hidden');
                if (saveBtn) saveBtn.classList.remove('hidden');
                showToast('Summary generated successfully!', 'success');
            } catch (err) {
                showToast(err.message || 'Generation failed.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const textEl = document.getElementById('source-text');
            if (textEl) textEl.value = '';
            currentGeneratedResult = null;
            renderResult(null);
            if (copyBtn) copyBtn.classList.add('hidden');
            if (saveBtn) saveBtn.classList.add('hidden');
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!currentGeneratedResult) return;
            navigator.clipboard.writeText(currentGeneratedResult).then(() => {
                showToast('Summary copied to clipboard!', 'success');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = currentGeneratedResult;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('Summary copied to clipboard!', 'success');
            });
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!currentGeneratedResult) return;
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';
                const title = currentSourceText.substring(0, 40) + '...';
                await saveSummaryRecord({
                    title,
                    input: currentSourceText,
                    summary: currentGeneratedResult,
                    summaryType: currentSummaryType
                });
                showToast('Summary saved to cloud successfully!', 'success');
            } catch (err) {
                showToast(err.message || 'Failed to save summary.', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save to Cloud';
            }
        });
    }
}

export async function generateSummary(text, summaryType) {
    try {
        const response = await fetch(BACKEND_SUMMARIZE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, summaryType })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication error with AI backend.');
            } else {
                throw new Error(`Backend error (${response.status}): AI service unavailable.`);
            }
        }

        const data = await response.json();
        if (!data || !data.summary) {
            throw new Error('Invalid response received from AI backend.');
        }

        return data.summary;
    } catch (err) {
        if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
            throw new Error('AI service is currently unavailable. Please try again later.');
        }
        throw err;
    }
}

function setLoadingState(isLoading) {
    const btn = document.getElementById('generate-btn');
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span>Generating...</span>`;
    } else {
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Summary</span>`;
    }
}

function renderResult(text) {
    const container = document.getElementById('output-container');
    if (!container) return;
    if (!text) {
        container.innerHTML = `
            <div class="empty-output">
                <span class="empty-icon">✨</span>
                <p>Your generated summary will appear here.</p>
            </div>`;
        return;
    }
    container.textContent = text;
}
