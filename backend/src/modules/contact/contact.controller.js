const contactService = require('./contact.service');

const createMessage = async (req, res) => {
    try {
        const message = await contactService.createMessage(req.body);
        res.status(201).json({
            success: true,
            data: message,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const listMessages = async (req, res) => {
    try {
        const messages = await contactService.listMessages();
        res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

module.exports = {
    createMessage,
    listMessages,
};
