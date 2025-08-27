class MarefaSourceApp {
    constructor() {
        this.currentUser = null;
        this.currentMode = 'ahkam';
        this.chatHistory = [];
        this.isTyping = false;
        this.typingSpeed = 75;
        
        // Mock user data
        this.users = [
            {
                id: 1,
                name: "Admin User",
                email: "admin@marefasource.ai",
                password: "admin123",
                role: "admin"
            },
            {
                id: 2,
                name: "Ahmed Hassan",
                email: "ahmed@example.com",
                password: "password123",
                role: "user"
            }
        ];
        
        // Mock chat data
        this.allChats = {
            1: [
                { id: 1, mode: 'ahkam', question: 'Is trading cryptocurrency halal?', answer: 'Cryptocurrency trading has different scholarly opinions...', timestamp: new Date('2024-01-15') },
                { id: 2, mode: 'research', question: 'References about Salah timing', answer: 'According to Sahih Bukhari...', timestamp: new Date('2024-01-14') }
            ],
            2: [
                { id: 3, mode: 'scholar', question: 'Explain the concept of Tawheed', answer: 'Tawheed is the fundamental concept...', timestamp: new Date('2024-01-13') }
            ]
        };

        this.modes = {
            ahkam: {
                title: "Ahkam Islamic Laws",
                greeting: "السلام عليكم! Ask about Islamic laws, halal/haram rulings, and jurisprudence guidance.",
                responses: [
                    "According to Islamic jurisprudence, this matter requires careful consideration of the Quran and Sunnah...",
                    "The scholarly consensus (ijma) on this issue indicates that...",
                    "From the perspective of Islamic law (Sharia), we must examine the evidence from primary sources...",
                    "This ruling is based on the principles of Islamic jurisprudence (usul al-fiqh)..."
                ]
            },
            research: {
                title: "Research Mode",
                greeting: "Welcome to Research Mode. Get scholarly Islamic references, citations from Quran and Hadith.",
                responses: [
                    "According to the Quran (Surah Al-Baqarah, 2:183) and Sahih Bukhari (Book 31, Hadith 1)...",
                    "The scholarly research shows multiple references including Ibn Kathir's Tafsir...",
                    "Primary sources indicate: Quran 4:29, Sahih Muslim 1553, and scholarly consensus...",
                    "Academic references include works by Imam Al-Nawawi, Ibn Taymiyyah, and contemporary scholars..."
                ]
            },
            scholar: {
                title: "Advanced Scholar Mode",
                greeting: "Advanced Scholar Mode activated. Engage in detailed Islamic theological discourse and analysis.",
                responses: [
                    "This theological question requires deep analysis of the classical texts and contemporary interpretations...",
                    "From an advanced scholarly perspective, we must consider the methodological approaches of different schools...",
                    "The theological implications involve careful examination of the historical context and linguistic analysis...",
                    "Advanced Islamic scholarship requires understanding the relationship between revelation, reason, and tradition..."
                ]
            }
        };

        this.init();
    }

    init() {
        try {
            this.bindElements();
            this.setupEventListeners();
            this.initTheme();
            this.updateUI();
            console.log('MarefaSource AI initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    bindElements() {
        // Header elements
        this.menuToggle = document.getElementById('menuToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.signupBtn = document.getElementById('signupBtn');
        
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.modeItems = document.querySelectorAll('.mode-item');
        this.themeToggle = document.getElementById('themeToggle');
        this.chatHistoryBtn = document.getElementById('chatHistoryBtn');
        
        // Main content
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatContainer = document.getElementById('chatContainer');
        this.chatMessages = document.getElementById('chatMessages');
        this.greeting = document.getElementById('greeting');
        
        // Input area
        this.messageInput = document.getElementById('messageInput');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.sendBtn = document.getElementById('sendBtn');
        
        // Modals
        this.loginModal = document.getElementById('loginModal');
        this.signupModal = document.getElementById('signupModal');
        this.chatHistoryModal = document.getElementById('chatHistoryModal');
        
        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    setupEventListeners() {
        // Header actions
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.showProfile();
                } else {
                    this.showLoginModal();
                }
            });
        }

        if (this.signupBtn) {
            this.signupBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.logout();
                } else {
                    this.showSignupModal();
                }
            });
        }

        // Mode selection
        this.modeItems.forEach(item => {
            item.addEventListener('click', () => {
                const mode = item.dataset.mode;
                this.selectMode(mode);
            });
        });

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Chat history
        if (this.chatHistoryBtn) {
            this.chatHistoryBtn.addEventListener('click', () => this.showChatHistory());
        }

        // Message input
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => this.handleInputChange());
            this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => this.showToast('Voice input not implemented in demo', 'info'));
        }

        // Forms
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Modal close buttons
        this.setupModalCloseListeners();

        // Modal switch buttons
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => {
                this.hideModal(this.loginModal);
                this.showSignupModal();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.hideModal(this.signupModal);
                this.showLoginModal();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        // Click outside sidebar to close
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                !this.menuToggle.contains(e.target) &&
                this.sidebar.classList.contains('open')) {
                this.sidebar.classList.remove('open');
            }
        });
    }

    setupModalCloseListeners() {
        const closeButtons = [
            'closeLoginBtn',
            'closeSignupBtn', 
            'closeChatHistoryBtn'
        ];

        closeButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) this.hideModal(modal);
                });
            }
        });

        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                    this.hideModal(modal);
                }
            });
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        localStorage.setItem('theme', theme);
        
        if (this.themeToggle) {
            this.themeToggle.classList.toggle('dark', theme === 'dark');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }

    toggleSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.toggle('open');
        }
    }

    selectMode(mode) {
        this.currentMode = mode;
        
        // Update active state
        this.modeItems.forEach(item => {
            item.classList.toggle('active', item.dataset.mode === mode);
        });

        // Show chat container and hide welcome screen
        if (this.welcomeScreen && this.chatContainer) {
            this.welcomeScreen.classList.add('hidden');
            this.chatContainer.classList.remove('hidden');
        }

        // Clear previous messages and show mode greeting
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
            setTimeout(() => {
                this.addAIMessage(this.modes[mode].greeting);
            }, 300);
        }

        this.showToast(`Switched to ${this.modes[mode].title}`, 'success');
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        }
    }

    updateUI() {
        // Update greeting
        if (this.greeting) {
            if (this.currentUser) {
                this.greeting.textContent = `Assalamu Alaikum ${this.currentUser.name},`;
            } else {
                this.greeting.textContent = 'Assalamu Alaikum Guest,';
            }
        }

        // Update header buttons
        if (this.currentUser) {
            if (this.loginBtn) {
                this.loginBtn.textContent = 'Profile';
            }
            if (this.signupBtn) {
                this.signupBtn.textContent = 'Log Out';
            }
        } else {
            if (this.loginBtn) {
                this.loginBtn.textContent = 'Log In';
            }
            if (this.signupBtn) {
                this.signupBtn.textContent = 'Sign Up';
            }
        }
    }

    showLoginModal() {
        if (this.loginModal) {
            this.loginModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
        }
    }

    showSignupModal() {
        if (this.signupModal) {
            this.signupModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const nameInput = document.getElementById('signupName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        }
    }

    showProfile() {
        if (!this.currentUser) return;
        
        // Create profile modal dynamically
        const existingProfileModal = document.getElementById('profileModal');
        if (existingProfileModal) {
            existingProfileModal.remove();
        }

        const profileModal = document.createElement('div');
        profileModal.id = 'profileModal';
        profileModal.className = 'modal';
        profileModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>User Profile</h3>
                    <button class="close-btn" id="closeProfileBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <div class="profile-value">${this.escapeHtml(this.currentUser.name)}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <div class="profile-value">${this.escapeHtml(this.currentUser.email)}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <div class="profile-value">${this.currentUser.role === 'admin' ? 'Administrator' : 'User'}</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chat History</label>
                            <div class="profile-value">${(this.allChats[this.currentUser.id] || []).length} conversations</div>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn--outline btn--full-width" id="viewHistoryFromProfile">View Chat History</button>
                        <button class="btn btn--secondary btn--full-width" id="logoutFromProfile">Log Out</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(profileModal);
        profileModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Add event listeners
        const closeBtn = profileModal.querySelector('#closeProfileBtn');
        const viewHistoryBtn = profileModal.querySelector('#viewHistoryFromProfile');
        const logoutBtn = profileModal.querySelector('#logoutFromProfile');

        closeBtn.addEventListener('click', () => {
            this.hideModal(profileModal);
            profileModal.remove();
        });

        viewHistoryBtn.addEventListener('click', () => {
            this.hideModal(profileModal);
            profileModal.remove();
            this.showChatHistory();
        });

        logoutBtn.addEventListener('click', () => {
            this.hideModal(profileModal);
            profileModal.remove();
            this.logout();
        });

        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal || e.target.classList.contains('modal-backdrop')) {
                this.hideModal(profileModal);
                profileModal.remove();
            }
        });
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.hideModal(modal);
        });
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Simple validation
        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Mock authentication
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            this.hideModal(this.loginModal);
            this.updateUI();
            this.showToast(`Welcome back, ${user.name}!`, 'success');
            
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        } else {
            this.showToast('Invalid email or password', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email === email)) {
            this.showToast('User already exists with this email', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: this.users.length + 1,
            name,
            email,
            password,
            role: 'user'
        };

        this.users.push(newUser);
        this.allChats[newUser.id] = [];
        this.currentUser = newUser;
        
        this.hideModal(this.signupModal);
        this.updateUI();
        this.showToast(`Welcome to MarefaSource AI, ${name}!`, 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showToast('Logged out successfully', 'success');
        
        // Reset to welcome screen
        if (this.chatContainer && this.welcomeScreen) {
            this.chatContainer.classList.add('hidden');
            this.welcomeScreen.classList.remove('hidden');
        }
    }

    showChatHistory() {
        const modal = this.chatHistoryModal;
        const content = document.getElementById('chatHistoryContent');
        
        if (!modal || !content) return;

        if (!this.currentUser) {
            this.showToast('Please log in to view chat history', 'error');
            return;
        }

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Generate history content
        let historyHTML = '';
        
        if (this.currentUser.role === 'admin') {
            // Admin can see all chats
            historyHTML = '<h4>All User Chat History (Admin View)</h4>';
            Object.keys(this.allChats).forEach(userId => {
                const user = this.users.find(u => u.id == userId);
                const chats = this.allChats[userId];
                
                if (chats && chats.length > 0) {
                    historyHTML += `<h5>${user ? user.name : 'Unknown User'}</h5>`;
                    chats.forEach(chat => {
                        historyHTML += this.createHistoryItem(chat);
                    });
                }
            });
        } else {
            // Regular user sees only their chats
            const userChats = this.allChats[this.currentUser.id] || [];
            
            if (userChats.length === 0) {
                historyHTML = '<p class="no-history">No chat history yet. Start a conversation to build your history!</p>';
            } else {
                userChats.forEach(chat => {
                    historyHTML += this.createHistoryItem(chat);
                });
            }
        }
        
        content.innerHTML = historyHTML;
    }

    createHistoryItem(chat) {
        const date = new Date(chat.timestamp).toLocaleDateString();
        const mode = this.modes[chat.mode]?.title || chat.mode;
        
        return `
            <div class="history-item">
                <div class="history-meta">${date} • ${mode}</div>
                <div class="history-preview">Q: ${chat.question}</div>
                <div class="history-preview">A: ${chat.answer.substring(0, 100)}...</div>
            </div>
        `;
    }

    handleInputChange() {
        const hasText = this.messageInput.value.trim().length > 0;
        if (this.sendBtn) {
            this.sendBtn.disabled = !hasText || this.isTyping;
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        if (!this.messageInput || this.isTyping) return;
        
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        this.messageInput.value = '';
        this.handleInputChange();

        // Show typing indicator
        this.isTyping = true;
        await this.delay(1000 + Math.random() * 1500);

        // Generate and add AI response
        const response = this.generateResponse(message);
        await this.addAIMessage(response);
        
        // Save to chat history if user is logged in
        if (this.currentUser) {
            const chatEntry = {
                id: Date.now(),
                mode: this.currentMode,
                question: message,
                answer: response,
                timestamp: new Date()
            };
            
            if (!this.allChats[this.currentUser.id]) {
                this.allChats[this.currentUser.id] = [];
            }
            
            this.allChats[this.currentUser.id].push(chatEntry);
        }

        this.isTyping = false;
        this.handleInputChange();
    }

    addUserMessage(message) {
        if (!this.chatMessages) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'message message--user';
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">Just now</div>
            </div>
        `;

        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
    }

    async addAIMessage(message) {
        if (!this.chatMessages) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'message message--ai';
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2.5 1 3.5 0 .5-.5 1-.5 1.5 0 1 1 1.5 2.5 1.5s2.5-.5 2.5-1.5c0-.5-.5-1-.5-1.5 0-1 1-2 1-3.5A3 3 0 0 0 12 2z"/>
                    <path d="M12 16.5c-1.5 0-3 .5-3 2v3h6v-3c0-1.5-1.5-2-3-2z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-text"></div>
                <div class="message-time">Just now</div>
            </div>
        `;

        this.chatMessages.appendChild(messageEl);
        
        const textEl = messageEl.querySelector('.message-text');
        
        // Type out the message
        for (let i = 0; i < message.length; i++) {
            textEl.textContent = message.substring(0, i + 1);
            this.scrollToBottom();
            await this.delay(this.typingSpeed);
        }
    }

    generateResponse(userMessage) {
        const responses = this.modes[this.currentMode]?.responses || [
            "Thank you for your question. This is a demo response from MarefaSource AI."
        ];
        
        const input = userMessage.toLowerCase();
        
        // Simple keyword-based responses
        if (input.includes('hello') || input.includes('assalam') || input.includes('salam')) {
            return "وعليكم السلام ورحمة الله وبركاته! Welcome to MarefaSource AI. How may I assist you with your Islamic inquiries today?";
        }
        
        if (input.includes('prayer') || input.includes('salah') || input.includes('namaz')) {
            return this.currentMode === 'ahkam' 
                ? "Regarding prayer (Salah), it is one of the five pillars of Islam. The obligation is established in the Quran and Sunnah..."
                : responses[0];
        }
        
        if (input.includes('halal') || input.includes('haram')) {
            return this.currentMode === 'ahkam'
                ? "The determination of halal and haram requires careful analysis of Islamic sources. Based on the Quran and Sunnah..."
                : responses[1];
        }
        
        // Return random response from current mode
        return responses[Math.floor(Math.random() * responses.length)];
    }

    scrollToBottom() {
        if (this.chatMessages) {
            requestAnimationFrame(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            });
        }
    }

    showToast(message, type = 'success') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icon = type === 'success' ? this.createCheckIcon() : 
                    type === 'error' ? this.createErrorIcon() : 
                    this.createInfoIcon();

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div>${this.escapeHtml(message)}</div>
        `;

        this.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    }

    createCheckIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>`;
    }

    createErrorIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;
    }

    createInfoIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check for stored user
        const storedUser = localStorage.getItem('currentUser');
        
        window.marefaApp = new MarefaSourceApp();
        
        if (storedUser) {
            window.marefaApp.currentUser = JSON.parse(storedUser);
            window.marefaApp.updateUI();
        }
        
        console.log('MarefaSource AI loaded successfully');
    } catch (error) {
        console.error('Failed to initialize MarefaSource AI:', error);
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarefaSourceApp;
}