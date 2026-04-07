const contactRepo = require('./contact.repository');

const createMessage = async (payload) => {
    return contactRepo.createMessage(payload);
};

const listMessages = async () => {
    return contactRepo.listMessages();
};

module.exports = {
    createMessage,
    listMessages,
};
