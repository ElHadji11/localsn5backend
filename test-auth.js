import { createTestUserToken } from './utils/test-auth.js';

// Simple test script to create a test user and get a token
console.log('Creating test user for Postman testing...\n');

createTestUserToken()
    .then((result) => {
        console.log('\n✅ Test user created successfully!');
        console.log('\n📋 Copy this token to use in Postman:');
        console.log('='.repeat(50));
        console.log(`Bearer ${result.sessionToken}`);
        console.log('='.repeat(50));
        console.log('\n🔗 Test these endpoints in Postman:');
        console.log('1. Public route: GET http://localhost:5000/api/test/public');
        console.log('2. Protected route: GET http://localhost:5000/api/test/protected');
        console.log('3. Current user: GET http://localhost:5000/api/users');
        console.log('\n📝 Remember to add the Authorization header with the token above!');
    })
    .catch((error) => {
        console.error('❌ Error creating test user:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure your backend server is running');
        console.log('2. Check that CLERK_SECRET_KEY is set in your .env file');
        console.log('3. Verify your Clerk configuration');
    });
