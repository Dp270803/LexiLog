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

// Current user
let currentUser = null;
// Current word of the day data (cached)
let currentWordOfDay = null;

// Dictionary API
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Custom Notification System
function showNotification(message, type = 'success', title = null) {
    const container = document.getElementById('notificationContainer');

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;

    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    // Default titles
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        info: 'Information'
    };

    const icon = icons[type] || icons.info;
    const notifTitle = title || defaultTitles[type];

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${notifTitle}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Combined vocabulary word list (for all users)
const VOCABULARY_WORDS = [
    // Literary & beautiful words
    'serendipity', 'ephemeral', 'mellifluous', 'eloquent', 'ethereal',
    'luminous', 'quintessential', 'enigmatic', 'resplendent', 'ineffable',
    'tranquil', 'reverie', 'solitude', 'wanderlust', 'nostalgia',
    'eloquence', 'petrichor', 'aurora', 'sonorous', 'ebullient',
    // Academic & exam-relevant words
    'aberration', 'pragmatic', 'vindicate', 'meticulous', 'substantiate',
    'comprehensive', 'analyze', 'empirical', 'hypothesis', 'paradigm',
    'ambiguous', 'articulate', 'coherent', 'correlate', 'criterion',
    'deduce', 'disparity', 'enumerate', 'explicit', 'facilitate',
    'formulate', 'infer', 'justify', 'preclude', 'refute', 'simulate',
    'subsequent', 'comprise', 'context', 'discern', 'elucidate'
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check auth state
    auth.onAuthStateChanged(async function(user) {
        currentUser = user;

        // Handle initial route after auth state is determined
        handleRoute();

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 500);
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            navigate('/home');
        } catch (error) {
            // Check if user tried to login with email but account was created with Google
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                showNotification(
                    'This account may have been created with Google Sign-In. Please try using the "Continue with Google" button.',
                    'error',
                    'Login Failed'
                );
            } else {
                showNotification(error.message, 'error', 'Login Failed');
            }
        }
    });

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);

            // Save user profile
            try {
                await db.collection('users').doc(result.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (profileError) {
                console.warn('Profile save failed:', profileError);
            }

            navigate('/home');
        } catch (error) {
            showNotification(error.message, 'error', 'Signup Failed');
        }
    });

    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWord();
        }
    });

    // Navigation event listeners
    document.getElementById('showSignupBtn').addEventListener('click', function() {
        navigate('/signup');
    });

    document.getElementById('showLoginBtn').addEventListener('click', function() {
        navigate('/login');
    });

    document.getElementById('homeTab').addEventListener('click', function() {
        navigate('/home');
    });

    document.getElementById('dictionaryTab').addEventListener('click', function() {
        navigate('/dictionary');
    });

    document.getElementById('myWordsTab').addEventListener('click', function() {
        navigate('/words');
    });

    document.getElementById('wordOfDayTab').addEventListener('click', function() {
        navigate('/word-of-day');
    });

    document.getElementById('logoLink').addEventListener('click', function() {
        navigate('/home');
    });

    document.getElementById('myProfileBtn').addEventListener('click', function() {
        navigate('/profile');
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('searchBtn').addEventListener('click', searchWord);

    document.getElementById('backBtn').addEventListener('click', goBack);

    // Homepage navigation
    document.getElementById('goToDictionary2').addEventListener('click', function() {
        navigate('/dictionary');
    });

    document.getElementById('goToMyWords2').addEventListener('click', function() {
        navigate('/words');
    });

    // Google Sign-In buttons
    document.getElementById('googleLoginBtn').addEventListener('click', signInWithGoogle);
    document.getElementById('googleSignupBtn').addEventListener('click', signInWithGoogle);
});

