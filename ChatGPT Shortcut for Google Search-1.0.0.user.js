// ==UserScript==
// @name         ChatGPT & Claude Shortcuts for Google Search
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Add ChatGPT and Claude buttons inside the Google search bar container
// @author       jamubc
// @match        https://www.google.com/search*
// @match        https://claude.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Check if we're on Claude.ai to handle auto-fill
    if (window.location.hostname === 'claude.ai') {
        // Check URL for query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (query) {
            // If we're not on /new, redirect to /new
            if (!window.location.pathname.includes('/new')) {
                window.location.href = `https://claude.ai/new?q=${encodeURIComponent(query)}`;
                return;
            }

            function fillChatInput() {
                const selectors = [
                    'div[contenteditable="true"]',
                    'textarea[placeholder*="message"]',
                    'div.max-h-96',
                    'div[role="textbox"]',
                    'div.ProseMirror',
                    '[data-testid="chat-input"]',
                    'div[contenteditable="true"][role="textbox"]'
                ];

                let inputElement = null;

                for (const selector of selectors) {
                    inputElement = document.querySelector(selector);
                    if (inputElement) {
                        break;
                    }
                }

                if (inputElement) {
                    // Fill the input
                    if (inputElement.tagName === 'TEXTAREA') {
                        inputElement.value = query;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        // For contenteditable divs
                        inputElement.focus();
                        inputElement.textContent = query;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Auto-click submit button after a delay
                    setTimeout(() => {
                        const submitButton = document.querySelector('button[aria-label="Send message"]:not([disabled])');
                        if (submitButton) {
                            submitButton.click();
                        }
                    }, 1000);

                    // Show notification
                    const notification = document.createElement('div');
                    notification.textContent = 'Populating...';
                    notification.style.position = 'fixed';
                    notification.style.top = '20px';
                    notification.style.right = '20px';
                    notification.style.backgroundColor = '#d97548';
                    notification.style.color = 'white';
                    notification.style.padding = '10px';
                    notification.style.borderRadius = '4px';
                    notification.style.zIndex = '10000';
                    notification.style.fontSize = '14px';
                    document.body.appendChild(notification);
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }, 3000);

                    return true;
                }
                return false;
            }

            // Wait for page to be ready and Claude to initialize
            let attempts = 0;
            const maxAttempts = 20;

            function tryFillInput() {
                attempts++;

                if (fillChatInput()) {
                    return;
                }

                if (attempts < maxAttempts) {
                    setTimeout(tryFillInput, 500);
                }
            }

            // Start trying after a short delay to let Claude initialize
            setTimeout(tryFillInput, 1000);
        }
        return; // Exit early if on Claude.ai
    }

    // Google Search functionality
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        // Function to detect and handle AI Overview
        function handleAIOverview() {
            // Try the specific selector path provided
            const aiOverviewElement = document.querySelector('div.q8sySb div.hdzaWe div#dEwkXc div div#B2Jtyd.yf div div div.h7Tj7e div#m-x-content.D5ad8b');

            // If not found, try a simpler selector
            const element = aiOverviewElement || document.querySelector('div.f5cPye');

            if (element) {
                // Extract text content from AI Overview
                let aiOverviewText = '';

                // Find the main content div that contains the actual text
                const contentElement = element.querySelector('div.f5cPye') || element;

                if (contentElement) {
                    // Clone the element to avoid modifying the original
                    const contentClone = contentElement.cloneNode(true);

                    // Remove unwanted elements
                    const unwantedSelectors = [
                        'script',
                        'style',
                        'button',
                        '[role="button"]',
                        //'.BMebGe', // Related links button
                        //'.NPrrbc', // Link containers
                        'svg',
                        //'[jscontroller]', // Interactive elements
                        //'.pjBG2e' // Link spans
                    ];
                    unwantedSelectors.forEach(selector => {
                        contentClone.querySelectorAll(selector).forEach(el => el.remove());
                    });

                    // Get text from span elements with data-huuid
                    const textSpans = contentClone.querySelectorAll('span[data-huuid]');
                    const textParts = [];

                    textSpans.forEach(span => {
                        const text = span.textContent.trim();
                        if (text && text.length > 0) {
                            textParts.push(text);
                        }
                    });

                    // If no spans found, get all text content
                    if (textParts.length === 0) {
                        const allText = contentClone.textContent || contentClone.innerText || '';
                        textParts.push(allText);
                    }

                    // Clean up and join the text
                    aiOverviewText = textParts
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\s*\.\s*/g, '. ')
                        .trim()
                        .substring(0, 1000); // Limit to 1000 chars
                }

                const parentElement = document.querySelector('div[data-mcpr]') ||
                                      document.querySelector('div.hdzaWe') ||
                                      element;

                return {
                    element: parentElement,
                    text: aiOverviewText
                };
            }

            return null;
        }

        // Function to create AI Overview buttons
        function createAIOverviewButtons(aiOverviewData) {
            // Find the AI Overview label container
            const labelContainer = document.querySelector('div.nk9vdc:nth-child(1)');

            if (!labelContainer) {
                // Fallback: append to the AI Overview element itself
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '8px';
                buttonContainer.style.marginTop = '12px';
                buttonContainer.style.marginBottom = '12px';
                aiOverviewData.element.appendChild(buttonContainer);
                addButtons(buttonContainer, aiOverviewData);
                return;
            }

            // Create button container
            const buttonContainer = document.createElement('span');
            buttonContainer.style.display = 'inline-flex';
            buttonContainer.style.gap = '8px';
            buttonContainer.style.marginLeft = '16px';

            addButtons(buttonContainer, aiOverviewData);

            // Insert buttons next to the AI Overview label
            labelContainer.appendChild(buttonContainer);
        }

        function addButtons(container, aiOverviewData) {
            // Create ChatGPT button for AI Overview
            const chatGPTButton = document.createElement('button');
            chatGPTButton.textContent = "Ask ChatGPT";
            chatGPTButton.style.padding = '4px 12px';
            chatGPTButton.style.backgroundColor = '#1f1f1f';
            chatGPTButton.style.color = 'white';
            chatGPTButton.style.border = 'none';
            chatGPTButton.style.borderRadius = '16px';
            chatGPTButton.style.cursor = 'pointer';
            chatGPTButton.style.fontSize = '12px';
            chatGPTButton.style.fontWeight = '500';

            chatGPTButton.addEventListener('click', () => {
                const aiQuery = `${query} - Google's 'AI Overview' says: ${aiOverviewData.text} [Verify this information]`;
                const chatGPTUrl = `https://chat.openai.com/?q=${encodeURIComponent(aiQuery)}`;
                window.open(chatGPTUrl, '_blank');
            });

            // Create Claude button for AI Overview
            const claudeButton = document.createElement('button');
            claudeButton.textContent = "Ask Claude";
            claudeButton.style.padding = '4px 12px';
            claudeButton.style.backgroundColor = '#d97548';
            claudeButton.style.color = 'white';
            claudeButton.style.border = 'none';
            claudeButton.style.borderRadius = '16px';
            claudeButton.style.cursor = 'pointer';
            claudeButton.style.fontSize = '12px';
            claudeButton.style.fontWeight = '500';

            claudeButton.addEventListener('click', () => {
                const aiQuery = `${query} - AI Overview says: ${aiOverviewData.text}`;
                const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiQuery)}`;
                window.open(claudeUrl, '_blank');
            });

            container.appendChild(chatGPTButton);
            container.appendChild(claudeButton);
        }

        // Check for AI Overview with delay
        setTimeout(() => {
            const aiOverviewData = handleAIOverview();
            if (aiOverviewData) {
                createAIOverviewButtons(aiOverviewData);
            }
        }, 1000);
        // Locate the main search bar container with class 'RNNXgb'
        const searchBarContainer = document.querySelector('.RNNXgb');

        if (searchBarContainer) {
            // Create a ChatGPT button
            const chatGPTButton = document.createElement('button');
            chatGPTButton.textContent = "Ask ChatGPT";
            chatGPTButton.style.marginLeft = '10px';
            chatGPTButton.style.padding = '6px 10px';
            chatGPTButton.style.backgroundColor = '#1f1f1f';
            chatGPTButton.style.color = 'white';
            chatGPTButton.style.border = 'none';
            chatGPTButton.style.borderRadius = '4px';
            chatGPTButton.style.cursor = 'pointer';
            chatGPTButton.style.fontSize = '12px';
            chatGPTButton.style.display = 'flex';
            chatGPTButton.style.alignItems = 'center';

            // Add functionality to the ChatGPT button
            chatGPTButton.addEventListener('click', () => {
                const chatGPTUrl = `https://chat.openai.com/?q=${encodeURIComponent(query)}`;
                window.open(chatGPTUrl, '_blank');
            });

            // Create a Claude button
            const claudeButton = document.createElement('button');
            claudeButton.textContent = "Ask Claude";
            claudeButton.style.marginLeft = '5px';
            claudeButton.style.padding = '6px 10px';
            claudeButton.style.backgroundColor = '#d97548';
            claudeButton.style.color = 'white';
            claudeButton.style.border = 'none';
            claudeButton.style.borderRadius = '4px';
            claudeButton.style.cursor = 'pointer';
            claudeButton.style.fontSize = '12px';
            claudeButton.style.display = 'flex';
            claudeButton.style.alignItems = 'center';

            // Add functionality to the Claude button
            claudeButton.addEventListener('click', () => {
                const claudeUrl = 'https://claude.ai/new?q=' + encodeURIComponent(query);
                window.open(claudeUrl, '_blank');
            });

            // Insert the buttons at the end of the search bar container
            const buttonContainer = searchBarContainer.querySelector('.BKRPef');
            if (buttonContainer) {
                buttonContainer.appendChild(chatGPTButton);
                buttonContainer.appendChild(claudeButton);
            }
        }
    }
})();