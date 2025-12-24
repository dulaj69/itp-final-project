const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const REPORTS_DIR = path.join(__dirname, '../reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR);
}

exports.listTables = async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const tables = collections.map(col => col.name);
    res.json({ tables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { tableName, reportName } = req.body;
    if (!tableName || !reportName) {
      return res.status(400).json({ message: 'Table name and report name are required' });
    }
    const data = await mongoose.connection.db.collection(tableName).find({}).toArray();
    const fileId = uuidv4();
    const fileName = `${reportName.replace(/\s+/g, '_')}_${fileId}.json`;
    const filePath = path.join(REPORTS_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.status(201).json({ message: 'Report generated', fileName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json'));
    const reports = files.map(file => {
      const stats = fs.statSync(path.join(REPORTS_DIR, file));
      return {
        _id: file,
        name: file.split('_').slice(0, -1).join(' '),
        fileName: file,
        createdAt: stats.birthtime,
        tableName: file.split('_')[0]
      };
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(REPORTS_DIR, id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.download(filePath, id);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(REPORTS_DIR, id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Report deleted' });
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 