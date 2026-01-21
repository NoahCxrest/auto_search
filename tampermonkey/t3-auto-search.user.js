// ==UserScript==
// @name         T3 Chat Auto Search
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  automatically enable/disable search on t3.chat based on query content
// @author       auto-search
// @match        *://t3.chat/*
// @match        *://www.t3.chat/*
// @include      https://t3.chat*
// @include      https://www.t3.chat*
// @icon         https://t3.chat/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    const TEMPORAL_MARKERS = new Set([
        "today", "yesterday", "tomorrow", "now", "current", "currently", "latest",
        "recent", "recently", "this week", "this month", "this year", "right now",
        "at the moment", "presently", "nowadays", "these days", "2024", "2025", "2026"
    ]);

    const CURRENT_EVENT_PATTERNS = [
        /\b(news|headlines|happening|update|updates|breaking)\b/i,
        /\b(stock|stocks|price|prices|market|markets)\b/i,
        /\b(weather|forecast|temperature)\b/i,
        /\b(score|scores|game|match|playing)\b/i,
        /\b(election|vote|voting|poll|polls)\b/i,
        /\bwho (is|are|was|were) (the )?(current|new|latest)\b/i,
        /\bwhat (is|are) .* (doing|happening|going on)\b/i,
    ];

    const CODE_PATTERNS = [
        /\b(code|coding|program|programming|function|class|method)\b/i,
        /\b(javascript|typescript|python|java|rust|golang|c\+\+|ruby)\b/i,
        /\b(debug|error|bug|fix|implement|refactor)\b/i,
        /```[\s\S]*```/,
    ];

    const MATH_PATTERNS = [
        /\b(calculate|compute|solve|equation|formula)\b/i,
        /\d+\s*[\+\-\*\/\^]\s*\d+/,
    ];

    const CREATIVE_PATTERNS = [
        /\b(write|create|generate|make|compose|draft)\b/i,
        /\b(story|poem|essay|article|script|song|lyrics)\b/i,
    ];

    const NO_SEARCH_PATTERNS = [
        /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you)/i,
    ];

    const matchesAny = (text, patterns) => patterns.some(p => p.test(text));
    const containsTemporal = (text) => {
        const lower = text.toLowerCase();
        for (const marker of TEMPORAL_MARKERS) {
            if (lower.includes(marker)) return true;
        }
        return false;
    };

    const shouldSearch = (query) => {
        if (!query || query.trim().length === 0) return false;
        const q = query.toLowerCase();

        if (matchesAny(q, NO_SEARCH_PATTERNS)) return false;
        if (matchesAny(q, CODE_PATTERNS)) return false;
        if (matchesAny(q, MATH_PATTERNS)) return false;
        if (matchesAny(q, CREATIVE_PATTERNS)) return false;
        if (matchesAny(q, CURRENT_EVENT_PATTERNS)) return true;
        if (containsTemporal(q)) return true;

        return false;
    };

    const log = (msg) => {
        console.log(`[auto-search] ${msg}`);
    };


    const API_URL = 'http://localhost:3000';
    let useApi = null;

    const checkApi = async () => {
        try {
            const res = await OriginalFetch.call(pageWindow, `${API_URL}/health`, { method: 'GET' });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const apiDecide = async (query) => {
        try {
            const res = await OriginalFetch.call(pageWindow, `${API_URL}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (res.ok) {
                const data = await res.json();
                return data.data?.shouldSearch ?? null;
            }
        } catch (e) {}
        return null;
    };

    const decide = async (query) => {
        if (useApi === null) {
            useApi = await checkApi();
            log(useApi ? 'using API' : 'using local heuristics');
        }

        if (useApi) {
            const result = await apiDecide(query);
            if (result !== null) return result;
            useApi = false;
            log('API failed, falling back to local heuristics');
        }

        return shouldSearch(query);
    };

    const modifyBody = async (bodyStr) => {
        try {
            const body = JSON.parse(bodyStr);
            const messages = body.messages;

            if (messages && Array.isArray(messages)) {
                const userMessages = messages.filter(m => m.role === 'user');
                const userMessage = userMessages[userMessages.length - 1];
                const textPart = userMessage?.parts?.find(p => p.type === 'text');
                const query = textPart?.text ?? '';

                if (query) {
                    const needsSearch = await decide(query);
                    const currentSetting = body.modelParams?.includeSearch ?? false;
                    const preview = query.length > 40 ? query.substring(0, 40) + '...' : query;

                    if (needsSearch !== currentSetting) {
                        body.modelParams = body.modelParams || {};
                        body.modelParams.includeSearch = needsSearch;
                        log(`"${preview}" → search: ${needsSearch}`);
                        return JSON.stringify(body);
                    }
                }
            }
        } catch (e) {}
        return null;
    };

    const OriginalFetch = pageWindow.fetch;

    pageWindow.fetch = async function(input, init) {
        let url;
        if (typeof input === 'string') url = input;
        else if (input instanceof URL) url = input.href;
        else if (input instanceof Request) url = input.url;
        else if (input?.url) url = input.url;

        if (url?.includes('/api/chat')) {
            let bodyStr = init?.body;
            
            if (bodyStr && typeof bodyStr !== 'string') {
                if (bodyStr instanceof ReadableStream || typeof bodyStr.getReader === 'function') {
                    try {
                        const reader = bodyStr.getReader();
                        const chunks = [];
                        let done = false;
                        while (!done) {
                            const result = await reader.read();
                            done = result.done;
                            if (result.value) chunks.push(result.value);
                        }
                        const combined = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
                        let offset = 0;
                        for (const chunk of chunks) {
                            combined.set(chunk, offset);
                            offset += chunk.length;
                        }
                        bodyStr = new TextDecoder().decode(combined);
                    } catch (e) {}
                } else if (bodyStr instanceof ArrayBuffer || ArrayBuffer.isView(bodyStr)) {
                    bodyStr = new TextDecoder().decode(bodyStr);
                } else if (bodyStr instanceof Blob) {
                    bodyStr = await bodyStr.text();
                }
            }
            
            if (!bodyStr && input instanceof Request) {
                try { bodyStr = await input.clone().text(); } catch (e) {}
            }

            if (typeof bodyStr === 'string' && bodyStr.includes('"messages"') && bodyStr.includes('"modelParams"')) {
                const modified = await modifyBody(bodyStr);
                if (modified) {
                    if (input instanceof Request) {
                        return OriginalFetch.call(this, url, {
                            method: input.method,
                            headers: input.headers,
                            body: modified,
                            mode: input.mode,
                            credentials: input.credentials,
                        });
                    }
                    return OriginalFetch.call(this, input, { ...init, body: modified });
                }
            }
        }

        return OriginalFetch.apply(this, arguments);
    };

    if (pageWindow !== window) {
        window.fetch = pageWindow.fetch;
    }

    log('ready');

})();
