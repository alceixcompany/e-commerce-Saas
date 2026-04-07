const uploadService = require('./upload.service');

const uploadImageMiddleware = (req, res, next) => {
    uploadService.imageUpload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error',
            });
        }
        next();
    });
};

const uploadVideoMiddleware = (req, res, next) => {
    uploadService.videoUpload.single('video')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error',
            });
        }
        next();
    });
};

const uploadImage = async (req, res) => {
    try {
        const data = await uploadService.uploadImage(req.file, req.user._id);
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getImage = async (req, res) => {
    try {
        const { bucket, file, objectId } = await uploadService.getImage(req.params.id);
        res.set('Content-Type', file.contentType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');
        bucket.openDownloadStream(objectId).pipe(res).on('error', (error) => {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve image',
            });
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const deleteImage = async (req, res) => {
    try {
        await uploadService.deleteImage(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const uploadVideo = async (req, res) => {
    try {
        const data = await uploadService.uploadVideo(req.file, req.user._id);
        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getVideo = async (req, res) => {
    try {
        const { bucket, file, objectId } = await uploadService.getVideoStream(req.params.id);
        const fileSize = file.length;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': file.contentType || 'video/mp4',
            };
            res.writeHead(206, head);
            bucket.openDownloadStream(objectId, { start, end: end + 1 }).pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': file.contentType || 'video/mp4',
            };
            res.writeHead(200, head);
            bucket.openDownloadStream(objectId).pipe(res);
        }
    } catch (error) {
        console.error('Video streaming error:', error);
        if (!res.headersSent) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error' });
        }
    }
};

const deleteVideo = async (req, res) => {
    try {
        await uploadService.deleteVideo(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Video deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

module.exports = {
    uploadImageMiddleware,
    uploadVideoMiddleware,
    uploadImage,
    getImage,
    deleteImage,
    uploadVideo,
    getVideo,
    deleteVideo,
};
