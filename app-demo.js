// LexiLog - Personal Vocabulary Builder (Demo Version)
// This version works without Firebase configuration

// App Configuration
const APP_ID = 'lexilog-vocabulary-builder';

// Dictionary APIs
const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/';
const WIKTIONARY_API_BASE = 'https://en.wiktionary.org/api/rest_v1/page/definition/';
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

// Supported Languages
const SUPPORTED_LANGUAGES = {
    'en': { name: 'English', code: 'en' },
    'hi': { name: 'Hindi', code: 'hi' },
    'kn': { name: 'Kannada', code: 'kn' },
    'ta': { name: 'Tamil', code: 'ta' },
    'te': { name: 'Telugu', code: 'te' },
    'ml': { name: 'Malayalam', code: 'ml' },
    'bn': { name: 'Bengali', code: 'bn' },
    'gu': { name: 'Gujarati', code: 'gu' },
    'mr': { name: 'Marathi', code: 'mr' },
    'pa': { name: 'Punjabi', code: 'pa' },
    'ur': { name: 'Urdu', code: 'ur' },
    'es': { name: 'Spanish', code: 'es' },
    'fr': { name: 'French', code: 'fr' },
    'de': { name: 'German', code: 'de' },
    'it': { name: 'Italian', code: 'it' },
    'pt': { name: 'Portuguese', code: 'pt' },
    'ru': { name: 'Russian', code: 'ru' },
    'ja': { name: 'Japanese', code: 'ja' },
    'ko': { name: 'Korean', code: 'ko' },
    'zh': { name: 'Chinese', code: 'zh' },
    'ar': { name: 'Arabic', code: 'ar' }
};

// Default language
let currentLanguage = 'en';

// Global Variables
let currentUser = null;
let speechRecognition = null;
let isListening = false;

// DOM Elements
const elements = {
    // Authentication Views
    loginView: document.getElementById('loginView'),
    signupView: document.getElementById('signupView'),
    mainApp: document.getElementById('mainApp'),
    
    // Login Form
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginButton: document.getElementById('loginButton'),
    showSignupBtn: document.getElementById('showSignupBtn'),
    
    // Signup Form
    signupForm: document.getElementById('signupForm'),
    signupName: document.getElementById('signupName'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    signupButton: document.getElementById('signupButton'),
    showLoginBtn: document.getElementById('showLoginBtn'),
    
    // User Profile
    userProfileButton: document.getElementById('userProfileButton'),
    userProfileDropdown: document.getElementById('userProfileDropdown'),
    userInitials: document.getElementById('userInitials'),
    userDisplayName: document.getElementById('userDisplayName'),
    userDisplayEmail: document.getElementById('userDisplayEmail'),
    greeting: document.getElementById('greeting'),
    
    // Language Selection
    languageSelector: document.getElementById('languageSelector'),
    
    // Tab Navigation
    searchTab: document.getElementById('searchTab'),
    libraryTab: document.getElementById('libraryTab'),
    dailyTab: document.getElementById('dailyTab'),
    logoutButton: document.getElementById('logoutButton'),
    
    // Search View
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    audioButton: document.getElementById('audioButton'),
    searchResults: document.getElementById('searchResults'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    resultWord: document.getElementById('resultWord'),
    resultPhonetic: document.getElementById('resultPhonetic'),
    resultDefinitions: document.getElementById('resultDefinitions'),
    playAudio: document.getElementById('playAudio'),
    
    // Library View
    libraryContent: document.getElementById('libraryContent'),
    emptyLibrary: document.getElementById('emptyLibrary'),
    wordList: document.getElementById('wordList'),
    
    // Daily Word View
    dailyWordContent: document.getElementById('dailyWordContent'),
    dailyLoading: document.getElementById('dailyLoading'),
    dailyWord: document.getElementById('dailyWord'),
    dailyWordText: document.getElementById('dailyWordText'),
    dailyPhonetic: document.getElementById('dailyPhonetic'),
    dailyDefinitions: document.getElementById('dailyDefinitions'),
    playDailyAudio: document.getElementById('playDailyAudio'),
    saveDailyWord: document.getElementById('saveDailyWord')
};

// Language Helper Functions
function getSpeechRecognitionLang(langCode) {
    const langMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'kn': 'kn-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'ml': 'ml-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'mr': 'mr-IN',
        'pa': 'pa-IN',
        'ur': 'ur-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA'
    };
    return langMap[langCode] || 'en-US';
}

function updateSpeechRecognitionLanguage() {
    if (speechRecognition) {
        speechRecognition.lang = getSpeechRecognitionLang(currentLanguage);
    }
}

// Initialize Speech Recognition
function initializeSpeechRecognition() {
    // Check for different speech recognition APIs
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    
    if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = getSpeechRecognitionLang(currentLanguage);
        speechRecognition.maxAlternatives = 1;
        
        speechRecognition.onstart = () => {
            isListening = true;
            elements.audioButton.classList.add('text-red-600');
            elements.audioButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
            elements.audioButton.title = "Listening... Click to stop";
        };
        
        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.searchInput.value = transcript;
            searchWord(transcript);
        };
        
        speechRecognition.onend = () => {
            isListening = false;
            elements.audioButton.classList.remove('text-red-600');
            elements.audioButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
            `;
            elements.audioButton.title = "Audio Search";
        };
        
        speechRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            elements.audioButton.classList.remove('text-red-600');
            elements.audioButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
            `;
            elements.audioButton.title = "Audio Search";
            
            if (event.error === 'not-allowed') {
                alert('Please allow microphone access to use voice search.');
            } else if (event.error === 'no-speech') {
                alert('No speech detected. Please try again.');
            } else {
                alert('Voice search error. Please try typing instead.');
            }
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
        elements.audioButton.style.display = 'none';
    }
}

