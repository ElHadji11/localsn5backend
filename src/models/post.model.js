
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    produit: {
        type: String,
        required: true,
    },
    typeActivite: {
        type: String,
        enum: ['agriculture', 'eleveur', 'transformateur'],
        required: true,
    },
    quantite: {
        type: Number,
        required: true,
    },
    prix: {
        type: Number,
        required: true,
    },
    unite: {
        type: String,
        enum: [
            'kg',
            'tonne',
            'unité',
            'sac',
            'litre',
            'ml',
            'g'
        ],
        required: true,
    },
    DisponibilityDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
    },

    photos: {
        type: [String],
        default: []
    },

    avis: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            commentaire: {
                type: String,
            },
            note: {
                type: Number,
                min: 1,
                max: 5,
            },
            date: {
                type: Date,
                default: Date.now,
            }
        }],
        default: []
    },
    noteMoyenne: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    nombreAvis: {
        type: Number,
        default: 0
    },
    statut: {
        type: String,
        enum: ['actif', 'inactif'],
    }
},
    { timestamps: true }
);
const Post = mongoose.model('Post', postSchema);
export default Post;