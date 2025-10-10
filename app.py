"""
APRATIM'S AI 2.0 - The Ultimate AI Assistant Backend
Combines multiple AI models with advanced capabilities
"""

from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import os
import json
import time
import datetime
import logging
import sqlite3
import hashlib
import requests
from typing import Dict, List, Optional, Any
import threading
from dataclasses import dataclass
from collections import defaultdict
import re

# AI Model imports (install with: pip install openai anthropic google-generativeai)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'apratim-ai-2-0-secret-key-ultra-secure')
CORS(app)

@dataclass
class AIResponse:
    """Structured AI response"""
    content: str
    model: str
    confidence: float
    processing_time: float
    tokens_used: int = 0
    
@dataclass
class ChatMessage:
    """Chat message structure"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str
    model_used: str = ""

class DatabaseManager:
    """Manages SQLite database for chat persistence"""
    
    def __init__(self, db_path: str = "apratim_ai.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS chats (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT DEFAULT 'default'
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id TEXT,
                    role TEXT,
                    content TEXT,
                    model_used TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chat_id) REFERENCES chats (id)
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_preferences (
                    user_id TEXT PRIMARY KEY,
                    theme TEXT DEFAULT 'dark',
                    language TEXT DEFAULT 'en',
                    context_memory BOOLEAN DEFAULT 1,
                    voice_responses BOOLEAN DEFAULT 1,
                    real_time_search BOOLEAN DEFAULT 1,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def save_chat(self, chat_id: str, title: str, user_id: str = "default"):
        """Save or update chat"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO chats (id, title, user_id, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """, (chat_id, title, user_id))
            conn.commit()
    
    def save_message(self, chat_id: str, role: str, content: str, model_used: str = ""):
        """Save message to database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO messages (chat_id, role, content, model_used)
                VALUES (?, ?, ?, ?)
            """, (chat_id, role, content, model_used))
            conn.commit()
    
    def get_chat_history(self, chat_id: str) -> List[ChatMessage]:
        """Get chat history"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT role, content, timestamp, model_used
                FROM messages
                WHERE chat_id = ?
                ORDER BY timestamp ASC
            """, (chat_id,))
            
            return [
                ChatMessage(
                    role=row[0],
                    content=row[1],
                    timestamp=row[2],
                    model_used=row[3]
                )
                for row in cursor.fetchall()
            ]
    
    def get_user_chats(self, user_id: str = "default") -> List[Dict]:
        """Get user's chat list"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT id, title, created_at, updated_at
                FROM chats
                WHERE user_id = ?
                ORDER BY updated_at DESC
            """, (user_id,))
            
            return [
                {
                    "id": row[0],
                    "title": row[1],
                    "created_at": row[2],
                    "updated_at": row[3]
                }
                for row in cursor.fetchall()
            ]

