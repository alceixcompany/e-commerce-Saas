const Page = require('../../models/Page');
const ComponentInstance = require('../../models/ComponentInstance');

const findPages = async () => {
    return Page.find().sort({ createdAt: -1 });
};

const findPageBySlug = async (slug) => {
    return Page.findOne({ slug });
};

const findComponentInstanceById = async (id) => {
    return ComponentInstance.findById(id);
};

const createPage = async (payload) => {
    return Page.create(payload);
};

const updatePageById = async (id, payload) => {
    return Page.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deletePageById = async (id) => {
    return Page.findByIdAndDelete(id);
};

module.exports = {
    findPages,
    findPageBySlug,
    findComponentInstanceById,
    createPage,
    updatePageById,
    deletePageById,
};