// LocalStorage-based Authentication Functions (Demo Version)
function initializeAuth() {
    // Check if user is logged in
    const currentUserData = localStorage.getItem('lexilog_demo_user');
    if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        currentUser = userData;
        showMainApp(userData);
    } else {
        showLogin();
    }
}

// Sign up with localStorage
function signUpWithEmail(name, email, password) {
    try {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('lexilog_demo_users') || '[]');
        const userExists = existingUsers.find(user => user.email === email);
        
        if (userExists) {
            showNotification('This email is already registered. Please sign in instead.', 'error');
            return false;
        }
        
        if (password.length < 6) {
            showNotification('Password should be at least 6 characters long.', 'error');
            return false;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // In real app, this would be hashed
            createdAt: new Date().toISOString()
        };
        
        // Save to users list
        existingUsers.push(newUser);
        localStorage.setItem('lexilog_demo_users', JSON.stringify(existingUsers));
        
        // Set as current user
        currentUser = { name: newUser.name, email: newUser.email, id: newUser.id };
        localStorage.setItem('lexilog_demo_user', JSON.stringify(currentUser));
        
        showNotification('Account created successfully! Welcome to LexiLog!', 'success');
        showMainApp(currentUser);
        return true;
    } catch (error) {
        console.error('Sign up error:', error);
        showNotification('Failed to create account. Please try again.', 'error');
        return false;
    }
}

// Sign in with localStorage
function signInWithEmail(email, password) {
    try {
        const existingUsers = JSON.parse(localStorage.getItem('lexilog_demo_users') || '[]');
        const user = existingUsers.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showNotification('Invalid email or password. Please try again.', 'error');
            return false;
        }
        
        // Set as current user
        currentUser = { name: user.name, email: user.email, id: user.id };
        localStorage.setItem('lexilog_demo_user', JSON.stringify(currentUser));
        
        showNotification('Welcome back!', 'success');
        showMainApp(currentUser);
    return true;
    } catch (error) {
        console.error('Sign in error:', error);
        showNotification('Failed to sign in. Please try again.', 'error');
        return false;
    }
}

// Sign out
function signOut() {
    localStorage.removeItem('lexilog_demo_user');
    currentUser = null;
    showNotification('Signed out successfully', 'info');
    showLogin();
}

// UI Functions
function showLogin() {
    elements.loginView.classList.remove('hidden');
    elements.signupView.classList.add('hidden');
    elements.mainApp.classList.add('hidden');
}

function showSignup() {
    elements.signupView.classList.remove('hidden');
    elements.loginView.classList.add('hidden');
    elements.mainApp.classList.add('hidden');
}

