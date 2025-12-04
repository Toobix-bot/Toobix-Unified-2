/**
 * Test Unified Services
 */

async function testService(name: string, url: string) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✓ ${name}:`);
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    return true;
  } catch (error) {
    console.log(`✗ ${name}: ${error}`);
    return false;
  }
}

console.log('========================================');
console.log('  TESTING UNIFIED CORE SERVICE');
console.log('========================================\n');

await testService('Health Check', 'http://localhost:8000/health');
await testService('Service Info', 'http://localhost:8000/');
await testService('Emotions', 'http://localhost:8000/api/emotions/current');
await testService('Dreams', 'http://localhost:8000/api/dreams/analyze');
await testService('Awareness', 'http://localhost:8000/api/awareness/state');
await testService('Hardware', 'http://localhost:8000/api/hardware/stats');

console.log('========================================');
console.log('All tests completed!');
console.log('========================================');