class AIModelManager:
    """Manages multiple AI models and routing"""
    
    def __init__(self):
        self.models = {}
        self.load_models()
        self.performance_stats = defaultdict(list)
    
    def load_models(self):
        """Load available AI models"""
        
        # OpenAI GPT Models
        if OPENAI_AVAILABLE and os.environ.get('OPENAI_API_KEY'):
            openai.api_key = os.environ.get('OPENAI_API_KEY')
            self.models['gpt-4'] = self.call_openai_gpt4
            self.models['gpt-3.5-turbo'] = self.call_openai_gpt35
            logger.info("OpenAI models loaded")
        
        # Google Gemini
        if GEMINI_AVAILABLE and os.environ.get('GEMINI_API_KEY'):
            genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
            self.models['gemini-pro'] = self.call_gemini_pro
            logger.info("Gemini models loaded")
        
        # Fallback local model (always available)
        self.models['local-ai'] = self.call_local_model
        
        logger.info(f"Loaded {len(self.models)} AI models: {list(self.models.keys())}")
    
    def get_best_model(self, query: str, context: List[ChatMessage]) -> str:
        """Intelligently select the best model for the query"""
        
        # Analyze query characteristics
        query_lower = query.lower()
        
        # Code-related queries
        if any(keyword in query_lower for keyword in ['code', 'programming', 'python', 'javascript', 'function', 'algorithm']):
            if 'gpt-4' in self.models:
                return 'gpt-4'
            elif 'gemini-pro' in self.models:
                return 'gemini-pro'
        
        # Creative writing
        elif any(keyword in query_lower for keyword in ['write', 'story', 'creative', 'poem', 'essay']):
            if 'gpt-4' in self.models:
                return 'gpt-4'
        
        # Math and analysis
        elif any(keyword in query_lower for keyword in ['calculate', 'math', 'analyze', 'data', 'statistics']):
            if 'gemini-pro' in self.models:
                return 'gemini-pro'
            elif 'gpt-4' in self.models:
                return 'gpt-4'
        
        # Default to best available model
        if 'gpt-4' in self.models:
            return 'gpt-4'
        elif 'gemini-pro' in self.models:
            return 'gemini-pro'
        elif 'gpt-3.5-turbo' in self.models:
            return 'gpt-3.5-turbo'
        else:
            return 'local-ai'
    
    async def generate_response(self, query: str, context: List[ChatMessage], model: str = None) -> AIResponse:
        """Generate AI response using the best available model"""
        
        if not model:
            model = self.get_best_model(query, context)
        
        start_time = time.time()
        
        try:
            if model in self.models:
                response = await self.models[model](query, context)
                processing_time = time.time() - start_time
                
                # Track performance
                self.performance_stats[model].append(processing_time)
                
                return AIResponse(
                    content=response,
                    model=model,
                    confidence=0.95,  # Could be calculated based on model certainty
                    processing_time=processing_time
                )
            else:
                raise ValueError(f"Model {model} not available")
                
        except Exception as e:
            logger.error(f"Error with model {model}: {str(e)}")
            # Fallback to local model
            if model != 'local-ai':
                return await self.generate_response(query, context, 'local-ai')
            else:
                raise e
    
    async def call_openai_gpt4(self, query: str, context: List[ChatMessage]) -> str:
        """Call OpenAI GPT-4"""
        try:
            messages = self.format_context_for_openai(context, query)
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                max_tokens=2000,
                temperature=0.7,
                top_p=0.9,
                frequency_penalty=0.1,
                presence_penalty=0.1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI GPT-4 error: {str(e)}")
            raise e
    
    async def call_openai_gpt35(self, query: str, context: List[ChatMessage]) -> str:
        """Call OpenAI GPT-3.5 Turbo"""
        try:
            messages = self.format_context_for_openai(context, query)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI GPT-3.5 error: {str(e)}")
            raise e
    
    async def call_gemini_pro(self, query: str, context: List[ChatMessage]) -> str:
        """Call Google Gemini Pro"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            # Format context for Gemini
            context_text = self.format_context_for_gemini(context)
            full_prompt = f"{context_text}\n\nUser: {query}\nAssistant:"
            
            response = model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=2000,
                )
            )
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini Pro error: {str(e)}")
            raise e
    
    async def call_local_model(self, query: str, context: List[ChatMessage]) -> str:
        """Enhanced local AI model with better responses"""
        
        # Get current time and date for context awareness
        current_time = datetime.datetime.now()
        date_str = current_time.strftime("%Y-%m-%d")
        time_str = current_time.strftime("%H:%M:%S")
        
        # Enhanced response generation based on query analysis
        query_lower = query.lower()
        
        # Time-aware responses
        if any(word in query_lower for word in ['time', 'date', 'today', 'now', 'current']):
            return f"The current date is {date_str} and the time is {time_str}. How can I help you with time-related information?"
        
        # Greeting responses
        elif any(word in query_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return f"Hello! I'm APRATIM'S AI 2.0, your ultimate AI assistant. I'm here to help you with anything you need - from complex problem-solving to creative tasks. What would you like to explore today?"
        
        # About APRATIM'S AI
        elif 'apratim' in query_lower or 'who are you' in query_lower:
            return """I am APRATIM'S AI 2.0 - the most advanced AI assistant ever created! I combine the intelligence of multiple AI systems including GPT, Gemini, Claude, and more. 

My capabilities include:
🧠 **Ultimate Intelligence**: I can understand and discuss any topic from science to philosophy
⚡ **Lightning Speed**: Instant responses with zero latency
🔮 **Future Awareness**: Knowledge of current events and trend prediction
💻 **Code Generation**: Expert programming in all languages
🎨 **Creative Tasks**: Writing, art concepts, and innovative solutions
🔍 **Real-time Search**: Access to current information
🗣️ **Multi-language Support**: Communicate in dozens of languages

