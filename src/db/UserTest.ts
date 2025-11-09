import 'lib/prismaDB.js';
import userService from "services/user.service.js";
// 1. Test user registration
async function testRegister() {
    console.log("\n=== Test: register user ===");
    try {
        const user = await userService.register("alice", "password123", "alice@example.com");
        console.log("User registered:", user);

        // Should throw if username already exists
        try {
            await userService.register("alice", "password123");
        } catch (err) {
            console.log("Duplicate registration correctly throws:", err);
        }
    } catch (err) {
        console.error("Register test failed:", err);
    }
}

// 2. Test authentication (login)
async function testAuth() {
    console.log("\n=== Test: user authentication ===");
    try {
        const ok = await userService.login("alice", "password123");
        console.log("Correct password returns user:", !!ok);

        const wrong = await userService.login("alice", "wrongpass");
        console.log("Wrong password returns false:",);
    } catch (err) {
        console.error("Auth test failed:", err);
    }
}


// 4. Test addFavorite
async function testAddFavorite(userId: number, artworkId: number) {
    console.log("\n=== Test: add favorite ===");
    try {
        const fav = await userService.addFavorite(userId, artworkId);
        console.log("Added favorite:", fav);

        // Should throw when adding again
        try {
            await userService.addFavorite(userId, artworkId);
        } catch (err) {
            console.log("Duplicate favorite correctly throws:", err);
        }
    } catch (err) {
        console.error("Add favorite test failed:", err);
    }
}

// 5. Test removeFavorite
async function testRemoveFavorite(userId: number, artworkId: number) {
    console.log("\n=== Test: remove favorite ===");
    try {
        const result = await userService.removeFavorite(userId, artworkId);
        console.log("Removed favorite:", result);

        // Should throw if already removed
        try {
            await userService.removeFavorite(userId, artworkId);
        } catch (err) {
            console.log("Repeated removal correctly throws:", err);
        }
    } catch (err) {
        console.error("Remove favorite test failed:", err);
    }
}

// 6. Test re-add favorite after removal
async function testRestoreFavorite(userId: number, artworkId: number) {
    console.log("\n=== Test: restore favorite after soft delete ===");
    try {
        const fav = await userService.addFavorite(userId, artworkId);
        console.log("Favorite restored:", fav);
    } catch (err) {
        console.error("Restore favorite test failed:", err);
    }
}

// 7. Test query user's favorites
async function testGetUserFavorites(userId: number) {
    console.log("\n=== Test: get user favorites ===");
    try {
        const favorites = await userService.getUserFavorites(userId);
        console.log("Favorites found:", favorites);
    } catch (err) {
        console.error("Get user favorites test failed:", err);
    }
}

// 8. Test query all users
async function testGetAllUsers() {
    console.log("\n=== Test: get all users ===");
    try {
        const users = await userService.getAllUsers();
        console.log("All users:", users);
    } catch (err) {
        console.error("Get all users test failed:", err);
    }
}

// Main runner
async function runTests() {
    console.log("=== Begin userService manual tests ===");

    const artworkID = 8766
    const userID = 1
    try {
        await testAddFavorite(userID, artworkID);
        await testRemoveFavorite(userID, artworkID);
        await testRestoreFavorite(userID, artworkID);
        await testGetUserFavorites(userID);
        await testGetAllUsers();

    } catch (err) {
        console.error("Unexpected error during test:", err);
    } finally {
        console.log("=== Tests completed, database connection closed ===");
    }
}

async function runTestUser() {
    try {
        await testRegister();
        await testAuth();
    } catch (err) {
        console.error(`UserService Test Failed: ${err}`)
    }
}

(async () => {
  try {
    await runTestUser();
  } catch (err) {
    console.error("UserTest fatal error:", err);
  } finally {
  }
})();