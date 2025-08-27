from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import openai
import os
from datetime import datetime, timedelta
import uuid
import threading
import time
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('FRONTEND_URL', 'http://localhost:3000'))

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["100 per hour", "20 per minute"]
)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

# Validate API keys
if not OPENAI_API_KEY and not PERPLEXITY_API_KEY:
    print("Error: No API keys provided. Please set OPENAI_API_KEY or PERPLEXITY_API_KEY in your .env file")
    exit(1)

# Initialize OpenAI client if key is available
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# In-memory conversation storage (use Redis or database in production)
conversations = {}
cleanup_lock = threading.Lock()

class ConversationManager:
    def __init__(self):
        self.conversations = {}
        self.cleanup_interval = 3600  # 1 hour
        self.max_age = 24 * 3600  # 24 hours
        self.start_cleanup_thread()

    def create_conversation(self):
        conv_id = str(uuid.uuid4())
        self.conversations[conv_id] = {
            'id': conv_id,
            'messages': [],
            'created_at': datetime.now().isoformat(),
            'last_activity': datetime.now().isoformat()
        }
        return conv_id

    def get_conversation(self, conv_id):
        return self.conversations.get(conv_id)

    def add_message(self, conv_id, role, content):
        if conv_id in self.conversations:
            message = {
                'role': role,
                'content': content,
                'timestamp': datetime.now().isoformat()
            }
            self.conversations[conv_id]['messages'].append(message)
            self.conversations[conv_id]['last_activity'] = datetime.now().isoformat()
            return message
        return None

    def delete_conversation(self, conv_id):
        if conv_id in self.conversations:
            del self.conversations[conv_id]
            return True
        return False

    def cleanup_old_conversations(self):
        with cleanup_lock:
            current_time = datetime.now()
            expired_conversations = []

            for conv_id, conversation in self.conversations.items():
                last_activity = datetime.fromisoformat(conversation['last_activity'])
                if (current_time - last_activity).total_seconds() > self.max_age:
                    expired_conversations.append(conv_id)

            for conv_id in expired_conversations:
                del self.conversations[conv_id]
                print(f"Cleaned up old conversation: {conv_id}")

    def start_cleanup_thread(self):
        def cleanup_worker():
            while True:
                time.sleep(self.cleanup_interval)
                self.cleanup_old_conversations()

        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()

# Initialize conversation manager
conv_manager = ConversationManager()

def generate_openai_response(messages):
    """Generate response using OpenAI GPT-4"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": msg["role"], "content": msg["content"]} for msg in messages[-20:]],
            temperature=0.7,
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise Exception("Failed to generate AI response")

def generate_perplexity_response(messages):
    """Generate response using Perplexity API"""
    try:
        headers = {
            'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
            'Content-Type': 'application/json'
        }
        data = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': [{"role": msg["role"], "content": msg["content"]} for msg in messages[-20:]],
            'temperature': 0.7,
            'max_tokens': 1500
        }

        response = requests.post('https://api.perplexity.ai/chat/completions', 
                               headers=headers, json=data)
        response.raise_for_status()

        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Perplexity API error: {e}")
        raise Exception("Failed to generate AI response")

# Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    conv_id = conv_manager.create_conversation()
    return jsonify({'conversationId': conv_id})

@app.route('/api/conversations/<conv_id>', methods=['GET'])
def get_conversation(conv_id):
    conversation = conv_manager.get_conversation(conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    return jsonify(conversation)

@app.route('/api/conversations/<conv_id>/messages', methods=['POST'])
@limiter.limit("10 per minute")
def send_message(conv_id):
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        use_perplexity = data.get('usePerplexity', False)

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        if len(message) > 4000:
            return jsonify({'error': 'Message too long. Maximum 4000 characters allowed.'}), 400

        # Get or create conversation
        conversation = conv_manager.get_conversation(conv_id)
        if not conversation:
            conv_manager.create_conversation()
            conversation = conv_manager.get_conversation(conv_id)

        # Add user message
        user_message = conv_manager.add_message(conv_id, 'user', message)
        if not user_message:
            return jsonify({'error': 'Failed to add message'}), 500

        # Generate AI response
        messages = conversation['messages']

        if use_perplexity and PERPLEXITY_API_KEY:
            ai_content = generate_perplexity_response(messages)
        elif OPENAI_API_KEY:
            ai_content = generate_openai_response(messages)
        else:
            return jsonify({'error': 'No AI API available'}), 503

        # Add AI message
        ai_message = conv_manager.add_message(conv_id, 'assistant', ai_content)

        return jsonify({
            'message': ai_message,
            'conversationId': conv_id
        })

    except Exception as e:
        print(f"Error processing message: {e}")
        return jsonify({
            'error': 'Failed to process message',
            'details': str(e)
        }), 500

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    if conv_manager.delete_conversation(conv_id):
        return jsonify({'message': 'Conversation deleted successfully'})
    else:
        return jsonify({'error': 'Conversation not found'}), 404

@app.route('/api/conversations', methods=['GET'])
def list_conversations():
    """List all conversations (for debugging/admin)"""
    all_conversations = []
    for conversation in conv_manager.conversations.values():
        all_conversations.append({
            'id': conversation['id'],
            'messageCount': len(conversation['messages']),
            'createdAt': conversation['created_at'],
            'lastActivity': conversation['last_activity']
        })
    return jsonify(all_conversations)

# Serve static files
@app.route('/')
def serve_frontend():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print(f"ChatGPT Clone Server starting...")
    print(f"OpenAI API: {'Configured' if OPENAI_API_KEY else 'Not configured'}")
    print(f"Perplexity API: {'Configured' if PERPLEXITY_API_KEY else 'Not configured'}")

    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )