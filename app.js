// LexiLog - Personal Vocabulary Builder
// Main Application JavaScript

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyByQABCkc1kQgSZevk30UKWQe3dq0bhHbs",
    authDomain: "lexilog-c1559.firebaseapp.com",
    projectId: "lexilog-c1559",
    storageBucket: "lexilog-c1559.firebasestorage.app",
    messagingSenderId: "383823777893",
    appId: "1:383823777893:web:ffe084adfbf2d1ee7cf68c",
    measurementId: "G-QXMEFRQ36N"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// App Configuration
const APP_ID = 'lexilog-vocabulary-builder';

// Dictionary APIs
const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/';
const WIKTIONARY_API_BASE = 'https://en.wiktionary.org/api/rest_v1/page/definition/';
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';
const WORDNIK_API_BASE = 'https://api.wordnik.com/v4/word.json/';
const COLLINS_API_BASE = 'https://api.collinsdictionary.com/api/v1/dictionaries/';
const RANDOM_WORDS_API = 'https://api.wordnik.com/v4/words.json/randomWord';
const WORDS_API_BASE = 'https://wordsapiv1.mashape.com/words/';

// Gemini AI Configuration
const GEMINI_API_KEY = 'AIzaSyAJowjMGOnrBN2g3TgbYJ0pJRQEz8164yc'; // Configured with user's API key
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
let currentUserId = null;
let speechRecognition = null;
let isListening = false;

// DOM Elements - will be initialized after DOM loads
let elements = {};

// Mobile Detection and Setup
function setupMobileInterface() {
    const isMobile = window.innerWidth <= 768;
    console.log('Mobile detection:', isMobile, 'Width:', window.innerWidth);
    
    if (isMobile) {
        // Simply add mobile class to body for CSS targeting
        document.body.classList.add('mobile-device');
        console.log('Mobile class added to body');
        
        // Don't hide the main app, just make it mobile-friendly
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.add('mobile-optimized');
        }
    }
}

// Legacy mobile interface function - no longer used
function createSimpleMobileInterface() {
    // This function is no longer used - we use CSS media queries instead
    return;
    console.log('Creating simple mobile interface...');
    
    // Hide the complex desktop main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }
    
    // Create simple mobile app structure
    const simpleMobileHTML = `
        <div id="simpleMobileApp" class="mobile-app">
            <!-- Mobile Header -->
            <div class="mobile-header">
                <div class="user-info">
                    <div class="user-avatar" id="mobileAvatar">DP</div>
                    <div class="user-details">
                        <div class="user-name" id="mobileUserNameSimple">Dhruv parashar</div>
                        <div class="user-email" id="mobileUserEmailSimple">parashardhruv27@gmail.com</div>
                    </div>
                </div>
                <button class="logout-btn" id="mobileLogoutSimple">Logout</button>
            </div>
            
            <!-- Mobile Content -->
            <div class="mobile-content">
                <div class="welcome-text">
                    <h1>Hi Dhruv, Here is your Pocket Dictionary</h1>
                </div>
                
                <div class="language-selector-mobile">
                    <select id="languageSelectorMobile">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ru">Russian</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                        <option value="ar">Arabic</option>
                        <option value="kn">Kannada</option>
                        <option value="te">Telugu</option>
                        <option value="ta">Tamil</option>
                        <option value="ml">Malayalam</option>
                        <option value="bn">Bengali</option>
                        <option value="gu">Gujarati</option>
                        <option value="mr">Marathi</option>
                        <option value="pa">Punjabi</option>
                        <option value="ur">Urdu</option>
                    </select>
                </div>
                
                <div class="search-container-mobile">
                    <input type="text" id="searchInputMobile" placeholder="✨ Type native words in English script..." />
                    <button id="audioButtonMobile" class="audio-btn">🎤</button>
                </div>
                
                <div id="searchResultsMobile" class="search-results-mobile"></div>
            </div>
            
            <!-- Mobile Bottom Navigation -->
            <div class="mobile-bottom-nav">
                <button class="nav-btn active" data-view="dictionary">
                    <span class="nav-icon">🔍</span>
                    <span class="nav-text">Dictionary</span>
                </button>
                <button class="nav-btn" data-view="translate">
                    <span class="nav-icon">🌐</span>
                    <span class="nav-text">Translate</span>
                </button>
                <button class="nav-btn" data-view="library">
                    <span class="nav-icon">📚</span>
                    <span class="nav-text">Library</span>
                </button>
                <button class="nav-btn" data-view="daily">
                    <span class="nav-icon">⭐</span>
                    <span class="nav-text">Daily</span>
                </button>
            </div>
        </div>
    `;
    
    // Add CSS for simple mobile interface
    const mobileCSS = `
        <style>
        .mobile-app {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .mobile-header {
            background: white;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: #1f2937;
        }
        
        .user-email {
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .logout-btn {
            background: none;
            border: none;
            color: #dc2626;
            font-weight: 500;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
        }
        
        .logout-btn:hover {
            background: #fef2f2;
        }
        
        .mobile-content {
            flex: 1;
            padding: 80px 1rem 80px 1rem;
            overflow-y: auto;
        }
        
        .welcome-text h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .language-selector-mobile {
            margin-bottom: 1rem;
        }
        
        .language-selector-mobile select {
            width: 100%;
            padding: 0.875rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            font-size: 1rem;
            background: white;
        }
        
        .search-container-mobile {
            position: relative;
            margin-bottom: 1.5rem;
        }
        
        .search-container-mobile input {
            width: 100%;
            padding: 1rem;
            padding-right: 3rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            font-size: 1rem;
            background: white;
        }
        
        .search-container-mobile input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .audio-btn {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 1.25rem;
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 0.5rem;
        }
        
        .audio-btn:hover {
            background: #f3f4f6;
        }
        
        .search-results-mobile {
            background: white;
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            min-height: 200px;
        }
        
        .mobile-bottom-nav {
            background: white;
            border-top: 1px solid #e5e7eb;
            padding: 0.5rem;
            display: flex;
            justify-content: space-around;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
        }
        
        .nav-btn {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            flex: 1;
            color: #6b7280;
        }
        
        .nav-btn.active {
            color: #3b82f6;
            background: #eff6ff;
        }
        
        .nav-icon {
            font-size: 1.25rem;
        }
        
        .nav-text {
            font-size: 0.75rem;
            font-weight: 500;
        }
        </style>
    `;
    
    // Insert the mobile app
    document.body.insertAdjacentHTML('beforeend', mobileCSS + simpleMobileHTML);
    
    // Add basic functionality
    setTimeout(() => {
        const searchInput = document.getElementById('searchInputMobile');
        const searchResults = document.getElementById('searchResultsMobile');
        const logoutBtn = document.getElementById('mobileLogoutSimple');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        searchResults.innerHTML = `<p>Searching for "${query}"...</p>`;
                        // Use existing search function
                        searchWord(query);
                    }
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                logout();
            });
        }
        
        // Set initial message
        if (searchResults) {
            searchResults.innerHTML = `
                <div style="text-align: center; color: #6b7280; padding: 2rem;">
                    <p>👋 Welcome to your pocket dictionary!</p>
                    <p>Type a word above and press Enter to search.</p>
                </div>
            `;
        }
        
        console.log('Mobile functionality added!');
    }, 100);
    
    console.log('Simple mobile interface created!');
}

