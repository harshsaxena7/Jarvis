# JARVIS - Gesture-Controlled Intelligent Assistant

JARVIS is an Electron-based application that combines Computer Vision (MediaPipe) and Generative AI (Google Gemini) to create a gesture-controlled intelligent assistant. It allows users to control their system and interact with an AI agent using hand gestures.

## 🚀 Features

- **Hand Gesture Tracking**: Uses MediaPipe Hands for real-time hand landmark detection via webcam.
- **AI Interpretation**: Leverages Google Gemini (via LangChain) to interpret gesture intents.
- **System Control**: A Python-based bridge using `pyautogui` for mouse movement and click actions.
- **Modern UI**: Built with Electron, HTML5, and JavaScript.

## 🛠️ Project Structure

- `main.js`: Main Electron process handling window management and IPC communication.
- `agent.js`: LangChain implementation for Google Gemini integration.
- `renderer.js`: UI logic and MediaPipe hand tracking integration.
- `bridge.py`: Python script for OS-level automation (mouse control).
- `index.html`: Main application interface.

## 📋 Prerequisites

- **Node.js**: v18 or later recommended.
- **Python**: 3.x with `pyautogui`.
- **Google AI API Key**: Required for the Gemini brain.

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd Jarvis
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
pip install pyautogui
```

### 4. Configuration
Create a `.env` file in the root directory and add your Google API key:
```env
GOOGLE_API_KEY=your_api_key_here
```

## 🏃 Running the Application

### Start the Python Bridge
In a separate terminal:
```bash
python bridge.py
```

### Start the Electron App
In another terminal:
```bash
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the ISC License.
