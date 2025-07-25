/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// System prompt to guide the chatbot
const SYSTEM_PROMPT = {
  role: "system",
  content:
    "You are a helpful assistant specializing in L’Oréal products, routines, recommendations, and beauty-related topics. If a user asks a question unrelated to these topics, politely refuse to answer and guide them back to relevant topics.",
};

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display user message in the chat window
  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;
  userInput.value = ""; // Clear input field

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;

  // Log API key and request payload for debugging
  console.log("API Key:", OPENAI_API_KEY); // This should log the API key if secrets.js is loaded correctly.
  console.log("Request Payload:", {
    model: "gpt-4o",
    messages: [SYSTEM_PROMPT, { role: "user", content: userMessage }],
  });

  // Call OpenAI API
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use the gpt-4o model
        messages: [SYSTEM_PROMPT, { role: "user", content: userMessage }],
      }),
    });

    console.log("Response Status:", response.status);

    if (response.status === 429) {
      // Handle rate limit error
      chatWindow.innerHTML += `<div class="msg ai">Too many requests. Please wait a moment and try again.</div>`;
      return;
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      // Handle unexpected API response
      chatWindow.innerHTML += `<div class="msg ai">Sorry, I couldn't process your request. Please try again later.</div>`;
      return;
    }

    const aiMessage = data.choices[0].message.content;

    // Display AI response
    chatWindow.innerHTML += `<div class="msg ai">${aiMessage}</div>`;
  } catch (error) {
    console.error("Error:", error);
    chatWindow.innerHTML += `<div class="msg ai">Sorry, something went wrong. Please try again.</div>`;
  }

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