function showMainApp(userProfile) {
    elements.loginView.classList.add('hidden');
    elements.signupView.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    
    // Update user profile display
    const firstName = userProfile.name.split(' ')[0];
    elements.greeting.textContent = `Hi ${firstName}, Here is your Pocket Dictionary`;
    elements.userDisplayName.textContent = userProfile.name;
    elements.userDisplayEmail.textContent = userProfile.email;
    
    // Update user initials
    const initials = userProfile.name.split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    elements.userInitials.textContent = initials;
    
    // Initialize features
    initializeSpeechRecognition();
    loadUserVocabulary();
    fetchWordOfTheDay();
}

// Logout Function
async function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            // Clear user-specific data
            if (currentUser && currentUser.id) {
                localStorage.removeItem(`lexilog_daily_word_${currentUser.id}`);
            }
            
            // Reset language
            currentLanguage = 'en';
            
            // Sign out
            signOut();
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Error signing out', 'error');
        }
    }
}



// Tab Navigation
function initializeTabNavigation() {
    const tabButtons = [elements.searchTab, elements.libraryTab, elements.dailyTab];
    const tabContents = ['searchView', 'libraryView', 'dailyView'];
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active content
            tabContents.forEach(contentId => {
                const content = document.getElementById(contentId);
                if (contentId === `${targetTab}View`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Refresh data when switching tabs
            if (targetTab === 'library') {
                loadUserVocabulary();
            } else if (targetTab === 'daily') {
                fetchWordOfTheDay();
            }
        });
    });
}

