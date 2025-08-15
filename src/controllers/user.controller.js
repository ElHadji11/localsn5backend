import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";

export const getCurrentUser = asyncHandler(async (req, res) => {
    // Corr: L'ID vient de l'utilisateur authentifié, pas des params
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
    // Corr: L'ID vient de l'utilisateur authentifié
    const { userId } = getAuth(req);
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
    console.log("=== SYNC USER START ===");
    console.log("Request headers:", req.headers.authorization ? "Token present" : "No token");

    try {
        const { userId } = getAuth(req);
        console.log("UserId from getAuth:", userId);

        if (!userId) {
            console.log("No userId - returning 401");
            return res.status(401).json({ message: "Clerk User ID not found in session." });
        }

        console.log("Fetching Clerk user for ID:", userId);
        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("Clerk user fetched successfully");

        // Le reste de votre code...

    } catch (error) {
        console.error("Error in syncUser:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
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
    const { userId } = getAuth(req); // L'ID de l'utilisateur authentifié
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


