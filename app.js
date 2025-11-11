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

// Navigation history
let navigationHistory = ['dictionary'];

// Dictionary API
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check auth state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            showMainApp();
        } else {
            currentUser = null;
            showLogin();
        }
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Auth state listener will handle UI update
        } catch (error) {
            alert('Login failed: ' + error.message);
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
            await db.collection('users').doc(result.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // Auth state listener will handle UI update
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWord();
        }
    });
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

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user avatar
    if (currentUser && currentUser.email) {
        const initial = currentUser.email[0].toUpperCase();
        document.getElementById('userAvatar').textContent = initial;
    }
    
    // Show dictionary by default
    showDictionary();
}

// Navigation
function showDictionary() {
    // Add to history if not already there
    if (navigationHistory[navigationHistory.length - 1] !== 'dictionary') {
        navigationHistory.push('dictionary');
    }
    
    document.getElementById('dictionaryView').classList.remove('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab')[0].classList.add('active');
}

function showMyWords() {
    // Add to history
    if (navigationHistory[navigationHistory.length - 1] !== 'myWords') {
        navigationHistory.push('myWords');
    }
    
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.remove('hidden');
    
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab')[1].classList.add('active');
    
    // Load words
    loadMyWords();
}

// Back navigation
function goBack() {
    if (navigationHistory.length > 1) {
        // Remove current page
        navigationHistory.pop();
        // Get previous page
        const previousPage = navigationHistory[navigationHistory.length - 1];
        
        if (previousPage === 'dictionary') {
            showDictionary();
        } else if (previousPage === 'myWords') {
            showMyWords();
        }
    } else {
        // If only one page in history, go to dictionary
        showDictionary();
    }
}

// Prevent browser back button
window.addEventListener('popstate', function(event) {
    event.preventDefault();
    goBack();
    window.history.pushState(null, null, window.location.href);
});

// Push initial state
window.history.pushState(null, null, window.location.href);

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
        
        // Display result
        displayWordResult(wordData);
        
        // Save word
        await saveWord(wordData);
        
    } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Word not found. Please check your spelling.</div>';
    }
}

// Display word result
function displayWordResult(wordData) {
    const word = wordData.word;
    const phonetic = wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '';
    const meanings = wordData.meanings || [];
    
    let html = `
        <div class="word-result">
            <div class="word-title">${word}</div>
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
    if (!currentUser) {
        console.log('No current user');
        return;
    }
    
    const wordListDiv = document.getElementById('wordList');
    if (!wordListDiv) {
        console.log('wordList element not found');
        return;
    }
    
    wordListDiv.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        console.log('Loading words for user:', currentUser.uid);
        
        // Try with orderBy first, if it fails, get all and sort manually
        let snapshot;
        try {
            snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('words')
                .orderBy('savedAt', 'desc')
                .get();
        } catch (orderError) {
            console.log('OrderBy failed, getting all words:', orderError);
            // If orderBy fails (no index), get all and sort manually
            snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('words')
                .get();
        }
        
        console.log('Snapshot size:', snapshot.size);
        
        if (snapshot.empty) {
            wordListDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No words saved yet. Start searching for words!</p>';
            return;
        }
        
        // Convert to array and sort if needed
        const words = [];
        snapshot.forEach(doc => {
            words.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by savedAt if we got all words without orderBy
        if (words.length > 0 && words[0].savedAt) {
            words.sort((a, b) => {
                if (!a.savedAt || !b.savedAt) return 0;
                return b.savedAt.toMillis() - a.savedAt.toMillis();
            });
        }
        
        console.log('Words loaded:', words.length);
        
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
        
        if (error.message && error.message.includes('permissions')) {
            wordListDiv.innerHTML = `
                <div class="error" style="padding: 24px;">
                    <h3 style="margin-bottom: 12px; color: #dc2626;">⚠️ Firestore Permissions Error</h3>
                    <p style="margin-bottom: 16px;">You need to set up Firestore security rules to view your saved words.</p>
                    <p style="margin-bottom: 16px;"><strong>Quick Fix:</strong></p>
                    <ol style="margin-left: 20px; margin-bottom: 16px; line-height: 1.8;">
                        <li>Go to <a href="https://console.firebase.google.com/project/lexilog-c1559/firestore/rules" target="_blank" style="color: #6366f1; text-decoration: underline;">Firebase Console → Firestore → Rules</a></li>
                        <li>Copy the rules from <code>FIRESTORE_RULES.md</code> file</li>
                        <li>Paste and click "Publish"</li>
                        <li>Refresh this page</li>
                    </ol>
                    <p style="font-size: 0.9rem; color: #6b7280;">See FIRESTORE_RULES.md for detailed instructions.</p>
                </div>
            `;
        } else {
            wordListDiv.innerHTML = '<div class="error">Error loading words: ' + error.message + '. Please try again.</div>';
        }
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
        alert('Failed to delete word. Please try again.');
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        // Auth state listener will handle UI update
    } catch (error) {
        console.error('Logout error:', error);
    }
}
