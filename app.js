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
    document.getElementById('dictionaryView').classList.remove('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab')[0].classList.add('active');
}

function showMyWords() {
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
    if (!currentUser) return;
    
    const wordListDiv = document.getElementById('wordList');
    wordListDiv.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('words')
            .orderBy('savedAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            wordListDiv.innerHTML = '<p style="text-align: center; color: #666;">No words saved yet. Start searching!</p>';
            return;
        }
        
        let html = '<div class="word-list">';
        snapshot.forEach(doc => {
            const word = doc.data();
            html += `
                <div class="word-item">
                    <div>
                        <h3>${word.word}</h3>
                        ${word.phonetic ? `<div class="phonetic">${word.phonetic}</div>` : ''}
                    </div>
                    <button class="delete-btn" onclick="deleteWord('${doc.id}')">Delete</button>
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
