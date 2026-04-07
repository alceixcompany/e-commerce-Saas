const Contact = require('../../models/Contact');

const createMessage = async (payload) => {
    return Contact.create(payload);
};

const listMessages = async () => {
    return Contact.find().sort({ createdAt: -1 });
};

module.exports = {
    createMessage,
    listMessages,
};
