const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const GridFSBucket = mongoose.mongo.GridFSBucket;

const imageStorage = multer.memoryStorage();
const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

const videoStorage = multer.memoryStorage();
const videoUpload = multer({
    storage: videoStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    },
});

const uploadImage = async (file, userId) => {
    if (!file) {
        const error = new Error('No image file provided');
        error.statusCode = 400;
        throw error;
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    let processedImage;
    const originalFormat = file.mimetype.split('/')[1];
    let contentType = 'image/jpeg';
    let extension = 'jpg';

    try {
        if (originalFormat === 'png') {
            contentType = 'image/png';
            extension = 'png';
            processedImage = await sharp(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .png({ quality: 85, compressionLevel: 9 })
                .toBuffer();
        } else {
            processedImage = await sharp(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                .toBuffer();
        }
    } catch (sharpError) {
        processedImage = file.buffer;
        contentType = file.mimetype;
        extension = file.mimetype.split('/')[1] || 'jpg';
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const uploadStream = bucket.openUploadStream(filename, {
        contentType: contentType,
        metadata: {
            originalName: file.originalname,
            originalSize: file.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
        },
    });

    uploadStream.end(processedImage);

    return new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
            resolve({
                fileId: uploadStream.id.toString(),
                filename: filename,
                url: `/api/upload/image/${uploadStream.id}`,
            });
        });

        uploadStream.on('error', (error) => {
            reject(error);
        });
    });
};

const getImage = async (fileId) => {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
        const error = new Error('Image not found');
        error.statusCode = 404;
        throw error;
    }
    return { bucket, file: files[0], objectId };
};

const deleteImage = async (fileId) => {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
};

const uploadVideo = async (file, userId) => {
    if (!file) {
        const error = new Error('No video file provided');
        error.statusCode = 400;
        throw error;
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const extension = file.originalname.split('.').pop();
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
        metadata: {
            originalName: file.originalname,
            originalSize: file.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
            type: 'video'
        },
    });

    uploadStream.end(file.buffer);

    return new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
            resolve({
                fileId: uploadStream.id.toString(),
                filename: filename,
                url: `/api/upload/video/${uploadStream.id}`,
            });
        });

        uploadStream.on('error', (error) => {
            reject(error);
        });
    });
};

const getVideoStream = async (fileId) => {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
        const error = new Error('Video not found');
        error.statusCode = 404;
        throw error;
    }
    return { bucket, file: files[0], objectId };
};

const deleteVideo = async (fileId) => {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
};

module.exports = {
    imageUpload,
    videoUpload,
    uploadImage,
    getImage,
    deleteImage,
    uploadVideo,
    getVideoStream,
    deleteVideo,
};
