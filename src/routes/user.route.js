import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';

import {
    getCurrentUser,
    getUserProfile,
    updateUser,
    syncUser,
    becomeSeller,
    getSellerPosts,
} from '../controllers/user.controller.js';

const router = express.Router();

// ROUTES PUBLIQUES 
router.get('/profile/:userId', getUserProfile);
router.get('/seller/:userId/posts', getSellerPosts);

//protected routes
router.post("/sync", protectRoute, syncUser);
router.get('/', protectRoute, getCurrentUser);
router.put('/profile', protectRoute, updateUser);
router.post('/become-seller', protectRoute, becomeSeller);


export default router;  