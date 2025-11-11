// LexiLog - English Vocabulary Builder
// Clean, Modern Implementation

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

// App State
const appState = {
    currentUser: null,
    currentView: 'dictionary',
    navigationHistory: ['dictionary']
};

// Dictionary API
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Common Misspellings Dictionary
const misspellings = {
    'recieve': 'receive', 'seperate': 'separate', 'definately': 'definitely',
    'occassion': 'occasion', 'accomodate': 'accommodate', 'begining': 'beginning',
    'beleive': 'believe', 'calender': 'calendar', 'collegue': 'colleague',
    'concious': 'conscious', 'embarass': 'embarrass', 'enviroment': 'environment',
    'existance': 'existence', 'foward': 'forward', 'freind': 'friend',
    'garentee': 'guarantee', 'goverment': 'government', 'grammer': 'grammar',
    'happend': 'happened', 'harrass': 'harass', 'immediatly': 'immediately',
    'independant': 'independent', 'knowlege': 'knowledge', 'liase': 'liaise',
    'liason': 'liaison', 'neccessary': 'necessary', 'occassionally': 'occasionally',
    'occurence': 'occurrence', 'occured': 'occurred', 'occuring': 'occurring',
    'peice': 'piece', 'persistant': 'persistent', 'pharoah': 'pharaoh',
    'posession': 'possession', 'prefered': 'preferred', 'priviledge': 'privilege',
    'probaly': 'probably', 'proffesional': 'professional', 'promiss': 'promise',
    'pronounciation': 'pronunciation', 'publically': 'publicly', 'quater': 'quarter',
    'questionaire': 'questionnaire', 'realy': 'really', 'reccomend': 'recommend',
    'rediculous': 'ridiculous', 'refered': 'referred', 'refering': 'referring',
    'religous': 'religious', 'rember': 'remember', 'resistence': 'resistance',
    'sieze': 'seize', 'similiar': 'similar', 'sincerly': 'sincerely',
    'speach': 'speech', 'sucess': 'success', 'sucessful': 'successful',
    'tommorow': 'tomorrow', 'tounge': 'tongue', 'truely': 'truly',
    'unfortunatly': 'unfortunately', 'untill': 'until', 'wierd': 'weird',
    'whereever': 'wherever', 'wich': 'which'
};

// Navigation System (Prevents Browser Back)
const appNavigation = {
    history: ['dictionary'],
    
    navigate(viewName) {
        // Add to history
        if (this.history[this.history.length - 1] !== viewName) {
            this.history.push(viewName);
        }
        
        // Update view
        this.updateView(viewName);
        this.updateMobileHeader(viewName);
    },
    
    goBack() {
        if (this.history.length > 1) {
            // Remove current view
            this.history.pop();
            // Get previous view
            const previousView = this.history[this.history.length - 1];
            this.updateView(previousView);
            this.updateMobileHeader(previousView);
        }
    },
    
    updateView(viewName) {
        appState.currentView = viewName;
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-view="${viewName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Show/hide navigation ribbon
        const navHeader = document.querySelector('.nav-header');
        if (viewName === 'dictionary' || viewName === 'library') {
            if (navHeader) navHeader.classList.remove('hidden');
        }
    },
    
    updateMobileHeader(viewName) {
        const mobileBack = document.getElementById('mobileBackBtn');
        const mobileTitle = document.getElementById('mobilePageTitle');
        
        // Show mobile back button on mobile when there's history to go back to
        if (window.innerWidth <= 768) {
            if (this.history.length > 1) {
                if (mobileBack) mobileBack.classList.remove('hidden');
            } else {
                if (mobileBack) mobileBack.classList.add('hidden');
            }
        } else {
            if (mobileBack) mobileBack.classList.add('hidden');
        }
        
        const titles = {
            'dictionary': 'Dictionary',
            'library': 'My Words'
        };
        
        if (mobileTitle) {
            mobileTitle.textContent = titles[viewName] || 'LexiLog';
        }
    }
};

