# ChatGPT Clone - Full Stack AI Chat Application

A professional, fully functional ChatGPT clone with modern UI/UX, streaming responses, and AI integration using OpenAI GPT-4 or Perplexity API.

## ✨ Features

### Frontend Features
- 🎨 **Modern Chat Interface**: Clean, professional UI with user/AI message bubbles
- ⚡ **Streaming Animations**: Real-time typing effects for AI responses
- 🌓 **Dark/Light Mode**: Toggle between themes with smooth transitions
- 📋 **Copy to Clipboard**: One-click copy functionality for AI messages
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⌨️ **Keyboard Shortcuts**: 
  - `Enter` to send messages
  - `Shift+Enter` for new lines
  - `Ctrl+N` for new conversation
  - `Ctrl+T` to toggle theme
- 💬 **Chat Management**: Start new conversations, maintain chat history
- 🎯 **Auto-scroll**: Automatically scrolls to latest messages

### Backend Features
- 🤖 **AI Integration**: Support for OpenAI GPT-4 and Perplexity API
- 💾 **Context Management**: Maintains conversation context across messages
- 🔒 **Security**: Rate limiting, CORS protection, input validation
- 🚀 **Performance**: Optimized API calls with proper error handling
- 📊 **Monitoring**: Health checks and logging
- 🧹 **Memory Management**: Automatic cleanup of old conversations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ or Python 3.8+
- OpenAI API key or Perplexity API key
- Git (optional)

### Option 1: Node.js Backend

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the Application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

### Option 2: Python Backend

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the Application**
   ```bash
   # Development mode
   python server.py

   # Production mode with Gunicorn
   gunicorn server:app --bind 0.0.0.0:5000
   ```

The application will be available at `http://localhost:3000` (Node.js) or `http://localhost:5000` (Python).

## 📁 Project Structure

```
chatgpt-clone/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # CSS styles and themes
│   └── app.js              # Frontend JavaScript logic
├── backend/
│   ├── server.js           # Node.js Express server
│   ├── server.py           # Python Flask server
│   ├── package.json        # Node.js dependencies
│   └── requirements.txt    # Python dependencies
├── .env.example            # Environment variables template
├── README.md               # This file
└── docs/                   # Additional documentation
```

## 🔧 Configuration

### API Keys Setup

1. **OpenAI API Key** (Recommended)
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Go to API Keys section
   - Create a new API key
   - Add to `.env` file: `OPENAI_API_KEY=sk-...`

2. **Perplexity API Key** (Alternative)
   - Sign up at [Perplexity AI](https://www.perplexity.ai)
   - Go to Settings > API
   - Create a new API key
   - Add to `.env` file: `PERPLEXITY_API_KEY=pplx-...`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Required |
| `PERPLEXITY_API_KEY` | Perplexity API key | Alternative |
| `PORT` | Server port | 3000 (Node.js), 5000 (Python) |
| `NODE_ENV` / `FLASK_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🔌 API Documentation

### Endpoints

#### Health Check
```
GET /api/health
Response: { "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

#### Create Conversation
```
POST /api/conversations
Response: { "conversationId": "uuid" }
```

#### Send Message
```
POST /api/conversations/:id/messages
Body: { 
  "message": "Hello!", 
  "usePerplexity": false 
}
Response: { 
  "message": { "role": "assistant", "content": "...", "timestamp": "..." },
  "conversationId": "uuid" 
}
```

#### Get Conversation
```
GET /api/conversations/:id
Response: { "id": "uuid", "messages": [...], "createdAt": "...", "lastActivity": "..." }
```

#### Delete Conversation
```
DELETE /api/conversations/:id
Response: { "message": "Conversation deleted successfully" }
```

## 🚀 Deployment

### Deploy to Vercel (Node.js)

1. Install Vercel CLI: `npm i -g vercel`
2. Configure `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" },
       { "src": "frontend/*", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/server.js" },
       { "src": "/(.*)", "dest": "/frontend/$1" }
     ],
     "env": {
       "OPENAI_API_KEY": "@openai-api-key"
     }
   }
   ```
3. Deploy: `vercel --prod`

### Deploy to Heroku

1. **Prepare for Deployment**
   ```bash
   # Add Procfile for Node.js
   echo "web: node server.js" > Procfile

   # Or for Python
   echo "web: gunicorn server:app --bind 0.0.0.0:$PORT" > Procfile
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create your-chatgpt-clone
   heroku config:set OPENAI_API_KEY=your_key_here
   git push heroku main
   ```

### Deploy to AWS/Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Deploy**
   ```bash
   docker build -t chatgpt-clone .
   docker run -p 3000:3000 --env-file .env chatgpt-clone
   ```

## 🎨 Customization

### Theming
- Modify CSS variables in `style.css`
- Add custom color schemes
- Adjust typography and spacing

### AI Behavior
- Change model parameters in backend
- Modify system prompts
- Adjust context window size

### UI Components
- Add new features to `app.js`
- Customize message rendering
- Add new keyboard shortcuts

## 📊 Performance & Monitoring

### Rate Limiting
- Default: 100 requests per hour, 20 per minute
- Configurable per endpoint
- IP-based tracking

### Error Handling
- Graceful API failure handling
- User-friendly error messages
- Comprehensive logging

### Memory Management
- Automatic cleanup of old conversations
- Configurable retention policies
- Memory usage optimization

## 🔐 Security Best Practices

### API Security
- Environment variable for API keys
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration

### Production Security
- Use HTTPS in production
- Implement proper authentication
- Regular security updates
- Monitor API usage

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correctly set in `.env`
   - Check API key permissions and billing
   - Ensure no extra spaces in key

2. **CORS Errors**
   - Update `FRONTEND_URL` in environment
   - Check domain configuration
   - Verify protocol (http/https)

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill process: `lsof -ti:3000 | xargs kill -9`

4. **Dependencies Issues**
   - Clear cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`

## 📈 Optional Improvements

### Potential Enhancements
- [ ] User authentication and profiles
- [ ] Persistent database storage
- [ ] File upload support
- [ ] Voice input/output
- [ ] Message search functionality
- [ ] Export conversations
- [ ] Multiple AI model support
- [ ] Custom prompt templates
- [ ] Analytics dashboard
- [ ] Multi-language support

### Database Integration
Replace in-memory storage with:
- PostgreSQL for conversation storage
- Redis for session management
- MongoDB for document storage

### Advanced Features
- WebSocket integration for real-time updates
- Server-sent events for streaming responses
- Progressive Web App (PWA) support
- Offline functionality

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or need help with setup:

1. Check the troubleshooting section
2. Review environment configuration
3. Verify API key setup
4. Check console logs for errors

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Perplexity AI for alternative API
- Modern web technologies and best practices
- Open source community for inspiration

---

**Happy coding! 🚀**