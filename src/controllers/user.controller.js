import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";

export const getCurrentUser = asyncHandler(async (req, res) => {
    // User ID is set by the auth middleware
    const userId = req.userId;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
    // User ID is set by the auth middleware
    const userId = req.userId;
    const updates = req.body;

    // Suppression des champs sensibles pour ne pas les mettre à jour
    delete updates.clerkId;
    delete updates.email;
    delete updates.role;
    delete updates.phoneNumber;

    const user = await User.findOneAndUpdate({ clerkId: userId }, updates, { new: true, runValidators: true });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        return res.status(404).json({ erreur: "User not found" });
    }

    const publicProfile = {
        clerkId: user.clerkId,
        username: user.username,
        companyName: user.companyName,
        role: user.role,
        TypeActivite: user.TypeActivite,
        tailleEntreprise: user.tailleEntreprise,
        region: user.region,
        bio: user.bio,
        dateDeCréationEntreprise: user.dateDeCréationEntreprise,
        profilePicture: user.profilePicture,
        badgeVendeurVerifie: user.badgeVendeurVerifie,
    };
    // Email n'est pas public
    res.status(200).json(publicProfile);
});

export const syncUser = asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: "Clerk User ID not found in session." });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const existingUser = await User.findOne({ clerkId: userId });

    if (existingUser) {
        existingUser.email = clerkUser.emailAddresses[0]?.emailAddress || existingUser.email;
        existingUser.username = clerkUser.username || clerkUser.firstName || existingUser.username;
        existingUser.profilePicture = clerkUser.profileImageUrl || existingUser.profilePicture;
        existingUser.phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber || existingUser.phoneNumber; // Mettre à jour si le numéro a été ajouté/vérifié dans Clerk
        await existingUser.save();
        return res.status(200).json({ user: existingUser, message: "User already exists and updated." });
    }

    const userData = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.firstName || `user_${userId}`, // Fallback si pas de username
        // motDePasse: Clerk gère les mots de passe de son côté, ne pas stocker ici
        role: 'user',
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        // Ces champs sont optionnels et seront renseignés lors de la demande 'becomeSeller'
        TypeActivite: null,
        companyName: null,
        tailleEntreprise: null,
        dateDeCréationEntreprise: null,
        region: null,
        bio: '',
        profilePicture: clerkUser.profileImageUrl,
        badgeVendeurVerifie: false,
    };

    const newUser = await User.create(userData);
    res.status(201).json({ user: newUser, message: "User created successfully." });
});

export const getSellerPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params; // L'ID Clerk du vendeur dont on veut les posts

    const seller = await User.findOne({ clerkId: userId });

    if (!seller || seller.role !== 'seller') {
        return res.status(404).json({ error: "Seller not found or not a seller." });
    }

    const posts = await Post.find({ user: seller._id, status: 'actif' })
        .populate('user', 'companyName profilePicture region TypeActivite'); // Peupler les infos du vendeur
    res.status(200).json(posts);
});

export const becomeSeller = asyncHandler(async (req, res) => {
    const userId = req.userId; // User ID is set by the auth middleware
    const { companyName, TypeActivite, tailleEntreprise, dateDeCréationEntreprise, region, bio } = req.body;

    if (!companyName || !TypeActivite || !tailleEntreprise || !region) {
        return res.status(400).json({ message: "Missing required seller information (companyName, TypeActivite, tailleEntreprise)." });
    }
    const clerkUser = await clerkClient.users.getUser(userId);
    if (!clerkUser.phoneNumbers || clerkUser.phoneNumbers.length === 0 || !clerkUser.phoneNumbers[0].verified) {
        return res.status(400).json({ message: "Phone number must be verified to become a seller." });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) { return res.status(404).json({ error: "User not found in DB." }); }

    if (user.role === 'seller') { return res.status(409).json({ message: "User is already a seller." }); }

    user.role = 'seller';
    user.companyName = companyName;
    user.typeActivite = typeActivite;
    user.tailleEntreprise = tailleEntreprise;
    user.dateDeCréationEntreprise = dateDeCréationEntreprise ? new Date(dateDeCréationEntreprise) : new Date();
    user.region = region;
    user.bio = bio || '';
    user.phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber;

    await user.save();

    await clerkClient.users.updateUser(userId, {
        publicMetadata: {
            ...clerkUser.publicMetadata,
            role: 'seller',
            companyName: companyName,
            typeActivite: typeActivite,
            tailleEntreprise: tailleEntreprise,
            region: region,
            bio: bio,
        },
    });

    res.status(200).json({ user, message: "User successfully upgraded to seller." });
});

// Password reset verification endpoint
export const verifyPasswordReset = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Reset token is required" });
    }

    try {
        // Verify the reset token with Clerk
        const session = await clerkClient.sessions.verifySession(token);

        if (!session) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Token is valid, return success
        res.status(200).json({
            message: "Reset token is valid",
            userId: session.userId
        });
    } catch (error) {
        console.error('Password reset verification error:', error);
        res.status(400).json({ error: "Invalid or expired reset token" });
    }
});