// Display search results in mobile interface
function displayMobileSearchResults(wordData, resultsContainer) {
    console.log('Displaying mobile search results:', wordData);
    
    let html = `
        <div class="mobile-word-result">
            <div class="word-header">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">
                    ${wordData.word}
                </h2>
    `;
    
    if (wordData.phonetic) {
        html += `<div style="color: #6b7280; margin-bottom: 1rem;">${wordData.phonetic}</div>`;
    }
    
    html += `</div>`;
    
    // Definitions
    if (wordData.definitions && wordData.definitions.length > 0) {
        html += `<div class="definitions" style="margin-bottom: 1rem;">`;
        wordData.definitions.forEach((def, index) => {
            html += `
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                        ${def.partOfSpeech || 'Definition'}
                    </div>
                    <div style="color: #1f2937; line-height: 1.5;">
                        ${def.definition}
                    </div>
                    ${def.example ? `<div style="color: #6b7280; font-style: italic; margin-top: 0.5rem;">Example: ${def.example}</div>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Add to library button
    html += `
        <div style="text-align: center; margin-top: 1.5rem;">
            <button onclick="saveMobileWord('${wordData.word.replace(/'/g, "\\'")}', '${JSON.stringify(wordData).replace(/'/g, "\\'")}', '${wordData.language || 'en'}')" 
                    style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer;">
                💾 Add to My LexiLog
            </button>
        </div>
    `;
    
    html += `</div>`;
    
    resultsContainer.innerHTML = html;
}

// Save word from mobile interface
function saveMobileWord(word, wordDataStr, language) {
    try {
        const wordData = JSON.parse(wordDataStr.replace(/\\'/g, "'"));
        saveWordToVocabulary(wordData, language);
        
        // Show success message
        const resultsContainer = document.getElementById('searchResultsMobile');
        if (resultsContainer) {
            const successMsg = document.createElement('div');
            successMsg.innerHTML = `
                <div style="background: #d1fae5; color: #065f46; padding: 0.75rem; border-radius: 0.5rem; margin-top: 1rem; text-align: center;">
                    ✅ "${word}" added to your LexiLog!
                </div>
            `;
            resultsContainer.appendChild(successMsg);
            
            setTimeout(() => successMsg.remove(), 3000);
        }
    } catch (error) {
        console.error('Error saving mobile word:', error);
    }
}

// Create Mobile User Profile Header
function createMobileUserProfile() {
    // Create mobile profile header that will be shown after login
    const mobileProfileHTML = `
        <div id="mobileUserProfile" class="mobile-user-profile hidden">
            <div class="flex items-center justify-between p-4 bg-white border-b">
                <div class="flex items-center space-x-3">
                    <div id="mobileUserInitials" class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"></div>
                    <div>
                        <div id="mobileUserName" class="font-semibold text-gray-800"></div>
                        <div id="mobileUserEmail" class="text-sm text-gray-500"></div>
                    </div>
                </div>
                <button id="mobileLogoutBtn" class="text-red-600 hover:text-red-700 font-medium text-sm">
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Insert at the beginning of main content
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.insertAdjacentHTML('afterbegin', mobileProfileHTML);
    }
}

// Initialize DOM Elements
function initializeElements() {
    console.log('Initializing DOM elements...');
    
    elements = {
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
        examGoal: document.getElementById('examGoal'),
        otherExam: document.getElementById('otherExam'),
        otherExamContainer: document.getElementById('otherExamContainer'),
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
        
        // Navigation
        homeButton: document.getElementById('homeButton'),
    searchTab: document.getElementById('searchTab'),
    languagesTab: document.getElementById('languagesTab'),
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
    
        // Views
        searchView: document.getElementById('searchView'),
        translateView: document.getElementById('translateView'),
        libraryView: document.getElementById('libraryView'),
        dailyView: document.getElementById('dailyView'),
        
        // Daily Word
    dailyWordContent: document.getElementById('dailyWordContent'),
    dailyLoading: document.getElementById('dailyLoading'),
    dailyWord: document.getElementById('dailyWord'),
    dailyWordText: document.getElementById('dailyWordText'),
    dailyPhonetic: document.getElementById('dailyPhonetic'),
    dailyDefinitions: document.getElementById('dailyDefinitions'),
    playDailyAudio: document.getElementById('playDailyAudio'),
    saveDailyWord: document.getElementById('saveDailyWord')
};
    
    // Debug: Log missing elements
    const missingElements = [];
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            missingElements.push(key);
        }
    }
    
    if (missingElements.length > 0) {
        console.warn('Missing DOM elements:', missingElements);
    } else {
        console.log('All DOM elements found successfully');
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
            // Add visual feedback
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
            
            // Show user-friendly error message
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
        // Disable the audio button if speech recognition is not supported
        elements.audioButton.style.display = 'none';
    }
}

// Authentication Functions
async function initializeAuth() {
    // Check if Firebase is properly configured
    if (firebaseConfig.apiKey === "your-api-key") {
        // Firebase not configured, show login
        console.log('Firebase not configured - please configure Firebase for authentication');
        showLogin();
        return;
    }

    try {
        // Listen for authentication state changes
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                currentUserId = user.uid;
                
                // Get user profile from Firestore
                const profile = await getUserProfile();
                if (profile && profile.name && profile.email) {
                    showMainApp(profile);
        } else {
                    // User exists but no profile, this shouldn't happen with our flow
                    // But handle it gracefully
                    await signOut();
                }
        } else {
                // No user signed in
                currentUser = null;
                currentUserId = null;
                showLogin();
            }
        });
    } catch (error) {
        console.error('Authentication initialization error:', error);
        showLogin();
    }
}

// Sign up with email and password
async function signUpWithEmail(name, email, password, examGoal, otherExam) {
    try {
        // Create user account
        const result = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        
        // Save user profile with exam goal
        await saveUserProfile(name, email, examGoal, otherExam);
        
        // Get the saved profile and show main app
        const profile = await getUserProfile();
        if (profile) {
            showMainApp(profile);
        }
        
        showNotification('Account created successfully! Welcome to LexiLog!', 'success');
        return true;
    } catch (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'Failed to create account. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered. Please sign in instead.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters long.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        showNotification(errorMessage, 'error');
        return false;
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        
        showNotification('Welcome back!', 'success');
        return true;
    } catch (error) {
        console.error('Sign in error:', error);
        let errorMessage = 'Failed to sign in. Please check your credentials.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please sign up first.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        showNotification(errorMessage, 'error');
        return false;
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        currentUser = null;
        currentUserId = null;
        showNotification('Signed out successfully', 'info');
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out', 'error');
    }
}

async function getUserProfile() {
    try {
        const doc = await db.collection('artifacts').doc(APP_ID)
            .collection('users').doc(currentUserId)
            .collection('profile').doc('data').get();
        
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

async function saveUserProfile(name, email, examGoal, otherExam) {
    try {
        const profileData = {
            name: name,
            email: email,
            examGoal: examGoal || '',
            otherExam: otherExam || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            totalWordsSearched: 0,
            totalWordsSaved: 0
        };
        
        await db.collection('artifacts').doc(APP_ID)
            .collection('users').doc(currentUserId)
            .collection('profile').doc('data').set(profileData);
        
        // Also create user analytics document
        await db.collection('artifacts').doc(APP_ID)
            .collection('analytics').doc('users')
            .collection('activity').doc(currentUserId).set({
                userId: currentUserId,
                name: name,
                email: email,
                signupDate: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
                sessionsCount: 1,
                wordsSearched: 0,
                wordsSaved: 0
            });
        
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
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
    
    // Update user profile display if profile is provided
    if (userProfile && userProfile.name) {
        const firstName = userProfile.name.split(' ')[0];
        elements.greeting.innerHTML = `
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hi ${firstName},
            </span>
            <br>
            <span class="text-gray-800">Here is your Pocket Dictionary</span>
        `;
        elements.userDisplayName.textContent = userProfile.name;
        elements.userDisplayEmail.textContent = userProfile.email;
        
        // Update user initials
        const initials = userProfile.name.split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
        elements.userInitials.textContent = initials;
    } else {
        // Fallback if no profile
        elements.userDisplayName.textContent = 'User';
        elements.userDisplayEmail.textContent = '';
        elements.userInitials.textContent = 'U';
    }
    
    // Update mobile profile if exists
    const mobileProfile = document.getElementById('mobileUserProfile');
    const mobileInitials = document.getElementById('mobileUserInitials');
    const mobileName = document.getElementById('mobileUserName');
    const mobileEmail = document.getElementById('mobileUserEmail');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (mobileProfile && window.innerWidth <= 768) {
        mobileProfile.classList.remove('hidden');
        if (mobileInitials) mobileInitials.textContent = initials;
        if (mobileName) mobileName.textContent = userProfile.name;
        if (mobileEmail) mobileEmail.textContent = userProfile.email;
        
        // Add logout functionality to mobile button
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }
    }
    
    // Track user session
    trackUserActivity('session_start');
    
    // Initialize features
    initializeSpeechRecognition();
    loadUserVocabulary();
    fetchWordOfTheDay();
    
    // Initialize tab navigation and show default view
    initializeTabNavigation();
    
    // Force mobile content visibility after login
    if (window.innerWidth <= 768) {
        forceMobileContentVisibility();
    }
}

// User Activity Tracking
async function trackUserActivity(action, data = {}) {
    if (!currentUserId) return;
    
    try {
        const activityData = {
            userId: currentUserId,
            action: action,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ...data
        };
        
        // Log activity
        await db.collection('artifacts').doc(APP_ID)
            .collection('analytics').doc('users')
            .collection('activity').doc(currentUserId)
            .collection('sessions').add(activityData);
        
        // Update user stats
        const userStatsRef = db.collection('artifacts').doc(APP_ID)
            .collection('analytics').doc('users')
            .collection('activity').doc(currentUserId);
        
        if (action === 'word_saved') {
            await userStatsRef.update({
                wordsSaved: firebase.firestore.FieldValue.increment(1),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else if (action === 'word_searched') {
            await userStatsRef.update({
                wordsSearched: firebase.firestore.FieldValue.increment(1),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else if (action === 'session_start') {
            await userStatsRef.update({
                sessionsCount: firebase.firestore.FieldValue.increment(1),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error tracking user activity:', error);
    }
}

// Logout Function
async function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            // Clear local storage
            if (currentUserId) {
                localStorage.removeItem(`lexilog_daily_word_${currentUserId}`);
            }
            
            // Reset language
            currentLanguage = 'en';
            
            // Sign out from Firebase
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Error signing out', 'error');
        }
    }
}

// View Navigation
function navigateToView(targetView) {
    console.log('Navigating to view:', targetView);
    
    // Hide all views
    const allViews = ['homeView', 'dictionaryView', 'languagesView', 'libraryView', 'dailyView'];
    allViews.forEach(viewId => {
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });
    
    // Show target view
    let targetViewId = targetView + 'View';
    if (targetView === 'dictionary') {
        targetViewId = 'dictionaryView';
        currentLanguage = 'en'; // Force English for dictionary
    } else if (targetView === 'languages') {
        targetViewId = 'languagesView';
        currentLanguage = 'hi'; // Default to Hindi for languages
    } else if (targetView === 'library') {
        targetViewId = 'libraryView';
    } else if (targetView === 'daily') {
        targetViewId = 'dailyView';
    } else {
        targetViewId = 'homeView'; // Default to home
    }
    
    const targetElement = document.getElementById(targetViewId);
    if (targetElement) {
        targetElement.classList.add('active');
        targetElement.classList.remove('hidden');
    }
    
    // Show/hide navigation ribbon
    const navigationRibbon = document.getElementById('navigationRibbon');
    if (navigationRibbon) {
        if (targetView === 'home') {
            navigationRibbon.classList.add('hidden');
        } else {
            navigationRibbon.classList.remove('hidden');
        }
    }
    
    // Initialize view-specific functionality
    if (targetView === 'library') {
        displayVocabulary();
    } else if (targetView === 'daily') {
        fetchWordOfTheDay();
    }
}

// Legacy Tab Navigation (keeping for compatibility)
function initializeTabNavigation() {
    // This function is now mostly handled by navigateToView
    console.log('Tab navigation initialized (legacy)');
    
    tabButtons.forEach(button => {
        if (button) {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Force English for search tab, allow language selection for languages tab
            if (targetTab === 'search') {
                currentLanguage = 'en'; // Force English for main dictionary
            } else if (targetTab === 'languages') {
                // Keep current language selection or default to Hindi
                if (currentLanguage === 'en') {
                    currentLanguage = 'hi';
                }
            }
            
            // Update active tab button
                tabButtons.forEach(btn => {
                    if (btn) btn.classList.remove('active');
                });
            button.classList.add('active');
            
            // Update active content
            tabContents.forEach(contentId => {
                const content = document.getElementById(contentId);
                    if (content) {
                if (contentId === `${targetTab}View`) {
                    content.classList.add('active');
                            content.classList.remove('hidden');
                } else {
                    content.classList.remove('active');
                            content.classList.add('hidden');
                        }
                    }
                });
                
                // Refresh data when switching tabs
                if (targetTab === 'library') {
                    loadUserVocabulary();
                } else if (targetTab === 'daily') {
                    fetchWordOfTheDay();
                }
            });
        }
    });
    
    // Set initial active tab (search/dictionary)
    if (elements.searchTab) {
        elements.searchTab.classList.add('active');
        const searchView = document.getElementById('searchView');
        if (searchView) {
            searchView.classList.add('active');
            searchView.classList.remove('hidden');
        }
        
        // Hide other views initially
        tabContents.forEach(contentId => {
            if (contentId !== 'searchView') {
                const content = document.getElementById(contentId);
                if (content) {
                    content.classList.remove('active');
                    content.classList.add('hidden');
                }
            }
        });
    }
}

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

// Native Language Dictionary Search
async function searchWord(word) {
    if (!word.trim()) return;
    
    showLoading();
    hideResults();
    hideError();
    
    try {
        let wordData = null;
        const searchTerm = word.trim().toLowerCase();
        
        if (currentLanguage === 'en') {
            // For English: Try multiple sources for better definitions
            wordData = await getEnglishDefinition(searchTerm);
        } else {
            // For other languages: Detect if input is native script or romanized
            wordData = await getNativeLanguageDefinition(searchTerm, currentLanguage);
        }
        
        if (wordData) {
            displaySearchResults(wordData);
            await saveWordToVocabulary(wordData);
            // Track word search activity
            trackUserActivity('word_searched', { word: wordData.word, language: currentLanguage });
        } else {
            throw new Error('Word not found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError();
    }
}

// Smart Native Language Definition (Handles both native script and romanized input)
async function getNativeLanguageDefinition(inputWord, targetLanguage) {
    try {
        const languageName = SUPPORTED_LANGUAGES[targetLanguage]?.name || targetLanguage;
        console.log(`🔍 Searching for "${inputWord}" in ${languageName}...`);
        
        // Step 1: Detect if input is native script or romanized English
        const isNativeScript = isNativeScriptDetected(inputWord, targetLanguage);
        console.log(`📝 Input type detected: ${isNativeScript ? 'Native Script' : 'Romanized English'}`);
        
        let nativeWord = null;
        let romanizedWord = null;
        let definition = null;
        let actualRomanized = null;
        let isGeminiAvailable = GEMINI_API_KEY !== 'your-gemini-api-key-here';
        
        if (isNativeScript) {
            // Input is already in native script (like "हाथ")
            nativeWord = inputWord;
            console.log(`✅ Using native script input: "${nativeWord}"`);
            
            // Try to get English meaning for definition
            const englishTranslation = await translateText(nativeWord, targetLanguage, 'en');
            if (englishTranslation && englishTranslation !== nativeWord) {
                // Store English translation separately (NOT as romanized)
                romanizedWord = englishTranslation.toLowerCase();
                
                // Try to get romanized version using Gemini AI
                try {
                    if (GEMINI_API_KEY !== 'your-gemini-api-key-here') {
                        actualRomanized = await getGeminiRomanization(nativeWord, targetLanguage);
                    }
                    
                    // Fallback to simple transliteration service if Gemini fails
                    if (!actualRomanized) {
                        actualRomanized = await getRomanizedVersion(nativeWord, targetLanguage);
                    }
                } catch (e) {
                    console.log('Could not get romanized version:', e);
                }
                
                // Get proper English definition instead of just translation
                try {
                    const englishDef = await getEnglishDefinition(englishTranslation);
                    if (englishDef && englishDef.meanings && englishDef.meanings[0]) {
                        const firstDef = englishDef.meanings[0].definitions[0];
                        if (firstDef) {
                            definition = firstDef.definition;
                        } else {
                            definition = `This ${languageName} word means "${englishTranslation}" in English.`;
                        }
                    } else {
                        definition = `This ${languageName} word means "${englishTranslation}" in English.`;
                    }
                } catch (e) {
                    console.log('Could not get English definition, using translation');
                    definition = `This ${languageName} word means "${englishTranslation}" in English.`;
                }
            } else {
                definition = `${languageName} word: "${nativeWord}".`;
            }
        } else {
            // Input is romanized English (like "haath")
            romanizedWord = inputWord;
            actualRomanized = inputWord; // For romanized input, this IS the romanized pronunciation
            console.log(`✅ Using romanized input: "${romanizedWord}"`);
            
            // Step 2: Try Gemini AI for native definition (if API key is configured)
            if (isGeminiAvailable) {
                console.log('🤖 Trying Gemini AI for native definition...');
                const geminiResult = await getGeminiNativeDefinition(romanizedWord, targetLanguage);
                            if (geminiResult && geminiResult.isValid) {
                nativeWord = geminiResult.nativeScript;
                
                // Create rich definition with cultural context
                let richDefinition = geminiResult.definition;
                if (geminiResult.partOfSpeech) {
                    richDefinition = `(${geminiResult.partOfSpeech}) ${richDefinition}`;
                }
                if (geminiResult.culturalNote) {
                    richDefinition += ` • Cultural note: ${geminiResult.culturalNote}`;
                }
                
                definition = richDefinition;
                console.log('✅ Gemini AI provided enhanced definition:', { nativeWord, definition, partOfSpeech: geminiResult.partOfSpeech });
                
                // Show success notification for Gemini AI (one-time)
                if (!sessionStorage.getItem('gemini-success-shown')) {
                    showNotification('🤖 Gemini AI activated! You now get premium native language definitions with cultural context!', 'success', 4000);
                    sessionStorage.setItem('gemini-success-shown', 'true');
                }
            }
            } else {
                console.log('⚠️ Gemini API not configured, using enhanced fallbacks...');
            }
            
            // Step 3: Fallback - try translation from English to native script
            if (!nativeWord) {
                console.log('🔄 Trying translation fallback...');
                nativeWord = await translateText(romanizedWord, 'en', targetLanguage);
                
                if (nativeWord && nativeWord !== romanizedWord) {
                    // Get English meaning for better context
                    const englishMeaning = await translateText(nativeWord, targetLanguage, 'en');
                    if (englishMeaning) {
                        definition = `This ${languageName} word means "${englishMeaning}" in English.`;
                    }
                }
            }
        }
        
        // Step 4: Create comprehensive result
        const wordData = {
            word: nativeWord || inputWord,
            romanized: romanizedWord && romanizedWord !== nativeWord ? romanizedWord : null,
            actualRomanized: actualRomanized,
            phonetic: '',
            definitions: [],
            language: targetLanguage,
            isNativeLanguage: true,
            source: isGeminiAvailable && definition ? 'gemini' : 'translation',
            inputType: isNativeScript ? 'native-script' : 'romanized'
        };
        
        // Format definitions properly
        if (definition) {
            wordData.definitions = [{
                partOfSpeech: 'word',
                definition: definition,
                example: ''
            }];
        } else {
            // Last resort fallback
            wordData.definitions = [{
                partOfSpeech: 'word',
                definition: `${languageName} word "${inputWord}". For better definitions, configure Gemini AI API.`,
                example: ''
            }];
        }
        
        console.log('✅ Native language result:', wordData);
        
        return wordData;
        
    } catch (error) {
        console.error('❌ Native language definition error:', error);
        
        // Emergency fallback - preserve original input
        return {
            word: inputWord,
            romanized: null,
            phonetic: '',
            definitions: [{
                partOfSpeech: 'word',
                definition: `${SUPPORTED_LANGUAGES[targetLanguage]?.name || targetLanguage} word: "${inputWord}". Unable to fetch detailed definition.`,
                example: ''
            }],
            language: targetLanguage,
            isNativeLanguage: true,
            source: 'fallback'
        };
    }
}

// Helper function to detect if input is native script or romanized English
function isNativeScriptDetected(inputWord, language) {
    // Simple detection based on Unicode ranges for common languages
    const unicodeRanges = {
        'hi': /[\u0900-\u097F]/, // Devanagari (Hindi)
        'kn': /[\u0C80-\u0CFF]/, // Kannada
        'ta': /[\u0B80-\u0BFF]/, // Tamil
        'te': /[\u0C00-\u0C7F]/, // Telugu
        'ml': /[\u0D00-\u0D7F]/, // Malayalam
        'bn': /[\u0980-\u09FF]/, // Bengali
        'gu': /[\u0A80-\u0AFF]/, // Gujarati
        'mr': /[\u0900-\u097F]/, // Marathi (uses Devanagari)
        'pa': /[\u0A00-\u0A7F]/, // Punjabi (Gurmukhi)
        'ur': /[\u0600-\u06FF]/, // Urdu (Arabic script)
        'ar': /[\u0600-\u06FF]/, // Arabic
        'zh': /[\u4E00-\u9FFF]/, // Chinese
        'ja': /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/, // Japanese (Hiragana, Katakana, Kanji)
        'ko': /[\uAC00-\uD7AF]/, // Korean
        'ru': /[\u0400-\u04FF]/, // Cyrillic (Russian)
        'fr': /[àâäèéêëïîôöùûüÿç]/, // French accented characters
        'de': /[äöüß]/, // German special characters
        'es': /[ñáéíóúü]/, // Spanish accented characters
        'it': /[àèéìíîòóù]/, // Italian accented characters
        'pt': /[ãáâàéêíóôõú]/ // Portuguese accented characters
    };
    
    const range = unicodeRanges[language];
    if (range) {
        return range.test(inputWord);
    }
    
    // Fallback: if contains non-ASCII characters, likely native script
    return /[^\x00-\x7F]/.test(inputWord);
}

function generateRomanizedFromNative(nativeWord, language) {
    // Simple romanization mapping for common words
    const romanizationMaps = {
        'hi': {
            'हाथ': 'haath',
            'पानी': 'paani',
            'घर': 'ghar',
            'किताब': 'kitaab',
            'स्कूल': 'school',
            'दोस्त': 'dost',
            'खाना': 'khaana',
            'समय': 'samay'
        },
        'kn': {
            'ಇಲ್ಲಿ': 'illi',
            'ಇದಿರಾ': 'idira',
            'ಮನೆ': 'mane',
            'ಪುಸ್ತಕ': 'pustaka',
            'ನೀರು': 'neeru'
        },
        'te': {
            'ఇల్లు': 'illu',
            'నీరు': 'neeru',
            'పుస్తకం': 'pustakam',
            'తిన్నాను': 'tinnaanu'
        },
        'ta': {
            'வீடு': 'veedu',
            'நீர்': 'neer',
            'புத்தகம்': 'puthagam',
            'சாப்பிட்டேன்': 'sappitten'
        },
        'bn': {
            'বাড়ি': 'bari',
            'পানি': 'paani',
            'খেয়েছি': 'kheyechi'
        },
        'ml': {
            'വീട്': 'veedu',
            'വെള্ളം': 'vellam',
            'കഴിച്ചു': 'kazhichu'
        },
        'gu': {
            'ઘર': 'ghar',
            'પાણી': 'paani',
            'ખાધું': 'khadhum'
        }
    };
    
    const map = romanizationMaps[language];
    if (map && map[nativeWord]) {
        return map[nativeWord];
    }
    
    return null;
}

async function getGeminiRomanization(nativeWord, language) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
        return null;
    }
    
    const languageNames = {
        'hi': 'Hindi', 'kn': 'Kannada', 'te': 'Telugu', 'ta': 'Tamil',
        'ml': 'Malayalam', 'gu': 'Gujarati', 'pa': 'Punjabi', 'bn': 'Bengali',
        'mr': 'Marathi', 'or': 'Odia', 'ur': 'Urdu', 'ar': 'Arabic',
        'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ru': 'Russian',
        'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese'
    };
    
    const languageName = languageNames[language] || language;
    
    const prompt = `You are an expert in ${languageName} transliteration. Please provide the romanized (English script) version of this ${languageName} word: "${nativeWord}"

Examples for different languages:
- Hindi: हाथ → haath, पानी → paani
- Kannada: ಇಲ್ಲಿ → illi, ಮನೆ → mane
- Tamil: வீடு → veedu, சாப்பிட்டேன் → sappitten
- Telugu: ఇల్లు → illu, తిన్నాను → tinnaanu
- Bengali: বাড়ি → bari, খেয়েছি → kheyechi
- Malayalam: വീട് → veedu, കഴിച്ചു → kazhichu
- Gujarati: ઘર → ghar, ખાધું → khadhum

Please respond with ONLY the romanized version in lowercase, no extra text or explanation.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            console.error('Gemini romanization API error:', response.status);
            return null;
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            const romanized = data.candidates[0].content.parts[0].text.trim().toLowerCase();
            console.log(`✅ Gemini romanization: ${nativeWord} → ${romanized}`);
            return romanized;
        }
    } catch (error) {
        console.error('Error getting Gemini romanization:', error);
    }
    
    return null;
}

// Helper function to get romanized version of native script
async function getRomanizedVersion(nativeWord, language) {
    try {
        // For now, we'll use a simple approach - try translating to English and back
        // This is not perfect but provides some romanization
        const englishTranslation = await translateText(nativeWord, language, 'en');
        if (englishTranslation && englishTranslation !== nativeWord) {
            // Try to get a romanized version by translating back
            const romanized = await translateText(englishTranslation, 'en', language);
            if (romanized && romanized !== nativeWord) {
                return englishTranslation.toLowerCase(); // Use English word as romanized
            }
        }
        return null;
    } catch (error) {
        console.log('Could not get romanized version:', error);
        return null;
    }
}

// Gemini AI Native Language Definition
async function getGeminiNativeDefinition(romanizedWord, language) {
    if (GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.log('Gemini API key not configured, skipping native definition...');
        return null;
    }
    
    try {
        const languageName = SUPPORTED_LANGUAGES[language]?.name || language;
        const prompt = `You are an expert ${languageName} dictionary and language assistant. The user typed "${romanizedWord}" in English script (romanized/transliterated).

Please provide:
1. The correct native script version of this word in ${languageName}
2. A comprehensive definition/meaning of this word in English (for better understanding)
3. Cultural context or usage notes if relevant
4. Part of speech (noun, verb, adjective, etc.)

Respond in JSON format:
{
  "nativeScript": "word in native script",
  "definition": "comprehensive definition in English with cultural context",
  "partOfSpeech": "noun/verb/adjective/etc",
  "culturalNote": "cultural context or usage note (optional)",
  "isValid": true/false
}

Examples:
- If input is "namaste" → {"nativeScript": "नमस्ते", "definition": "A respectful greeting meaning 'I bow to you', used when meeting or parting", "partOfSpeech": "interjection", "culturalNote": "Traditional Hindu greeting with hands pressed together", "isValid": true}
- If input is "haath" → {"nativeScript": "हाथ", "definition": "Hand - the part of the body at the end of the arm", "partOfSpeech": "noun", "isValid": true}

If "${romanizedWord}" is not a valid ${languageName} word, set isValid to false.`;
        
        const response = await fetch(`${GEMINI_API_BASE}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
                try {
                    // Try to parse JSON response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);
                        if (result.isValid) {
                            return result;
                        }
                    }
                } catch (parseError) {
                    console.error('Gemini native definition parse error:', parseError);
                }
            }
        }
    } catch (error) {
        console.error('Gemini native definition API error:', error);
    }
    return null;
}

// Enhanced English Definition with Multiple Sources
async function getEnglishDefinition(word) {
    // Try multiple sources in order of preference
    const sources = [
        () => getDictionaryApiDefinition(word),
        () => getGeminiDefinition(word, 'en'),
        () => getWiktionaryDefinition(word)
    ];
    
    for (const source of sources) {
        try {
            const result = await source();
            if (result) {
                return result;
            }
        } catch (error) {
            console.log(`Source failed, trying next...`, error);
        }
    }
    
    return null;
}

// Multilingual Definition (English input → Target language)
async function getMultilingualDefinition(englishWord, targetLanguage) {
    try {
        // Step 1: Get English definition first
        const englishDef = await getEnglishDefinition(englishWord);
        
        // Step 2: Translate the word to target language
        const translatedWord = await translateText(englishWord, 'en', targetLanguage);
        
        // Step 3: Get definition in target language using Gemini
        let targetDef = null;
        if (translatedWord) {
            targetDef = await getGeminiDefinition(translatedWord, targetLanguage);
        }
        
        // Step 4: Combine results
        const combinedDef = {
            word: translatedWord || englishWord,
            originalWord: englishWord,
            phonetic: englishDef?.phonetic || '',
            meanings: [],
            translation: translatedWord,
            originalLanguage: targetLanguage,
            englishDefinition: englishDef
        };
        
        // Add target language definition if available
        if (targetDef && targetDef.meanings) {
            combinedDef.meanings = targetDef.meanings;
        } else if (englishDef && englishDef.meanings) {
            // Fallback to English definition with translation note
            combinedDef.meanings = englishDef.meanings.map(meaning => ({
                ...meaning,
                definitions: meaning.definitions.map(def => ({
                    ...def,
                    definition: `(English: ${def.definition}) - Translation: ${translatedWord || englishWord}`
                }))
            }));
        } else {
            // Basic fallback
            combinedDef.meanings = [{
                partOfSpeech: 'word',
                definitions: [{
                    definition: `Translation of "${englishWord}" in ${SUPPORTED_LANGUAGES[targetLanguage]?.name || targetLanguage}: ${translatedWord || englishWord}`,
                    example: ''
                }]
            }];
        }
        
        return combinedDef;
    } catch (error) {
        console.error('Multilingual definition error:', error);
        return null;
    }
}

// Dictionary API Definition
async function getDictionaryApiDefinition(word) {
    try {
        const response = await fetch(`${DICTIONARY_API_BASE}en/${encodeURIComponent(word)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return data[0];
            }
        }
    } catch (error) {
        console.error('Dictionary API error:', error);
    }
    return null;
}

// Gemini AI Definition
async function getGeminiDefinition(word, language) {
    if (GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.log('Gemini API key not configured, skipping...');
        return null;
    }
    
    try {
        const languageName = SUPPORTED_LANGUAGES[language]?.name || language;
        const prompt = language === 'en' 
            ? `Define the word "${word}" in English. Provide: 1) Part of speech, 2) Clear definition, 3) Example sentence. Format as JSON with structure: {"word": "${word}", "phonetic": "", "meanings": [{"partOfSpeech": "", "definitions": [{"definition": "", "example": ""}]}]}`
            : `Define the word "${word}" in ${languageName}. Provide the definition in ${languageName} language. Format as JSON with structure: {"word": "${word}", "phonetic": "", "meanings": [{"partOfSpeech": "", "definitions": [{"definition": "", "example": ""}]}]}`;
        
        const response = await fetch(`${GEMINI_API_BASE}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
                try {
                    // Try to parse JSON response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                } catch (parseError) {
                    console.error('Gemini JSON parse error:', parseError);
                }
                
                // Fallback: Create structured response from text
                return {
                    word: word,
                    phonetic: '',
                    meanings: [{
                        partOfSpeech: 'definition',
                        definitions: [{
                            definition: content.replace(/\*\*/g, '').trim(),
                            example: ''
                        }]
                    }]
                };
            }
        }
    } catch (error) {
        console.error('Gemini API error:', error);
    }
    return null;
}

// Wiktionary Definition
async function getWiktionaryDefinition(word) {
    try {
        const response = await fetch(`${WIKTIONARY_API_BASE}${encodeURIComponent(word)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.en && data.en.length > 0) {
                const entry = data.en[0];
                return {
                    word: word,
                    phonetic: '',
                    meanings: [{
                        partOfSpeech: entry.partOfSpeech || 'word',
                        definitions: [{
                            definition: entry.definitions?.[0]?.definition || entry.definition || 'Definition available',
                            example: entry.examples?.[0] || ''
                        }]
                    }]
                };
            }
        }
    } catch (error) {
        console.error('Wiktionary API error:', error);
    }
    return null;
}

// Enhanced Translation Function
async function translateText(text, fromLang, toLang) {
    try {
        const response = await fetch(`${GOOGLE_TRANSLATE_API}?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        
        if (data && data[0] && data[0][0]) {
            return data[0][0][0];
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
    return null;
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
    
    // Also display in mobile interface if it exists
    const mobileResults = document.getElementById('searchResultsMobile');
    if (mobileResults && window.innerWidth <= 768) {
        displayMobileSearchResults(wordData, mobileResults);
        return; // Use mobile display only
    }
    
    // Enhanced display for native language results
    if (wordData.isNativeLanguage) {
        let wordHtml = `<div class="text-3xl font-bold text-gray-800 mb-2">${wordData.word}</div>`;
        
        // Show English translation if available
        if (wordData.romanized && /^[a-zA-Z\s]+$/.test(wordData.romanized)) {
            wordHtml += `<div class="text-lg text-blue-600 mb-1">English: "${wordData.romanized}"</div>`;
        }
        
        // Show source and input type indicators
        const sourceIcon = wordData.source === 'gemini' ? '🤖' : wordData.source === 'translation' ? '🔄' : '📚';
        const sourceName = wordData.source === 'gemini' ? 'Gemini AI' : wordData.source === 'translation' ? 'Translation Service' : 'Dictionary';
        const inputTypeIcon = wordData.inputType === 'native-script' ? '📝' : '🔤';
        const inputTypeName = wordData.inputType === 'native-script' ? 'Native Script' : 'Romanized';
        wordHtml += `<div class="text-sm text-gray-500 mb-2">${sourceIcon} ${sourceName} • ${inputTypeIcon} ${inputTypeName}</div>`;
        
        elements.resultWord.innerHTML = wordHtml;
    } else if (wordData.originalWord && wordData.originalWord !== wordData.word) {
        // Show both original English word and translation
        elements.resultWord.innerHTML = `
            <div class="text-2xl font-bold text-gray-800">${wordData.word}</div>
            <div class="text-lg text-blue-600 mt-1">English: "${wordData.originalWord}"</div>
        `;
    } else {
    elements.resultWord.textContent = wordData.word;
    }
    
    // Enhanced phonetic and language display
    let phoneticHtml = '';
    if (wordData.phonetic) {
        phoneticHtml += `<div class="text-gray-600 mb-2">${wordData.phonetic}</div>`;
    }
    if (wordData.isNativeLanguage) {
        const langName = SUPPORTED_LANGUAGES[wordData.language]?.name || wordData.language;
        phoneticHtml += `<div class="text-purple-600 font-medium mb-2">📚 ${langName} Dictionary</div>`;
    } else if (wordData.translation && wordData.originalLanguage !== 'en') {
        const langName = SUPPORTED_LANGUAGES[wordData.originalLanguage]?.name || wordData.originalLanguage;
        phoneticHtml += `<div class="text-blue-600 font-medium mb-2">🌐 ${langName} Translation</div>`;
    }
    if (wordData.originalWord && currentLanguage !== 'en') {
        phoneticHtml += `<div class="text-green-600 text-sm mb-2">✨ Searched in English, translated to ${SUPPORTED_LANGUAGES[currentLanguage]?.name || currentLanguage}</div>`;
    }
    
    elements.resultPhonetic.innerHTML = phoneticHtml;
    
    // Clear previous definitions
    elements.resultDefinitions.innerHTML = '';
    
    // Display definitions with enhanced formatting (support both meanings and definitions structure)
    const meaningsToDisplay = wordData.meanings || (wordData.definitions ? [{ partOfSpeech: 'definition', definitions: wordData.definitions }] : []);
    
    meaningsToDisplay.forEach((meaning, index) => {
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'definition-item hover-lift';
        
        // Choose gradient based on language type
        const gradient = wordData.isNativeLanguage 
            ? 'from-purple-500 to-pink-500' 
            : 'from-blue-500 to-purple-500';
        
        // Enhanced styling for definitions
        meaningDiv.innerHTML = `
            <div class="part-of-speech bg-gradient-to-r ${gradient} text-white px-3 py-1 rounded-full text-xs uppercase tracking-wide inline-block mb-3">${meaning.partOfSpeech}</div>
            <div class="definition-text text-gray-800 text-lg leading-relaxed mb-3">${meaning.definitions[0].definition}</div>
            ${meaning.definitions[0].example ? `<div class="example-text bg-gray-50 border-l-4 border-purple-500 pl-4 py-2 italic text-gray-700 rounded">"${meaning.definitions[0].example}"</div>` : ''}
        `;
        
        // Add animation delay for each definition
        meaningDiv.style.animationDelay = `${index * 0.1}s`;
        meaningDiv.classList.add('animate-fade-in-up');
        
        elements.resultDefinitions.appendChild(meaningDiv);
    });
    
    // Handle audio pronunciation for native languages
    if (wordData.isNativeLanguage && wordData.word) {
        // Use Text-to-Speech for native pronunciation
        elements.playAudio.onclick = () => playNativePronunciation(wordData.word, wordData.language);
    } else if (wordData.phonetics && wordData.phonetics.length > 0) {
        const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
        if (audioUrl) {
            elements.playAudio.onclick = () => playAudio(audioUrl);
        }
    }
    
    elements.searchResults.classList.remove('hidden');
    
    // Add success notification
    const langName = SUPPORTED_LANGUAGES[currentLanguage]?.name || 'the selected language';
    const searchType = wordData.isNativeLanguage ? 'native word' : 'definition';
    showNotification(`✨ Found ${searchType} for "${wordData.romanized || wordData.originalWord || wordData.word}" in ${langName}!`, 'success');
}

// Native Language Pronunciation using Text-to-Speech
function playNativePronunciation(word, language) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        
        // Map our language codes to speech synthesis language codes
        const speechLangMap = {
            'hi': 'hi-IN',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'bn': 'bn-IN',
            'te': 'te-IN',
            'ta': 'ta-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'gu': 'gu-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN'
        };
        
        utterance.lang = speechLangMap[language] || language;
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
        
        showNotification(`🔊 Playing pronunciation in ${SUPPORTED_LANGUAGES[language]?.name || language}`, 'info');
    } else {
        showNotification('❌ Text-to-speech not supported in this browser', 'error');
    }
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

// Vocabulary Management
async function saveWordToVocabulary(wordData) {
    try {
        const wordDoc = {
            word: wordData.word,
            phonetic: wordData.phonetic || '',
            meanings: wordData.meanings || (wordData.definitions ? [{ partOfSpeech: 'definition', definitions: wordData.definitions }] : []),
            audioUrl: wordData.phonetics?.find(p => p.audio)?.audio || '',
            savedAt: new Date().toISOString(),
            timestamp: Date.now(),
            language: wordData.language || 'en',
            isNativeLanguage: wordData.isNativeLanguage || false,
            romanized: wordData.romanized || null,
            source: wordData.source || 'dictionary',
            // Add Word of the Day tag if applicable
            isWordOfDay: wordData.isWordOfDay || false,
            wordOfDayDate: wordData.isWordOfDay ? wordData.date : null
        };
        
        // Try Firebase first
        if (firebaseConfig.apiKey !== "your-api-key" && currentUserId) {
        await db.collection('artifacts').doc(APP_ID)
            .collection('users').doc(currentUserId)
            .collection('vocabulary').doc(wordData.word.toLowerCase())
            .set(wordDoc);
        }
        
        // Always save to localStorage as fallback
        const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
        const existingIndex = vocabulary.findIndex(w => w.word.toLowerCase() === wordData.word.toLowerCase());
        
        if (existingIndex >= 0) {
            vocabulary[existingIndex] = wordDoc;
        } else {
            vocabulary.push(wordDoc);
        }
        
        localStorage.setItem('lexilog_vocabulary', JSON.stringify(vocabulary));
        
        // Show success animation and notification
        elements.searchResults.classList.add('save-success');
        
        // Track word save activity
        trackUserActivity('word_saved', { word: wordData.word });
        
        // Create and show notification
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
        // Fallback to localStorage only
        try {
            const wordDoc = {
                word: wordData.word,
                phonetic: wordData.phonetic || '',
                meanings: wordData.meanings || (wordData.definitions ? [{ partOfSpeech: 'definition', definitions: wordData.definitions }] : []),
                audioUrl: wordData.phonetics?.find(p => p.audio)?.audio || '',
                savedAt: new Date().toISOString(),
                timestamp: Date.now(),
                language: wordData.language || 'en',
                isNativeLanguage: wordData.isNativeLanguage || false,
                romanized: wordData.romanized || null,
                source: wordData.source || 'dictionary'
            };
            
            const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
            const existingIndex = vocabulary.findIndex(w => w.word.toLowerCase() === wordData.word.toLowerCase());
            
            if (existingIndex >= 0) {
                vocabulary[existingIndex] = wordDoc;
            } else {
                vocabulary.push(wordDoc);
            }
            
            localStorage.setItem('lexilog_vocabulary', JSON.stringify(vocabulary));
            
            // Show success animation and notification
            elements.searchResults.classList.add('save-success');
            showNotification(`${wordData.word} has been added to your LexiLog!`, 'success');
            setTimeout(() => {
                elements.searchResults.classList.remove('save-success');
            }, 300);
        } catch (localError) {
            console.error('Error saving to localStorage:', localError);
        }
    }
}

async function loadUserVocabulary() {
    try {
        let words = [];
        
        // Try Firebase first
        if (firebaseConfig.apiKey !== "your-api-key" && currentUserId) {
        const snapshot = await db.collection('artifacts').doc(APP_ID)
            .collection('users').doc(currentUserId)
            .collection('vocabulary')
            .orderBy('timestamp', 'desc')
            .get();
        
        snapshot.forEach(doc => {
            words.push({ id: doc.id, ...doc.data() });
        });
        }
        
        // If no words from Firebase, try localStorage
        if (words.length === 0) {
            const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
            words = vocabulary.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        displayVocabulary(words);
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        // Fallback to localStorage
        try {
            const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
            const words = vocabulary.sort((a, b) => b.timestamp - a.timestamp);
            displayVocabulary(words);
        } catch (localError) {
            console.error('Error loading from localStorage:', localError);
        displayVocabulary([]);
        }
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
    
    // Format date for Word of the Day tag
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
            <h3 class="text-xl font-bold text-gray-800">${wordData.word}</h3>
                ${wordData.isWordOfDay ? `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                        🌟 Word of the Day - ${formatDate(wordData.wordOfDayDate)}
                    </span>
                ` : ''}
            </div>
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
            // Try Firebase first
            if (firebaseConfig.apiKey !== "your-api-key" && currentUserId) {
            await db.collection('artifacts').doc(APP_ID)
                .collection('users').doc(currentUserId)
                .collection('vocabulary').doc(word.toLowerCase())
                .delete();
            }
            
            // Always remove from localStorage
            const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
            const filteredVocabulary = vocabulary.filter(w => w.word.toLowerCase() !== word.toLowerCase());
            localStorage.setItem('lexilog_vocabulary', JSON.stringify(filteredVocabulary));
            
            // Reload vocabulary
            loadUserVocabulary();
        } catch (error) {
            console.error('Error deleting word:', error);
            // Fallback to localStorage only
            try {
                const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
                const filteredVocabulary = vocabulary.filter(w => w.word.toLowerCase() !== word.toLowerCase());
                localStorage.setItem('lexilog_vocabulary', JSON.stringify(filteredVocabulary));
                loadUserVocabulary();
            } catch (localError) {
                console.error('Error deleting from localStorage:', localError);
            }
        }
    }
}

// Word of the Day Functions
async function fetchWordOfTheDay() {
    try {
        if (!elements.dailyLoading || !elements.dailyWord) {
            console.log('Daily word elements not found, skipping...');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const userId = currentUserId || 'local_user';
        
        // Check localStorage first for today's word for this user
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
        showDailyWordError();
    }
}

function displayDailyWord(wordData) {
    if (!elements.dailyLoading || !elements.dailyWord) {
        return;
    }
    
    elements.dailyLoading.classList.add('hidden');
    elements.dailyWord.classList.remove('hidden');
    
    elements.dailyWordText.textContent = wordData.word;
    elements.dailyPhonetic.textContent = wordData.phonetic || '';
    
    // Clear previous definitions
    elements.dailyDefinitions.innerHTML = '';
    
    // Display definitions (handle both meanings and definitions structure)
    const meaningsToDisplay = wordData.meanings || (wordData.definitions ? [{ partOfSpeech: 'definition', definitions: wordData.definitions }] : []);
    
    if (meaningsToDisplay.length > 0) {
        meaningsToDisplay.forEach(meaning => {
        const meaningDiv = document.createElement('div');
            meaningDiv.className = 'definition-item mb-4';
            
            const definitions = meaning.definitions || [];
            const firstDef = definitions[0] || { definition: 'Definition not available' };
        
        meaningDiv.innerHTML = `
                <div class="text-sm text-purple-600 uppercase tracking-wide mb-2">${meaning.partOfSpeech || 'Word'}</div>
                <div class="text-gray-700 mb-2">${firstDef.definition}</div>
                ${firstDef.example ? `<div class="text-gray-600 italic">"${firstDef.example}"</div>` : ''}
        `;
        
        elements.dailyDefinitions.appendChild(meaningDiv);
    });
    } else {
        // Fallback if no definitions available
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'definition-item mb-4';
        fallbackDiv.innerHTML = `
            <div class="text-gray-700">Word of the day: <strong>${wordData.word}</strong></div>
            <div class="text-gray-600 mt-2">Definition loading...</div>
        `;
        elements.dailyDefinitions.appendChild(fallbackDiv);
    }
    
    // Store current word for saving
    window.currentDailyWord = wordData;
}

function showDailyWordError() {
    if (!elements.dailyLoading || !elements.dailyWord) {
        return;
    }
    
    elements.dailyLoading.classList.add('hidden');
    elements.dailyWord.classList.remove('hidden');
    
    elements.dailyWordText.textContent = 'serendipity';
    elements.dailyPhonetic.textContent = '/ˌserənˈdipədē/';
    elements.dailyDefinitions.innerHTML = `
        <div class="definition-item mb-4">
            <div class="text-sm text-purple-600 uppercase tracking-wide mb-2">noun</div>
            <div class="text-gray-700 mb-2">The occurrence and development of events by chance in a happy or beneficial way.</div>
            <div class="text-gray-600 italic">"A fortunate stroke of serendipity"</div>
        </div>
    `;
    
    window.currentDailyWord = {
        word: 'serendipity',
        phonetic: '/ˌserənˈdipədē/',
        meanings: [{
            partOfSpeech: 'noun',
            definitions: [{
                definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
                example: 'A fortunate stroke of serendipity'
            }]
        }]
    };
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

// Duplicate function removed - using the main displayDailyWord function above

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
    // Exam goal dropdown handler
    if (elements.examGoal) {
        elements.examGoal.addEventListener('change', (e) => {
            if (e.target.value === 'other') {
                elements.otherExamContainer?.classList.remove('hidden');
                elements.otherExam?.setAttribute('required', 'required');
            } else {
                elements.otherExamContainer?.classList.add('hidden');
                elements.otherExam?.removeAttribute('required');
                elements.otherExam.value = '';
            }
        });
    }
    
    // Feature card navigation
    const featureCards = document.querySelectorAll('.feature-card[data-navigate]');
    featureCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = card.dataset.navigate;
            navigateToView(target);
        });
    });
    
    // Navigation ribbon buttons
    const navButtons = document.querySelectorAll('.nav-button[data-navigate]');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = button.dataset.navigate;
            navigateToView(target);
        });
    });
    
    // Logo click to go home
    if (elements.homeButton) {
        elements.homeButton.addEventListener('click', () => {
            navigateToView('home');
        });
    }
    
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value.trim();
        const password = elements.loginPassword.value;
        
        if (email && password) {
            elements.loginButton.disabled = true;
            elements.loginButton.textContent = 'Signing In...';
            
            const success = await signInWithEmail(email, password);
            
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
        const examGoal = elements.examGoal.value;
        const otherExam = elements.otherExam?.value || '';
        
        if (name && email && password && examGoal) {
            elements.signupButton.disabled = true;
            elements.signupButton.textContent = 'Creating Account...';
            
            const success = await signUpWithEmail(name, email, password, examGoal, otherExam);
            
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
    if (elements.userProfileButton && elements.userProfileDropdown) {
        elements.userProfileButton.addEventListener('click', () => {
            elements.userProfileDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.userProfileButton.contains(e.target)) {
                elements.userProfileDropdown.classList.add('hidden');
            }
        });
    }
    
    // Home button functionality
    if (elements.homeButton) {
        elements.homeButton.addEventListener('click', () => {
            // Switch to search/home tab
            const tabButtons = [elements.searchTab, elements.languagesTab, elements.libraryTab, elements.dailyTab];
            const tabContents = ['searchView', 'languagesView', 'libraryView', 'dailyView'];
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            elements.searchTab.classList.add('active');
            
            // Update active content
            tabContents.forEach(contentId => {
                const content = document.getElementById(contentId);
                if (contentId === 'searchView') {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    }
    
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
    if (elements.searchButton && elements.searchInput) {
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
    }
    
    // Audio search
    if (elements.audioButton) {
    elements.audioButton.addEventListener('click', toggleAudioSearch);
    }
    
    // Daily word save functionality
    if (elements.saveDailyWord) {
        elements.saveDailyWord.addEventListener('click', async () => {
            if (window.currentDailyWord) {
                await saveWordToVocabulary(window.currentDailyWord);
                showNotification(`"${window.currentDailyWord.word}" added to your LexiLog!`, 'success');
            }
        });
    }
    
    // Tab navigation is now handled in showMainApp
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing LexiLog...');
        
        // Initialize DOM elements first
        initializeElements();
        console.log('Elements initialized');
        
        // Setup mobile interface
        setupMobileInterface();
        console.log('Mobile interface setup');
        
        // Then initialize event listeners and auth
    initializeEventListeners();
        console.log('Event listeners initialized');
        
    initializeAuth();
        console.log('Auth initialized');
        
        console.log('LexiLog initialization complete');
    } catch (error) {
        console.error('Error initializing LexiLog:', error);
        
        // Show a basic error message to the user
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: #dc2626;">LexiLog Error</h1>
                <p>There was an error loading the application. Please refresh the page.</p>
                <p style="color: #666; font-size: 14px;">Error: ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }
});

// Make functions globally available for onclick handlers
window.playAudio = playAudio;
window.deleteWord = deleteWord;
