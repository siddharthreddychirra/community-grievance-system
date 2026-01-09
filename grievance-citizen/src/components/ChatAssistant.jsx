import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Mic, MicOff, Languages, Lightbulb, Loader2, Search } from "lucide-react";
import api from "../api";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "👋 Hello! I'm your intelligent GrievanceHub assistant. I can help you file complaints, check status, and answer questions in English, Hindi, or Telugu. How can I help you today?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Add bot message helper
  const addBotMessage = (text, data = {}) => {
    const botMessage = {
      type: "bot",
      text: text,
      time: new Date(),
      ...data
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  // Add user message helper
  const addUserMessage = (text) => {
    const userMessage = {
      type: "user",
      text: text,
      time: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on selection
      const langCodes = { en: "en-US", hi: "hi-IN", te: "te-IN" };
      recognitionRef.current.lang = langCodes[language] || "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        addBotMessage("Sorry, I couldn't hear that clearly. Please try again or type your message.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addBotMessage("Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Get AI response from backend
  const getAIResponse = async (userInput) => {
    try {
      setIsLoading(true);
      
      const conversationHistory = messages
        .slice(-6)
        .map(msg => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text
        }));

      const response = await api.post("/chatbot/chat", {
        message: userInput,
        conversationHistory: conversationHistory,
        language: language
      });

      setIsLoading(false);
      return response.data;
    } catch (error) {
      console.error("AI response error:", error);
      setIsLoading(false);
      return {
        response: getFallbackResponse(userInput),
        isAI: false
      };
    }
  };

  // Find similar complaints
  const findSimilarComplaints = async (description) => {
    try {
      const response = await api.post("/chatbot/similar-complaints", {
        description: description,
        limit: 3
      });

      if (response.data.similar && response.data.similar.length > 0) {
        const similarText = `I found ${response.data.similar.length} similar complaint(s) in your area:\n\n` +
          response.data.similar.map((c, idx) => 
            `${idx + 1}. ${c.title}\n   📂 ${c.department}\n   ⏱️ ${c.resolutionTime ? `Resolved in ${c.resolutionTime} days` : 'Pending'}`
          ).join("\n\n");
        
        return similarText;
      } else {
        return "No similar complaints found. Your issue appears to be unique in your area.";
      }
    } catch (error) {
      console.error("Similar complaints error:", error);
      return "I couldn't check for similar complaints at the moment.";
    }
  };

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    const langNames = { en: "English", hi: "हिंदी (Hindi)", te: "తెలుగు (Telugu)" };
    addBotMessage(`Language changed to ${langNames[lang]}. I can now understand and respond in this language!`);
    
    // Update speech recognition language
    if (recognitionRef.current) {
      const langCodes = { en: "en-US", hi: "hi-IN", te: "te-IN" };
      recognitionRef.current.lang = langCodes[lang] || "en-US";
    }
    
    setShowLanguageMenu(false);
  };

  // Fallback responses when AI is not available
  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();

    const responses = {
      greeting: "Hello! I'm here to help you with your complaints. How can I assist you today?",
      complaint: "To file a complaint:\n1. Describe your issue\n2. I'll help you with department and priority\n3. Add photos/videos if possible\n4. We'll check for similar cases\n5. Submit your complaint\n\nShall we start?",
      status: "To check complaint status, go to 'My Complaints' on your dashboard. You'll see real-time updates with staff remarks.",
      department: "We handle:\n🛣️ Roads & Transport\n💧 Water Supply\n⚡ Electricity\n🗑️ Sanitation\n🏛️ Municipal Services\n\nWhich one do you need?",
      help: "I can help you:\n✅ File new complaints (with guidance)\n✅ Check complaint status\n✅ Find similar issues in your area\n✅ Answer questions in Hindi/Telugu\n✅ Voice input support\n\nWhat would you like to do?",
      voice: "🎤 Click the microphone button to use voice input. Speak clearly in English, Hindi, or Telugu.",
      similar: "I can search for similar complaints in your area. Just describe your issue and I'll check!",
      thanks: "You're welcome! Feel free to ask if you have more questions. 😊"
    };

    if (input.match(/hello|hi|hey|namaste|नमस्ते|నమస్కారం/)) return responses.greeting;
    if (input.match(/complain|issue|problem|file|raise|शिकायत|ఫిర్యాదు/)) return responses.complaint;
    if (input.match(/status|track|check|where|update|स्थिति/)) return responses.status;
    if (input.match(/department|category|type|विभाग|విభాగం/)) return responses.department;
    if (input.match(/help|assist|guide|मदद|సహాయం/)) return responses.help;
    if (input.match(/voice|speak|mic|आवाज|వాయిస్/)) return responses.voice;
    if (input.match(/similar|same|duplicate|other/)) return responses.similar;
    if (input.match(/thank|thanks|धन्यवाद|ధన్యవాదాలు/)) return responses.thanks;

    return "I can help with:\n• Filing complaints (guided process)\n• Checking status\n• Finding similar issues\n• Voice input\n• Multilingual support\n\nWhat would you like to do?";
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    addUserMessage(input);
    const userInput = input;
    setInput("");

    // Check if user wants to find similar complaints
    if (userInput.toLowerCase().includes("similar") || userInput.toLowerCase().includes("same issue")) {
      const similarResponse = await findSimilarComplaints(userInput);
      addBotMessage(similarResponse);
      return;
    }

    // Get AI response
    const aiResponse = await getAIResponse(userInput);
    addBotMessage(aiResponse.response, { isAI: aiResponse.isAI });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-50 animate-pulse"
          title="Open AI Assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online - Voice & Multilingual
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Change Language"
                >
                  <Languages size={20} />
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 top-12 bg-white text-gray-800 rounded-lg shadow-xl p-2 w-40 z-50">
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${language === "en" ? "bg-blue-100 font-semibold" : ""}`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => changeLanguage("hi")}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${language === "hi" ? "bg-blue-100 font-semibold" : ""}`}
                    >
                      🇮🇳 हिंदी
                    </button>
                    <button
                      onClick={() => changeLanguage("te")}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 ${language === "te" ? "bg-blue-100 font-semibold" : ""}`}
                    >
                      🇮🇳 తెలుగు
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                const msg = "Help me file a complaint";
                addUserMessage(msg);
                setInput("");
                getAIResponse(msg).then(res => addBotMessage(res.response, { isAI: res.isAI }));
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap shadow-sm"
            >
              <Lightbulb size={14} />
              File Complaint
            </button>
            <button
              onClick={() => {
                const msg = "Check complaint status";
                addUserMessage(msg);
                setInput("");
                getAIResponse(msg).then(res => addBotMessage(res.response, { isAI: res.isAI }));
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap shadow-sm"
            >
              <Search size={14} />
              Check Status
            </button>
            <button
              onClick={() => {
                const msg = "Find similar complaints in my area";
                addUserMessage(msg);
                setInput("");
                findSimilarComplaints(msg).then(res => addBotMessage(res));
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap shadow-sm"
            >
              <Search size={14} />
              Similar Issues
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md"
                      : "bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-100"
                  }`}
                >
                  {msg.type === "bot" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={14} className="text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                      {msg.isAI && <span className="text-xs text-blue-400">✨ AI</span>}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } p-2 rounded-lg transition-all`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={20} className="text-white" /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak your message..."}
                disabled={isListening}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              🎤 Voice | 🌐 Multi-language | ✨ AI-Powered
            </p>
          </div>
        </div>
      )}
    </>
  );
}
