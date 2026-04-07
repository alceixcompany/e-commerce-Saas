const User = require('../../models/User');

const findUserByEmail = async (email, options = {}) => {
    const query = User.findOne({ email });
    if (options.includePassword) {
        query.select('+password');
    }
    return query;
};

const findUserByIdWithRefresh = async (id) => {
    return User.findById(id).select('+refreshToken');
};

const createUser = async (payload) => {
    return User.create(payload);
};

const saveUser = async (user) => {
    return user.save();
};

const unsetRefreshToken = async (userId) => {
    return User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

module.exports = {
    findUserByEmail,
    findUserByIdWithRefresh,
    createUser,
    saveUser,
    unsetRefreshToken,
};
