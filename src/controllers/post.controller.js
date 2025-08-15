import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";

export const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ statut: 'actif' })
        .sort({ createdAt: -1 })
        .populate('user', 'companyName region TypeActivite ');
    res.status(200).json(posts);
});


export const getUserPosts = asyncHandler(async (req, res) => {
    const { companyName } = req.params;

    const user = await User.findOne({ companyName });

    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const posts = await Post.find({ user: user._id, statut: 'actif' })
        .sort({ createdAt: -1 })
        .populate('user', 'companyName profilePicture');

    if (!posts || posts.length === 0) {
        return res.status(404).json({ message: "Aucun post trouvé pour cet utilisateur." });
    }

    res.status(200).json(posts);
});

export const getHomepagePosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ status: 'actif' })
        .sort({ createdAt: -1 }) // Trier par les plus récents
        .limit(10) // Limiter à 10 posts
        .populate('user', 'companyName profilePicture region TypeActivite');
    res.status(200).json(posts);
});


export const createPost = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { produit, typeActivite, quantite, prix, unite, description, region, DisponibilityDate, } = req.body;

    // `req.files` contiendra le tableau des fichiers uploadés par multer.array()
    const imageFiles = req.files;

    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== 'seller') {
        return res.status(403).json({ message: "Non autorisé : Seuls les vendeurs peuvent créer des annonces." });
    }

    // Validation des champs requis
    if (!produit || !typeActivite || !quantite || !prix || !unite || !DisponibilityDate || !region) {
        return res.status(400).json({ message: "Champs requis manquants pour l'annonce." });
    }

    if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ message: "Au moins une image est requise pour l'annonce." });
    }
    if (imageFiles.length > 3) {
        return res.status(400).json({ message: "Vous ne pouvez uploader un maximum de 3 images." });
    }

    const photosUrls = [];

    // Uploader chaque image vers Cloudinary
    for (const file of imageFiles) {
        try {
            // Convertir le buffer de l'image en base64
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

            // Uploader vers Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                folder: "farm_connect_posts", // Nom du dossier dans Cloudinary pour tes posts
                resource_type: "image",
                transformation: [ // Options de transformation pour optimiser les images
                    { width: 800, height: 600, crop: "limit" }, // Redimensionner pour un affichage web/mobile
                    { quality: "auto" },
                    { format: "auto" },
                ],
            });
            photosUrls.push(uploadResponse.secure_url);
        } catch (uploadError) {
            console.error("Erreur d'upload Cloudinary pour un fichier:", uploadError);
            return res.status(500).json({ error: "Échec de l'upload d'une ou plusieurs images." });
        }
    }

    // Créer un nouveau post dans la base de données avec les URLs Cloudinary
    const newPost = await Post.create({
        user: user._id,
        produit,
        typeActivite,
        quantite,
        prix,
        unite,
        description,
        region,
        photos: photosUrls,
        DisponibilityDate: new Date(DisponibilityDate),
        statut: 'actif',
    });

    res.status(201).json({ post: newPost, message: "Annonce créée avec succès." });
});

export const createPostTest = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { produit, typeActivite, quantite, prix, unite, description, region, DisponibilityDate, } = req.body;

    // `req.files` contiendra le tableau des fichiers uploadés par multer.array()
    const imageFiles = req.files;

    const user = await User.findOne({ clerkId: userId });
    //changemet ici
    if (!user) {
        return res.status(403).json({ message: "Non autorisé : Seuls les vendeurs peuvent créer des annonces." });
    }

    // Validation des champs requis
    if (!produit || !typeActivite || !quantite || !prix || !unite || !DisponibilityDate || !region) {
        return res.status(400).json({ message: "Champs requis manquants pour l'annonce." });
    }

    if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ message: "Au moins une image est requise pour l'annonce." });
    }
    if (imageFiles.length > 3) {
        return res.status(400).json({ message: "Vous ne pouvez uploader un maximum de 3 images." });
    }

    const photosUrls = [];

    // Uploader chaque image vers Cloudinary
    for (const file of imageFiles) {
        try {
            // Convertir le buffer de l'image en base64
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

            // Uploader vers Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                folder: "farm_connect_posts", // Nom du dossier dans Cloudinary pour tes posts
                resource_type: "image",
                transformation: [ // Options de transformation pour optimiser les images
                    { width: 800, height: 600, crop: "limit" }, // Redimensionner pour un affichage web/mobile
                    { quality: "auto" },
                    { format: "auto" },
                ],
            });
            photosUrls.push(uploadResponse.secure_url);
        } catch (uploadError) {
            console.error("Erreur d'upload Cloudinary pour un fichier:", uploadError);
            return res.status(500).json({ error: "Échec de l'upload d'une ou plusieurs images." });
        }
    }

    // Créer un nouveau post dans la base de données avec les URLs Cloudinary
    const newPost = await Post.create({
        user: user._id,
        produit,
        typeActivite,
        quantite,
        prix,
        unite,
        description,
        region,
        photos: photosUrls,
        DisponibilityDate: new Date(DisponibilityDate),
        statut: 'actif',
    });

    res.status(201).json({ post: newPost, message: "Annonce créée avec succès." });
});

