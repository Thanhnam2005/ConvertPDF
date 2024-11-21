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
    setPdfReady(false);
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
    setPdfReady(false);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setPdfReady(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 text-gray-800 dark:text-gray-200 transition-all duration-500 ${theme}`}>
      <header className="py-6 bg-white dark:bg-gray-900 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
            Chuyển đổi ảnh sang PDF chuyên nghiệp
          </h1>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 mb-4 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'bg-blue-50 dark:bg-blue-900/30 scale-105' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <input {...getInputProps()} />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">
              Kéo và thả các ảnh vào đây, hoặc nhấp để chọn tệp
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mb-4 animate-fadeIn">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">{selectedFiles.length} file(s) đã chọn</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index}`} 
                      className="w-full h-20 object-cover rounded-md transition-all duration-300 group-hover:opacity-75"
                    />
                    <button 
                      onClick={() => removeFile(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={convertToPdf}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  Chuyển đổi sang PDF
                </button>
                <button 
                  onClick={clearAllFiles}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-2 px-4 rounded hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
          {pdfReady && (
            <div className="text-center text-green-600 dark:text-green-400 animate-fadeInUp">
              <p className="mb-2 font-bold text-lg">PDF của bạn đã sẵn sàng!</p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setPdfReady(false); }}
                className="text-blue-500 hover:underline font-medium transition-all duration-300 hover:text-blue-600"
              >
                Tạo PDF mới
              </a>
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400">
        <p className="font-medium">© 2023 Chuyển đổi ảnh sang PDF chuyên nghiệp. Bảo lưu mọi quyền.</p>
      </footer>
    </div>
  );
};

export default ImageToPdfConverter;

