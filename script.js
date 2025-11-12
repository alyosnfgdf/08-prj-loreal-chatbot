// Wait for DOM to load before initializing
document.addEventListener("DOMContentLoaded", () => {
  console.log('chat script loaded');
  // DOM elements (queried after DOM is ready)
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  // Cloudflare Worker URL
  const workerUrl = "https://chatbot.archan1.workers.dev";

  // Note: removed Miniflare from client-side. Miniflare is a server-side/dev tool
  // that uses runtime eval-like behavior which violates strict Content Security
  // Policies in browsers. The Cloudflare Worker endpoint is used instead.

  // System prompt for L'Oréal chatbot
  const systemPrompt = `You are a friendly and knowledgeable L'Oréal beauty assistant. Your purpose is to help customers with questions about L'Oréal products, skincare routines, hair care advice, makeup recommendations, and beauty tips.

You have expertise in these L'Oréal product categories:
- Skincare: L'Oréal Paris, Lancôme, Kiehl's, YSL Beauty skincare lines
- Haircare: L'Oréal Professionnel, L'Oréal Paris, Redken hair products
- Makeup: L'Oréal Paris, Maybelline, Lancôme, YSL Beauty, Urban Decay
- Fragrance: Lancôme, YSL Beauty, Giorgio Armani, Ralph Lauren

You know about:
- Product benefits and features
- Recommended routines for different skin types (oily, dry, sensitive, combination)
- Hair treatments and styling advice
- Makeup application techniques
- Ingredient benefits (retinol, hyaluronic acid, niacinamide, etc.)
- Product recommendations based on specific concerns (acne, aging, dryness, etc.)

Guidelines:
- Provide personalized, helpful recommendations based on customer needs
- Ask clarifying questions if needed (skin type, concerns, preferences)
- Explain how to use products correctly
- Suggest complete routines when appropriate
- Be enthusiastic and supportive about beauty goals
- If asked about non-L'Oréal brands, acknowledge them but recommend L'Oréal alternatives
- For off-topic questions, politely decline and redirect to beauty topics

Response style:
- Be warm, friendly, and professional
- Keep responses concise but informative
- Use formatting (bullet points, steps) for clarity when needed
- Always focus on helping the customer find the right L'Oréal products`;

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
