document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const convertBtn = document.getElementById('convert-btn');
    const pdfDownload = document.getElementById('pdf-download');
    const downloadLink = document.getElementById('download-link');
    const themeToggle = document.getElementById('themeToggle');

    let uploadedImages = [];

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // File drop and selection functionality
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
        uploadedImages.forEach((file, index) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            imgContainer.appendChild(img);
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✕';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = () => removeFile(index);
            imgContainer.appendChild(removeBtn);
            
            imagePreview.appendChild(imgContainer);
        });
        convertBtn.style.display = uploadedImages.length > 0 ? 'inline-block' : 'none';
    }

    function removeFile(index) {
        uploadedImages.splice(index, 1);
        updateImagePreview();
    }

    function convertToPdf() {
        if (uploadedImages.length === 0) return;

        const pdf = new jspdf.jsPDF();
        
        let processedImages = 0;
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
                
                processedImages++;
                if (processedImages === uploadedImages.length) {
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    downloadLink.href = pdfUrl;
                    pdfDownload.style.display = 'block';
                }
            };
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

