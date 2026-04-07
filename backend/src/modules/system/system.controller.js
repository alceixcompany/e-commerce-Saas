const getApiInfo = (req, res) => {
    res.json({
        message: 'E-commerce Backend API',
        version: '1.0.0'
    });
};

const getHealth = (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
};

module.exports = {
    getApiInfo,
    getHealth,
};
