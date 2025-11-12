/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker URL
const workerUrl = "https://lorealchatbot.archan1.workers.dev";

const mf = new Miniflare({
  bindings: {
    KEY1: "APIkey",
    KEY2: "value2",
  },
});

// Store conversation history
let conversationHistory = [];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to history
  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  // Display user message
  chatWindow.innerHTML += `\n\nUser: ${userMessage}`;
  userInput.value = "";
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Call Cloudflare Worker which proxies to OpenAI
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    // Handle response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract AI message from OpenAI response
    const aiMessage = data.choices[0].message.content;

    // Add AI message to history
    conversationHistory.push({
      role: "assistant",
      content: aiMessage
    });

    // Display AI message
    chatWindow.innerHTML += `\n\nAssistant: ${aiMessage}`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

  } catch (error) {
    // Show error message
    chatWindow.innerHTML += `\n\nError: ${error.message}`;
    console.error("Error:", error);
  }
});
