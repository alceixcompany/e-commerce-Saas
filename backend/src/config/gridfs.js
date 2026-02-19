const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs;

const initGridFS = () => {
  const conn = mongoose.connection;
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  return gfs;
};

const getGridFS = () => {
  if (!gfs) {
    return initGridFS();
  }
  return gfs;
};

module.exports = { initGridFS, getGridFS };

