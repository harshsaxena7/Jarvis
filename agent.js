require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

// Placeholder for the agent
// In a real scenario, we would use a ToolAgent (createReactAgent or similar)
// For now, we will just use a simple chat model to interpret intents.

async function interpretGesture(gestureName) {
    console.log(`[Agent] Interpreting gesture: ${gestureName}`);
    
    // Check if API key is present
    if (!process.env.GOOGLE_API_KEY) {
        console.warn("[Agent] No GOOGLE_API_KEY found. Returning mock response.");
        return "I see you made a gesture, but I need a brain (API Key) to understand it. Please add GOOGLE_API_KEY to .env file.";
    }

    const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-1.5-flash",
        maxOutputTokens: 2048,
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const messages = [
        new SystemMessage("You are JARVIS, an intelligent assistant. The user is interacting with you via hand gestures. Interpret the intent based on the context."),
        new HumanMessage(`User performed gesture: ${gestureName}. What should I do?`)
    ];

    try {
        const response = await model.invoke(messages);
        return response.content;
    } catch (error) {
        console.error("Agent Error:", error);
        return "Sorry, I had trouble thinking.";
    }
}

module.exports = { interpretGesture };
