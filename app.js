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
const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/';

// Global Variables
let currentUser = null;
let currentUserId = null;
let elements = {};

// Initialize DOM Elements
function initializeElements() {
    elements = {
        loginView: document.getElementById('loginView'),
        signupView: document.getElementById('signupView'),
        mainApp: document.getElementById('mainApp'),
        loginForm: document.getElementById('loginForm'),
        signupForm: document.getElementById('signupForm'),
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        searchResults: document.getElementById('searchResults'),
        resultWord: document.getElementById('resultWord'),
        resultDefinitions: document.getElementById('resultDefinitions'),
        greeting: document.getElementById('greeting'),
        homeView: document.getElementById('homeView'),
        dictionaryView: document.getElementById('dictionaryView'),
        navigationRibbon: document.getElementById('navigationRibbon'),
        homeButton: document.getElementById('homeButton'),
        dictionaryTab: document.getElementById('dictionaryTab'),
        signupQuestion: document.getElementById('signupQuestion'),
        signupOtherGoal: document.getElementById('signupOtherGoal'),
        otherGoalField: document.getElementById('otherGoalField')
    };
}

// Basic UI Functions
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
    
    if (elements.greeting && userProfile) {
        const firstName = userProfile.name.split(' ')[0];
        elements.greeting.innerHTML = `<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to LexiLog, ${firstName}!</span>`;
    }
    
    navigateToView('home');
}

// Navigation
function navigateToView(viewName) {
    const views = ['home', 'dictionary'];
    views.forEach(view => {
        const viewElement = elements[`${view}View`];
        if (viewElement) {
            viewElement.classList.add('hidden');
        }
    });
    
    const targetView = elements[`${viewName}View`];
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    if (viewName === 'home') {
        if (elements.navigationRibbon) elements.navigationRibbon.classList.add('hidden');
    } else {
        if (elements.navigationRibbon) elements.navigationRibbon.classList.remove('hidden');
    }
}

// Search Function
async function searchEnglishWord(word) {
    if (!word.trim()) return;
    
    try {
        const response = await fetch(`${DICTIONARY_API_BASE}en/${encodeURIComponent(word.trim())}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                displaySearchResults(data[0]);
            } else {
                showError('Word not found');
            }
        } else {
            showError('Word not found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Search failed');
    }
}

function displaySearchResults(wordData) {
    if (elements.resultWord) {
        elements.resultWord.textContent = wordData.word;
    }
    
    if (elements.resultDefinitions) {
        elements.resultDefinitions.innerHTML = '';
        wordData.meanings.forEach(meaning => {
            const meaningDiv = document.createElement('div');
            meaningDiv.className = 'mb-4 p-4 bg-white rounded-lg shadow';
            meaningDiv.innerHTML = `
                <div class="text-sm text-blue-600 font-semibold mb-2">${meaning.partOfSpeech}</div>
                <div class="text-gray-800">${meaning.definitions[0].definition}</div>
                ${meaning.definitions[0].example ? `<div class="text-gray-600 italic mt-2">"${meaning.definitions[0].example}"</div>` : ''}
            `;
            elements.resultDefinitions.appendChild(meaningDiv);
        });
    }
    
    if (elements.searchResults) {
        elements.searchResults.classList.remove('hidden');
    }
}

function showError(message) {
    if (elements.searchResults) {
        elements.searchResults.innerHTML = `<div class="text-red-600 text-center p-4">${message}</div>`;
        elements.searchResults.classList.remove('hidden');
    }
}

// Authentication
function initializeAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            currentUserId = user.uid;
            const profile = await getUserProfile();
            if (profile) {
                showMainApp(profile);
            } else {
                await signOut();
            }
        } else {
            currentUser = null;
            currentUserId = null;
            showLogin();
        }
    });
}

async function signUpWithEmail(name, email, password, goal = '', otherGoal = '') {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        await saveUserProfile(name, email, goal, otherGoal);
        alert('Account created successfully! Welcome to LexiLog!');
        return true;
    } catch (error) {
        console.error('Sign up error:', error);
        alert('Failed to create account. Please try again.');
        return false;
    }
}

async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        currentUser = result.user;
        currentUserId = result.user.uid;
        alert('Welcome back!');
        return true;
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please check your credentials.');
        return false;
    }
}

async function signOut() {
    try {
        await auth.signOut();
        currentUser = null;
        currentUserId = null;
        alert('Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Error signing out');
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

async function saveUserProfile(name, email, goal = '', otherGoal = '') {
    try {
        const profileData = {
            name: name,
            email: email,
            goal: goal,
            otherGoal: otherGoal,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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

// Event Listeners
function initializeEventListeners() {
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                await signInWithEmail(email, password);
            }
        });
    }
    
    // Signup form
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const goal = elements.signupQuestion ? elements.signupQuestion.value : '';
            const otherGoal = elements.signupOtherGoal ? elements.signupOtherGoal.value.trim() : '';
            
            if (name && email && password) {
                await signUpWithEmail(name, email, password, goal, otherGoal);
            }
        });
    }
    
    // Search functionality
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
    
    // Navigation
    if (elements.homeButton) {
        elements.homeButton.addEventListener('click', () => navigateToView('home'));
    }
    
    if (elements.dictionaryTab) {
        elements.dictionaryTab.addEventListener('click', () => navigateToView('dictionary'));
    }
    
    // Show signup/login buttons
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', showSignup);
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLogin);
    }
    
    // Goal selector for signup
    if (elements.signupQuestion) {
        elements.signupQuestion.addEventListener('change', (e) => {
            if (e.target.value === 'other') {
                if (elements.otherGoalField) elements.otherGoalField.classList.remove('hidden');
                if (elements.signupOtherGoal) elements.signupOtherGoal.required = true;
            } else {
                if (elements.otherGoalField) elements.otherGoalField.classList.add('hidden');
                if (elements.signupOtherGoal) {
                    elements.signupOtherGoal.required = false;
                    elements.signupOtherGoal.value = '';
                }
            }
        });
    }
    
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
    initializeElements();
    initializeEventListeners();
    initializeAuth();
});

// Global functions
window.navigateToView = navigateToView;
