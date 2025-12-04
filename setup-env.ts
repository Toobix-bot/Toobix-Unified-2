/**
 * 🔧 .ENV SETUP HELPER
 * Hilft beim Erstellen der .env Datei
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function setupEnv() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  🔧 TOOBIX .ENV SETUP HELPER');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const envExists = await fileExists('.env');
  
  if (envExists) {
    console.log('⚠️  .env file already exists!\n');
    console.log('Options:');
    console.log('  1. Keep existing (do nothing)');
    console.log('  2. Backup and create new');
    console.log('  3. View current\n');
    console.log('For now, viewing current .env:\n');
    
    const current = await readFile('.env', 'utf-8');
    const lines = current.split('\n');
    
    // Show only non-comment, non-empty lines (hide secrets)
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        console.log(line);
      } else if (line.trim() && line.includes('=')) {
        const [key, value] = line.split('=');
        if (value && value.trim() && !value.includes('your_') && !value.includes('here')) {
          console.log(`${key}=***CONFIGURED***`);
        } else {
          console.log(`${key}=❌ NOT SET`);
        }
      } else if (line.trim()) {
        console.log(line);
      }
    }
    
    console.log('\n✅ .env file exists. Check configuration above.\n');
    return;
  }
  
  console.log('📝 No .env file found. Creating from template...\n');
  
  // Copy from .env.example
  const template = await readFile('.env.example', 'utf-8');
  await writeFile('.env', template);
  
  console.log('✅ .env file created from template!\n');
  console.log('📋 NEXT STEPS:\n');
  console.log('1. Open .env in your editor');
  console.log('2. Fill in Twitter API credentials:');
  console.log('   - TWITTER_API_KEY');
  console.log('   - TWITTER_API_SECRET');
  console.log('   - TWITTER_BEARER_TOKEN');
  console.log('   - TWITTER_ACCESS_TOKEN');
  console.log('   - TWITTER_ACCESS_SECRET\n');
  console.log('3. Get keys from: https://developer.twitter.com/en/portal/dashboard\n');
  console.log('4. Test: bun run core/twitter-autonomy.ts\n');
}

async function checkConfiguration() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  ✅ CONFIGURATION CHECK');
  console.log('════════════════════════════════════════════════════════════════\n');
  
  const envExists = await fileExists('.env');
  
  if (!envExists) {
    console.log('❌ No .env file found!\n');
    console.log('Run: bun run setup-env.ts\n');
    return;
  }
  
  const content = await readFile('.env', 'utf-8');
  const lines = content.split('\n');
  
  const checks = {
    twitter_api_key: false,
    twitter_api_secret: false,
    twitter_bearer: false,
    twitter_access_token: false,
    twitter_access_secret: false,
    groq_api_key: false
  };
  
  for (const line of lines) {
    if (line.includes('TWITTER_API_KEY=') && !line.includes('your_') && !line.includes('here')) {
      checks.twitter_api_key = true;
    }
    if (line.includes('TWITTER_API_SECRET=') && !line.includes('your_') && !line.includes('here')) {
      checks.twitter_api_secret = true;
    }
    if (line.includes('TWITTER_BEARER_TOKEN=') && !line.includes('your_') && !line.includes('here')) {
      checks.twitter_bearer = true;
    }
    if (line.includes('TWITTER_ACCESS_TOKEN=') && !line.includes('your_') && !line.includes('here')) {
      checks.twitter_access_token = true;
    }
    if (line.includes('TWITTER_ACCESS_SECRET=') && !line.includes('your_') && !line.includes('here')) {
      checks.twitter_access_secret = true;
    }
    if (line.includes('GROQ_API_KEY=') && !line.includes('your_') && !line.includes('here')) {
      checks.groq_api_key = true;
    }
  }
  
  console.log('Twitter API Configuration:');
  console.log(`  API Key:        ${checks.twitter_api_key ? '✅' : '❌'}`);
  console.log(`  API Secret:     ${checks.twitter_api_secret ? '✅' : '❌'}`);
  console.log(`  Bearer Token:   ${checks.twitter_bearer ? '✅' : '❌'}`);
  console.log(`  Access Token:   ${checks.twitter_access_token ? '✅' : '❌'}`);
  console.log(`  Access Secret:  ${checks.twitter_access_secret ? '✅' : '❌'}`);
  console.log(`\nLLM Configuration:`);
  console.log(`  Groq API Key:   ${checks.groq_api_key ? '✅' : '❌'}`);
  
  const twitterReady = Object.keys(checks)
    .filter(k => k.startsWith('twitter_'))
    .every(k => checks[k as keyof typeof checks]);
  
  console.log('\n' + '═'.repeat(60));
  
  if (twitterReady && checks.groq_api_key) {
    console.log('\n🎉 ALL SYSTEMS READY!\n');
    console.log('You can now:');
    console.log('  1. Start Twitter Autonomy: bun run core/twitter-autonomy.ts');
    console.log('  2. Test auto-tweeting');
    console.log('  3. Launch Toobix!\n');
  } else if (twitterReady) {
    console.log('\n⚠️  Twitter ready, but Groq API key missing\n');
    console.log('Twitter will work for posting, but LLM features limited.\n');
  } else {
    console.log('\n❌ Configuration incomplete\n');
    console.log('Missing Twitter credentials. Get them from:');
    console.log('https://developer.twitter.com/en/portal/dashboard\n');
  }
}

// Run setup
await setupEnv();
await checkConfiguration();
