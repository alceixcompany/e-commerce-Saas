const pagesRepo = require('./pages.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const populateSections = async (pageObj) => {
    if (!pageObj.sections || !Array.isArray(pageObj.sections)) {
        return pageObj;
    }

    const populatedSections = await Promise.all(pageObj.sections.map(async (section) => {
        const sectionId = typeof section === 'string' ? section : section.id;

        if (sectionId && sectionId.includes('_instance_')) {
            const instanceId = sectionId.split('_instance_')[1];
            try {
                const instance = await pagesRepo.findComponentInstanceById(instanceId);
                return {
                    ...section,
                    instanceData: instance ? instance.data : null
                };
            } catch (error) {
                console.error(`Failed to populate instance ${instanceId}:`, error);
                return section;
            }
        }
        return section;
    }));

    return { ...pageObj, sections: populatedSections };
};

const listPages = async () => {
    const pages = await pagesRepo.findPages();
    return pages;
};

const getPageBySlug = async (slug) => {
    const page = await pagesRepo.findPageBySlug(slug);
    if (!page) throw createHttpError('Page not found', 404);
    const pageObj = page.toObject();
    return populateSections(pageObj);
};

const createPage = async (payload) => {
    const { title, slug, path, description, sections } = payload;
    if (!title || !slug || !path) {
        throw createHttpError('Title, slug, and path are required', 400);
    }

    return pagesRepo.createPage({
        title,
        slug,
        path,
        description: description || '',
        sections: sections || []
    });
};

const updatePage = async (id, payload) => {
    const page = await pagesRepo.updatePageById(id, payload);
    if (!page) throw createHttpError('Page not found', 404);
    return page;
};

const deletePage = async (id) => {
    const page = await pagesRepo.deletePageById(id);
    if (!page) throw createHttpError('Page not found', 404);
    return true;
};

module.exports = {
    listPages,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
};
