const fs = require('fs'); const [,, inF, outF] = process.argv; fs.writeFileSync(outF, Buffer.from(fs.readFileSync(inF, 'utf8').replace(/\s+/g, ''), 'base64')); console.log('Decoded to', outF);
