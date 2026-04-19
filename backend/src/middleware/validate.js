const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const fs = require('fs');
        const path = require('path');
        const errorLog = {
            timestamp: new Date().toISOString(),
            errors: errors.array(),
            body: req.body
        };
        fs.appendFileSync(path.join(process.cwd(), 'debug_validation_errors.log'), JSON.stringify(errorLog, null, 2) + '\n');
        
        console.error('--- Validation Error ---');
        console.error('Errors:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array(),
        });
    }
    next();
};

module.exports = { validateRequest };
