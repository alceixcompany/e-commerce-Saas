const componentsRepo = require('./components.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const listComponents = async ({ type }) => {
    const query = {};
    if (type) query.type = type;
    return componentsRepo.findComponents(query);
};

const getComponentById = async (id) => {
    const instance = await componentsRepo.findComponentById(id);
    if (!instance) throw createHttpError('Component instance not found', 404);
    return instance;
};

const createComponent = async (payload) => {
    const { type, name, data } = payload;
    if (!type || !name) throw createHttpError('Type and name are required', 400);
    return componentsRepo.createComponent({ type, name, data: data || {} });
};

const updateComponent = async (id, payload) => {
    const instance = await componentsRepo.updateComponentById(id, payload);
    if (!instance) throw createHttpError('Component instance not found', 404);
    return instance;
};

const deleteComponent = async (id) => {
    const instance = await componentsRepo.deleteComponentById(id);
    if (!instance) throw createHttpError('Component instance not found', 404);
    return true;
};

module.exports = {
    listComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
};
