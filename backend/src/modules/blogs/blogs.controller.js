const blogsService = require('./blogs.service');

const listBlogs = async (req, res) => {
    try {
        const result = await blogsService.listBlogs(req.query);
        res.status(200).json({
            success: true,
            count: result.blogs.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const listAllBlogs = async (req, res) => {
    try {
        const result = await blogsService.listAllBlogs(req.query);
        res.status(200).json({
            success: true,
            count: result.blogs.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getBlog = async (req, res) => {
    try {
        const blog = await blogsService.getBlogByIdOrSlug(req.params.id);
        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const createBlog = async (req, res) => {
    try {
        const blog = await blogsService.createBlog(req.body, req.user.id);
        res.status(201).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const updateBlog = async (req, res) => {
    try {
        const blog = await blogsService.updateBlog(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const deleteBlog = async (req, res) => {
    try {
        await blogsService.deleteBlog(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

module.exports = {
    listBlogs,
    listAllBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
};
