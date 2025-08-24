# LexiLog - Personal Vocabulary Builder

A modern web application for building and managing your personal vocabulary. Search for words, save them to your personal library, and discover new words daily.

## Features

- **Multi-Language Support**: Search words in 22 languages including Indian languages (Hindi, Kannada, Tamil, Telugu, etc.)
- **Enhanced Dictionary**: Better word definitions using multiple APIs and translation services
- **Word Search**: Search for any word and get definitions, pronunciations, and examples
- **Voice Search**: Use your microphone to search for words in your selected language
- **Personal Library**: Automatically save searched words to "My LexiLog"
- **Word of the Day**: Discover a new word every day
- **Audio Pronunciation**: Listen to word pronunciations
- **Translation Support**: Get English translations for non-English words
- **Responsive Design**: Works on desktop and mobile devices

## Recent Updates

The following features have been added and issues resolved:

1. **Multi-Language Support**: 
   - Added support for 22 languages including Indian languages (Hindi, Kannada, Tamil, Telugu, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Urdu)
   - International languages: Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic
   - Language selector dropdown in the search interface

2. **Enhanced Dictionary API**: 
   - Integrated Google Translate API for better word definitions
   - Fallback translation system for non-English words
   - Shows translations alongside definitions

3. **Improved User Experience**: 
   - Always asks for user's name on first visit
   - Personalized greeting: "Hi {Name}, Here is your Pocket Dictionary"
   - Voice search adapts to selected language

4. **Voice Explainer Fixed**: 
   - Improved speech recognition compatibility across different browsers
   - Added better error handling and user feedback
   - Fixed microphone permission issues

5. **Word of the Day Loading Fixed**: 
   - Added localStorage fallback when Firebase is not configured
   - Improved error handling and retry logic
   - Words now load properly even without Firebase setup

6. **My LexiLog Functionality Fixed**: 
   - Searched words now properly appear in the vocabulary library
   - Added localStorage support for data persistence
   - Improved save/delete functionality with notifications

## Files

- `index.html` - Main application with Firebase support
- `app.js` - Main JavaScript with Firebase integration and localStorage fallback
- `index-demo.html` - Demo version without Firebase dependencies
- `app-demo.js` - Demo JavaScript using only localStorage
- `styles.css` - Custom styling and animations

## Usage

### Option 1: Full Version (with Firebase)
1. Configure Firebase in `app.js` (replace placeholder values)
2. Open `index.html` in a web browser
3. Enter your name and start using the app

### Option 2: Demo Version (no setup required)
1. Open `index-demo.html` in a web browser
2. Enter your name and start using the app
3. All data is stored locally in your browser

## How to Use

1. **Search for Words**: 
   - Type a word in the search box and press Enter or click Search
   - Use the microphone button for voice search (allow microphone access)

2. **Save Words**: 
   - Words are automatically saved to your library when searched
   - You'll see a green notification when words are saved

3. **View Your Library**: 
   - Click "My LexiLog" tab to see all your saved words
   - Click the audio button to hear pronunciation
   - Click the delete button to remove words

4. **Word of the Day**: 
   - Click "Word of the Day" tab to see today's featured word
   - Click "Add to My LexiLog" to save it to your library

## Browser Compatibility

- **Voice Search**: Works best in Chrome, Edge, and Safari
- **Data Storage**: Uses localStorage (works in all modern browsers)
- **Responsive Design**: Optimized for desktop and mobile

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Data Storage**: Firebase Firestore (with localStorage fallback)
- **Dictionary API**: Free Dictionary API (https://dictionaryapi.dev/)
- **Speech Recognition**: Web Speech API

## Troubleshooting

### Voice Search Not Working
- Ensure you're using a supported browser (Chrome recommended)
- Allow microphone access when prompted
- Check that your microphone is working and not muted

### Words Not Saving
- Check browser console for errors
- Ensure localStorage is enabled in your browser
- Try refreshing the page

### Word of the Day Not Loading
- Check your internet connection
- The app will retry automatically
- Try switching to the demo version if issues persist

## Development

To modify the app:

1. Edit `app.js` for main functionality
2. Edit `styles.css` for styling changes
3. Edit `index.html` for HTML structure changes

The app is designed to work with or without Firebase configuration, making it easy to deploy and test.
