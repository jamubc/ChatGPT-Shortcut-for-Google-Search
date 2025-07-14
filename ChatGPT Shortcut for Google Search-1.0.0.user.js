// ==UserScript==
// @name         ChatGPT & Claude Shortcuts for Google Search
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Add ChatGPT and Claude buttons inside the Google search bar container
// @author       jamubc
// @match        https://www.google.com/search*
// @match        https://claude.ai/*
// @grant        none
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