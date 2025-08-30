// LexiLog - Personal Vocabulary Builder
// Main Application JavaScript with Firebase Integration

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
    signupQuestion: document.getElementById('signupQuestion'),
    signupOtherGoal: document.getElementById('signupOtherGoal'),
    otherGoalField: document.getElementById('otherGoalField'),
    signupButton: document.getElementById('signupButton'),
    showLoginBtn: document.getElementById('showLoginBtn'),
    
    // User Profile
    userProfileButton: document.getElementById('userProfileButton'),
    userProfileDropdown: document.getElementById('userProfileDropdown'),
    userInitials: document.getElementById('userInitials'),
    userDisplayName: document.getElementById('userDisplayName'),
    userDisplayEmail: document.getElementById('userDisplayEmail'),
    greeting: document.getElementById('greeting'),
    
    // Navigation
    navigationRibbon: document.getElementById('navigationRibbon'),
    homeButton: document.getElementById('homeButton'),
    dictionaryTab: document.getElementById('dictionaryTab'),
    languagesTab: document.getElementById('languagesTab'),
    libraryTab: document.getElementById('libraryTab'),
    dailyTab: document.getElementById('dailyTab'),
    logoutButton: document.getElementById('logoutButton'),
    
    // Views
    homeView: document.getElementById('homeView'),
    dictionaryView: document.getElementById('dictionaryView'),
    languagesView: document.getElementById('languagesView'),
    libraryView: document.getElementById('libraryView'),
    dailyView: document.getElementById('dailyView'),
    
    // Language Selection
    languageSelector: document.getElementById('languageSelector'),
    
    // Dictionary Search (English)
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
    
    // Language Search (Other Languages)
    languageSearchInput: document.getElementById('languageSearchInput'),
    languageSearchButton: document.getElementById('languageSearchButton'),
    languageAudioButton: document.getElementById('languageAudioButton'),
    languageSearchResults: document.getElementById('languageSearchResults'),
    languageResultWord: document.getElementById('languageResultWord'),
    languageResultPhonetic: document.getElementById('languageResultPhonetic'),
    languageResultDefinitions: document.getElementById('languageResultDefinitions'),
    playLanguageAudio: document.getElementById('playLanguageAudio'),
    
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
            if (elements.audioButton) {
            elements.audioButton.classList.add('text-red-600');
            elements.audioButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
                elements.audioButton.title = "Listening... Click to stop";
            }
        };
        
        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (elements.searchInput) {
            elements.searchInput.value = transcript;
                searchEnglishWord(transcript);
            }
        };
        
        speechRecognition.onend = () => {
            isListening = false;
            if (elements.audioButton) {
            elements.audioButton.classList.remove('text-red-600');
            elements.audioButton.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
            `;
                elements.audioButton.title = "Audio Search";
            }
        };
        
        speechRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            if (elements.audioButton) {
            elements.audioButton.classList.remove('text-red-600');
                elements.audioButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                `;
                elements.audioButton.title = "Audio Search";
            }
            
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
        if (elements.audioButton) {
            elements.audioButton.style.display = 'none';
        }
    }
}

// Firebase Authentication Functions
function initializeAuth() {
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
}

