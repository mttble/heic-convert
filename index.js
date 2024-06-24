const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');

(async () => {
  // const sourceDirectory = '\\\\srv-sa1-fs1\\Switchrooms\\Metro\\76348 - Bayswater Substation\\09- Photos\\Final\\heic'; // Source directory containing HEIC files
  const sourceDirectory = 'C:\\heic test images';
  const destinationDirectory = './converted_images'; // Destination directory to save converted JPEG images

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destinationDirectory)) {
    fs.mkdirSync(destinationDirectory);
  }

  const files = await promisify(fs.readdir)(sourceDirectory); // Get list of files in the source directory

  for (let file of files) {
    const sourceFilePath = path.join(sourceDirectory, file); // Full path to the source HEIC file

    // Check if the file is a HEIC file
    if (path.extname(file).toLowerCase() === '.heic') {
      const inputBuffer = await promisify(fs.readFile)(sourceFilePath); // Read the HEIC file

      // Convert the HEIC image to JPEG
      const images = await convert.all({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG'       // output format
      });

      // Write each converted image to a JPEG file
      for (let idx in images) {
        const image = images[idx];
        const outputBuffer = await image.convert();
        await promisify(fs.writeFile)(path.join(destinationDirectory, `result-${file}-${idx}.jpg`), outputBuffer);
      }

      // Copy the original HEIC file to the destination directory
      fs.copyFileSync(sourceFilePath, path.join(destinationDirectory, file));
    }
  }
})();
