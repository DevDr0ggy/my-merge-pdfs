// --- 1. DARK MODE LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Toggle button click event
themeToggleBtn.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    // Save preference to localStorage (Like saving a game state)
    if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// --- 2. STATE MANAGEMENT ---
let selectedFiles = [];
let actionToConfirm = null; 

// DOM Elements
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const fileListContainer = document.getElementById('file-list-container');
const fileList = document.getElementById('file-list');
const mergeBtn = document.getElementById('merge-btn');
const mergeSpinner = document.getElementById('merge-spinner');
const mergeBtnText = document.getElementById('merge-btn-text');
const totalSizeDisplay = document.getElementById('total-size-display');

// Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const cancelBtn = document.getElementById('cancel-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const alertModal = document.getElementById('alert-modal');
const alertMessage = document.getElementById('alert-message');
const alertOkBtn = document.getElementById('alert-ok-btn');

// Filename Elements
const radioDefault = document.getElementById('radio-default');
const radioCustom = document.getElementById('radio-custom');
const customNameContainer = document.getElementById('custom-name-container');
const customFilenameInput = document.getElementById('custom-filename');
const clearAllBtn = document.getElementById('clear-all-btn');

// --- 3. MATH: FORMATTING BYTES PRECISELY ---
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; // 1 KB = 1024 Bytes
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --- 4. MATH: CALCULATE TOTAL SIZE ---
// We sum the RAW bytes first for 100% precision, then convert.
function calculateTotalSize() {
    let totalBytes = 0;
    // Standard FOR loop, similar to C or Python
    for (let i = 0; i < selectedFiles.length; i++) {
        totalBytes += selectedFiles[i].size;
    }
    totalSizeDisplay.textContent = formatBytes(totalBytes);
}

// --- Filename UI Logic ---
radioDefault.addEventListener('change', () => {
    if (radioDefault.checked) {
        customNameContainer.classList.add('hidden');
        customFilenameInput.value = '';
    }
});

radioCustom.addEventListener('change', () => {
    if (radioCustom.checked) {
        customNameContainer.classList.remove('hidden');
        customFilenameInput.focus();
    }
});

// --- Alert UI Logic ---
function showCustomAlert(msg) {
    alertMessage.innerHTML = msg;
    alertModal.classList.remove('hidden');
}

alertOkBtn.addEventListener('click', () => {
    alertModal.classList.add('hidden');
});

// --- Drag & Drop & Input Logic ---
fileInput.addEventListener('change', (event) => {
    addFiles(Array.from(event.target.files));
    fileInput.value = ''; 
});

dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    addFiles(Array.from(event.dataTransfer.files).filter(file => file.type === 'application/pdf'));
});

function addFiles(newFiles) {
    newFiles.forEach(file => {
        if (file.type === 'application/pdf') {
            selectedFiles.push(file);
        } else {
            showCustomAlert(`Skipped / ข้ามไฟล์ <br><span class="font-semibold text-red-500">${file.name}</span><br>Not a PDF file`);
        }
    });
    updateFileListUI();
}

// --- Remove & Clear All Logic ---
clearAllBtn.addEventListener('click', () => { promptConfirmation('ALL'); });

function promptConfirmation(action) {
    actionToConfirm = action; 
    
    if (action === 'ALL') {
        confirmTitle.innerHTML = `Clear All Files<br><span class="text-sm font-normal text-gray-500 dark:text-gray-400">(ยืนยันการล้างข้อมูล)</span>`;
        confirmMessage.innerHTML = `Are you sure you want to remove all files?<br><span class="text-xs text-gray-500 dark:text-gray-400 mt-1 block">(ลบไฟล์ทั้งหมดออกจากรายการ?)</span>`;
        confirmDeleteBtn.textContent = "Clear All";
    } else {
        confirmTitle.innerHTML = `Confirm Removal<br><span class="text-sm font-normal text-gray-500 dark:text-gray-400">(ยืนยันการลบ)</span>`;
        confirmMessage.innerHTML = `Remove:<br><span class="font-semibold text-gray-900 dark:text-white mt-1 block">${selectedFiles[action].name}</span>`;
        confirmDeleteBtn.textContent = "Remove";
    }
    confirmModal.classList.remove('hidden');
}

