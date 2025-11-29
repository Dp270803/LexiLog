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
        currentUser = user;
        // Handle initial route after auth state is determined
        handleRoute();
        // Hide loading screen after auth state is determined
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
            // Auth state listener will handle UI update and redirect to home
            navigate('/home');
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

            // Try to save user profile (optional - won't block signup if Firestore rules aren't set)
            try {
                await db.collection('users').doc(result.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (profileError) {
                console.warn('Profile save failed (Firestore rules may not be set up):', profileError);
                // Continue anyway - user account was created successfully
            }

            // Auth state listener will handle UI update and redirect to home
            navigate('/home');
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
    document.getElementById('homeLogo').addEventListener('click', function() {
        navigate('/home');
    });

    document.getElementById('homeLogoutBtn').addEventListener('click', logout);

    document.getElementById('goToDictionary').addEventListener('click', function() {
        navigate('/dictionary');
    });

    document.getElementById('goToMyWords').addEventListener('click', function() {
        navigate('/words');
    });

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
    document.getElementById('homepageScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.remove('hidden');
    document.getElementById('homepageScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showHomepage() {
    showMainApp();

    document.getElementById('homepageScreen').classList.add('hidden');
    document.getElementById('homeView').classList.remove('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('profileView').classList.add('hidden');

    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('homeTab').classList.add('active');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('homepageScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    // Update user avatar
    if (currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (currentUser.photoURL) {
            // Use Google profile photo if available
            userAvatar.style.backgroundImage = `url(${currentUser.photoURL})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.style.backgroundPosition = 'center';
            userAvatar.textContent = '';
        } else if (currentUser.displayName) {
            // Use first letter of display name
            const initial = currentUser.displayName[0].toUpperCase();
            userAvatar.textContent = initial;
        } else if (currentUser.email) {
            // Use first letter of email
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
    document.getElementById('profileView').classList.add('hidden');

    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('dictionaryTab').classList.add('active');
}

function showMyWords() {
    showMainApp();

    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.remove('hidden');
    document.getElementById('profileView').classList.add('hidden');

    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('myWordsTab').classList.add('active');

    // Load words
    loadMyWords();
}

function showProfile() {
    showMainApp();

    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('dictionaryView').classList.add('hidden');
    document.getElementById('myWordsView').classList.add('hidden');
    document.getElementById('profileView').classList.remove('hidden');

    // Clear active tab (profile is not in tabs)
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Load profile data
    loadProfile();
}

// Hash-based Router
function navigate(path) {
    window.location.hash = path;
}

function handleRoute() {
    const hash = window.location.hash.slice(1);

    // Default routes based on auth state
    if (!hash) {
        if (currentUser) {
            navigate('/home');
            return;
        } else {
            navigate('/login');
            return;
        }
    }

    // Check if user is authenticated
    if (!currentUser && hash !== '/login' && hash !== '/signup') {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
    }

    // Route to appropriate view
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
        case '/profile':
            if (currentUser) showProfile();
            else navigate('/login');
            break;
        default:
            // Default route based on auth state
            if (currentUser) {
                navigate('/dictionary');
            } else {
                navigate('/login');
            }
    }
}

// Listen for hash changes (browser back/forward button)
window.addEventListener('hashchange', handleRoute);

// Back navigation
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

// Play audio pronunciation
function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Could not play audio pronunciation');
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

// Load profile
async function loadProfile() {
    if (!currentUser) return;

    try {
        // Get user profile from Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            // Display name (prefer Firestore name, fallback to Google displayName)
            document.getElementById('profileName').textContent =
                userData.name || currentUser.displayName || 'Not set';

            // Display email
            document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';

            // Display member since date
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
            // If profile doesn't exist in Firestore, use auth data
            document.getElementById('profileName').textContent =
                currentUser.displayName || 'Not set';
            document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';
            document.getElementById('profileJoined').textContent = 'Unknown';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to auth data
        document.getElementById('profileName').textContent = 'Error loading';
        document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';
        document.getElementById('profileJoined').textContent = 'Error loading';
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
        // Redirect to login page
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

        // Check if this is a new user
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            // Create user profile for new Google users
            try {
                await db.collection('users').doc(user.uid).set({
                    name: user.displayName || 'User',
                    email: user.email,
                    photoURL: user.photoURL || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    provider: 'google'
                });
            } catch (profileError) {
                console.warn('Profile save failed (Firestore rules may not be set up):', profileError);
                // Continue anyway - user account was created successfully
            }
        }

        // Auth state listener will handle UI update and redirect to home
        navigate('/home');
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no need to show error
            return;
        }
        alert('Google sign-in failed: ' + error.message);
    }
}
