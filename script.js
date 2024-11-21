document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const convertBtn = document.getElementById('convert-btn');
    const pdfDownload = document.getElementById('pdf-download');
    const downloadLink = document.getElementById('download-link');

    let selectedFiles = [];

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        selectedFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        updateImagePreview();
    }

    function updateImagePreview() {
        imagePreview.innerHTML = '';
        selectedFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            imagePreview.appendChild(img);
        });
        convertBtn.style.display = selectedFiles.length > 0 ? 'inline-block' : 'none';
    }

    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        const pdf = new jspdf.jsPDF();
        let firstPage = true;

        for (const file of selectedFiles) {
            const img = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL('image/jpeg');
            if (!firstPage) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'JPEG', 10, 10, 190, 0);
            firstPage = false;
        }

        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        downloadLink.href = pdfUrl;
        pdfDownload.style.display = 'block';
    });
});