// Sign up with Firebase
async function signUpWithEmail(name, email, password, goal = '', otherGoal = '') {
    try {
        // Create user account
        const result = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        
        // Save user profile with goal information
        await saveUserProfile(name, email, goal, otherGoal);
        
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

// Sign in with Firebase
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

// Get user profile from Firestore
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

// Save user profile to Firestore
async function saveUserProfile(name, email, goal = '', otherGoal = '') {
    try {
        const profileData = {
            name: name,
            email: email,
            goal: goal,
            otherGoal: otherGoal,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            totalWordsSearched: 0,
            totalWordsSaved: 0
        };
        
        await db.collection('artifacts').doc(APP_ID)
            .collection('users').doc(currentUserId)
            .collection('profile').doc('data').set(profileData);
        
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
    if (elements.greeting) {
        elements.greeting.innerHTML = `
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to LexiLog, ${firstName}!
            </span>
        `;
    }
    if (elements.userDisplayName) elements.userDisplayName.textContent = userProfile.name;
    if (elements.userDisplayEmail) elements.userDisplayEmail.textContent = userProfile.email;
    
    // Update user initials
    const initials = userProfile.name.split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    if (elements.userInitials) elements.userInitials.textContent = initials;
    
    // Show homepage initially, hide navigation ribbon
    navigateToView('home');
    
    // Initialize features
    initializeSpeechRecognition();
    loadUserVocabulary();
    fetchWordOfTheDay();
}

// Navigation Functions
function navigateToView(viewName) {
    const views = ['home', 'dictionary', 'languages', 'library', 'daily'];
    const tabButtons = [elements.dictionaryTab, elements.languagesTab, elements.libraryTab, elements.dailyTab];
    
    // Hide all views
    views.forEach(view => {
        const viewElement = elements[`${view}View`];
        if (viewElement) {
            viewElement.classList.remove('active');
            viewElement.classList.add('hidden');
        }
    });
    
    // Show target view
    const targetView = elements[`${viewName}View`];
    if (targetView) {
        targetView.classList.add('active');
        targetView.classList.remove('hidden');
    }
    
    // Update navigation ribbon visibility
    if (viewName === 'home') {
        if (elements.navigationRibbon) elements.navigationRibbon.classList.add('hidden');
        document.body.style.paddingTop = '0';
                } else {
        if (elements.navigationRibbon) elements.navigationRibbon.classList.remove('hidden');
        document.body.style.paddingTop = '80px';
    }
    
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    const activeTab = elements[`${viewName}Tab`];
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Refresh data when switching to certain views
    if (viewName === 'library') {
        loadUserVocabulary();
    } else if (viewName === 'daily') {
        fetchWordOfTheDay();
    }
}

// Search Functions
async function searchEnglishWord(word) {
    if (!word.trim()) return;
    
    showLoading();
    hideResults();
    hideError();
    
    try {
        let wordData = null;
        
        // For English dictionary, always use English API
        const response = await fetch(`${DICTIONARY_API_BASE}en/${encodeURIComponent(word.trim())}`);
        if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
                wordData = data[0];
            }
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

async function searchLanguageWord(word, language) {
    if (!word.trim()) return;
    
    showLanguageLoading();
    hideLanguageResults();
    hideLanguageError();
    
    try {
        const wordData = await getWordDefinitionFromTranslation(word.trim(), language);
        
        if (wordData) {
            displayLanguageSearchResults(wordData);
            await saveWordToVocabulary(wordData);
        } else {
            throw new Error('Word not found');
        }
    } catch (error) {
        console.error('Language search error:', error);
        showLanguageError();
    }
}

async function getWordDefinitionFromTranslation(word, language = currentLanguage) {
    try {
        // Get translation to English for better definition
        const translateUrl = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=${language}&tl=en&dt=t&q=${encodeURIComponent(word)}`;
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
                        originalLanguage: language
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
            originalLanguage: language
        };
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

function displaySearchResults(wordData) {
    hideLoading();
    hideError();
    
    if (elements.resultWord) elements.resultWord.textContent = wordData.word;
    
    // Show translation if available
    if (wordData.translation && wordData.originalLanguage !== 'en') {
        if (elements.resultPhonetic) {
            elements.resultPhonetic.innerHTML = `
                <div class="text-blue-600 font-medium">Translation: ${wordData.translation}</div>
                ${wordData.phonetic ? `<div class="text-gray-600">${wordData.phonetic}</div>` : ''}
            `;
        }
    } else {
        if (elements.resultPhonetic) elements.resultPhonetic.textContent = wordData.phonetic || '';
    }
    
    // Clear previous definitions
    if (elements.resultDefinitions) {
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
    }
    
    // Store audio URL if available
    if (wordData.phonetics && wordData.phonetics.length > 0) {
        const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
        if (audioUrl && elements.playAudio) {
            elements.playAudio.onclick = () => playAudio(audioUrl);
        }
    }
    
    if (elements.searchResults) elements.searchResults.classList.remove('hidden');
}

function displayLanguageSearchResults(wordData) {
    if (!elements.languageSearchResults) return;
    
    hideLanguageResults();
    
    if (elements.languageResultWord) elements.languageResultWord.textContent = wordData.word;
    
    // Show translation if available
    if (wordData.translation && wordData.originalLanguage !== 'en') {
        if (elements.languageResultPhonetic) {
            elements.languageResultPhonetic.innerHTML = `
                <div class="text-purple-600 font-medium">English Translation: ${wordData.translation}</div>
                ${wordData.phonetic ? `<div class="text-gray-600">${wordData.phonetic}</div>` : ''}
            `;
        }
    } else {
        if (elements.languageResultPhonetic) elements.languageResultPhonetic.textContent = wordData.phonetic || '';
    }
    
    // Clear previous definitions
    if (elements.languageResultDefinitions) {
        elements.languageResultDefinitions.innerHTML = '';
        
        // Display definitions
        wordData.meanings.forEach((meaning, index) => {
            const meaningDiv = document.createElement('div');
            meaningDiv.className = 'definition-item hover-lift';
            
            meaningDiv.innerHTML = `
                <div class="part-of-speech bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs uppercase tracking-wide inline-block mb-3">${meaning.partOfSpeech}</div>
                <div class="definition-text text-gray-800 text-lg leading-relaxed mb-3">${meaning.definitions[0].definition}</div>
                ${meaning.definitions[0].example ? `<div class="example-text bg-gray-50 border-l-4 border-purple-500 pl-4 py-2 italic text-gray-700 rounded">"${meaning.definitions[0].example}"</div>` : ''}
            `;
            
            meaningDiv.style.animationDelay = `${index * 0.1}s`;
            meaningDiv.classList.add('animate-fade-in-up');
            
            elements.languageResultDefinitions.appendChild(meaningDiv);
        });
    }
    
    elements.languageSearchResults.classList.remove('hidden');
}

function showLoading() {
    if (elements.loadingState) elements.loadingState.classList.remove('hidden');
}

function hideLoading() {
    if (elements.loadingState) elements.loadingState.classList.add('hidden');
}

function showError() {
    if (elements.errorState) elements.errorState.classList.remove('hidden');
}

function hideError() {
    if (elements.errorState) elements.errorState.classList.add('hidden');
}

function hideResults() {
    if (elements.searchResults) elements.searchResults.classList.add('hidden');
}

function showLanguageLoading() {
    console.log('Language search loading...');
}

function hideLanguageResults() {
    if (elements.languageSearchResults) {
        elements.languageSearchResults.classList.add('hidden');
    }
}

function hideLanguageError() {
    // Add error handling for language search if needed
}

function showLanguageError() {
    console.log('Language search error');
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
    
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Mobile-friendly positioning
    if (isMobile) {
        notification.className += ' top-4 left-4 right-4 mx-4';
    } else {
        notification.className += ' top-4 right-4';
    }
    
    // Set notification content based on type
    if (type === 'success') {
        notification.className += ' bg-green-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-sm">${message}</span>
            </div>
        `;
    } else if (type === 'error') {
        notification.className += ' bg-red-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span class="text-sm">${message}</span>
            </div>
        `;
    } else {
        notification.className += ' bg-blue-500 text-white';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">${message}</span>
            </div>
        `;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 4 seconds on mobile, 3 on desktop
    const autoRemoveTime = isMobile ? 4000 : 3000;
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, autoRemoveTime);
}

// Vocabulary Management with Firebase and localStorage fallback
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
        
        // Try Firebase first
        if (currentUserId) {
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
        if (elements.searchResults) elements.searchResults.classList.add('save-success');
        showNotification(`${wordData.word} has been added to your LexiLog!`, 'success');
        
        // Immediately refresh the vocabulary list if we're on the library tab
        if (elements.libraryTab && elements.libraryTab.classList.contains('active')) {
            loadUserVocabulary();
        }
        
        setTimeout(() => {
            if (elements.searchResults) elements.searchResults.classList.remove('save-success');
        }, 300);
        
    } catch (error) {
        console.error('Error saving word:', error);
        showNotification('Failed to save word. Please try again.', 'error');
    }
}

async function loadUserVocabulary() {
    try {
        let words = [];
        
        // Try Firebase first
        if (currentUserId) {
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
        if (elements.emptyLibrary) elements.emptyLibrary.classList.remove('hidden');
        if (elements.wordList) elements.wordList.classList.add('hidden');
        return;
    }
    
    if (elements.emptyLibrary) elements.emptyLibrary.classList.add('hidden');
    if (elements.wordList) elements.wordList.classList.remove('hidden');
    
    if (elements.wordList) {
    elements.wordList.innerHTML = '';
    
    words.forEach(wordData => {
        const wordCard = createWordCard(wordData);
        elements.wordList.appendChild(wordCard);
    });
    }
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
            // Try Firebase first
            if (currentUserId) {
            await db.collection('artifacts').doc(APP_ID)
                .collection('users').doc(currentUserId)
                .collection('vocabulary').doc(word.toLowerCase())
                .delete();
            }
            
            // Always remove from localStorage
            const vocabulary = JSON.parse(localStorage.getItem('lexilog_vocabulary') || '[]');
            const filteredVocabulary = vocabulary.filter(w => w.word.toLowerCase() !== word.toLowerCase());
            localStorage.setItem('lexilog_vocabulary', JSON.stringify(filteredVocabulary));
            
            showNotification(`${word} has been removed from your LexiLog.`, 'success');
            loadUserVocabulary();
        } catch (error) {
            console.error('Error deleting word:', error);
            showNotification('Failed to delete word. Please try again.', 'error');
        }
    }
}

// Word of the Day Functions
async function fetchWordOfTheDay() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = currentUser ? currentUser.uid : 'local_user';
        
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
    if (elements.dailyLoading) elements.dailyLoading.classList.add('hidden');
    if (elements.dailyWord) elements.dailyWord.classList.remove('hidden');
    
    if (elements.dailyWordText) elements.dailyWordText.textContent = wordData.word;
    if (elements.dailyPhonetic) elements.dailyPhonetic.textContent = wordData.phonetic || '';
    
    // Clear previous definitions
    if (elements.dailyDefinitions) {
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
    }
    
    // Store audio URL if available
    if (wordData.phonetics && wordData.phonetics.length > 0) {
        const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
        if (audioUrl && elements.playDailyAudio) {
            elements.playDailyAudio.onclick = () => playAudio(audioUrl);
        }
    }
    
    // Store word data for saving
    if (elements.saveDailyWord) {
    elements.saveDailyWord.onclick = () => saveDailyWord(wordData);
    }
}

async function saveDailyWord(wordData) {
    try {
        await saveWordToVocabulary(wordData);
        if (elements.saveDailyWord) {
        elements.saveDailyWord.textContent = 'Added to My LexiLog!';
        elements.saveDailyWord.disabled = true;
        elements.saveDailyWord.classList.remove('bg-green-600', 'hover:bg-green-700');
        elements.saveDailyWord.classList.add('bg-gray-400');
        
        setTimeout(() => {
            elements.saveDailyWord.textContent = 'Add to My LexiLog';
            elements.saveDailyWord.disabled = false;
            elements.saveDailyWord.classList.remove('bg-gray-400');
            elements.saveDailyWord.classList.add('bg-green-600', 'hover:bg-green-700');
        }, 2000);
        }
        
        showNotification(`${wordData.word} has been added to your LexiLog!`, 'success');
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
            const goal = elements.signupQuestion.value;
            const otherGoal = elements.signupOtherGoal.value.trim();
            
            if (name && email && password && goal) {
                elements.signupButton.disabled = true;
                elements.signupButton.textContent = 'Creating Account...';
                
                const success = await signUpWithEmail(name, email, password, goal, otherGoal);
                
                elements.signupButton.disabled = false;
                elements.signupButton.textContent = 'Create Account';
                
                if (!success) {
                    // Error handling is done in signUpWithEmail function
                }
            } else {
                showNotification('Please fill in all required fields including your learning goal.', 'error');
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
    
    // Goal selector for signup
    if (elements.signupQuestion) {
        elements.signupQuestion.addEventListener('change', (e) => {
            if (e.target.value === 'other') {
                elements.otherGoalField.classList.remove('hidden');
                elements.signupOtherGoal.required = true;
            } else {
                elements.otherGoalField.classList.add('hidden');
                elements.signupOtherGoal.required = false;
                elements.signupOtherGoal.value = '';
            }
        });
    }
    
    // Logout functionality
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to sign out?')) {
                signOut();
            }
        });
    }
    
    // English Dictionary Search (Dictionary View)
    if (elements.searchButton && elements.searchInput) {
    elements.searchButton.addEventListener('click', () => {
        const word = elements.searchInput.value.trim();
        if (word) {
                searchEnglishWord(word);
        }
    });
    
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const word = elements.searchInput.value.trim();
            if (word) {
                    searchEnglishWord(word);
            }
        }
    });
    }
    
    // Language Search (Languages View)
    if (elements.languageSearchButton && elements.languageSearchInput) {
        elements.languageSearchButton.addEventListener('click', () => {
            const word = elements.languageSearchInput.value.trim();
            if (word) {
                searchLanguageWord(word, currentLanguage);
            }
        });
        
        elements.languageSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const word = elements.languageSearchInput.value.trim();
                if (word) {
                    searchLanguageWord(word, currentLanguage);
                }
            }
        });
    }
    
    // Audio search
    if (elements.audioButton) {
    elements.audioButton.addEventListener('click', toggleAudioSearch);
    }
    if (elements.languageAudioButton) {
        elements.languageAudioButton.addEventListener('click', toggleAudioSearch);
    }
    
    // Navigation
    if (elements.homeButton) {
        elements.homeButton.addEventListener('click', () => navigateToView('home'));
    }
    
    // Tab navigation
    const tabButtons = [
        { element: elements.dictionaryTab, view: 'dictionary' },
        { element: elements.languagesTab, view: 'languages' },
        { element: elements.libraryTab, view: 'library' },
        { element: elements.dailyTab, view: 'daily' }
    ];
    
    tabButtons.forEach(({ element, view }) => {
        if (element) {
            element.addEventListener('click', () => navigateToView(view));
        }
    });
    
    // Feature card navigation
    const featureCards = document.querySelectorAll('.feature-card[data-navigate]');
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetView = card.getAttribute('data-navigate');
            navigateToView(targetView);
        });
    });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeAuth();
    initializePWA();
});

