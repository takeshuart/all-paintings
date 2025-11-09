import express from "express";
import userService from "services/user.service.js";

const router = express.Router();

// ======================================
// User API Routes
// Prefix: /api/v1/users
// ======================================

router.post("/register", async (req, res) => {
    try {
        const {password, email, phone } = req.body;
        const user = await userService.register( password, email, phone);

        res.json({ success: true, user });
    } catch (err: any) {
        console.error("Register error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { id, password } = req.body;
        if (!id || !password) {
            return res.status(400).json({ error: "ID and password are required" });
        }
        const user = await userService.login(id, password);
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }
        res.json({ success: true, user });
    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error:err.message});
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.post("/:userId/favorites", async (req, res) => {
    try {
        const { userId } = req.params;
        const { artworkId } = req.body;
        if (!artworkId) {
            return res.status(400).json({ error: "artworkId is required" });
        }
        const favorite = await userService.addFavorite(Number(userId), Number(artworkId));
        res.json({ success: true, favorite });
    } catch (err: any) {
        console.error("Add favorite error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});


router.delete("/:userId/favorites/:artworkId", async (req, res) => {
    try {
        const { userId, artworkId } = req.params;
        const result = await userService.removeFavorite(Number(userId), Number(artworkId));
        res.json({ success: true, result });
    } catch (err: any) {
        console.error("Remove favorite error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});


router.get("/:userId/favorites", async (req, res) => {
    try {
        const { userId } = req.params;
        const favorites = await userService.getUserFavorites(Number(userId));
        res.json(favorites);
    } catch (err) {
        console.error("Get favorites error:", err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

export default router;
