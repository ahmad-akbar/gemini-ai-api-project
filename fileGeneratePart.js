const fs = require('fs')

function fileGeneratePart(filePath, mimeType) {
 const inlineData = {
    mimeType: mimeType || 'application/octet-stream',
    data: fs.readFileSync(filePath).toString('base64'),
  };

  return { inlineData }
}

module.exports = {fileGeneratePart};