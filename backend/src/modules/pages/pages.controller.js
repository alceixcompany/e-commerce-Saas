const pagesService = require('./pages.service');

const listPages = async (req, res) => {
    try {
        const pages = await pagesService.listPages();
        res.json({ success: true, count: pages.length, data: pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
};

const getPage = async (req, res) => {
    try {
        const page = await pagesService.getPageBySlug(req.params.slug);
        res.json({ success: true, data: page });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const createPage = async (req, res) => {
    try {
        const page = await pagesService.createPage(req.body);
        res.status(201).json({ success: true, data: page });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Page with this slug already exists', error: 'Page with this slug already exists' });
        }
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const updatePage = async (req, res) => {
    try {
        const page = await pagesService.updatePage(req.params.id, req.body);
        res.json({ success: true, data: page });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

const deletePage = async (req, res) => {
    try {
        await pagesService.deletePage(req.params.id);
        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? err.message : 'Server Error' });
    }
};

module.exports = {
    listPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
};
