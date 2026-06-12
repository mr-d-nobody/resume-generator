import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportTemplates() {
  // Ensure the exports directory exists
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }

  // Ensure dev server is running before executing this
  console.log('Ensure your Vite dev server is running on http://localhost:5173');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // We'll export templates 1 to 15
  const templatesToExport = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  for (const id of templatesToExport) {
    try {
      console.log(`Exporting Template ${id}...`);
      await page.goto(`http://localhost:5173/view-template/${id}`, { waitUntil: 'networkidle2' });
      
      // Wait extra time for React to render and Tailwind classes to apply
      await new Promise(r => setTimeout(r, 1500));
      
      const pdfPath = path.join(exportsDir, `template-${id}.pdf`);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      });

      console.log(`Successfully exported Template ${id} to ${pdfPath}`);
      
      // Also grab a screenshot for preview
      const previewPath = path.join(exportsDir, `template-${id}-preview.jpg`);
      await page.screenshot({
        path: previewPath,
        type: 'jpeg',
        quality: 80,
        fullPage: true
      });
      
    } catch (err) {
      console.error(`Failed to export Template ${id}:`, err);
    }
  }

  await browser.close();
  console.log('Export complete.');
}

exportTemplates();