// Show screens
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showHomepage() {
    showMainApp();
    document.getElementById('homeView').classList.remove('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('wordOfDayView').classList.add('hidden');
    document.getElementById('profileView').classList.add('hidden');

    setActiveTab('homeTab');

    // Load Word of the Day on home page
    loadWordOfDayForHome();
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    // Update user avatar
    if (currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (currentUser.photoURL) {
            userAvatar.style.backgroundImage = `url(${currentUser.photoURL})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.style.backgroundPosition = 'center';
            userAvatar.textContent = '';
        } else if (currentUser.displayName) {
            const initial = currentUser.displayName[0].toUpperCase();
            userAvatar.textContent = initial;
        } else if (currentUser.email) {
            const initial = currentUser.email[0].toUpperCase();
            userAvatar.textContent = initial;
        }
    }
}

// Navigation
function showDictionary() {
    showMainApp();
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.remove('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('wordOfDayView').classList.add('hidden');
    document.getElementById('profileView').classList.add('hidden');

    setActiveTab('dictionaryTab');
}

function showMyWords() {
    showMainApp();
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.remove('hidden');
    document.getElementById('wordOfDayView').classList.add('hidden');
    document.getElementById('profileView').classList.add('hidden');

    setActiveTab('myWordsTab');
    loadMyWords();
}

function showWordOfDay() {
    showMainApp();
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('wordOfDayView').classList.remove('hidden');
    document.getElementById('profileView').classList.add('hidden');

    setActiveTab('wordOfDayTab');
    loadWordOfDay();
}

function showProfile() {
    showMainApp();
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('wordOfDayView').classList.add('hidden');
    document.getElementById('profileView').classList.remove('hidden');

    setActiveTab(null);
    loadProfile();
}

function setActiveTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (tabId) {
        document.getElementById(tabId).classList.add('active');
    }
}

// Hash-based Router
function navigate(path) {
    window.location.hash = path;
}

function handleRoute() {
    const hash = window.location.hash.slice(1);

    if (!hash) {
        if (currentUser) {
            navigate('/home');
        } else {
            navigate('/login');
        }
        return;
    }

    if (!currentUser && hash !== '/login' && hash !== '/signup') {
        navigate('/login');
        return;
    }

    switch(hash) {
        case '/login':
            showLogin();
            break;
        case '/signup':
            showSignup();
            break;
        case '/home':
            if (currentUser) showHomepage();
            else navigate('/login');
            break;
        case '/dictionary':
            if (currentUser) showDictionary();
            else navigate('/login');
            break;
        case '/words':
            if (currentUser) showMyWords();
            else navigate('/login');
            break;
        case '/word-of-day':
            if (currentUser) showWordOfDay();
            else navigate('/login');
            break;
        case '/profile':
            if (currentUser) showProfile();
            else navigate('/login');
            break;
        default:
            if (currentUser) {
                navigate('/home');
            } else {
                navigate('/login');
            }
    }
}

window.addEventListener('hashchange', handleRoute);

function goBack() {
    window.history.back();
}

// Search word
async function searchWord() {
    const word = document.getElementById('searchInput').value.trim();
    if (!word) return;

    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch(DICTIONARY_API + encodeURIComponent(word));

        if (!response.ok) {
            throw new Error('Word not found');
        }

        const data = await response.json();
        const wordData = data[0];

        displayWordResult(wordData);
        await saveWord(wordData);

    } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Word not found. Please check your spelling.</div>';
    }
}

// Display word result
function displayWordResult(wordData) {
    const word = wordData.word;
    const phonetic = wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '';
    const audioUrl = wordData.phonetics?.find(p => p.audio)?.audio || '';
    const meanings = wordData.meanings || [];

    let html = `
        <div class="word-result">
            <div style="display: flex; align-items: center; gap: 16px;">
                <div class="word-title">${word}</div>
                ${audioUrl ? `<button class="audio-btn" onclick="playAudio('${audioUrl}')">🔊</button>` : ''}
            </div>
            ${phonetic ? `<div class="phonetic">${phonetic}</div>` : ''}
    `;

    meanings.forEach(meaning => {
        html += `
            <div class="meaning">
                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                <div class="definition">${meaning.definitions[0].definition}</div>
            </div>
        `;
    });

    html += `
            <div class="saved-badge">✓ Saved to My Words</div>
        </div>
    `;

    document.getElementById('searchResults').innerHTML = html;
}

// Play audio
function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        showNotification('Could not play audio pronunciation', 'error');
    });
}

// Save word
async function saveWord(wordData) {
    if (!currentUser) return;

    try {
        const wordDoc = {
            word: wordData.word,
            phonetic: wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '',
            meanings: wordData.meanings || [],
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(currentUser.uid)
            .collection('words').doc(wordData.word.toLowerCase()).set(wordDoc);
    } catch (error) {
        console.error('Error saving word:', error);
    }
}

// Load my words
async function loadMyWords() {
    if (!currentUser) return;

    const wordListDiv = document.getElementById('wordList');
    if (!wordListDiv) return;

    wordListDiv.innerHTML = '<div class="loading">Loading...</div>';

    try {
        let snapshot;
        try {
            snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('words')
                .orderBy('savedAt', 'desc')
                .get();
        } catch (orderError) {
            snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('words')
                .get();
        }

        if (snapshot.empty) {
            wordListDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No words saved yet. Start searching for words!</p>';
            return;
        }

        const words = [];
        snapshot.forEach(doc => {
            words.push({ id: doc.id, ...doc.data() });
        });

        if (words.length > 0 && words[0].savedAt) {
            words.sort((a, b) => {
                if (!a.savedAt || !b.savedAt) return 0;
                return b.savedAt.toMillis() - a.savedAt.toMillis();
            });
        }

        let html = '<div class="word-list">';
        words.forEach(wordData => {
            const word = wordData.word || wordData.id;
            const phonetic = wordData.phonetic || '';
            const meaning = wordData.meanings && wordData.meanings[0] && wordData.meanings[0].definitions
                ? wordData.meanings[0].definitions[0].definition
                : '';

            html += `
                <div class="word-item">
                    <div>
                        <h3>${word}</h3>
                        ${phonetic ? `<div class="phonetic" style="color: #6b7280; font-style: italic; margin-top: 4px;">${phonetic}</div>` : ''}
                        ${meaning ? `<div style="color: #6b7280; font-size: 0.9rem; margin-top: 8px;">${meaning.substring(0, 100)}${meaning.length > 100 ? '...' : ''}</div>` : ''}
                    </div>
                    <button class="delete-btn" onclick="deleteWord('${wordData.id}')">Delete</button>
                </div>
            `;
        });
        html += '</div>';

        wordListDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading words:', error);
        wordListDiv.innerHTML = '<div class="error">Error loading words. Please try again.</div>';
    }
}

// Delete word
async function deleteWord(wordId) {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('words').doc(wordId).delete();

        loadMyWords();
    } catch (error) {
        console.error('Error deleting word:', error);
        showNotification('Failed to delete word. Please try again.', 'error');
    }
}

// Load profile
async function loadProfile() {
    if (!currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('profileName').textContent = userData.name || currentUser.displayName || 'Not set';
            document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';

            if (userData.createdAt) {
                const date = userData.createdAt.toDate();
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                document.getElementById('profileJoined').textContent = formattedDate;
            } else {
                document.getElementById('profileJoined').textContent = 'Unknown';
            }
        } else {
            document.getElementById('profileName').textContent = currentUser.displayName || 'Not set';
            document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';
            document.getElementById('profileJoined').textContent = 'Unknown';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileName').textContent = 'Error loading';
        document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';
        document.getElementById('profileJoined').textContent = 'Error loading';
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        navigate('/login');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Google Sign-In
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Check if new user
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            try {
                await db.collection('users').doc(user.uid).set({
                    name: user.displayName || 'User',
                    email: user.email,
                    photoURL: user.photoURL || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    provider: 'google'
                });
            } catch (profileError) {
                console.warn('Profile save failed:', profileError);
            }
        }

        navigate('/home');
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showNotification(error.message, 'error', 'Google Sign-In Failed');
        }
    }
}

// Word of the Day functions
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

async function getWordOfDay() {
    if (!currentUser) return null;

    const seed = currentUser.uid + getTodayString();
    const hash = simpleHash(seed);
    const index = hash % VOCABULARY_WORDS.length;

    return VOCABULARY_WORDS[index];
}

async function loadWordOfDay() {
    if (!currentUser) return;

    const contentDiv = document.getElementById('wordOfDayContent');
    if (!contentDiv) return;

    contentDiv.innerHTML = '<div class="loading">Loading today\'s word...</div>';

    try {
        const word = await getWordOfDay();

        if (!word) {
            contentDiv.innerHTML = '<div class="error">Unable to load word</div>';
            return;
        }

        const response = await fetch(DICTIONARY_API + encodeURIComponent(word));

        if (!response.ok) {
            throw new Error('Word not found');
        }

        const data = await response.json();
        currentWordOfDay = data[0];

        displayWordOfDay(currentWordOfDay);

    } catch (error) {
        console.error('Error loading Word of the Day:', error);
        contentDiv.innerHTML = '<div class="error">Failed to load today\'s word. Please try again later.</div>';
    }
}

function displayWordOfDay(wordData) {
    const word = wordData.word;
    const phonetic = wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '';
    const audioUrl = wordData.phonetics?.find(p => p.audio)?.audio || '';
    const meanings = wordData.meanings || [];

    let html = `
        <div class="word-result">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <div class="word-title" style="font-size: 2.5rem; margin-bottom: 8px;">${word}</div>
                    ${phonetic ? `<div class="phonetic" style="font-size: 1.2rem;">${phonetic}</div>` : ''}
                </div>
                ${audioUrl ? `<button class="audio-btn" onclick="playAudio('${audioUrl}')">🔊</button>` : ''}
            </div>
    `;

    meanings.slice(0, 2).forEach(meaning => {
        html += `
            <div class="meaning" style="margin-bottom: 24px;">
                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                <div class="definition" style="font-size: 1.1rem; line-height: 1.8;">${meaning.definitions[0].definition}</div>
                ${meaning.definitions[0].example ? `<div style="margin-top: 12px; font-style: italic; color: var(--text-light); padding-left: 16px; border-left: 3px solid var(--accent);">"${meaning.definitions[0].example}"</div>` : ''}
            </div>
        `;
    });

    html += `
            <button class="btn" onclick="saveWordOfDay()" style="margin-top: 24px;">
                ➕ Add to My Words
            </button>
        </div>
    `;

    document.getElementById('wordOfDayContent').innerHTML = html;
}

async function saveWordOfDay() {
    if (!currentUser || !currentWordOfDay) return;

    try {
        await saveWord(currentWordOfDay);
        showNotification('Word added to My Words!', 'success');
    } catch (error) {
        console.error('Error saving word:', error);
        showNotification('Failed to save word. Please try again.', 'error');
    }
}

// Load Word of Day for home page preview
async function loadWordOfDayForHome() {
    if (!currentUser) return;

    const homeContentDiv = document.getElementById('wordOfDayHomeContent');
    if (!homeContentDiv) return;

    homeContentDiv.innerHTML = '<div class="loading">Loading today\'s word...</div>';

    try {
        const word = await getWordOfDay();

        if (!word) {
            homeContentDiv.innerHTML = '<div class="error">Unable to load word</div>';
            return;
        }

        const response = await fetch(DICTIONARY_API + encodeURIComponent(word));

        if (!response.ok) {
            throw new Error('Word not found');
        }

        const data = await response.json();
        const wordData = data[0];

        // Display compact version for home page
        const wordTitle = wordData.word;
        const phonetic = wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '';
        const meaning = wordData.meanings?.[0]?.definitions?.[0]?.definition || '';
        const partOfSpeech = wordData.meanings?.[0]?.partOfSpeech || '';

        let html = `
            <div style="text-align: center;">
                <div class="word-title" style="font-size: 2rem; margin-bottom: 8px;">${wordTitle}</div>
                ${phonetic ? `<div class="phonetic" style="font-size: 1rem; margin-bottom: 16px;">${phonetic}</div>` : ''}
                ${partOfSpeech ? `<span class="part-of-speech" style="display: inline-block; margin-bottom: 12px;">${partOfSpeech}</span>` : ''}
                <div class="definition" style="font-size: 1rem; line-height: 1.7; color: var(--text); margin-bottom: 20px;">${meaning}</div>
                <button class="btn" onclick="navigate('/word-of-day')" style="padding: 12px 24px; font-size: 0.95rem;">
                    View Full Details →
                </button>
            </div>
        `;

        homeContentDiv.innerHTML = html;

    } catch (error) {
        console.error('Error loading Word of the Day for home:', error);
        homeContentDiv.innerHTML = '<div class="error">Failed to load today\'s word.</div>';
    }
}