// Authentication Functions
const authManager = {
    async signUp(name, email, password) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            await this.saveUserProfile(result.user.uid, name, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email, password) {
        try {
            console.log('Attempting to sign in...');
            const result = await auth.signInWithEmailAndPassword(email, password);
            console.log('Sign in successful:', result.user.uid);
            return { success: true };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signOut() {
        try {
            console.log('Signing out user...');
            await auth.signOut();
            console.log('Sign out successful');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async saveUserProfile(uid, name, email) {
        const profileData = {
            name,
            email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('artifacts').doc('lexilog-vocabulary-builder')
            .collection('users').doc(uid).set(profileData);
    },
    
    async getUserProfile(uid) {
        const doc = await db.collection('artifacts').doc('lexilog-vocabulary-builder')
            .collection('users').doc(uid).get();
        
        return doc.exists ? doc.data() : null;
    }
};

// Dictionary Functions
const dictionaryManager = {
    async searchWord(word) {
        if (!word || !word.trim()) return null;
        
        const searchWord = word.trim().toLowerCase();
        
        try {
            // Try exact search first
            const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(searchWord)}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    return data[0];
                }
            }
            
            // Word not found, try spell checking
            const suggestions = await this.getSpellSuggestions(searchWord);
            if (suggestions.length > 0) {
                return { suggestions, originalWord: searchWord };
            }
            
            return null;
        } catch (error) {
            console.error('Dictionary search error:', error);
            return null;
        }
    },
    
    async getSpellSuggestions(word) {
        const suggestions = [];
        
        // Check common misspellings
        const correction = misspellings[word.toLowerCase()];
        if (correction) {
            suggestions.push(correction);
        }
        
        // Try API-based suggestions
        try {
            const response = await fetch(`https://api.datamuse.com/words?sp=${word}&max=5`);
            if (response.ok) {
                const data = await response.json();
                suggestions.push(...data.map(item => item.word));
            }
        } catch (error) {
            console.error('Spell check API error:', error);
        }
        
        // Remove duplicates and verify suggestions
        const uniqueSuggestions = [...new Set(suggestions)];
        const verifiedSuggestions = [];
        
        for (const suggestion of uniqueSuggestions.slice(0, 5)) {
            try {
                const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(suggestion)}`);
                if (response.ok) {
                    verifiedSuggestions.push(suggestion);
                }
            } catch (error) {
                // Skip this suggestion
            }
        }
        
        return verifiedSuggestions;
    },
    
    displayWord(wordData) {
        const resultsContainer = document.getElementById('searchResults');
        const errorState = document.getElementById('errorState');
        const loadingState = document.getElementById('loadingState');
        const spellSuggestions = document.getElementById('spellSuggestions');
        
        // Hide other states
        if (errorState) errorState.classList.add('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (spellSuggestions) spellSuggestions.classList.add('hidden');
        
        if (!resultsContainer) return;
        
        const word = wordData.word;
        const phonetic = wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '';
        const meanings = wordData.meanings || [];
        
        // Build definitions HTML
        let definitionsHTML = '';
        meanings.forEach((meaning, index) => {
            definitionsHTML += `
                <div class="meaning-section">
                    <div class="part-of-speech">${meaning.partOfSpeech}</div>
                    <ul class="definitions-list">
                        ${meaning.definitions.slice(0, 3).map(def => `
                            <li>
                                <div class="definition-text">${def.definition}</div>
                                ${def.example ? `<div class="definition-example">"${def.example}"</div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = `
            <div class="word-card">
                <div class="word-header">
                    <h2 id="resultWord" class="word-title">${word}</h2>
                    <button id="playAudio" class="audio-btn" onclick="dictionaryManager.playAudio('${word}')" title="Play pronunciation">🔊</button>
                </div>
                ${phonetic ? `<div class="word-phonetic">${phonetic}</div>` : ''}
                <div class="word-definitions">${definitionsHTML}</div>
                <div class="word-saved">
                    <span class="saved-badge">✓ Auto-saved to My Words</span>
                </div>
            </div>
        `;
        
        resultsContainer.classList.remove('hidden');
        
        // Auto-save word
        this.saveWord(word, wordData);
    },
    
    displaySuggestions(originalWord, suggestions) {
        const resultsContainer = document.getElementById('searchResults');
        const errorState = document.getElementById('errorState');
        const loadingState = document.getElementById('loadingState');
        const spellSuggestions = document.getElementById('spellSuggestions');
        
        // Hide other states
        if (errorState) errorState.classList.add('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        
        if (!spellSuggestions) return;
        
        spellSuggestions.innerHTML = `
            <div class="suggestions-card">
                <div class="suggestions-header">
                    <span class="suggestions-icon">💡</span>
                    <h3>Did you mean one of these?</h3>
                </div>
                <p class="suggestions-text">We couldn't find "<strong>${originalWord}</strong>" but here are some suggestions:</p>
                <div class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <button onclick="handleSuggestionClick('${suggestion}')" class="suggestion-btn">
                            ${suggestion}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        spellSuggestions.classList.remove('hidden');
    },
    
    displayError() {
        const errorState = document.getElementById('errorState');
        const loadingState = document.getElementById('loadingState');
        const resultsContainer = document.getElementById('searchResults');
        const spellSuggestions = document.getElementById('spellSuggestions');
        
        if (loadingState) loadingState.classList.add('hidden');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (spellSuggestions) spellSuggestions.classList.add('hidden');
        if (errorState) errorState.classList.remove('hidden');
    },
    
    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const resultsContainer = document.getElementById('searchResults');
        const spellSuggestions = document.getElementById('spellSuggestions');
        
        if (errorState) errorState.classList.add('hidden');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (spellSuggestions) spellSuggestions.classList.add('hidden');
        if (loadingState) loadingState.classList.remove('hidden');
    },
    
    async saveWord(word, wordData) {
        if (!appState.currentUser) return;
        
        try {
            const wordDoc = {
                word: word,
                phonetic: wordData.phonetic || wordData.phonetics?.find(p => p.text)?.text || '',
                meanings: wordData.meanings || [],
                searchedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('artifacts').doc('lexilog-vocabulary-builder')
                .collection('users').doc(appState.currentUser.uid)
                .collection('vocabulary').doc(word.toLowerCase()).set(wordDoc);
        } catch (error) {
            console.error('Error saving word:', error);
        }
    },
    
    playAudio(word) {
        // Use browser's speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }
};

// Library Functions
const libraryManager = {
    async loadWords() {
        if (!appState.currentUser) return;
        
        try {
            const wordsSnapshot = await db.collection('artifacts').doc('lexilog-vocabulary-builder')
                .collection('users').doc(appState.currentUser.uid)
                .collection('vocabulary')
                .orderBy('searchedAt', 'desc')
                .get();
            
            const words = [];
            wordsSnapshot.forEach(doc => {
                words.push({ id: doc.id, ...doc.data() });
            });
            
            this.displayWords(words);
        } catch (error) {
            console.error('Error loading words:', error);
        }
    },
    
    displayWords(words) {
        const emptyLibrary = document.getElementById('emptyLibrary');
        const wordList = document.getElementById('wordList');
        
        if (!emptyLibrary || !wordList) return;
        
        if (words.length === 0) {
            emptyLibrary.classList.remove('hidden');
            wordList.classList.add('hidden');
            return;
        }
        
        emptyLibrary.classList.add('hidden');
        wordList.classList.remove('hidden');
        
        wordList.innerHTML = words.map(word => `
            <div class="library-word-card">
                <div class="library-word-header">
                    <h3 class="library-word-title">${word.word}</h3>
                    <button onclick="libraryManager.deleteWord('${word.id}')" class="delete-btn" title="Delete word">🗑️</button>
                </div>
                ${word.phonetic ? `<div class="library-word-phonetic">${word.phonetic}</div>` : ''}
                <div class="library-word-meaning">
                    ${word.meanings && word.meanings[0] && word.meanings[0].definitions[0] 
                        ? word.meanings[0].definitions[0].definition 
                        : 'No definition available'}
                </div>
            </div>
        `).join('');
    },
    
    async deleteWord(wordId) {
        if (!appState.currentUser) return;
        
        if (!confirm('Are you sure you want to delete this word?')) return;
        
        try {
            await db.collection('artifacts').doc('lexilog-vocabulary-builder')
                .collection('users').doc(appState.currentUser.uid)
                .collection('vocabulary').doc(wordId).delete();
            
            await this.loadWords();
        } catch (error) {
            console.error('Error deleting word:', error);
            alert('Failed to delete word. Please try again.');
        }
    }
};

// UI Functions
const uiManager = {
    showAuth() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    },
    
    showMainApp(user, profile) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Update user info
        const userName = document.getElementById('userName');
        const userInitials = document.getElementById('userInitials');
        
        if (profile && profile.name) {
            if (userName) userName.textContent = profile.name;
            if (userInitials) {
                const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                userInitials.textContent = initials;
            }
        } else if (user && user.email) {
            // Fallback to email if no profile
            const displayName = user.email.split('@')[0];
            if (userName) userName.textContent = displayName;
            if (userInitials) {
                userInitials.textContent = displayName.substring(0, 2).toUpperCase();
            }
        }
    },
    
    showLogin() {
        document.getElementById('loginView').classList.remove('hidden');
        document.getElementById('signupView').classList.add('hidden');
    },
    
    showSignup() {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('signupView').classList.remove('hidden');
    }
};

// Event Handlers
function handleSuggestionClick(word) {
    document.getElementById('searchInput').value = word;
    handleSearch();
}

async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const word = searchInput?.value.trim();
    
    if (!word) return;
    
    dictionaryManager.showLoading();
    
    const result = await dictionaryManager.searchWord(word);
    
    if (result) {
        if (result.suggestions) {
            dictionaryManager.displaySuggestions(result.originalWord, result.suggestions);
        } else {
            dictionaryManager.displayWord(result);
        }
    } else {
        dictionaryManager.displayError();
    }
}

// Initialize App
function initApp() {
    // Auth state listener
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        
        if (user) {
            appState.currentUser = user;
            console.log('User UID:', user.uid);
            
            try {
                // Get profile if it exists, but don't require it
                const profile = await authManager.getUserProfile(user.uid).catch((error) => {
                    console.log('Profile fetch error (non-critical):', error);
                    return null;
                });
                
                console.log('Profile loaded:', profile ? 'Yes' : 'No');
                uiManager.showMainApp(user, profile);
                
                // Load library if on library view
                if (appState.currentView === 'library') {
                    libraryManager.loadWords();
                }
            } catch (error) {
                console.error('Error in auth state handler:', error);
                // Still show main app even if profile fetch fails
                uiManager.showMainApp(user, null);
            }
        } else {
            appState.currentUser = null;
            uiManager.showAuth();
            uiManager.showLogin();
        }
    });
    
    // Auth form handlers
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Disable button to prevent double submission
        const loginButton = document.getElementById('loginSubmitBtn');
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = 'Signing in...';
        }
        
        try {
            const result = await authManager.signIn(email, password);
            if (!result.success) {
                alert('Login failed: ' + result.error);
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = 'Sign In';
                }
            }
            // If successful, auth state listener will handle the UI update
            // Don't re-enable button here - let auth state listener handle it
        } catch (error) {
            console.error('Login form error:', error);
            alert('An unexpected error occurred. Please try again.');
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
            }
        }
    });
    
    document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        const result = await authManager.signUp(name, email, password);
        if (!result.success) {
            alert('Signup failed: ' + result.error);
        }
    });
    
    // Show signup/login buttons
    document.getElementById('showSignupBtn')?.addEventListener('click', () => {
        uiManager.showSignup();
    });
    
    document.getElementById('showLoginBtn')?.addEventListener('click', () => {
        uiManager.showLogin();
    });
    
    
    // Navigation handlers
    document.getElementById('homeBtn')?.addEventListener('click', () => {
        appNavigation.navigate('dictionary');
    });
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.getAttribute('data-view');
            appNavigation.navigate(view);
            
            if (view === 'library') {
                libraryManager.loadWords();
            }
        });
    });
    
    // Search handlers
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // User menu
    document.getElementById('userBtn')?.addEventListener('click', () => {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await authManager.signOut();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const userBtn = document.getElementById('userBtn');
        const dropdown = document.getElementById('userDropdown');
        
        if (userBtn && dropdown && !userBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Prevent browser back button - use app navigation instead
    // Push initial state to prevent browser back
    window.history.pushState(null, null, window.location.href);
    
    // Override browser back button behavior
    window.addEventListener('popstate', function(event) {
        // Prevent default browser back
        window.history.pushState(null, null, window.location.href);
        
        // Use app navigation instead
        if (appNavigation.history.length > 1) {
            appNavigation.goBack();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
