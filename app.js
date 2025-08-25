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

// Gemini AI Configuration (you'll need to add your API key)
const GEMINI_API_KEY = 'your-gemini-api-key-here'; // Replace with your actual API key
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

// Initialize DOM Elements
function initializeElements() {
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
        translateTab: document.getElementById('translateTab'),
        libraryTab: document.getElementById('libraryTab'),
        logoutButton: document.getElementById('logoutButton'),
        
        // Word of the Day Popup
        wordOfDayPopup: document.getElementById('wordOfDayPopup'),
        rocketAnimation: document.getElementById('rocketAnimation'),
        popupContent: document.getElementById('popupContent'),
        popupWord: document.getElementById('popupWord'),
        popupPhonetic: document.getElementById('popupPhonetic'),
        popupDefinition: document.getElementById('popupDefinition'),
        addDailyWordBtn: document.getElementById('addDailyWordBtn'),
        closeDailyPopup: document.getElementById('closeDailyPopup'),
        
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
        libraryView: document.getElementById('libraryView')
    };
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
async function signUpWithEmail(name, email, password) {
    try {
        // Create user account
        const result = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        
        // Save user profile
        await saveUserProfile(name, email);
        
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

async function saveUserProfile(name, email) {
    try {
        const profileData = {
            name: name,
            email: email,
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
    
    // Update user profile display
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
    
    // Track user session
    trackUserActivity('session_start');
    
    // Initialize features
    initializeSpeechRecognition();
    loadUserVocabulary();
    
    // Show Word of the Day popup after a short delay
    setTimeout(showWordOfDayPopup, 2000);
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
            }
        });
    });
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
            // For other languages: Treat input as romanized/transliterated native word
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

