import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { jsPDF } from 'jspdf';

const ImageToPdfConverter: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pdfReady, setPdfReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []}
  });

  const convertToPdf = async () => {
    if (selectedFiles.length === 0) return;

    const pdf = new jsPDF();
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      const imgData = canvas.toDataURL('image/jpeg');
      
      if (i !== 0) {
        pdf.addPage();
      }
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save('converted-images.pdf');
    setPdfReady(true);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setPdfReady(false);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 min-h-screen transition-all duration-500">
      <header className="py-6 bg-white dark:bg-gray-900 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Chuyển đổi ảnh sang PDF
          </h1>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Chuyển đổi dễ dàng chỉ với vài bước!</h2>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div 
              {...getRootProps()} 
              className={`p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
                isDragActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            >
              <input {...getInputProps()} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500 mt-2">
                Kéo và thả các ảnh vào đây, hoặc <span className="text-blue-500 underline cursor-pointer">nhấp để chọn tệp</span>.
              </p>
            </div>
            <button 
              onClick={convertToPdf}
              disabled={selectedFiles.length === 0}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-teal-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              Chuyển đổi sang PDF
            </button>
          </div>
        </section>

        {selectedFiles.length > 0 && (
          <section id="image-preview" className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Hình ảnh đã tải lên:</h3>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <li key={index} className="relative group">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:shadow-lg" />
                  <button 
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <button 
              onClick={clearAllFiles}
              className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              Xóa tất cả
            </button>
          </section>
        )}

        {pdfReady && (
          <section id="pdf-download" className="text-center">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6 border border-green-200 dark:border-green-700 shadow-lg transition-all duration-300 hover:shadow-xl">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">PDF của bạn đã sẵn sàng!</h3>
              <a 
                href="#" 
                onClick={() => setPdfReady(false)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-400 text-white font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-teal-500 transition-all duration-300 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Tải xuống PDF
              </a>
            </div>
          </section>
        )}
      </main>

      <footer className="py-6 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 Chuyển đổi ảnh sang PDF. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ImageToPdfConverter;

