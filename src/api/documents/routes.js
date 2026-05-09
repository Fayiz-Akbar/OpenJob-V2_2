const express = require('express');
const path = require('path');
const fs = require('fs');
const upload = require('../../middlewares/uploadMiddleware');
const DocumentsService = require('../../services/postgres/DocumentsService');
const verifyToken = require('../../middlewares/auth');
const ClientError = require('../../exceptions/ClientError');

const router = express.Router();
const documentsService = new DocumentsService();

router.post('/', verifyToken, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
  if (err) {
    // Pastikan status 400. Jika error bawaan multer, err.message mungkin adalah 'File too large'
    return res.status(400).json({ status: 'failed', message: err.message });
  }
  next();
});
}, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ClientError('File is required', 400);
    }

    const { filename, originalname, size } = req.file;
    const documentId = await documentsService.addDocument({
      filename,
      originalName: originalname,
      size,
    });

    res.status(201).json({
      status: 'success',
      data: {
        documentId,
        filename,
        originalName: originalname,
        size,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const documents = await documentsService.getDocuments();
    res.status(200).json({
      status: 'success',
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentsService.getDocumentById(id);
    
    const filePath = path.resolve(__dirname, '../../../uploads/documents', document.filename);
    
    if (!fs.existsSync(filePath)) {
        throw new ClientError('File fisik tidak ditemukan', 404);
    }

    res.download(filePath, document.original_name || document.originalName);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await documentsService.getDocumentById(id);
    await documentsService.deleteDocumentById(id);

    const filePath = path.resolve(__dirname, '../../../uploads/documents', document.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.status(200).json({
      status: 'success',
      message: 'Dokumen berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;