const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
let uploadHistory = [];

const app = express();
const PORT = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));


app.post('/upload', upload.single('file-upload'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded.');

  const ext = path.extname(file.originalname).toLowerCase();
  const inputPath = path.resolve(file.path);
  const outputDir = path.resolve('converted');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);


  if (ext === '.docx' || ext === '.pptx') {
    const command = `soffice --head
    less --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', stderr);
        return res.status(500).send('Failed to convert file.');
      }

      const pdfFilename = file.originalname.replace(ext, '.pdf');
      const pdfPath = path.join('converted', pdfFilename);

    
      const uploadedInfo = {
        name: file.originalname,
        converted: true,
        timestamp: new Date(),
        path: pdfPath
      };
      uploadHistory.push(uploadedInfo);

      return res.download(pdfPath, pdfFilename); 
    });


  } else if (ext === '.pdf') {
    const uploadedInfo = {
      name: file.originalname,
      converted: false,
      timestamp: new Date(),
      path: inputPath
    };
    uploadHistory.push(uploadedInfo);

    return res.download(inputPath, file.originalname);
  } else {
    return res.status(400).send('Unsupported file type.');
  }
});


app.get('/upload-history', (req, res) => {
  res.json(uploadHistory);
});

const initializeUploadHistory = () => {
    const scanFolder = (folderPath, converted = false) => {
      if (!fs.existsSync(folderPath)) return;
  
      const files = fs.readdirSync(folderPath);
      files.forEach(filename => {
        const fullPath = path.join(folderPath, filename);
        const stat = fs.statSync(fullPath);
  
        if (stat.isFile()) {
          uploadHistory.push({
            name: filename,
            converted,
            timestamp: stat.mtime, 
            path: path.relative('public', fullPath).replace(/\\/g, '/')
          });
        }
      });
    };
  
    scanFolder(path.resolve('uploads'), false);      // Scan uploaded original files
    scanFolder(path.resolve('converted'), true);    
  };
  
  initializeUploadHistory(); 
  

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
