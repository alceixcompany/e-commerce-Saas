const DOMPurify = require('isomorphic-dompurify');
const blogsRepo = require('./blogs.repository');
const escapeRegex = require('../../utils/escapeRegex');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const listBlogs = async ({ page = 1, limit = 10, sort, q }) => {
    let query = { isPublished: true };

    if (q) {
        const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
        query.$or = [
            { title: searchRegex },
            { excerpt: searchRegex },
            { content: searchRegex }
        ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'best-read') {
        sortQuery = { views: -1 };
    } else if (sort === 'new') {
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const [blogs, total] = await blogsRepo.findBlogs(query, sortQuery, skip, parseInt(limit));

    return {
        blogs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

const listAllBlogs = async ({ page = 1, limit = 10, q }) => {
    const skip = (page - 1) * limit;
    let query = {};
    if (q) {
        query.title = { $regex: escapeRegex(q.trim()), $options: 'i' };
    }

    const [blogs, total] = await blogsRepo.findBlogsAdmin(query, skip, parseInt(limit));
    return {
        blogs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

const getBlogByIdOrSlug = async (idOrSlug) => {
    let query = {};
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: idOrSlug };
    } else {
        query = { slug: idOrSlug.toLowerCase() };
    }

    const blog = await blogsRepo.findBlogByQueryAndIncViews(query);
    if (!blog) throw createHttpError('Blog not found', 404);
    return blog;
};

const createBlog = async (payload, userId) => {
    const blogPayload = { ...payload, author: userId };
    if (blogPayload.content) {
        blogPayload.content = DOMPurify.sanitize(blogPayload.content);
    }
    return blogsRepo.createBlog(blogPayload);
};

const updateBlog = async (id, payload) => {
    const existing = await blogsRepo.findBlogById(id);
    if (!existing) throw createHttpError('Blog not found', 404);

    const updatePayload = { ...payload };
    if (updatePayload.content) {
        updatePayload.content = DOMPurify.sanitize(updatePayload.content);
    }

    return blogsRepo.updateBlogById(id, updatePayload);
};

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const extractFileIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/api\/upload\/image\/([a-fA-F0-9]{24})/);
    return match ? match[1] : null;
};

const deleteImageFromGridFS = async (fileId) => {
    try {
        if (!fileId) return;
        const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        const objectId = new mongoose.Types.ObjectId(fileId);
        await bucket.delete(objectId);
    } catch (error) {
        console.error(`Failed to delete image ${fileId}:`, error.message);
    }
};

const deleteBlog = async (id) => {
    const blog = await blogsRepo.findBlogById(id);
    if (!blog) throw createHttpError('Blog not found', 404);

    if (blog.image) {
        const imageId = extractFileIdFromUrl(blog.image);
        if (imageId) await deleteImageFromGridFS(imageId);
    }

    await blogsRepo.deleteBlog(blog);
};

const bulkDeleteBlogs = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return;

    for (const id of ids) {
        const blog = await blogsRepo.findBlogById(id);
        if (!blog) continue;

        if (blog.image) {
            const imageId = extractFileIdFromUrl(blog.image);
            if (imageId) await deleteImageFromGridFS(imageId);
        }
    }

    await blogsRepo.deleteManyBlogs(ids);
};

module.exports = {
    listBlogs,
    listAllBlogs,
    getBlogByIdOrSlug,
    createBlog,
    updateBlog,
    deleteBlog,
    bulkDeleteBlogs,
};