cancelBtn.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    actionToConfirm = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (actionToConfirm !== null) {
        if (actionToConfirm === 'ALL') {
            selectedFiles = []; // Empty the array
        } else {
            selectedFiles.splice(actionToConfirm, 1); 
        }
        updateFileListUI();
        confirmModal.classList.add('hidden');
        actionToConfirm = null;
    }
});

// --- UI Updating ---
function updateFileListUI() {
    fileList.innerHTML = ''; 

    if (selectedFiles.length > 0) {
        fileListContainer.classList.remove('hidden');
        mergeBtn.disabled = selectedFiles.length < 2; 
    } else {
        fileListContainer.classList.add('hidden');
        mergeBtn.disabled = true;
    }

    selectedFiles.forEach((file, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', index);
        li.className = 'flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 p-3 rounded-xl text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm';
        
        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center overflow-hidden w-full';
        
        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mr-3 text-lg select-none flex-shrink-0';
        dragHandle.innerHTML = '&#9776;';

        const orderSpan = document.createElement('span');
        orderSpan.className = 'font-bold text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 w-4 text-center';
        orderSpan.textContent = index + 1;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-gray-700 dark:text-gray-200 truncate pr-2'; 
        nameSpan.innerHTML = `${file.name} <span class="text-gray-400 dark:text-gray-500 text-xs ml-1">(${formatBytes(file.size)})</span>`;

        leftDiv.appendChild(dragHandle);
        leftDiv.appendChild(orderSpan);
        leftDiv.appendChild(nameSpan);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex-shrink-0 text-xs sm:text-sm';
        removeBtn.textContent = 'Remove (ลบ)'; 
        removeBtn.onclick = () => promptConfirmation(index);

        li.appendChild(leftDiv);
        li.appendChild(removeBtn);
        fileList.appendChild(li);
    });

    // Recalculate total size every time UI updates
    calculateTotalSize();
}

// Initialize SortableJS
new Sortable(fileList, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function (evt) {
        const movedFile = selectedFiles.splice(evt.oldIndex, 1)[0]; 
        selectedFiles.splice(evt.newIndex, 0, movedFile);
        updateFileListUI();
    }
});

// --- Merging Process ---
mergeBtn.addEventListener('click', async () => {
    if (selectedFiles.length < 2) return;

    let finalFilename = "Merged_Document.pdf"; 

    if (radioCustom.checked) {
        let userInput = customFilenameInput.value.trim();
        if (userInput === "") {
            showCustomAlert("Please enter a custom filename.<br><span class='text-sm text-gray-500'>(กรุณาตั้งชื่อไฟล์ผลลัพธ์)</span>");
            return; 
        }
        if (!userInput.toLowerCase().endsWith('.pdf')) {
            userInput += '.pdf'; 
        }
        finalFilename = userInput; 
    }

    mergeBtn.disabled = true;
    mergeSpinner.classList.remove('hidden');
    mergeBtnText.textContent = "Merging... (กำลังประมวลผล)";
    
    try {
        await performPdfMerge(finalFilename);
    } catch (error) {
        console.error(error);
        showCustomAlert("An error occurred. Some files might be encrypted.<br><span class='text-sm text-gray-500'>(เกิดข้อผิดพลาด บางไฟล์อาจติดรหัสผ่าน)</span>");
    } finally {
        mergeBtn.disabled = false;
        mergeSpinner.classList.add('hidden');
        mergeBtnText.textContent = "Merge PDFs (รวมไฟล์)";
    }
});

// Core Merge Logic
async function performPdfMerge(filename) {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageIndices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        
        copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
        });
    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadFile(mergedPdfBytes, filename);
}

// Download Logic
function downloadFile(uint8Array, filename) {
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
} 
