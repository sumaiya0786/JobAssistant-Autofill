const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');
(async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400,400]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('John Doe Skills Java Python React SQL Docker Bachelor of Technology', {x:20,y:350,font,size:12});
  const bytes = await doc.save({ useObjectStreams: false });
  fs.writeFileSync(process.argv[2] || '/tmp/t4.pdf', bytes);
})();
