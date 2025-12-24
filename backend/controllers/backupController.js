const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

exports.listCollections = async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ collections: collections.map(col => col.name) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};
    for (const col of collections) {
      backupData[col.name] = await mongoose.connection.db.collection(col.name).find({}).toArray();
    }
    const backupId = uuidv4();
    const timestamp = new Date().toISOString();
    const fileName = `backup_${backupId}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify({ id: backupId, timestamp, collections: Object.keys(backupData), data: backupData }, null, 2));
    res.status(201).json({ message: 'Backup created', id: backupId, fileName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listBackups = async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
    const backups = files.map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        id: content.id,
        timestamp: content.timestamp,
        collections: content.collections,
        fileName: file
      };
    });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const fileName = `backup_${id}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const col of content.collections) {
      await mongoose.connection.db.collection(col).deleteMany({});
      if (content.data[col] && content.data[col].length > 0) {
        await mongoose.connection.db.collection(col).insertMany(content.data[col]);
      }
    }
    res.json({ message: 'Backup restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const fileName = `backup_${id}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Backup deleted' });
    } else {
      res.status(404).json({ message: 'Backup not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 