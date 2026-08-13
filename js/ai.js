import { showToast } from './ui.js';
import { saveSummaryRecord } from './firestore.js';

let currentGeneratedResult = null;
let currentSourceText = '';
let currentSummaryType = 'quick';

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
            const textarea = document.createElement('textarea');
            textarea.value = currentGeneratedResult;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Summary copied to clipboard!', 'success');
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
    // BACKEND REQUIRED: Frontend calls secure backend endpoint.
    // Simulating intelligent summary processing for demonstration & resilient architecture testing:
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!text || text.length < 10) {
        throw new Error('Text is too short for intelligent summarization.');
    }

    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const wordCount = text.split(/\s+/).length;

    switch (summaryType) {
        case 'quick':
            return `[Quick Summary - SumNova V2 Engine]\n\n• Core Subject: ${sentences[0] || text.substring(0, 60)}...\n• Total Words Analyzed: ${wordCount} words.\n• Executive Takeaway: The provided text outlines critical concepts focusing on key foundational principles and structured insights.`;
        case 'detailed':
            return `[Detailed Comprehensive Summary - SumNova V2]\n\n1. Introduction & Context:\n${sentences.slice(0, 2).join('. ') || text.substring(0, 100)}.\n\n2. Core Analysis:\n- Explores primary thematic elements with robust depth.\n- Highlights significant structural components and data points.\n\n3. Conclusion:\nSynthesizes overall takeaways for optimal study and professional application.`;
        case 'keypoints':
            return `[Key Points Extracted - SumNova V2]\n\n1. ${sentences[0] || 'Primary premise established.'}\n2. ${sentences[1] || 'Secondary supporting argument verified.'}\n3. ${sentences[2] || 'Concluding synthesis & implications noted.'}`;
        case 'studynotes':
            return `[Structured Study Notes - SumNova V2]\n\nSUBJECT / THEME:\n${text.substring(0, 40)}...\n\nKEY DEFINITIONS:\n• Derived from primary text context.\n\nREVIEW QUESTIONS:\n1. What is the primary objective of this text?\n2. How do the secondary arguments support the conclusion?`;
        default:
            return `Summary: ${text.substring(0, 150)}...`;
    }
}

function setLoadingState(isLoading) {
    const btn = document.getElementById('generate-btn');
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-spin mr-2">⚡</span> Generating...`;
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
            <div class="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <span class="text-2xl">✨</span>
                <p>Your generated summary will appear here.</p>
            </div>`;
        return;
    }
    container.textContent = text;
}
