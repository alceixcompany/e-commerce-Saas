const profileRepo = require('./profile.repository');
const { sanitize } = require('../../utils/sanitizer');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getProfile = async (userId) => {
    const user = await profileRepo.findUserByIdWithProfile(userId);
    if (!user) throw createHttpError('User not found', 404);

    user.cart = user.cart.filter(item => item.product !== null);
    user.wishlist = user.wishlist.filter(item => item !== null);

    if (user.isModified('cart') || user.isModified('wishlist')) {
        await profileRepo.saveUser(user);
    }

    return user;
};

const updateProfile = async (userId, payload) => {
    const { name, phone, identityNumber, profileImage } = payload;
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    if (name) user.name = sanitize(name);
    if (phone !== undefined) user.phone = sanitize(phone);
    if (identityNumber !== undefined) user.identityNumber = sanitize(identityNumber);
    if (profileImage !== undefined) user.profileImage = profileImage;

    await profileRepo.saveUser(user);
    return profileRepo.findUserByIdNoPassword(user._id);
};

const addAddress = async (userId, payload) => {
    const { title, fullAddress, city, district, postalCode, phone, isDefault } = payload;
    if (!title || !fullAddress || !city || !district || !postalCode || !phone) {
        throw createHttpError('Please provide all required address fields', 400);
    }

    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    if (isDefault) {
        user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({
        title: sanitize(title),
        fullAddress: sanitize(fullAddress),
        city: sanitize(city),
        district: sanitize(district),
        postalCode: sanitize(postalCode),
        phone: sanitize(phone),
        isDefault: isDefault || user.addresses.length === 0,
    });

    await profileRepo.saveUser(user);
    return profileRepo.findUserByIdNoPassword(user._id);
};

const updateAddress = async (userId, addressId, payload) => {
    const { title, fullAddress, city, district, postalCode, phone, isDefault } = payload;
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    const address = user.addresses.id(addressId);
    if (!address) throw createHttpError('Address not found', 404);

    if (isDefault) {
        user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    if (title) address.title = title;
    if (fullAddress) address.fullAddress = fullAddress;
    if (city) address.city = city;
    if (district) address.district = district;
    if (postalCode) address.postalCode = postalCode;
    if (phone) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await profileRepo.saveUser(user);
    return profileRepo.findUserByIdNoPassword(user._id);
};

const deleteAddress = async (userId, addressId) => {
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    const address = user.addresses.id(addressId);
    if (!address) throw createHttpError('Address not found', 404);

    address.deleteOne();
    if (address.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await profileRepo.saveUser(user);
    return profileRepo.findUserByIdNoPassword(user._id);
};

const addToWishlist = async (userId, productId) => {
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    if (user.wishlist.some((id) => id.toString() === productId)) {
        throw createHttpError('Product already in wishlist', 400);
    }

    user.wishlist.push(productId);
    await profileRepo.saveUser(user);

    return profileRepo.findUserByIdWithProfile(user._id);
};

const removeFromWishlist = async (userId, productId) => {
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await profileRepo.saveUser(user);

    return profileRepo.findUserByIdWithProfile(user._id);
};

const getCart = async (userId) => {
    const user = await profileRepo.findUserByIdWithCart(userId);
    if (!user) throw createHttpError('User not found', 404);
    return user.cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
    if (!productId) throw createHttpError('Product ID is required', 400);
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    const existingItem = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        user.cart.push({ product: productId, quantity });
    }

    await profileRepo.saveUser(user);
    const updatedUser = await profileRepo.findUserByIdWithCart(user._id);
    return updatedUser.cart;
};

const updateCartItem = async (userId, productId, quantity) => {
    if (!quantity || quantity < 1) throw createHttpError('Valid quantity is required', 400);
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    const cartItem = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (!cartItem) throw createHttpError('Product not found in cart', 404);

    cartItem.quantity = quantity;
    await profileRepo.saveUser(user);
    const updatedUser = await profileRepo.findUserByIdWithCart(user._id);
    return updatedUser.cart;
};

const removeFromCart = async (userId, productId) => {
    const user = await profileRepo.findUserById(userId);
    if (!user) throw createHttpError('User not found', 404);

    user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId
    );

    await profileRepo.saveUser(user);
    const updatedUser = await profileRepo.findUserByIdWithCart(user._id);
    return updatedUser.cart;
};

const clearCart = async (userId) => {
    await profileRepo.clearUserCart(userId);
    return profileRepo.findUserByIdWithProfile(userId);
};

module.exports = {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
