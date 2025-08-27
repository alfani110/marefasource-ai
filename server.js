const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.openai.com"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'public_html')));

// Conversation storage (in production, use a database)
const conversations = new Map();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Alternative: Perplexity API configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Utility function to validate API keys
const validateApiKeys = () => {
    if (!OPENAI_API_KEY && !PERPLEXITY_API_KEY) {
        console.error('Error: No API keys provided. Please set OPENAI_API_KEY or PERPLEXITY_API_KEY in your .env file');
        process.exit(1);
    }
};

// Function to generate AI response using OpenAI
async function generateOpenAIResponse(messages, conversationId) {
    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: 'gpt-4',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1500,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response');
    }
}

// Function to generate AI response using Perplexity
async function generatePerplexityResponse(messages, conversationId) {
    try {
        const response = await axios.post(PERPLEXITY_API_URL, {
            model: 'llama-3.1-sonar-small-128k-online',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1500
        }, {
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Perplexity API error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response');
    }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start new conversation
app.post('/api/conversations', (req, res) => {
    const conversationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    });

    res.json({ conversationId });
});

// Get conversation history
app.get('/api/conversations/:id', (req, res) => {
    const { id } = req.params;
    const conversation = conversations.get(id);

    if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
});

// Send message and get AI response
app.post('/api/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { message, usePerplexity = false } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
        }

        if (message.length > 4000) {
            return res.status(400).json({ error: 'Message too long. Maximum 4000 characters allowed.' });
        }

        let conversation = conversations.get(id);
        if (!conversation) {
            // Create new conversation if it doesn't exist
            conversation = {
                id: id,
                messages: [],
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            conversations.set(id, conversation);
        }

        // Add user message to conversation
        const userMessage = {
            role: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString()
        };
        conversation.messages.push(userMessage);

        // Prepare messages for API (keep last 20 messages for context)
        const apiMessages = conversation.messages
            .slice(-20)
            .map(msg => ({ role: msg.role, content: msg.content }));

        // Generate AI response
        let aiResponseContent;
        if (usePerplexity && PERPLEXITY_API_KEY) {
            aiResponseContent = await generatePerplexityResponse(apiMessages, id);
        } else if (OPENAI_API_KEY) {
            aiResponseContent = await generateOpenAIResponse(apiMessages, id);
        } else {
            throw new Error('No AI API available');
        }

        // Add AI message to conversation
        const aiMessage = {
            role: 'assistant',
            content: aiResponseContent,
            timestamp: new Date().toISOString()
        };
        conversation.messages.push(aiMessage);
        conversation.lastActivity = new Date().toISOString();

        res.json({
            message: aiMessage,
            conversationId: id
        });

    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error.message 
        });
    }
});

// Delete conversation
app.delete('/api/conversations/:id', (req, res) => {
    const { id } = req.params;

    if (conversations.has(id)) {
        conversations.delete(id);
        res.json({ message: 'Conversation deleted successfully' });
    } else {
        res.status(404).json({ error: 'Conversation not found' });
    }
});

// List all conversations (for debugging/admin)
app.get('/api/conversations', (req, res) => {
    const allConversations = Array.from(conversations.values()).map(conv => ({
        id: conv.id,
        messageCount: conv.messages.length,
        createdAt: conv.createdAt,
        lastActivity: conv.lastActivity
    }));

    res.json(allConversations);
});

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Cleanup old conversations periodically (basic memory management)
setInterval(() => {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, conversation] of conversations.entries()) {
        const lastActivity = new Date(conversation.lastActivity);
        if (now - lastActivity > maxAge) {
            conversations.delete(id);
            console.log(`Cleaned up old conversation: ${id}`);
        }
    }
}, 60 * 60 * 1000); // Run every hour

// Validate API keys and start server
validateApiKeys();

app.listen(PORT, () => {
    console.log(`ChatGPT Clone Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`OpenAI API: ${OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`Perplexity API: ${PERPLEXITY_API_KEY ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