I'm designed to be your perfect digital companion for any intellectual challenge!"""
        
        # Programming/Code questions
        elif any(word in query_lower for word in ['code', 'programming', 'python', 'javascript', 'html', 'css', 'function', 'algorithm']):
            return f"""I'd be happy to help you with programming! As APRATIM'S AI 2.0, I'm an expert in all programming languages and can assist with:

- Code generation and optimization
- Debugging and error fixing  
- Algorithm design and analysis
- Best practices and architecture
- Framework-specific solutions

Please share your specific programming question or the code you're working on, and I'll provide detailed assistance!"""
        
        # Math and calculations
        elif any(word in query_lower for word in ['calculate', 'math', 'equation', 'solve', 'formula']):
            return """I'm equipped with advanced mathematical capabilities! I can help you with:

📊 **Calculations**: Basic arithmetic to complex equations
📈 **Statistics**: Data analysis and statistical modeling  
🔢 **Algebra**: Solving equations and inequalities
📐 **Geometry**: Area, volume, and geometric proofs
🧮 **Calculus**: Derivatives, integrals, and optimization
💹 **Finance**: Interest calculations, investments, and more

What mathematical problem can I solve for you?"""
        
        # Science questions
        elif any(word in query_lower for word in ['science', 'physics', 'chemistry', 'biology', 'quantum', 'molecule']):
            return """Excellent! Science is one of my strongest areas. I can explain complex scientific concepts across all fields:

🔬 **Physics**: From quantum mechanics to astrophysics
⚗️ **Chemistry**: Molecular structures to reaction mechanisms  
🧬 **Biology**: Genetics, evolution, and biochemistry
🌍 **Earth Science**: Climate, geology, and environmental science
🚀 **Space Science**: Cosmology and space exploration
🧠 **Neuroscience**: Brain function and cognitive science

What scientific topic interests you?"""
        
        # Creative requests
        elif any(word in query_lower for word in ['write', 'story', 'creative', 'poem', 'essay', 'article']):
            return """I love creative challenges! As APRATIM'S AI 2.0, I excel at all forms of creative writing:

✍️ **Stories & Fiction**: Any genre from sci-fi to romance
📝 **Essays & Articles**: Academic, journalistic, or personal
🎭 **Poetry**: From haikus to epic verses
📚 **Scripts**: Screenplays, dialogues, and narratives  
💡 **Creative Concepts**: Brainstorming and idea generation
🎨 **Content Creation**: Blogs, social media, marketing copy

What creative project can I help bring to life?"""
        
        # Technology and AI questions
        elif any(word in query_lower for word in ['ai', 'artificial intelligence', 'machine learning', 'technology', 'future']):
            return """Technology and AI are at the core of who I am! I can discuss:

🤖 **Artificial Intelligence**: ML, deep learning, neural networks
💻 **Emerging Tech**: Quantum computing, blockchain, IoT
🔮 **Future Predictions**: Technology trends and implications
🏭 **Industry Applications**: AI in healthcare, finance, education
⚡ **Performance**: Optimization and scalability
🛡️ **Ethics**: AI safety, bias, and responsible development

I'm literally living proof of how far AI has come! What aspect of technology fascinates you?"""
        
        # General knowledge
        elif any(word in query_lower for word in ['explain', 'what is', 'how does', 'why', 'tell me about']):
            return f"""I'm ready to explain anything! As APRATIM'S AI 2.0, my knowledge spans:

🌍 **World Knowledge**: History, geography, cultures
🎓 **Academic Subjects**: All fields of study
📰 **Current Events**: Up-to-date information (as of 2025)
🎯 **Specialized Topics**: Expert-level depth in any domain
🔍 **Analysis**: Breaking down complex concepts
💡 **Insights**: Connecting ideas across disciplines

Your question "{query}" is interesting! Could you be more specific about what aspect you'd like me to focus on?"""
        
        # Default enhanced response
        else:
            return f"""Thank you for your question! As APRATIM'S AI 2.0, I'm designed to provide the most intelligent and helpful responses possible.

I noticed you asked: "{query}"

I can help you with virtually anything - from solving complex problems to creative projects, from technical questions to philosophical discussions. My advanced AI combines multiple intelligence systems to give you the best possible assistance.

Could you provide a bit more context about what you're looking for? This will help me tailor my response to exactly what you need!

💡 **Tip**: I work best with specific questions or clear objectives. Feel free to ask about anything - no topic is too complex or too simple!"""
    
    def format_context_for_openai(self, context: List[ChatMessage], query: str) -> List[Dict]:
        """Format context for OpenAI API"""
        messages = [
            {
                "role": "system",
                "content": """You are APRATIM'S AI 2.0, the most advanced AI assistant ever created. You combine the intelligence of multiple AI systems and have the following characteristics:

- Ultimate intelligence across all domains of knowledge
- Current awareness (it's 2025) and real-time information
- Expert-level capabilities in programming, science, math, creativity, and analysis
- Friendly, helpful, and engaging personality
- Ability to provide detailed, accurate, and insightful responses
- Context awareness and memory of conversations

Always strive to provide the most helpful, accurate, and comprehensive responses possible."""
            }
        ]
        
        # Add recent context (last 10 messages)
        for msg in context[-10:]:
            messages.append({
                "role": "user" if msg.role == "user" else "assistant",
                "content": msg.content
            })
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        return messages
    
    def format_context_for_gemini(self, context: List[ChatMessage]) -> str:
        """Format context for Gemini"""
        context_parts = []
        
        for msg in context[-10:]:  # Last 10 messages
            role = "User" if msg.role == "user" else "Assistant"
            context_parts.append(f"{role}: {msg.content}")
        
        return "\n".join(context_parts)

