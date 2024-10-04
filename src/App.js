import React, { useState } from 'react';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import htmlReactParser from 'html-react-parser';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

function App() {
  const [pdfContent, setPdfContent] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files;
    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await getDocument({ data: typedArray }).promise;
        let content = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          const imgData = canvas.toDataURL();
          content += `<img src="${imgData}" alt="Page ${i}" />`;
          textContent.items.forEach((item) => {
            content += item.str + ' ';
          });
        }
        console.log("Extracted Content:", content); // Debugging log
        setPdfContent(content);
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("The selected file is not a Blob.");
    }
  };

  return (
    <div className="App">
      <h1>PDF to Responsive Webpage</h1>
      <input type="file" onChange={handleFileChange} />
      <div className="pdf-content">
        {htmlReactParser(pdfContent)}
      </div>
    </div>
  );
}

export default App;
