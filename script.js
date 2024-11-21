document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const convertBtn = document.getElementById('convert-btn');
    const pdfDownload = document.getElementById('pdf-download');
    const downloadLink = document.getElementById('download-link');

    let uploadedImages = [];

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', convertToPdf);

    function handleDrop(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        uploadedImages = [...uploadedImages, ...Array.from(files)];
        updateImagePreview();
    }

    function updateImagePreview() {
        imagePreview.innerHTML = '';
        uploadedImages.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            imagePreview.appendChild(img);
        });
        convertBtn.style.display = uploadedImages.length > 0 ? 'inline-block' : 'none';
    }

    function convertToPdf() {
        if (uploadedImages.length === 0) return;

        const pdf = new jspdf.jsPDF();
        
        uploadedImages.forEach((file, index) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (img.height * imgWidth) / img.width;
                
                if (index > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                
                if (index === uploadedImages.length - 1) {
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    downloadLink.href = pdfUrl;
                    pdfDownload.style.display = 'block';
                }
            };
        });
    }
});

