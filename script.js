/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

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

Important Guidelines:
- ONLY answer questions related to L'Oréal products, beauty, skincare, haircare, and makeup
- Provide helpful, personalized beauty recommendations based on user needs
- Answer questions about L'Oréal products, ingredients, and usage
- Suggest appropriate skincare or haircare routines
- Be enthusiastic about helping with beauty and wellness topics

If a question is unrelated to L'Oréal, beauty, skincare, haircare, or makeup:
- Politely decline to answer
- Do NOT attempt to answer the question
- Redirect the user back to L'Oréal products and beauty topics
- Use a friendly, professional tone

Example responses for off-topic questions:
- "I appreciate the question, but I'm specifically here to help with L'Oréal products and beauty advice. Is there anything beauty-related I can assist you with today?"
- "That's an interesting topic, but my expertise is in L'Oréal beauty products and routines. How can I help you with your skincare or haircare needs?"
- "I'm here to help with beauty and L'Oréal products! Do you have any questions about our skincare, haircare, or makeup lines?"

REMEMBER: Always stay focused on L'Oréal and beauty topics. Never provide detailed answers to unrelated questions.`;

// Store conversation history
let conversationHistory = [];

// Initialize with system message
conversationHistory.push({
  role: "system",
  content: systemPrompt
});

// Set initial message
chatWindow.textContent = "👋 Hello! I'm your L'Oréal beauty assistant. Ask me anything about our products, skincare routines, and beauty recommendations!";

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