// Search Functions
async function searchWord(word) {
    if (!word.trim()) return;
    
    showLoading();
    hideResults();
    hideError();
    
    try {
        let wordData = null;
        
        // Try multiple dictionary sources
        if (currentLanguage === 'en') {
            // For English, try the main dictionary API first
            try {
                const response = await fetch(`${DICTIONARY_API_BASE}en/${encodeURIComponent(word.trim())}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        wordData = data[0];
                    }
                }
            } catch (error) {
                console.log('Main dictionary API failed, trying alternatives...');
            }
        }
        
        // If no data from main API, try translation and basic definition
        if (!wordData) {
            wordData = await getWordDefinitionFromTranslation(word.trim());
        }
        
        if (wordData) {
            displaySearchResults(wordData);
            await saveWordToVocabulary(wordData);
        } else {
            throw new Error('Word not found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError();
    }
}

async function getWordDefinitionFromTranslation(word) {
    try {
        // Get translation to English for better definition
        const translateUrl = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=${currentLanguage}&tl=en&dt=t&q=${encodeURIComponent(word)}`;
        const translateResponse = await fetch(translateUrl);
        const translateData = await translateResponse.json();
        
        if (translateData && translateData[0] && translateData[0][0]) {
            const englishWord = translateData[0][0][0];
            
            // Get English definition
            const definitionResponse = await fetch(`${DICTIONARY_API_BASE}en/${encodeURIComponent(englishWord)}`);
            if (definitionResponse.ok) {
                const definitionData = await definitionResponse.json();
                if (definitionData && definitionData.length > 0) {
                    // Create a custom word data object
                    return {
                        word: word,
                        phonetic: '',
                        meanings: definitionData[0].meanings,
                        phonetics: definitionData[0].phonetics,
                        translation: englishWord,
                        originalLanguage: currentLanguage
                    };
                }
            }
        }
        
        // Fallback: create basic definition
        return {
            word: word,
            phonetic: '',
            meanings: [{
                partOfSpeech: 'noun',
                definitions: [{
                    definition: `Translation: ${translateData[0]?.[0]?.[0] || word}`,
                    example: ''
                }]
            }],
            phonetics: [],
            originalLanguage: currentLanguage
        };
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

function displaySearchResults(wordData) {
    hideLoading();
    hideError();
    
    elements.resultWord.textContent = wordData.word;
    
    // Show translation if available
    if (wordData.translation && wordData.originalLanguage !== 'en') {
        elements.resultPhonetic.innerHTML = `
            <div class="text-blue-600 font-medium">Translation: ${wordData.translation}</div>
            ${wordData.phonetic ? `<div class="text-gray-600">${wordData.phonetic}</div>` : ''}
        `;
    } else {
    elements.resultPhonetic.textContent = wordData.phonetic || '';
    }
    
    // Clear previous definitions
    elements.resultDefinitions.innerHTML = '';
    
    // Display definitions
    wordData.meanings.forEach(meaning => {
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'definition-item';
        
        meaningDiv.innerHTML = `
            <div class="part-of-speech">${meaning.partOfSpeech}</div>
            <div class="definition-text">${meaning.definitions[0].definition}</div>
            ${meaning.definitions[0].example ? `<div class="example-text">"${meaning.definitions[0].example}"</div>` : ''}
        `;
        
        elements.resultDefinitions.appendChild(meaningDiv);
    });
    
    // Store audio URL if available
    if (wordData.phonetics && wordData.phonetics.length > 0) {
        const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
        if (audioUrl) {
            elements.playAudio.onclick = () => playAudio(audioUrl);
        }
    }
    
    elements.searchResults.classList.remove('hidden');
}

function showLoading() {
    elements.loadingState.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingState.classList.add('hidden');
}

function showError() {
    elements.errorState.classList.remove('hidden');
}

function hideError() {
    elements.errorState.classList.add('hidden');
}

function hideResults() {
    elements.searchResults.classList.add('hidden');
}

// Audio Functions
function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Audio playback error:', error);
    });
}

function toggleAudioSearch() {
    if (!speechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use the text input instead.');
        return;
    }
    
    if (isListening) {
        speechRecognition.stop();
    } else {
        try {
        speechRecognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            alert('Unable to start voice search. Please check your microphone permissions and try again.');
        }
    }
}

// Notification Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set notification content based on type
    if (type === 'success') {
        notification.className += ' bg-green-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;
    } else if (type === 'error') {
        notification.className += ' bg-red-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;
    } else {
        notification.className += ' bg-blue-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Vocabulary Management (Demo version using localStorage only)
async function saveWordToVocabulary(wordData) {
    try {
        const wordDoc = {
            word: wordData.word,
            phonetic: wordData.phonetic || '',
            meanings: wordData.meanings,
            audioUrl: wordData.phonetics?.find(p => p.audio)?.audio || '',
            savedAt: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Save to user-specific localStorage
        const storageKey = currentUser ? `lexilog_vocabulary_${currentUser.id}` : 'lexilog_vocabulary';
        const vocabulary = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const existingIndex = vocabulary.findIndex(w => w.word.toLowerCase() === wordData.word.toLowerCase());
        
        if (existingIndex >= 0) {
            vocabulary[existingIndex] = wordDoc;
        } else {
            vocabulary.push(wordDoc);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(vocabulary));
        
        // Show success animation and notification
        elements.searchResults.classList.add('save-success');
        showNotification(`${wordData.word} has been added to your LexiLog!`, 'success');
        
        // Immediately refresh the vocabulary list if we're on the library tab
        if (elements.libraryTab.classList.contains('active')) {
            loadUserVocabulary();
        }
        
        setTimeout(() => {
            elements.searchResults.classList.remove('save-success');
        }, 300);
        
    } catch (error) {
        console.error('Error saving word:', error);
        showNotification('Failed to save word. Please try again.', 'error');
    }
}

async function loadUserVocabulary() {
    try {
        const storageKey = currentUser ? `lexilog_vocabulary_${currentUser.id}` : 'lexilog_vocabulary';
        const vocabulary = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const words = vocabulary.sort((a, b) => b.timestamp - a.timestamp);
        displayVocabulary(words);
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        displayVocabulary([]);
    }
}

function displayVocabulary(words) {
    if (words.length === 0) {
        elements.emptyLibrary.classList.remove('hidden');
        elements.wordList.classList.add('hidden');
        return;
    }
    
    elements.emptyLibrary.classList.add('hidden');
    elements.wordList.classList.remove('hidden');
    
    elements.wordList.innerHTML = '';
    
    words.forEach(wordData => {
        const wordCard = createWordCard(wordData);
        elements.wordList.appendChild(wordCard);
    });
}

function createWordCard(wordData) {
    const card = document.createElement('div');
    card.className = 'word-card bg-white rounded-lg shadow-md p-6';
    
    const primaryMeaning = wordData.meanings[0];
    const primaryDefinition = primaryMeaning.definitions[0];
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-xl font-bold text-gray-800">${wordData.word}</h3>
            <div class="flex space-x-2">
                ${wordData.audioUrl ? `
                    <button class="audio-button text-blue-600 hover:text-blue-800" onclick="playAudio('${wordData.audioUrl}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                        </svg>
                    </button>
                ` : ''}
                <button class="text-red-600 hover:text-red-800" onclick="deleteWord('${wordData.word}')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="text-gray-600 mb-2">${wordData.phonetic || ''}</div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mb-2">${primaryMeaning.partOfSpeech}</div>
        <div class="text-gray-700 mb-2">${primaryDefinition.definition}</div>
        ${primaryDefinition.example ? `<div class="text-gray-600 italic">"${primaryDefinition.example}"</div>` : ''}
    `;
    
    return card;
}

async function deleteWord(word) {
    if (confirm(`Are you sure you want to remove "${word}" from your vocabulary?`)) {
        try {
            const storageKey = currentUser ? `lexilog_vocabulary_${currentUser.id}` : 'lexilog_vocabulary';
            const vocabulary = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const filteredVocabulary = vocabulary.filter(w => w.word.toLowerCase() !== word.toLowerCase());
            localStorage.setItem(storageKey, JSON.stringify(filteredVocabulary));
            
            showNotification(`${word} has been removed from your LexiLog.`, 'success');
            loadUserVocabulary();
        } catch (error) {
            console.error('Error deleting word:', error);
            showNotification('Failed to delete word. Please try again.', 'error');
        }
    }
}

// Word of the Day Functions (Demo version)
async function fetchWordOfTheDay() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = currentUser ? currentUser.id : 'local_user';
        
        // Check localStorage for today's word for this user
        const dailyWordData = localStorage.getItem(`lexilog_daily_word_${userId}`);
        if (dailyWordData) {
            const parsed = JSON.parse(dailyWordData);
            if (parsed.date === today) {
                displayDailyWord(parsed);
            return;
            }
        }
        
        // Fetch new random word from API
        const wordData = await fetchRandomWord();
        
        if (wordData) {
            const wordWithDate = {
                ...wordData,
                date: today,
                timestamp: Date.now()
            };
            
            // Save to localStorage (user-specific)
            localStorage.setItem(`lexilog_daily_word_${userId}`, JSON.stringify(wordWithDate));
            displayDailyWord(wordData);
        }
    } catch (error) {
        console.error('Error fetching word of the day:', error);
        setTimeout(fetchWordOfTheDay, 1000);
    }
}

async function fetchRandomWord() {
    const commonWords = [
        'serendipity', 'ephemeral', 'mellifluous', 'petrichor', 'aurora',
        'luminous', 'ethereal', 'cascade', 'whisper', 'twilight',
        'enchant', 'resilient', 'graceful', 'mystical', 'tranquil',
        'radiant', 'serene', 'majestic', 'wonder', 'bliss',
        'eloquent', 'profound', 'whimsical', 'serene', 'luminous',
        'ethereal', 'mystical', 'enchanting', 'radiant', 'tranquil',
        'graceful', 'majestic', 'wonderful', 'blissful', 'serendipitous',
        'ephemeral', 'mellifluous', 'petrichor', 'aurora', 'cascade'
    ];
    
    // Shuffle the array to get random order
    const shuffledWords = [...commonWords].sort(() => Math.random() - 0.5);
    
    // Try up to 10 random words with timeout
    for (let i = 0; i < Math.min(10, shuffledWords.length); i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const response = await fetch(`${DICTIONARY_API_BASE}en/${shuffledWords[i]}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    return data[0];
                }
            }
        } catch (error) {
            console.error(`Error fetching word ${shuffledWords[i]}:`, error);
        }
    }
    
    // If all words fail, return a simple fallback
    return {
        word: 'serendipity',
        phonetic: '/ˌserənˈdipədē/',
        meanings: [{
            partOfSpeech: 'noun',
            definitions: [{
                definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
                example: 'A fortunate stroke of serendipity'
            }]
        }],
        phonetics: []
    };
}

