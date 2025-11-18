import React, { useState, useEffect, useRef } from "react";
import { ChatApi } from "../../api/chatbotApi"; // Your API logic
import { theme } from "../../theme/theme";

// Helper: generate unique session ID
const generateSessionId = () => Math.random().toString(36).substring(2, 12);

const Chatbot = ({ }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || "guest";

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // ✅ Keys unique per user
  const sessionKey = `chat_session_id_${userId}`;
  const messagesKey = `chat_messages_${userId}`;

  // ✅ Use a guard so init only runs once
  const initializedRef = useRef(false);
  // ✅ Load chat history and session
  useEffect(() => {
    // prevent re-initialization on re-render
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log("🔹 Initializing chat for user:", userId);

    const storedSessionId = localStorage.getItem(sessionKey);
    const storedMessages = localStorage.getItem(messagesKey);
    console.log("🔹 Retrieved from storage:",storedSessionId); 
    if (storedSessionId) {
      // Found existing session
      console.log("✅ Restoring existing session:", storedSessionId);
      setSessionId(storedSessionId);

      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        setMessages(parsed);
        console.log("✅ Restored messages:", parsed);
      } else {
        const initMsg = [{ from: "bot", text: "Hi! How can I help you today?" }];
        setMessages(initMsg);
        localStorage.setItem(messagesKey, JSON.stringify(initMsg));
      }
    } else {
      // Create new session (first ever)
      const newSessionId = generateSessionId();
      console.log("🆕 Creating new session:", newSessionId);
      setSessionId(newSessionId);
      localStorage.setItem(sessionKey, newSessionId);

      const initMsg = [{ from: "bot", text: "Hi! How can I help you today?" }];
      setMessages(initMsg);
      localStorage.setItem(messagesKey, JSON.stringify(initMsg));
    }
  }, [userId, sessionKey, messagesKey]);

  // ✅ Save messages whenever they change
  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(sessionKey, sessionId);
    localStorage.setItem(messagesKey, JSON.stringify(messages));
    console.log("💾 Saved session + messages:", { sessionId, messages });
  }, [messages, sessionId, sessionKey, messagesKey]);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setShowScrollButton(!nearBottom);
  };

  // ✅ Send message + persist
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Scroll down when user sends
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const response = await ChatApi.sendMessage(input, sessionId);
      const botMessage = {
        from: "bot",
        text: response?.answer || "Sorry, I couldn’t understand that.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ There was an error connecting to the AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  // ✅ Reset chat
  const resetChat = () => {
    const newSessionId = generateSessionId();
    const initialMsg = [{ from: "bot", text: "Hi! How can I help you today?" }];
    setSessionId(newSessionId);
    setMessages(initialMsg);
    localStorage.setItem(sessionKey, newSessionId);
    localStorage.setItem(messagesKey, JSON.stringify(initialMsg));
  };

  // ✅ UI (your exact version)
  return (
    <>
      {/* Floating Chat Icon */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: theme.colors.primary,
          color: "white",
          fontSize: "28px",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 2000,
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "320px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 2001,
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: theme.colors.primary,
              color: "white",
              padding: "12px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Ask your HR Assistant
            <div>
              <button
                onClick={resetChat}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
                title="Start a new chat"
              >
                🔄
              </button>
              <button
                onClick={toggleChat}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.from === "user" ? "#007bff" : "#f1f1f1",
                  color: msg.from === "user" ? "white" : "black",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f1f1f1",
                  color: "black",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  fontStyle: "italic",
                }}
              >
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              style={{
                position: "absolute",
                bottom: "60px",
                right: "30px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
              title="Scroll to bottom"
            >
              ↓
            </button>
          )}

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              padding: "8px",
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                marginRight: "8px",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
