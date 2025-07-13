// ==UserScript==
// @name         AI Shortcut for Google Search (ChatGPT & Claude)
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Add ChatGPT and Claude buttons inside the Google search bar container
// @author       jamubc
// @match        https://www.google.com/search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // AI platforms configuration
    const AI_PLATFORMS = {
        chatgpt: {
            name: 'Ask ChatGPT',
            url: 'https://chat.openai.com/?q=',
            color: '#10a37f',
            hoverColor: '#0d8767'
        },
        claude: {
            name: 'Ask Claude',
            url: 'https://claude.ai/chat/',
            color: '#d97706',
            hoverColor: '#b45309'
        }
    };

    // Enhanced button styling
    const BUTTON_STYLES = {
        marginLeft: '8px',
        padding: '6px 12px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        color: 'white',
        height: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    // Utility function to apply styles to an element
    function applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    // Create a button for an AI platform
    function createAIButton(platform, query) {
        const button = document.createElement('button');
        button.textContent = platform.name;
        
        // Apply base styles
        applyStyles(button, {
            ...BUTTON_STYLES,
            backgroundColor: platform.color
        });

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = platform.hoverColor;
            button.style.transform = 'translateY(-1px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = platform.color;
            button.style.transform = 'translateY(0)';
        });

        // Add click functionality
        button.addEventListener('click', () => {
            let url;
            if (platform === AI_PLATFORMS.chatgpt) {
                url = `${platform.url}${encodeURIComponent(query)}`;
            } else if (platform === AI_PLATFORMS.claude) {
                // Claude doesn't support direct query parameters, so we'll open a new chat
                url = platform.url;
            }
            window.open(url, '_blank');
        });

        return button;
    }

    // Enhanced DOM waiting function with multiple selectors
    function waitForElement(selectors, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            function checkForElement() {
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        resolve(element);
                        return;
                    }
                }
                
                if (Date.now() - startTime < timeout) {
                    setTimeout(checkForElement, 100);
                } else {
                    resolve(null);
                }
            }
            
            checkForElement();
        });
    }

    // Main initialization function
    async function initializeAIButtons() {
        // Check if there's a search query in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        if (!query) {
            console.log('AI Shortcut: No search query found');
            return;
        }

        console.log('AI Shortcut: Initializing buttons for query:', query);

        // Prevent duplicate buttons
        if (document.querySelector('.ai-shortcut-button')) {
            console.log('AI Shortcut: Buttons already exist, skipping');
            return;
        }

        // Wait for search bar container with multiple possible selectors
        const searchBarContainer = await waitForElement([
            '.RNNXgb',  // Current known selector
            '[role="search"]', // Semantic fallback
            '.tsf',     // Alternative Google search form selector
            '#searchform' // Another fallback
        ]);

        if (!searchBarContainer) {
            console.error('AI Shortcut: Search bar container not found');
            return;
        }

        // Look for button container with multiple selectors
        const buttonContainer = await waitForElement([
            '.BKRPef',  // Current known selector
            '.RNNXgb .BKRPef', // More specific
            '[data-ved]', // Common Google element attribute
            '.gLFyf' // Search input area
        ]);

        if (!buttonContainer) {
            console.error('AI Shortcut: Button container not found, appending to search bar container');
            // Fallback: create our own container
            const aiButtonContainer = document.createElement('div');
            aiButtonContainer.className = 'ai-shortcut-container';
            applyStyles(aiButtonContainer, {
                display: 'flex',
                alignItems: 'center',
                marginLeft: '8px'
            });
            searchBarContainer.appendChild(aiButtonContainer);
            
            // Add buttons to our container
            Object.values(AI_PLATFORMS).forEach(platform => {
                const button = createAIButton(platform, query);
                button.className = 'ai-shortcut-button';
                aiButtonContainer.appendChild(button);
            });
        } else {
            // Add buttons to existing container
            Object.values(AI_PLATFORMS).forEach(platform => {
                const button = createAIButton(platform, query);
                button.className = 'ai-shortcut-button';
                buttonContainer.appendChild(button);
            });
        }

        console.log('AI Shortcut: Buttons successfully added');
    }

    // Handle dynamic content loading
    function handleDynamicLoading() {
        // Initialize immediately
        initializeAIButtons();

        // Watch for URL changes (SPA navigation)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(initializeAIButtons, 500); // Small delay for DOM updates
            }
        }).observe(document, { subtree: true, childList: true });

        // Also listen for popstate events
        window.addEventListener('popstate', () => {
            setTimeout(initializeAIButtons, 500);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDynamicLoading);
    } else {
        handleDynamicLoading();
    }
})();