// Native Language Definition (Romanized input → Native script + definition)
async function getNativeLanguageDefinition(romanizedWord, targetLanguage) {
    try {
        const languageName = SUPPORTED_LANGUAGES[targetLanguage]?.name || targetLanguage;
        
        // Step 1: Try to get native script version using Gemini
        let nativeWord = null;
        let definition = null;
        
        if (GEMINI_API_KEY !== 'your-gemini-api-key-here') {
            const geminiResult = await getGeminiNativeDefinition(romanizedWord, targetLanguage);
            if (geminiResult) {
                nativeWord = geminiResult.nativeScript;
                definition = geminiResult.definition;
            }
        }
        
        // Step 2: Fallback - try translation services
        if (!nativeWord) {
            nativeWord = await translateText(romanizedWord, 'en', targetLanguage);
        }
        
        // Step 3: Create comprehensive result
        const wordData = {
            word: nativeWord || romanizedWord,
            romanized: romanizedWord,
            phonetic: '',
            meanings: [],
            language: targetLanguage,
            isNativeLanguage: true
        };
        
        if (definition) {
            // Use Gemini definition
            wordData.meanings = [{
                partOfSpeech: 'word',
                definitions: [{
                    definition: definition,
                    example: ''
                }]
            }];
        } else {
            // Fallback definition
            wordData.meanings = [{
                partOfSpeech: 'word',
                definitions: [{
                    definition: `${languageName} word "${romanizedWord}" ${nativeWord ? `(${nativeWord})` : ''}`,
                    example: ''
                }]
            }];
        }
        
        return wordData;
    } catch (error) {
        console.error('Native language definition error:', error);
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
        const prompt = `You are a ${languageName} dictionary. The user typed "${romanizedWord}" in English script (romanized/transliterated). 
        
Please provide:
1. The correct native script version of this word in ${languageName}
2. The meaning/definition of this word in ${languageName}

Respond in JSON format:
{
  "nativeScript": "word in native script",
  "definition": "definition in ${languageName}",
  "isValid": true/false
}

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
    
    // Enhanced display for native language results
    if (wordData.isNativeLanguage && wordData.romanized) {
        // Show native script word with romanized version
        elements.resultWord.innerHTML = `
            <div class="text-3xl font-bold text-gray-800 mb-2">${wordData.word}</div>
            <div class="text-lg text-blue-600">Romanized: "${wordData.romanized}"</div>
        `;
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
    
    // Display definitions with enhanced formatting
    wordData.meanings.forEach((meaning, index) => {
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
            meanings: wordData.meanings,
            audioUrl: wordData.phonetics?.find(p => p.audio)?.audio || '',
            savedAt: new Date().toISOString(),
            timestamp: Date.now(),
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
                meanings: wordData.meanings,
                audioUrl: wordData.phonetics?.find(p => p.audio)?.audio || '',
                savedAt: new Date().toISOString(),
                timestamp: Date.now()
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

// Word of the Day Popup System
let currentDailyWord = null;

async function showWordOfDayPopup() {
    const today = new Date().toISOString().split('T')[0];
    const userId = currentUser?.uid || currentUserId || 'local_user';
    
    // Check if user has already seen today's word
    const seenKey = `lexilog_daily_seen_${userId}_${today}`;
    if (localStorage.getItem(seenKey)) {
        return; // Already seen today
    }
    
    try {
        let dailyWord = await fetchTrulyRandomWord();
        
        if (dailyWord) {
            currentDailyWord = { ...dailyWord, date: today, isWordOfDay: true };
            displayWordOfDayPopup(currentDailyWord);
            
            // Show the popup with animation
            elements.wordOfDayPopup.classList.remove('hidden');
            
            // Reset animations
            elements.rocketAnimation.style.animation = 'none';
            elements.popupContent.style.animation = 'none';
            
            // Trigger animations
            setTimeout(() => {
                elements.rocketAnimation.style.animation = 'rocketFly 2s ease-out forwards';
                elements.popupContent.style.animation = 'popupAppear 1s ease-out forwards';
                elements.popupContent.style.animationDelay = '1.5s';
            }, 100);
        }
    } catch (error) {
        console.error('Error showing word of the day popup:', error);
    }
}

async function fetchTrulyRandomWord() {
    // Try multiple random word sources for variety
    const sources = [
        () => fetchFromWordnikAPI(),
        () => fetchFromRandomWordsList(),
        () => fetchFromGeminiRandom()
    ];
    
    for (const source of sources) {
        try {
            const word = await source();
            if (word) {
                // Get full definition for the random word
                const definition = await getEnglishDefinition(word);
                if (definition) {
                    return definition;
                }
            }
        } catch (error) {
            console.log('Random word source failed, trying next...', error);
        }
    }
    
    // Ultimate fallback with a truly beautiful word
    return {
        word: 'serendipity',
        phonetic: '/ˌsɛrənˈdɪpɪti/',
        meanings: [{
            partOfSpeech: 'noun',
            definitions: [{
                definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
                example: 'A fortunate stroke of serendipity brought the two old friends together.'
            }]
        }]
    };
}

async function fetchFromWordnikAPI() {
    try {
        // Try Wordnik's random word API (free tier)
        const response = await fetch(`${RANDOM_WORDS_API}?hasDictionaryDef=true&minCorpusCount=1000&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=15`);
        if (response.ok) {
            const data = await response.json();
            return data.word;
        }
    } catch (error) {
        console.error('Wordnik API error:', error);
    }
    return null;
}

async function fetchFromRandomWordsList() {
    // High-quality word list for educational purposes
    const educationalWords = [
        'serendipity', 'eloquent', 'perseverance', 'ephemeral', 'resilience',
        'luminous', 'tranquil', 'vivacious', 'benevolent', 'sagacious',
        'ubiquitous', 'mellifluous', 'ineffable', 'quintessential', 'perspicacious',
        'magnanimous', 'ethereal', 'effervescent', 'incandescent', 'harmonious',
        'meticulous', 'tenacious', 'exuberant', 'profound', 'pristine',
        'enigmatic', 'scintillating', 'resplendent', 'transcendent', 'magnificent',
        'euphoric', 'iridescent', 'luminescent', 'opalescent', 'phosphorescent',
        'incorrigible', 'indefatigable', 'indomitable', 'irrepressible', 'insatiable',
        'effulgent', 'coruscating', 'diaphanous', 'gossamer', 'halcyon',
        'incipient', 'lambent', 'nascent', 'palimpsest', 'penumbra',
        'petrichor', 'saudade', 'susurrus', 'vellichor', 'wanderlust'
    ];
    
    // Use crypto.getRandomValues for true randomness
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % educationalWords.length;
    
    return educationalWords[randomIndex];
}

async function fetchFromGeminiRandom() {
    if (GEMINI_API_KEY === 'your-gemini-api-key-here') {
        return null;
    }
    
    try {
        const prompt = `Generate a single beautiful, educational English word that would be perfect for vocabulary building. The word should be:
        1. Interesting and meaningful
        2. Not too common but not extremely obscure
        3. Between 5-15 characters long
        4. Suitable for adult learners
        
        Respond with just the word, nothing else.`;
        
        const response = await fetch(`${GEMINI_API_BASE}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
                return content.trim().toLowerCase();
            }
        }
    } catch (error) {
        console.error('Gemini random word error:', error);
    }
    return null;
}

