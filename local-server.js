import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Đường dẫn tới thư mục upload của bạn
const UPLOAD_DIR = 'D:\\data_upload';

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.userId || 'default';
    const userDir = path.join(UPLOAD_DIR, userId);
    
    // Tạo thư mục người dùng nếu chưa tồn tại
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique để tránh trùng lặp
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// API endpoint để upload file
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);

    res.json({
      success: true,
      file: {
        path: req.file.path,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Khởi động server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Local file server running on port ${PORT}`);
  console.log(`Files will be uploaded to: ${UPLOAD_DIR}`);
});