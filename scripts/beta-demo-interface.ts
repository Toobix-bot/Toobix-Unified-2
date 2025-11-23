#!/usr/bin/env bun
/**
 * TOOBIX BETA DEMO INTERFACE
 * Simple web interface for beta testers
 */

const PORT = 3000;

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toobix Beta - Decision Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
            animation: fadeIn 1s ease-in;
        }

        h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .tagline {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: slideUp 0.6s ease-out;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .card h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.8em;
        }

        .card p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }

        textarea, input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            transition: border-color 0.3s ease;
        }

        textarea:focus, input:focus {
            outline: none;
            border-color: #667eea;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            width: 100%;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        button:active {
            transform: translateY(0);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .result {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            display: none;
            animation: fadeIn 0.5s ease-in;
        }

        .result.show {
            display: block;
        }

        .result h3 {
            color: #667eea;
            margin-bottom: 10px;
        }

        .status {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .status h3 {
            color: #667eea;
            margin-bottom: 15px;
        }

        .service-status {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }

        .status-dot.online {
            background: #4caf50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .status-dot.offline {
            background: #f44336;
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌟 Toobix Beta</h1>
            <p class="tagline">Conscious Decision Making powered by AI</p>
        </header>

        <div class="status">
            <h3>📊 System Status</h3>
            <div class="service-status">
                <div class="status-dot online"></div>
                <span>Multi-Perspective Engine (12 viewpoints)</span>
            </div>
            <div class="service-status">
                <div class="status-dot online"></div>
                <span>Decision Framework (Ethics & Impact)</span>
            </div>
            <div class="service-status">
                <div class="status-dot online"></div>
                <span>Emotional Resonance (EQ Analysis)</span>
            </div>
            <div class="service-status">
                <div class="status-dot online"></div>
                <span>Dream Journal (Subconscious Insights)</span>
            </div>
        </div>

        <div class="cards">
            <!-- Decision Assistant Card -->
            <div class="card">
                <h2>🎯 Decision Assistant</h2>
                <p>Get multi-perspective analysis for your important decisions</p>

                <div class="input-group">
                    <label for="decision">What decision are you facing?</label>
                    <textarea id="decision" placeholder="e.g., Should I change careers? Should I move to a new city?"></textarea>
                </div>

                <button onclick="analyzeDecision()">Analyze Decision</button>

                <div class="result" id="decisionResult">
                    <h3>Analysis Results:</h3>
                    <div id="decisionContent"></div>
                </div>
            </div>

            <!-- Emotional Check-in Card -->
            <div class="card">
                <h2>💖 Emotional Check-in</h2>
                <p>Track and understand your emotional patterns</p>

                <div class="input-group">
                    <label for="emotion">How are you feeling right now?</label>
                    <input type="text" id="emotion" placeholder="e.g., anxious, excited, peaceful">
                </div>

                <div class="input-group">
                    <label for="emotionContext">What's happening?</label>
                    <textarea id="emotionContext" placeholder="Optional: Share context about your emotional state"></textarea>
                </div>

                <button onclick="checkEmotion()">Check Emotion</button>

                <div class="result" id="emotionResult">
                    <h3>Emotional Insights:</h3>
                    <div id="emotionContent"></div>
                </div>
            </div>

            <!-- Dream Journal Card -->
            <div class="card">
                <h2>🌙 Dream Journal</h2>
                <p>Explore your subconscious through dream interpretation</p>

                <div class="input-group">
                    <label for="dreamTheme">Dream theme or question:</label>
                    <input type="text" id="dreamTheme" placeholder="e.g., my future, relationships, creativity">
                </div>

                <button onclick="generateDream()">Generate Dream</button>

                <div class="result" id="dreamResult">
                    <h3>Dream Exploration:</h3>
                    <div id="dreamContent"></div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Toobix Beta v0.1 | Made with consciousness by humans and AI</p>
            <p>Your feedback shapes the future of conscious technology</p>
        </div>
    </div>

    <script>
        async function analyzeDecision() {
            const decision = document.getElementById('decision').value;
            if (!decision.trim()) {
                alert('Please enter a decision to analyze');
                return;
            }

            const button = event.target;
            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Analyzing...';

            try {
                // Get multi-perspective analysis
                const perspectives = await fetch('http://localhost:8897/wisdom/' + encodeURIComponent(decision));
                const perspData = await perspectives.json();

                // Get decision framework analysis
                const decisionAnalysis = await fetch('http://localhost:8909/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decision })
                });
                const decData = await decisionAnalysis.json();

                // Display results
                const resultDiv = document.getElementById('decisionResult');
                const contentDiv = document.getElementById('decisionContent');

                contentDiv.innerHTML = \`
                    <h4>🧠 Wisdom Synthesis:</h4>
                    <p>\${perspData.synthesis || 'Analysis complete'}</p>

                    <h4>📊 Impact Scores:</h4>
                    <ul>
                        <li><strong>Ethical Impact:</strong> \${decData.ethicalScore || 'N/A'}/100</li>
                        <li><strong>Human Impact:</strong> \${decData.humanImpact || 'N/A'}/100</li>
                        <li><strong>Nature Impact:</strong> \${decData.natureImpact || 'N/A'}/100</li>
                    </ul>

                    <h4>💡 Recommendation:</h4>
                    <p>\${decData.recommendation || 'Consider all perspectives carefully'}</p>
                \`;

                resultDiv.classList.add('show');
            } catch (error) {
                alert('Error analyzing decision. Please make sure all services are running.');
                console.error(error);
            } finally {
                button.disabled = false;
                button.textContent = 'Analyze Decision';
            }
        }

        async function checkEmotion() {
            const emotion = document.getElementById('emotion').value;
            const context = document.getElementById('emotionContext').value;

            if (!emotion.trim()) {
                alert('Please describe your emotion');
                return;
            }

            const button = event.target;
            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Processing...';

            try {
                const response = await fetch('http://localhost:8900/check-in', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emotion, context })
                });
                const data = await response.json();

                const resultDiv = document.getElementById('emotionResult');
                const contentDiv = document.getElementById('emotionContent');

                contentDiv.innerHTML = \`
                    <h4>Your Emotional State:</h4>
                    <p><strong>Primary Emotion:</strong> \${data.emotion || emotion}</p>
                    <p><strong>Intensity:</strong> \${data.intensity || 'Medium'}</p>

                    <h4>💡 Insights:</h4>
                    <p>\${data.insight || 'Emotions are valid. Take time to process them.'}</p>

                    <h4>🎯 Suggested Actions:</h4>
                    <ul>
                        <li>\${data.suggestion1 || 'Practice mindful breathing'}</li>
                        <li>\${data.suggestion2 || 'Journal about your feelings'}</li>
                        <li>\${data.suggestion3 || 'Talk to someone you trust'}</li>
                    </ul>
                \`;

                resultDiv.classList.add('show');
            } catch (error) {
                alert('Error processing emotion. Please make sure Emotional Resonance service is running.');
                console.error(error);
            } finally {
                button.disabled = false;
                button.textContent = 'Check Emotion';
            }
        }

        async function generateDream() {
            const theme = document.getElementById('dreamTheme').value;
            if (!theme.trim()) {
                alert('Please enter a dream theme');
                return;
            }

            const button = event.target;
            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Dreaming...';

            try {
                const response = await fetch('http://localhost:8899/dream', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ theme })
                });
                const data = await response.json();

                const resultDiv = document.getElementById('dreamResult');
                const contentDiv = document.getElementById('dreamContent');

                contentDiv.innerHTML = \`
                    <h4>🌙 Your Dream:</h4>
                    <p style="font-style: italic;">\${data.narrative || 'A dream unfolds...'}</p>

                    <h4>🔮 Interpretation:</h4>
                    <p>\${data.interpretation || 'Dreams reflect our subconscious processing.'}</p>

                    <h4>✨ Symbols:</h4>
                    <p>\${data.symbols ? data.symbols.join(', ') : 'Light, Water, Path'}</p>
                \`;

                resultDiv.classList.add('show');
            } catch (error) {
                alert('Error generating dream. Please make sure Dream Journal service is running.');
                console.error(error);
            } finally {
                button.disabled = false;
                button.textContent = 'Generate Dream';
            }
        }

        // Auto-check service status on load
        window.addEventListener('load', async () => {
            console.log('Toobix Beta Interface loaded');

            // Check services
            const services = [
                { url: 'http://localhost:8897', name: 'Multi-Perspective' },
                { url: 'http://localhost:8909', name: 'Decision Framework' },
                { url: 'http://localhost:8900', name: 'Emotional Resonance' },
                { url: 'http://localhost:8899', name: 'Dream Journal' }
            ];

            for (const service of services) {
                try {
                    await fetch(service.url, { method: 'HEAD' });
                    console.log(\`✅ \${service.name} is online\`);
                } catch {
                    console.warn(\`⚠️ \${service.name} may be offline\`);
                }
            }
        });
    </script>
</body>
</html>
`;

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🌟 TOOBIX BETA DEMO INTERFACE                        ║
║                                                            ║
║     Running at: http://localhost:${PORT}                    ║
║                                                            ║
║     Features:                                              ║
║       • Decision Assistant                                 ║
║       • Emotional Check-in                                 ║
║       • Dream Journal                                      ║
║                                                            ║
║     Status: READY FOR BETA TESTING                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
