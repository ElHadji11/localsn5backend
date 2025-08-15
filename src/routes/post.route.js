import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';

import upload from '../middlewares/upload.middleware.js';
import {
    getPosts,
    getUserPosts,
    searchPosts,
    getHomepagePosts,
    getPostById,
    createPost,
    createPostTest,
    deletePost,
    addFavorite,
    removeFavorite,
    getFavorites,
    updatePost,
    archivePost,
    addReviewToPost
} from '../controllers/post.controller.js';


const router = express.Router();

//public routes
router.get("/", getPosts);
router.get("/user/:companyName", getUserPosts);
router.get('/search', searchPosts);
router.get('/homepage', getHomepagePosts);
router.get('/:postId', getPostById);

//protected routes
router.post("/", protectRoute, upload.array('photos', 3), createPost);
router.post("/testpost", protectRoute, upload.array('photos', 3), createPostTest);
router.put('/:postId', protectRoute, updatePost);
router.delete("/:postId", protectRoute, deletePost);
router.post('/:postId/reviews', protectRoute, addReviewToPost);
router.put('/:postId/archive', protectRoute, archivePost);

router.get('/favorites', protectRoute, getFavorites);
router.post('/:postId/favorites', protectRoute, addFavorite);
router.delete('/:postId/favorites', protectRoute, removeFavorite);

export default router;

