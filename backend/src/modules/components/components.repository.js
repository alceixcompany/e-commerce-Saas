const ComponentInstance = require('../../models/ComponentInstance');

const findComponents = async (query) => {
    return ComponentInstance.find(query).sort({ createdAt: -1 });
};

const findComponentById = async (id) => {
    return ComponentInstance.findById(id);
};

const createComponent = async (payload) => {
    return ComponentInstance.create(payload);
};

const updateComponentById = async (id, payload) => {
    return ComponentInstance.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deleteComponentById = async (id) => {
    return ComponentInstance.findByIdAndDelete(id);
};

module.exports = {
    findComponents,
    findComponentById,
    createComponent,
    updateComponentById,
    deleteComponentById,
};
