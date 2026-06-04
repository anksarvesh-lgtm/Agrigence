const https = require('https');
const fs = require('fs');
https.get('https://kpnttmkkjq9kpa0f.public.blob.vercel-storage.com/settings/1778090902639-WhatsApp_Image_2026-04-05_at_21.20.18-removebg-preview.png', (res) => {
  res.pipe(fs.createWriteStream('./public/logo.png'));
});
