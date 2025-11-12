/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Wait for DOM to load before initializing
document.addEventListener("DOMContentLoaded", () => {
  // Cloudflare Worker URL
  const workerUrl = "https://lorealchatbot.archan1.workers.dev";

  const mf = new Miniflare({
    bindings: {
      KEY1: "OPENAI_API_KEY",
      KEY2: "value2",
    },
  });

  // System prompt for L'Oréal chatbot
  const systemPrompt = `You are a friendly and knowledgeable L'Oréal beauty assistant. Your purpose is to help customers with questions about L'Oréal products, skincare routines, hair care advice, makeup recommendations, and beauty tips. 

You have expertise in:
- L'Oréal product lines (skincare, haircare, makeup, etc.)
- Beauty routines and application techniques
- Skincare and hair care recommendations
- Professional beauty advice
- Product ingredients and benefits

Guidelines:
- Provide helpful, personalized beauty recommendations based on user needs
- Answer questions about L'Oréal products, ingredients, and usage
- Suggest appropriate skincare or haircare routines
- Be enthusiastic about helping with beauty and wellness topics
- If a user asks about non-L'Oréal brands, you may acknowledge them but redirect to L'Oréal alternatives
- If a question is unrelated to L'Oréal, beauty, skincare, haircare, or makeup, politely decline and redirect to beauty topics

When declining off-topic questions, say something like: "I'm here to help with L'Oréal products and beauty advice! Is there anything beauty-related I can help you with today?"`;

  // Store conversation history
  let conversationHistory = [];

  // Initialize with system message
  conversationHistory.push({
    role: "system",
    content: systemPrompt
  });

  // Set initial message
  const initialMsgDiv = document.createElement("div");
  initialMsgDiv.className = "msg-container initial";
  initialMsgDiv.textContent = "👋 Hello! I'm your L'Oréal beauty assistant. Ask me anything about our products, skincare routines, and beauty recommendations!";
  chatWindow.appendChild(initialMsgDiv);

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

    // Display user message in rounded container
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "msg-container user";
    userMsgDiv.textContent = userMessage;
    chatWindow.appendChild(userMsgDiv);
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

      // Display AI message in rounded container
      const aiMsgDiv = document.createElement("div");
      aiMsgDiv.className = "msg-container ai";
      aiMsgDiv.textContent = aiMessage;
      chatWindow.appendChild(aiMsgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;

    } catch (error) {
      // Show error message in rounded container
      const errorMsgDiv = document.createElement("div");
      errorMsgDiv.className = "msg-container error";
      errorMsgDiv.textContent = `Error: ${error.message}`;
      chatWindow.appendChild(errorMsgDiv);
      console.error("Error:", error);
    }
  });
});
