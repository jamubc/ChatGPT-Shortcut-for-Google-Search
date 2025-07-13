
# AI-Shortcut-for-Google-Search (ChatGPT & Claude)

This Tampermonkey script adds both "Ask ChatGPT" and "Ask Claude" buttons to Google Search. The buttons appear inside the search bar container, alongside the existing buttons, allowing you to send your Google search query directly to ChatGPT or open Claude for AI assistance.

## ✨ Features

- **Dual AI Support**: Quick access to both ChatGPT and Claude
- **Smart Integration**: Buttons appear seamlessly in Google's search interface
- **Enhanced Reliability**: Multiple DOM selector fallbacks for better compatibility
- **Modern UI**: Improved button styling with hover effects and smooth transitions
- **Dynamic Loading**: Handles Google's single-page application navigation
- **Duplicate Prevention**: Prevents multiple button sets from appearing

## 🚀 Intended Use Scenario
1. You google a question, lets say "Why is the magnetic field non conservative?"
2. Google returns some results, but you want AI analysis
3. Click either "Ask ChatGPT" or "Ask Claude" button to get AI assistance
4. Save time and learn faster with AI explanations

## 📥 How to Install

### Option 1: Install from GitHub (Latest Version)

1. **Download the Script:**
   - Clone or download this repository as a ZIP file and extract it
   - Use the new `AI-Shortcut-for-Google-Search-1.1.0.user.js` file for the latest features
   
2. **Open Tampermonkey Dashboard:**
   - Install Tampermonkey for your browser if you haven't already
   - Click the Tampermonkey icon in your browser and choose "Dashboard"
   
3. **Add the New Script:**
   - Click on the "+" (Add a New Script) button
   - Copy the contents of `AI-Shortcut-for-Google-Search-1.1.0.user.js` and paste it into the editor
   
4. **Save the Script:**
   - Click File → Save or press Ctrl + S (Cmd + S on Mac)
   
5. **Done:**
   - Visit Google Search and try a search. Both ChatGPT and Claude buttons should appear

### Option 2: Install from GreasyFork (Legacy Version)

⚠️ **Note**: The GreasyFork version may be outdated. Use GitHub installation for the latest features.

1. **Visit the GreasyFork Script Page:**
   - Navigate to [GreasyFork](https://greasyfork.org/en/scripts/518980-chatgpt-shortcut-for-google-search)
   - Click on the "Install this script" button
   - Tampermonkey will open and prompt you to confirm the installation
   
2. **Done:**
   - Visit Google Search and try a search

## 🔧 Technical Improvements

### Version 1.1.0 Features:
- **Claude Integration**: Added support for Claude.ai alongside ChatGPT
- **Enhanced DOM Handling**: Multiple selector fallbacks for better Google compatibility
- **Improved Error Handling**: Graceful fallbacks when Google updates their UI
- **Better Performance**: Async/await patterns and optimized DOM queries  
- **Modern Styling**: Updated button designs with hover effects and animations
- **Duplicate Prevention**: Smart logic to prevent multiple button instances
- **SPA Navigation Support**: Handles Google's dynamic page updates

### Browser Compatibility:
- ✅ Chrome (Latest)
- ✅ Firefox (Latest) 
- ✅ Safari (Latest)
- ✅ Edge (Latest)

## 🎨 AI Platform Details

### ChatGPT Integration
- **Direct Query Support**: Passes your search query directly to ChatGPT
- **URL Format**: `https://chat.openai.com/?q=YOUR_QUERY`
- **Button Color**: OpenAI Green (#10a37f)

### Claude Integration  
- **New Chat**: Opens a fresh Claude conversation 
- **URL Format**: `https://claude.ai/chat/`
- **Button Color**: Anthropic Orange (#d97706)
- **Note**: Claude doesn't support direct query parameters, so you'll need to paste your question

## 🤝 Contributing

Feel free to submit issues or pull requests to improve this script. Contributions are welcome!

### Development Guidelines:
- Test changes across multiple browsers
- Ensure compatibility with Google's changing UI
- Maintain backward compatibility when possible
- Follow existing code style and patterns

## 📄 License

This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.
