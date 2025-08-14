import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';

import {
    getCurrentUser,
    getUserProfile,
    updateUser,
    syncUser,
    becomeSeller,
    getSellerPosts,
    verifyPasswordReset,
} from '../controllers/user.controller.js';

const router = express.Router();

// ROUTES PUBLIQUES 
router.get('/profile/:userId', getUserProfile);
router.post("/sync", syncUser);
router.get('/seller/:userId/posts', getSellerPosts);
router.post('/verify-reset-token', verifyPasswordReset);

//protected routes
router.get('/', protectRoute, getCurrentUser);
router.put('/profile', protectRoute, updateUser);
router.post('/become-seller', protectRoute, becomeSeller);


export default router;  