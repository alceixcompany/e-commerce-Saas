const User = require('../../models/User');

const findUserByEmail = async (email, options = {}) => {
    const query = User.findOne({ email });
    if (options.includePassword) {
        query.select('+password');
    }
    return query;
};

const findUserByIdWithRefresh = async (id) => {
    return User.findById(id).select('+refreshTokens');
};

const createUser = async (payload) => {
    return User.create(payload);
};

const saveUser = async (user) => {
    return user.save();
};

const removeRefreshToken = async (userId, token) => {
    return User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } });
};

module.exports = {
    findUserByEmail,
    findUserByIdWithRefresh,
    createUser,
    saveUser,
    removeRefreshToken,
};