function displayDailyWord(wordData) {
    elements.dailyLoading.classList.add('hidden');
    elements.dailyWord.classList.remove('hidden');
    
    elements.dailyWordText.textContent = wordData.word;
    elements.dailyPhonetic.textContent = wordData.phonetic || '';
    
    // Clear previous definitions
    elements.dailyDefinitions.innerHTML = '';
    
    // Display definitions
    wordData.meanings.forEach(meaning => {
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'definition-item';
        
        meaningDiv.innerHTML = `
            <div class="part-of-speech">${meaning.partOfSpeech}</div>
            <div class="definition-text">${meaning.definitions[0].definition}</div>
            ${meaning.definitions[0].example ? `<div class="example-text">"${meaning.definitions[0].example}"</div>` : ''}
        `;
        
        elements.dailyDefinitions.appendChild(meaningDiv);
    });
    
    // Store audio URL if available
    if (wordData.phonetics && wordData.phonetics.length > 0) {
        const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
        if (audioUrl) {
            elements.playDailyAudio.onclick = () => playAudio(audioUrl);
        }
    }
    
    // Store word data for saving
    elements.saveDailyWord.onclick = () => saveDailyWord(wordData);
}

async function saveDailyWord(wordData) {
    try {
        await saveWordToVocabulary(wordData);
        elements.saveDailyWord.textContent = 'Added to My LexiLog!';
        elements.saveDailyWord.disabled = true;
        elements.saveDailyWord.classList.remove('bg-green-600', 'hover:bg-green-700');
        elements.saveDailyWord.classList.add('bg-gray-400');
        
        showNotification(`${wordData.word} has been added to your LexiLog!`, 'success');
        
        setTimeout(() => {
            elements.saveDailyWord.textContent = 'Add to My LexiLog';
            elements.saveDailyWord.disabled = false;
            elements.saveDailyWord.classList.remove('bg-gray-400');
            elements.saveDailyWord.classList.add('bg-green-600', 'hover:bg-green-700');
        }, 2000);
    } catch (error) {
        console.error('Error saving daily word:', error);
        showNotification('Failed to save word. Please try again.', 'error');
    }
}

