// Test Groq API keys provided via environment variables (no secrets in repo).
const Groq = require('groq-sdk');
const Store = require('electron-store');

const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// Accept comma, semicolon, or newline separated keys from GROQ_API_KEYS
const rawKeys = process.env.GROQ_API_KEYS || '';
const keys = rawKeys
  .split(/[\s,;]+/)
  .map((k) => k.trim())
  .filter(Boolean);

if (keys.length === 0) {
  console.error('Provide keys via GROQ_API_KEYS env var (comma or newline separated).');
  process.exit(1);
}

async function testKey(key, index) {
  try {
    const groq = new Groq({ apiKey: key });
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "OK"' }],
      model,
      max_tokens: 10
    });
    console.log(`OK: key #${index + 1} looks valid`);
    return true;
  } catch (error) {
    const code = error.status || 'error';
    const detail = error?.message || error?.response?.data?.error?.message || '';
    console.log(`FAIL: key #${index + 1} invalid (${code})${detail ? ` - ${detail}` : ''}`);
    return false;
  }
}

async function findValidKey() {
  console.log(`Testing Groq API keys from GROQ_API_KEYS (model: ${model})...\n`);

  for (const [index, key] of keys.entries()) {
    const isValid = await testKey(key, index);
    if (isValid) {
      const store = new Store();
      store.set('groq_api_key', key);

      console.log(`\nStored key #${index + 1} in electron-store.`);
      console.log(`Key prefix: ${key.substring(0, 15)}...`);
      console.log('Restart the desktop app to use this key.\n');
      return;
    }
  }

  console.log('\nNo valid keys found. Please check the provided values.');
  process.exit(1);
}

findValidKey();
