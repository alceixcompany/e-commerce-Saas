const Blog = require('../../models/Blog');

const findBlogs = async (query, sortQuery, skip, limit) => {
    return Promise.all([
        Blog.find(query)
            .populate('author', 'name')
            .sort(sortQuery)
            .skip(skip)
            .limit(limit),
        Blog.countDocuments(query)
    ]);
};

const findBlogsAdmin = async (query, skip, limit) => {
    return Promise.all([
        Blog.find(query)
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Blog.countDocuments(query)
    ]);
};

const findBlogByQueryAndIncViews = async (query) => {
    return Blog.findOneAndUpdate(
        query,
        { $inc: { views: 1 } },
        { new: true }
    ).populate('author', 'name');
};

const findBlogById = async (id) => {
    return Blog.findById(id);
};

const createBlog = async (payload) => {
    return Blog.create(payload);
};

const updateBlogById = async (id, payload) => {
    return Blog.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deleteBlog = async (blog) => {
    return blog.deleteOne();
};

module.exports = {
    findBlogs,
    findBlogsAdmin,
    findBlogByQueryAndIncViews,
    findBlogById,
    createBlog,
    updateBlogById,
    deleteBlog,
};