// PWA Functionality
let deferredPrompt;
let isInstalled = false;

// Check if app is installed
function checkIfInstalled() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        console.log('LexiLog: Running as installed PWA');
    } else if (window.navigator && window.navigator.standalone) {
        isInstalled = true;
        console.log('LexiLog: Running as iOS PWA');
    }
}

// Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('LexiLog: Service Worker registered successfully:', registration.scope);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New update available
                        showNotification('LexiLog has been updated! Refresh to get the latest version.', 'info');
                    }
                });
            });
            
        } catch (error) {
            console.error('LexiLog: Service Worker registration failed:', error);
        }
    }
}

// PWA Install Prompt
function initializePWAInstall() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('LexiLog: PWA install prompt available');
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Store the event for later use
        deferredPrompt = e;
        // Show custom install button/banner
        showInstallPrompt();
    });

    // Listen for app installation
    window.addEventListener('appinstalled', (e) => {
        console.log('LexiLog: PWA installed successfully');
        isInstalled = true;
        hideInstallPrompt();
        showNotification('🎉 LexiLog installed! You can now access it from your home screen.', 'success');
    });
}

// Show custom install prompt
function showInstallPrompt() {
    if (isInstalled || !deferredPrompt) return;
    
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.className = 'fixed top-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    installBanner.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    📱
                </div>
                <div>
                    <div class="font-semibold">Install LexiLog</div>
                    <div class="text-sm opacity-90">Get the full app experience</div>
                </div>
            </div>
            <div class="flex space-x-2">
                <button id="pwa-install-btn" class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors">
                    Install
                </button>
                <button id="pwa-dismiss-btn" class="text-white/70 hover:text-white p-1">
                    ✕
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // Add event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', installPWA);
    document.getElementById('pwa-dismiss-btn').addEventListener('click', hideInstallPrompt);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (document.getElementById('pwa-install-banner')) {
            hideInstallPrompt();
        }
    }, 10000);
}

