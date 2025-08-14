import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            unique: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'seller'],
            default: 'user',
        },
        phoneNumber: {
            type: String,
            unique: true,
        },
        companyName: {
            type: String,
            unique: true,
        },
        typeActivite: {
            type: String,
            enum: ['agriculture', 'eleveur', 'transformateur']
        },
        tailleEntreprise: {
            type: String,
            enum: ['1 personne', '2-10 personnnes', '11-100 personnes', '100+ personnes'],
        },

        dateDeCréationEntreprise: {
            type: Date,
            default: Date.now,
        },
        region: {
            type: String
        },
        bio: {
            type: String,
            default: '',
        },
        profilePicture: {
            type: String,
        },
        favorites: [{

            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }],
        badgeVendeurVerifie: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
const User = mongoose.model('User', userSchema);

export default User;    