import Head from "next/head";
import { useState, useEffect } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState(""); // User input
  const [messages, setMessages] = useState([]); // Message history
  const [loading, setLoading] = useState(false); // Loading state
  const [displayedText, setDisplayedText] = useState(""); // Typing effect for AI response
  const [showIntro, setShowIntro] = useState(true); // Intro visibility
  const [introTypingText, setIntroTypingText] = useState(""); // Typing effect for intro messages
  const [currentIndex, setCurrentIndex] = useState(0); // Index for intro messages
  const [isDeleting, setIsDeleting] = useState(false); // Deleting state for intro messages

  const introMessages = [
    "Welcome to PawVetAI!",
    "Your trusted AI veterinarian.",
    "Ask me anything about your pet's health and care.",
    "Together, we ensure your pet's well-being.",
  ];

  useEffect(() => {
    if (!showIntro) return;

    let typingInterval;
    const typingSpeed = isDeleting ? 30 : 60; // Typing and deleting speed
    const pauseDuration = 1500;

    typingInterval = setInterval(() => {
      const currentMessage = introMessages[currentIndex];

      if (!isDeleting) {
        setIntroTypingText((prev) => {
          const nextText = currentMessage.slice(0, prev.length + 1);
          if (nextText === currentMessage) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
            clearInterval(typingInterval);
          }
          return nextText;
        });
      } else {
        setIntroTypingText((prev) => {
          const nextText = prev.slice(0, -1);
          if (nextText === "") {
            setIsDeleting(false);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % introMessages.length);
            clearInterval(typingInterval);
          }
          return nextText;
        });
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [currentIndex, isDeleting, showIntro]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.role === "assistant") {
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
          setDisplayedText((prev) => prev + latestMessage.content.charAt(i));
          i++;
          if (i >= latestMessage.content.length) clearInterval(interval);
        }, 20);
        return () => clearInterval(interval);
      }
    }
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert("Please enter a message!");
      return;
    }

    if (showIntro) setShowIntro(false);

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "An error occurred: " + errorData.error },
        ]);
        return;
      }

      const data = await response.json();
      const prediction = data.prediction || "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: prediction },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setUserInput(""); // Reset user input
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSubmit(); // Send the message
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-[#E2E8F0] flex flex-col lg:flex-row">
    <Head>
      <title>PawVetAI - Your AI Veterinarian</title>
      <meta
        name="description"
        content="PawVetAI is your trusted AI veterinarian. Ask questions about your pet's health and care!"
      />
    </Head>

      {/* Right Top Corner Icons */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
  <a
    href="https://x.com/PawVetAI"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center w-10 h-10"
  >
    <img
      src="/x.png"
      alt="Twitter Logo"
      className="w-full h-full object-contain"
    />
  </a>
  <a
    href="https://t.me/PawVetAIBot"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center w-10 h-10"
  >
    <img
      src="/telegram.png"
      alt="Telegram Logo"
      className="w-full h-full object-contain"
    />
  </a>
</div>

      {/* Left Side Title */}
      <div className="lg:w-1/3 w-full flex items-center justify-center p-4 lg:p-0">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-snug">
    <span className="text-[#0D1F44]">Welcome to</span> <br />
    <span className="text-[#000000]">PawVet</span>
    <span className="text-[#1852F1]">AI</span>
  </h1>
      </div>

      {/* Chat Window */}
      <div className="lg:w-2/3 w-full flex flex-col items-center justify-center font-mono px-4">
      


        {/* Chat Box */}
        <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg w-full max-w-4xl h-80 sm:h-96 flex flex-col">
        {showIntro ? (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#638AF6] text-center">
      {introTypingText}
    </div>
  </div>
          ) : (
            <div className="overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      msg.role === "user"
                        ? "bg-[#4FD1C5] text-[#1A202C]"
                        : "bg-[#E2E8F0] text-[#1A202C]"
                    } px-4 py-2 rounded-lg max-w-lg break-words`}
                  >
                    {msg.role === "assistant" && index === messages.length - 1 && !loading
                      ? displayedText
                      : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#2D3748] text-[#A0AEC0] px-4 py-2 rounded-lg max-w-lg break-words">
                    PawVetAI is typing...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form className="flex space-x-2 items-center mt-4 w-full max-w-4xl">
          <textarea
            placeholder="Type your pet-related question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown} // Enter key handling
            className="flex-1 p-2 bg-[#2D3748] text-[#E2E8F0] border border-[#4A5568] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
            rows={1}
          ></textarea>
          <button
            type="button"
            onClick={handleSubmit} // Handle send on button click
            className="flex items-center justify-center"
            disabled={loading}
          >
            <img
              src="/send.png"
              alt="Send"
              className="w-10 h-10 cursor-pointer"
            />
          </button>
        </form>
      </div>
    </div>
  );
}