// Install PWA
async function installPWA() {
    if (!deferredPrompt) return;
    
    try {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('LexiLog: User accepted PWA install');
        } else {
            console.log('LexiLog: User dismissed PWA install');
        }
        
        // Clear the deferredPrompt
        deferredPrompt = null;
        hideInstallPrompt();
        
    } catch (error) {
        console.error('LexiLog: PWA install error:', error);
        hideInstallPrompt();
    }
}

// Hide install prompt
function hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// PWA Navigation handling
function handlePWANavigation() {
    // Handle deep links when app is opened from home screen
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    
    if (view && ['dictionary', 'languages', 'library', 'daily'].includes(view)) {
        // Delay navigation to ensure app is fully loaded
        setTimeout(() => {
            navigateToView(view);
        }, 1000);
    }
}

// Initialize PWA features
function initializePWA() {
    checkIfInstalled();
    registerServiceWorker();
    initializePWAInstall();
    handlePWANavigation();
    
    // Add PWA-specific styles for better mobile experience
    if (isInstalled) {
        document.body.classList.add('pwa-installed');
        // Add some padding for status bar on mobile
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    }
}

// Make functions globally available for onclick handlers
window.navigateToView = navigateToView;
window.playAudio = playAudio;
window.deleteWord = deleteWord;
window.installPWA = installPWA;