function displayWordOfDayPopup(wordData) {
    elements.popupWord.textContent = wordData.word;
    elements.popupPhonetic.textContent = wordData.phonetic || '';
    
    // Display first definition
    if (wordData.meanings && wordData.meanings.length > 0) {
        const firstMeaning = wordData.meanings[0];
        const firstDef = firstMeaning.definitions[0];
        elements.popupDefinition.innerHTML = `
            <div class="text-sm text-purple-600 font-medium mb-2">${firstMeaning.partOfSpeech}</div>
            <div>${firstDef.definition}</div>
        `;
    }
}

function closeWordOfDayPopup() {
    const today = new Date().toISOString().split('T')[0];
    const userId = currentUser?.uid || currentUserId || 'local_user';
    const seenKey = `lexilog_daily_seen_${userId}_${today}`;
    
    // Mark as seen for today
    localStorage.setItem(seenKey, 'true');
    
    // Hide popup
    elements.wordOfDayPopup.classList.add('hidden');
    currentDailyWord = null;
}

async function addWordOfDayToLibrary() {
    if (currentDailyWord) {
        await saveWordToVocabulary(currentDailyWord);
        showNotification('✨ Word of the Day added to your LexiLog!', 'success');
        closeWordOfDayPopup();
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
    
    // Signup form
    elements.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = elements.signupName.value.trim();
        const email = elements.signupEmail.value.trim();
        const password = elements.signupPassword.value;
        
        if (name && email && password) {
            elements.signupButton.disabled = true;
            elements.signupButton.textContent = 'Creating Account...';
            
            const success = await signUpWithEmail(name, email, password);
            
            elements.signupButton.disabled = false;
            elements.signupButton.textContent = 'Create Account';
            
            if (!success) {
                // Error handling is done in signUpWithEmail function
            }
        }
    });
    
    // Show signup/login buttons
    elements.showSignupBtn.addEventListener('click', showSignup);
    elements.showLoginBtn.addEventListener('click', showLogin);
    
    // User profile dropdown
    elements.userProfileButton.addEventListener('click', () => {
        elements.userProfileDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.userProfileButton.contains(e.target)) {
            elements.userProfileDropdown.classList.add('hidden');
        }
    });
    
    // Home button functionality
    if (elements.homeButton) {
        elements.homeButton.addEventListener('click', () => {
            // Switch to search/home tab
            const tabButtons = [elements.searchTab, elements.libraryTab, elements.dailyTab];
            const tabContents = ['searchView', 'libraryView', 'dailyView'];
            
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
    
    // Word of the Day popup listeners
    if (elements.closeDailyPopup) {
        elements.closeDailyPopup.addEventListener('click', closeWordOfDayPopup);
    }
    
    if (elements.addDailyWordBtn) {
        elements.addDailyWordBtn.addEventListener('click', addWordOfDayToLibrary);
    }
    
    // Close popup when clicking outside
    if (elements.wordOfDayPopup) {
        elements.wordOfDayPopup.addEventListener('click', (e) => {
            if (e.target === elements.wordOfDayPopup) {
                closeWordOfDayPopup();
            }
        });
    }
    
    // Tab navigation
    initializeTabNavigation();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing LexiLog...');
        
        // Initialize DOM elements first
        initializeElements();
        console.log('Elements initialized');
        
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
