const User = require('../../models/User');

const findUserById = async (id) => {
    return User.findById(id);
};

const findUserByIdWithProfile = async (id) => {
    return User.findById(id)
        .select('-password')
        .populate({
            path: 'wishlist',
            select: 'name price discountedPrice mainImage image'
        })
        .populate({
            path: 'cart.product',
            select: 'name price discountedPrice mainImage image'
        });
};

const findUserByIdNoPassword = async (id) => {
    return User.findById(id).select('-password');
};

const findUserByIdWithCart = async (id) => {
    return User.findById(id).select('-password').populate('cart.product');
};

const saveUser = async (user) => {
    return user.save();
};

const clearUserCart = async (userId) => {
    return User.updateOne({ _id: userId }, { $set: { cart: [] } });
};

module.exports = {
    findUserById,
    findUserByIdWithProfile,
    findUserByIdNoPassword,
    findUserByIdWithCart,
    saveUser,
    clearUserCart,
};
