const mongoose = require('mongoose');

const componentInstanceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ComponentInstance', componentInstanceSchema);
