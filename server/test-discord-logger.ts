import { logToDiscord } from './discord-logger';

async function testLogger() {
  console.log('Starting Discord logger test...');
  
  try {
    // Test a simple INFO message
    console.log('Testing INFO message...');
    await logToDiscord({
      type: 'INFO',
      message: 'Test INFO message from the Discord Token Checker app',
      data: {
        testField: 'testValue',
        timestamp: new Date().toISOString()
      }
    });
    
    // Test an ERROR message
    console.log('Testing ERROR message...');
    await logToDiscord({
      type: 'ERROR',
      message: 'Test ERROR message from the Discord Token Checker app',
      data: {
        error: 'Test error',
        stack: 'Fake stack trace for testing'
      }
    });
    
    console.log('Tests completed.');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testLogger();