export const searchPosts = asyncHandler(async (req, res) => {
    const { query, typeActivite, region, minPrice, maxPrice, availability } = req.query;
    let filter = { status: 'actif' };

    if (query) {
        filter.$or = [
            { produit: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (typeActivite) {
        filter.typeActivite = typeActivite;
    }
    if (region) {
        filter.region = region;
    }
    if (minPrice || maxPrice) {
        filter.prix = {};
        if (minPrice) filter.prix.$gte = parseFloat(minPrice);
        if (maxPrice) filter.prix.$lte = parseFloat(maxPrice);
    }
    if (availability === 'now') {
        filter.DisponibilityDate = { $lte: new Date() };
    } else if (availability === 'future') {
        filter.DisponibilityDate = { $gt: new Date() };
    }

    const posts = await Post.find(filter).populate('user', 'companyName profilePicture region TypeActivite').limit(20);
    res.status(200).json(posts);
});

export const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = getAuth(req);
    const updates = req.body;

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found." });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user || post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You do not own this post." });
    }

    delete updates.user;
    delete updates.typeActivite;

    const updatedPost = await Post.findByIdAndUpdate(postId, updates, { new: true, runValidators: true });
    res.status(200).json({ post: updatedPost, message: "Post updated successfully." });
});

export const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId)
        .populate('user', 'companyName profilePicture region TypeActivite');

    if (!post || post.status === 'archivé') {
        return res.status(404).json({ message: "Post not found or unavailable." });
    }

    res.status(200).json(post);
});

export const archivePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = getAuth(req);

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found." });
    }

    const user = await User.findOne({ clerkId: userId });
    // Vérifier que le post appartient bien à l'utilisateur authentifié
    if (!user || post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You do not own this post." });
    }

    post.status = 'archivé'; // Mettre le statut à 'archivé' (soft delete)
    await post.save();

    res.status(200).json({ message: "Post archived successfully." });
});

export const addReviewToPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = getAuth(req); // L'ID de l'utilisateur qui écrit l'avis
    const { commentaire, note } = req.body;

    if (!commentaire || !note) {
        return res.status(400).json({ message: "Comment and rating are required." });
    }
    if (note < 1 || note > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found." });
    }

    const userReviewing = await User.findOne({ clerkId: userId });
    if (!userReviewing) {
        return res.status(404).json({ message: "Reviewing user not found in DB." });
    }

    // Empêcher l'utilisateur de laisser un avis sur son propre post
    if (post.user.toString() === userReviewing._id.toString()) {
        return res.status(403).json({ message: "You cannot review your own post." });
    }

    // Empêcher l'utilisateur de laisser plusieurs avis sur le même post
    const hasReviewed = post.avis.some(
        (review) => review.user.toString() === userReviewing._id.toString()
    );
    if (hasReviewed) {
        return res.status(409).json({ message: "You have already reviewed this post." });
    }

    post.avis.push({
        user: userReviewing._id,
        commentaire,
        note,
        date: new Date(),
    });

    // Recalculer la note moyenne et le nombre d'avis pour le post
    const totalNotes = post.avis.reduce((sum, review) => sum + review.note, 0);
    post.noteMoyenne = totalNotes / post.avis.length;
    post.nombreAvis = post.avis.length;

    await post.save();

    res.status(201).json({ post, message: "Review added successfully." });
});


export const getFavorites = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId })
        .populate({
            path: 'favorites',
            populate: {
                path: 'user',
                select: 'companyName region TypeActivite '
            }
        });

    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(user.favorites);
});

export const addFavorite = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Vérifier si le post existe
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found." });
    }

    // Vérifier si le post est déjà dans les favoris
    if (user.favorites.includes(post._id)) {
        return res.status(409).json({ message: "Post already in favorites." });
    }

    // Ajouter le post aux favoris de l'utilisateur
    user.favorites.push(post._id);
    await user.save();

    res.status(200).json({ message: "Post added to favorites." });
});

export const removeFavorite = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Vérifier si le post est bien dans les favoris
    if (!user.favorites.includes(postId)) {
        return res.status(404).json({ message: "Post not found in favorites." });
    }

    // Retirer le post des favoris de l'utilisateur
    user.favorites = user.favorites.filter(
        (favoriteId) => favoriteId.toString() !== postId
    );
    await user.save();

    res.status(200).json({ message: "Post removed from favorites." });
});

export const deletePost = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) return res.status(404).json({ error: "User or post not found" });

    if (post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "You can only delete your own posts" });
    }

    // delete all comments on this post
    //   await Comment.deleteMany({ post: postId });

    // delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });


});