# 🔑 Groq API Setup Guide

## Why You Need a Groq API Key

The Groq API key is required for the following features:
- 💬 **Chat** - Talk to Toobix AI
- 🧠 **AI Training** - Train neural networks
- 🌟 **Life Coach** - Get personalized guidance across 7 life domains

## Getting Your FREE Groq API Key

1. **Visit Groq Console**: https://console.groq.com/keys
2. **Sign up** or **Log in** with your account
3. **Create a new API key**
4. **Copy the key** (starts with `gsk_...`)

## Setting Up Your API Key

### Option 1: Using the Desktop App (Recommended)

1. **Launch the Desktop App**
   ```batch
   .\launch-desktop-v2.bat
   ```

2. **Navigate to Settings**
   - Click on **⚙️ Settings** in the sidebar
   - Or press `Alt + 5` (if keyboard shortcuts are enabled)

3. **Enter Your API Key**
   - Paste your Groq API key into the input field
   - Click **💾 Save Settings**
   - You'll see a success notification

4. **Verify**
   - Go to **💬 Chat**
   - Try sending a message
   - If it works, your API key is configured correctly!

### Option 2: Using the Quick Script

Run the batch file:
```batch
.\set-key.bat
```

Then follow the prompts to enter your API key.

### Option 3: Using Node.js Directly

```batch
node set-groq-key-simple.js YOUR_API_KEY_HERE
```

## Testing Your Setup

### Test Chat
1. Go to **💬 Chat**
2. Type a message: "Hello! Can you introduce yourself?"
3. Press Enter or click Send
4. You should get a response from Toobix AI

### Test Life Coach
1. Go to **🌟 Life Coach**
2. Select a life domain (e.g., Career)
3. Ask a question: "How can I improve my productivity?"
4. You should get personalized guidance

### Test AI Training
1. Start the **Hybrid AI Core** service (Port 8915)
2. Go to **🧠 AI Training**
3. View AI state and configure training

## Troubleshooting

### Error: "Groq API not initialized"
**Solution**: Set your API key in Settings and restart the app

### Error: "Invalid API key"
**Solution**:
- Check that your key starts with `gsk_`
- Make sure you copied the entire key
- Generate a new key from console.groq.com

### Chat works but Life Coach doesn't
**Solution**:
- Make sure the Life-Domain Chat service is running (Port 8916)
- Start it from the Services view

### Features don't appear after setting key
**Solution**: Restart the Desktop App:
1. Close the app (Ctrl+C in terminal)
2. Run `.\launch-desktop-v2.bat` again

## API Key Best Practices

✅ **DO:**
- Keep your API key private
- Use environment variables in production
- Rotate keys periodically
- Monitor your usage at console.groq.com

❌ **DON'T:**
- Share your API key publicly
- Commit API keys to Git
- Use the same key for multiple projects
- Expose keys in client-side code

## Free Tier Limits

Groq offers a **generous free tier**:
- Fast inference speeds
- Access to Llama 3.3 70B model
- Reasonable request limits

Check current limits at: https://console.groq.com/docs/rate-limits

## Need Help?

- **Groq Documentation**: https://console.groq.com/docs
- **Toobix Desktop App Issues**: Check the logs in the app
- **Service Status**: Use the Dashboard to see which services are running

---

**🎉 Once configured, you'll have access to all AI-powered features!**
