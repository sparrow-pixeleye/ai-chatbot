// APRATIM'S AI 2.0 - Frontend Application

class ApratimAI {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = [];
        this.isTyping = false;
        this.settings = {
            theme: 'dark',
            language: 'en',
            contextMemory: true,
            voiceResponses: true,
            realTimeSearch: true
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.showLoadingScreen();
        this.loadChatHistory();
        
        // Initialize app after loading
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('apratim-ai-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applyTheme(this.settings.theme);
    }

    saveSettings() {
        localStorage.setItem('apratim-ai-settings', JSON.stringify(this.settings));
    }

    setupEventListeners() {
        // Loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        
        // Main app elements
        const newChatBtn = document.getElementById('newChatBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        const voiceBtn = document.getElementById('voiceBtn');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        // Settings modal
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const themeButtons = document.querySelectorAll('.theme-btn');
        const languageSelect = document.getElementById('languageSelect');
        const clearHistory = document.getElementById('clearHistory');
        
        // Event listeners
        newChatBtn?.addEventListener('click', () => this.startNewChat());
        settingsBtn?.addEventListener('click', () => this.openSettings());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        voiceBtn?.addEventListener('click', () => this.toggleVoiceInput());
        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        
        closeSettings?.addEventListener('click', () => this.closeSettings());
        settingsModal?.addEventListener('click', (e) => {
            if (e.target === settingsModal) this.closeSettings();
        });
        
        // Theme selection
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
        });
        
        // Language selection
        languageSelect?.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.saveSettings();
        });
        
        // Clear history
        clearHistory?.addEventListener('click', () => this.clearChatHistory());
        
        // Message input
        messageInput?.addEventListener('input', () => this.handleInputChange());
        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Settings checkboxes
        const checkboxes = ['contextMemory', 'voiceResponses', 'realTimeSearch'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = this.settings[id];
                checkbox.addEventListener('change', (e) => {
                    this.settings[id] = e.target.checked;
                    this.saveSettings();
                });
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.startNewChat();
                        break;
                    case ',':
                        e.preventDefault();
                        this.openSettings();
                        break;
                }
            }
        });
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');
        
        loadingScreen?.classList.remove('hidden');
        mainApp?.classList.add('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');
        
        loadingScreen?.classList.add('hidden');
        mainApp?.classList.remove('hidden');
        
        // Show welcome screen if no active chat
        if (!this.currentChatId) {
            this.showWelcomeScreen();
        }
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const chatInterface = document.getElementById('chatInterface');
        
        welcomeScreen?.classList.remove('hidden');
        chatInterface?.classList.add('hidden');
    }

    showChatInterface() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const chatInterface = document.getElementById('chatInterface');
        
        welcomeScreen?.classList.add('hidden');
        chatInterface?.classList.remove('hidden');
    }

    startNewChat() {
        this.currentChatId = this.generateChatId();
        this.clearChatMessages();
        this.showChatInterface();
        
        // Focus on input
        const messageInput = document.getElementById('messageInput');
        messageInput?.focus();
        
        // Add to chat history
        const newChat = {
            id: this.currentChatId,
            title: 'New Chat',
            timestamp: new Date().toISOString(),
            messages: []
        };
        
        this.chatHistory.unshift(newChat);
        this.updateChatList();
        this.saveChatHistory();
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    clearChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput?.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input
        messageInput.value = '';
        this.handleInputChange();
        
        // Show chat interface if not visible
        if (!this.currentChatId) {
            this.startNewChat();
        }
        
        // Add user message
        this.addMessage('user', message);
        
        // Show thinking indicator
        this.showThinkingIndicator();
        
        try {
            // Send to backend
            const response = await this.callAPI(message);
            
            // Hide thinking indicator
            this.hideThinkingIndicator();
            
            // Add AI response
            this.addMessage('ai', response);
            
            // Update chat title if first message
            this.updateChatTitle(message);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideThinkingIndicator();
            this.addMessage('ai', 'I apologize, but I encountered an error. Please try again.');
        }
    }

    async callAPI(message) {
        const response = await fetch('/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                chatId: this.currentChatId,
                settings: this.settings
            }),
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.reply;
    }

    addMessage(sender, content) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        if (sender === 'ai') {
            // Parse markdown and highlight code
            messageBubble.innerHTML = this.parseMarkdown(content);
            // Highlight code blocks
            messageBubble.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        } else {
            messageBubble.textContent = content;
        }
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageContent.appendChild(messageBubble);
        messageContent.appendChild(messageTime);
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save message to current chat
        if (this.currentChatId) {
            const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId);
            if (currentChat) {
                currentChat.messages.push({
                    sender,
                    content,
                    timestamp: new Date().toISOString()
                });
                this.saveChatHistory();
            }
        }
    }

    parseMarkdown(text) {
        // Use marked.js for markdown parsing
        if (typeof marked !== 'undefined') {
            return marked.parse(text);
        }
        
        // Fallback simple markdown parsing
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
    }

    showThinkingIndicator() {
        const indicator = document.getElementById('thinkingIndicator');
        indicator?.classList.remove('hidden');
        this.isTyping = true;
    }

    hideThinkingIndicator() {
        const indicator = document.getElementById('thinkingIndicator');
        indicator?.classList.add('hidden');
        this.isTyping = false;
    }

    handleInputChange() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            const hasContent = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasContent;
            
            // Auto-resize textarea
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        }
    }

    updateChatTitle(firstMessage) {
        if (!this.currentChatId) return;
        
        const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId);
        if (currentChat && currentChat.messages.length === 1) {
            // Generate title from first message
            currentChat.title = firstMessage.length > 30 
                ? firstMessage.substring(0, 30) + '...'
                : firstMessage;
            
            this.updateChatList();
            this.saveChatHistory();
        }
    }

    loadChatHistory() {
        const saved = localStorage.getItem('apratim-ai-history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            this.updateChatList();
        }
    }

    saveChatHistory() {
        localStorage.setItem('apratim-ai-history', JSON.stringify(this.chatHistory));
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        this.chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            if (chat.id === this.currentChatId) {
                chatItem.classList.add('active');
            }
            
            chatItem.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-time">${new Date(chat.timestamp).toLocaleDateString()}</div>
            `;
            
            chatItem.addEventListener('click', () => this.loadChat(chat.id));
            chatList.appendChild(chatItem);
        });
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.clearChatMessages();
        this.showChatInterface();
        
        // Load messages
        chat.messages.forEach(msg => {
            this.addMessageToUI(msg.sender, msg.content);
        });
        
        this.updateChatList();
    }

    addMessageToUI(sender, content) {
        // Similar to addMessage but without saving to history
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        if (sender === 'ai') {
            messageBubble.innerHTML = this.parseMarkdown(content);
            messageBubble.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        } else {
            messageBubble.textContent = content;
        }
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageContent.appendChild(messageBubble);
        messageContent.appendChild(messageTime);
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            this.chatHistory = [];
            this.currentChatId = null;
            this.saveChatHistory();
            this.updateChatList();
            this.showWelcomeScreen();
        }
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal?.classList.remove('hidden');
        
        // Update theme selection
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
        
        // Update language selection
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
        }
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal?.classList.add('hidden');
    }

    changeTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('open');
    }

    toggleVoiceInput() {
        const voiceBtn = document.getElementById('voiceBtn');
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            if (!this.recognition) {
                this.initSpeechRecognition();
            }
            
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.settings.language === 'en' ? 'en-US' : this.settings.language;
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            const voiceBtn = document.getElementById('voiceBtn');
            voiceBtn?.classList.add('recording');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = transcript;
                this.handleInputChange();
            }
        };
        
        this.recognition.onend = () => {
            this.isRecording = false;
            const voiceBtn = document.getElementById('voiceBtn');
            voiceBtn?.classList.remove('recording');
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isRecording = false;
            const voiceBtn = document.getElementById('voiceBtn');
            voiceBtn?.classList.remove('recording');
        };
    }

    startRecording() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}

// Suggestion functions
function sendSuggestion(message) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = message;
        app.handleInputChange();
        app.sendMessage();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ApratimAI();
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}