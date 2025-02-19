import { useState, useEffect } from "react";

const Chat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
  
    socket.onopen = () => console.log("✅ Connected to WebSocket");
    socket.onmessage = (event) => setMessages((prev) => [...prev, event.data]);
    socket.onclose = () => console.log("❌ WebSocket closed");
    socket.onerror = (error) => console.error("⚠️ WebSocket error:", error);
  
    setWs(socket);
  
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input.trim()) {
      ws.send(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 border rounded-lg shadow-lg">
      <div className="h-64 overflow-y-auto border-b p-2 mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-1 border-b">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
