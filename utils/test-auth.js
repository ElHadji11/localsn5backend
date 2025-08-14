import { clerkClient } from "@clerk/express";
import { ENV } from "../config/env.js";

/**
 * Utility functions for testing authentication in Postman
 * 
 * Usage:
 * 1. Run this script to get a test user token
 * 2. Use the token in Postman Authorization header
 */

export const createTestUserToken = async () => {
    try {
        // Create a test user
        const user = await clerkClient.users.createUser({
            emailAddress: [`test-${Date.now()}@example.com`],
            password: "TestPassword123!",
            firstName: "Test",
            lastName: "User",
        });

        // Create a session for the user
        const session = await clerkClient.sessions.createSession({
            userId: user.id,
            duration: 60 * 60 * 24 * 7, // 7 days
        });

        console.log("Test User Created:");
        console.log("User ID:", user.id);
        console.log("Email:", user.emailAddresses[0].emailAddress);
        console.log("Session Token:", session.id);
        console.log("\nUse this token in Postman:");
        console.log(`Authorization: Bearer ${session.id}`);

        return {
            userId: user.id,
            email: user.emailAddresses[0].emailAddress,
            sessionToken: session.id
        };
    } catch (error) {
        console.error("Error creating test user:", error);
        throw error;
    }
};

export const listTestUsers = async () => {
    try {
        const users = await clerkClient.users.getUserList({
            limit: 10,
        });

        console.log("Recent Users:");
        users.forEach(user => {
            console.log(`- ${user.id}: ${user.emailAddresses[0]?.emailAddress || 'No email'}`);
        });

        return users;
    } catch (error) {
        console.error("Error listing users:", error);
        throw error;
    }
};

export const deleteTestUser = async (userId) => {
    try {
        await clerkClient.users.deleteUser(userId);
        console.log(`User ${userId} deleted successfully`);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];

    switch (command) {
        case 'create':
            createTestUserToken();
            break;
        case 'list':
            listTestUsers();
            break;
        case 'delete':
            const userId = process.argv[3];
            if (!userId) {
                console.error("Please provide a user ID to delete");
                process.exit(1);
            }
            deleteTestUser(userId);
            break;
        default:
            console.log("Usage:");
            console.log("  node test-auth.js create  - Create a test user and get token");
            console.log("  node test-auth.js list    - List recent users");
            console.log("  node test-auth.js delete <userId> - Delete a test user");
    }
}
