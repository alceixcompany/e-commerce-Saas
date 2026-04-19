const componentsService = require('./components.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const listComponents = async (req, res) => {
    try {
        const instances = await componentsService.listComponents(req.query);
        res.json({ success: true, count: instances.length, data: instances });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
};

const getComponent = async (req, res) => {
    try {
        const instance = await componentsService.getComponentById(req.params.id);
        res.json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const createComponent = async (req, res) => {
    try {
        const instance = await componentsService.createComponent(req.body);
        await triggerRevalidation(['content', 'content:bootstrap']);
        res.status(201).json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const updateComponent = async (req, res) => {
    try {
        const instance = await componentsService.updateComponent(req.params.id, req.body);
        await triggerRevalidation(['content', 'content:bootstrap']);
        res.json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const deleteComponent = async (req, res) => {
    try {
        await componentsService.deleteComponent(req.params.id);
        await triggerRevalidation(['content', 'content:bootstrap']);
        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

module.exports = {
    listComponents,
    getComponent,
    createComponent,
    updateComponent,
    deleteComponent,
};