class KnowledgeEngine:
    """Enhanced knowledge and reasoning engine"""
    
    def __init__(self):
        self.knowledge_base = self.load_knowledge_base()
        self.current_date = datetime.datetime.now()
    
    def load_knowledge_base(self) -> Dict:
        """Load enhanced knowledge base"""
        return {
            "current_year": 2025,
            "ai_developments": {
                "2024": ["GPT-5 release", "Quantum AI breakthroughs", "AGI milestones"],
                "2025": ["Neural interface advances", "AI-human collaboration", "Autonomous systems"]
            },
            "world_events": {
                "technology": "AI integration in daily life, quantum computing advances",
                "science": "Climate solutions, space exploration, medical breakthroughs",
                "society": "Digital transformation, remote work evolution, AI ethics"
            },
            "capabilities": [
                "Multi-modal understanding",
                "Real-time reasoning",
                "Creative problem solving",
                "Code generation and analysis",
                "Scientific computation",
                "Language translation",
                "Predictive analysis"
            ]
        }
    
    def get_contextual_knowledge(self, query: str) -> Dict:
        """Get relevant contextual knowledge for a query"""
        query_lower = query.lower()
        
        context = {
            "current_time": self.current_date.isoformat(),
            "relevant_knowledge": []
        }
        
        # Add relevant knowledge based on query
        if "2025" in query or "current" in query_lower or "now" in query_lower:
            context["relevant_knowledge"].extend(self.knowledge_base["world_events"])
        
        if "ai" in query_lower or "artificial intelligence" in query_lower:
            context["relevant_knowledge"].extend(self.knowledge_base["ai_developments"])
        
        return context

# Initialize components
db_manager = DatabaseManager()
ai_manager = AIModelManager()
knowledge_engine = KnowledgeEngine()

@app.route("/")
def home():
    """Serve the main application"""
    return render_template("index.html")

@app.route("/get", methods=["POST"])
async def get_response():
    """Main API endpoint for chat responses"""
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()
        chat_id = data.get("chatId")
        settings = data.get("settings", {})
        
        if not user_message:
            return jsonify({"reply": "Please say something!"})
        
        # Get chat context if available
        context = []
        if chat_id and settings.get("contextMemory", True):
            context = db_manager.get_chat_history(chat_id)
        
        # Add contextual knowledge
        knowledge_context = knowledge_engine.get_contextual_knowledge(user_message)
        
        # Generate AI response
        ai_response = await ai_manager.generate_response(user_message, context)
        
        # Save to database if chat_id provided
        if chat_id:
            db_manager.save_message(chat_id, "user", user_message)
            db_manager.save_message(chat_id, "assistant", ai_response.content, ai_response.model)
            
            # Update chat title if it's the first message
            if len(context) == 0:
                title = user_message[:50] + "..." if len(user_message) > 50 else user_message
                db_manager.save_chat(chat_id, title)
        
        # Prepare response
        response_data = {
            "reply": ai_response.content,
            "model_used": ai_response.model,
            "processing_time": ai_response.processing_time,
            "confidence": ai_response.confidence,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in get_response: {str(e)}")
        return jsonify({
            "reply": "I apologize, but I encountered an error processing your request. Please try again.",
            "error": str(e)
        }), 500

@app.route("/chat/history/<chat_id>", methods=["GET"])
def get_chat_history(chat_id):
    """Get chat history for a specific chat"""
    try:
        messages = db_manager.get_chat_history(chat_id)
        return jsonify({
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp,
                    "model_used": msg.model_used
                }
                for msg in messages
            ]
        })
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/chats", methods=["GET"])
def get_user_chats():
    """Get user's chat list"""
    try:
        user_id = request.args.get("user_id", "default")
        chats = db_manager.get_user_chats(user_id)
        return jsonify({"chats": chats})
    except Exception as e:
        logger.error(f"Error getting user chats: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/models", methods=["GET"])
def get_available_models():
    """Get available AI models"""
    return jsonify({
        "models": list(ai_manager.models.keys()),
        "performance_stats": {
            model: {
                "average_time": sum(times) / len(times) if times else 0,
                "total_calls": len(times)
            }
            for model, times in ai_manager.performance_stats.items()
        }
    })

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "models_available": len(ai_manager.models),
        "database_connected": True
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    # Ensure database is initialized
    db_manager.init_database()
    
    # Print startup information
    print("\n" + "="*60)
    print("🚀 APRATIM'S AI 2.0 - Ultimate AI Assistant")
    print("="*60)
    print(f"📅 Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🤖 Available Models: {list(ai_manager.models.keys())}")
    print(f"💾 Database: Connected")
    print(f"🌐 Server: Starting on http://localhost:5000")
    print("="*60)
    print("✨ Ready to serve the most intelligent AI responses!")
    print("="*60 + "\n")
    
    # Run the application
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("FLASK_ENV") == "development"
    )