// Event Listeners
function initializeEventListeners() {
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = elements.loginEmail.value.trim();
            const password = elements.loginPassword.value;
            
            if (email && password) {
                elements.loginButton.disabled = true;
                elements.loginButton.textContent = 'Signing In...';
                
                const success = signInWithEmail(email, password);
                
                elements.loginButton.disabled = false;
                elements.loginButton.textContent = 'Sign In';
                
                if (!success) {
                    // Error handling is done in signInWithEmail function
                }
            }
        });
    }
    
    // Signup form
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
            const name = elements.signupName.value.trim();
            const email = elements.signupEmail.value.trim();
            const password = elements.signupPassword.value;
            
            if (name && email && password) {
                elements.signupButton.disabled = true;
                elements.signupButton.textContent = 'Creating Account...';
                
                const success = signUpWithEmail(name, email, password);
                
                elements.signupButton.disabled = false;
                elements.signupButton.textContent = 'Create Account';
                
                if (!success) {
                    // Error handling is done in signUpWithEmail function
                }
            }
        });
    }
    
    // Show signup/login buttons
    if (elements.showSignupBtn) {
        elements.showSignupBtn.addEventListener('click', showSignup);
    }
    if (elements.showLoginBtn) {
        elements.showLoginBtn.addEventListener('click', showLogin);
    }
    
    // User profile dropdown
    if (elements.userProfileButton) {
        elements.userProfileButton.addEventListener('click', () => {
            elements.userProfileDropdown.classList.toggle('hidden');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.userProfileButton && !elements.userProfileButton.contains(e.target)) {
            elements.userProfileDropdown.classList.add('hidden');
        }
    });
    
    // Language selector
    if (elements.languageSelector) {
        elements.languageSelector.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            updateSpeechRecognitionLanguage();
            showNotification(`Language changed to ${SUPPORTED_LANGUAGES[currentLanguage].name}`, 'info');
        });
    }
    
    // Logout functionality
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener('click', logout);
    }
    
    // Search functionality
    elements.searchButton.addEventListener('click', () => {
        const word = elements.searchInput.value.trim();
        if (word) {
            searchWord(word);
        }
    });
    
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const word = elements.searchInput.value.trim();
            if (word) {
                searchWord(word);
            }
        }
    });
    
    // Audio search
    elements.audioButton.addEventListener('click', toggleAudioSearch);
    
    // Tab navigation
    initializeTabNavigation();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeAuth();
});

// Make functions globally available for onclick handlers
window.playAudio = playAudio;
window.deleteWord = deleteWord;
