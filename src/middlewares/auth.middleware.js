import { getAuth } from '@clerk/express'; // Assurez-vous d'importer getAuth

export const protectRoute = (req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        console.log("No userId found in protectRoute"); // Debug
        return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }

    console.log("User authenticated, userId:", userId); // Debug
    next();
};