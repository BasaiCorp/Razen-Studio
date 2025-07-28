// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const copyBtn = document.getElementById('copy-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const cursorPosition = document.getElementById('cursor-position');
    const autocompleteSuggestions = document.getElementById('autocomplete-suggestions');
    const tabBtn = document.getElementById('tab-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const bracketBtn = document.getElementById('bracket-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchPopup = document.getElementById('search-popup');
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    const findNextBtn = document.getElementById('find-next-btn');
    const replaceBtn = document.getElementById('replace-btn');
    const replaceAllBtn = document.getElementById('replace-all-btn');
    const searchCancelBtn = document.getElementById('search-cancel-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const newFileBtn = document.getElementById('new-file-btn');
    const fileList = document.getElementById('file-list');
    const activeFilesContainer = document.getElementById('active-files');
    const customPopup = document.getElementById('custom-popup');
    const popupMessage = document.getElementById('popup-message');
    const popupConfirm = document.getElementById('popup-confirm');
    const popupCancel = document.getElementById('popup-cancel');
    const filenamePopup = document.getElementById('filename-popup');
    const filenameInput = document.getElementById('filename-input');
    const filenameConfirm = document.getElementById('filename-confirm');
    const filenameCancel = document.getElementById('filename-cancel');

    // State
    let files = {};
    let activeFileId = null;
    let fileCounter = 1;
    let editor;

    // Event Listeners
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    newFileBtn.addEventListener('click', () => {
        showFilenamePopup();
    });
    
    copyBtn.addEventListener('click', copyCode);
    themeToggle.addEventListener('click', toggleTheme);

    function copyCode() {
        if (editor) {
            navigator.clipboard.writeText(editor.getValue())
                .then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        }
    }
    
    function toggleTheme() {
        const isLightTheme = document.body.classList.toggle('light-theme');
        const newTheme = isLightTheme ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', newTheme);

        if (editor) {
            monaco.editor.setTheme(isLightTheme ? 'razen-light' : 'razen-dark');
        }

        // Update button text and icon based on the new theme
        if (themeToggle) {
            themeToggle.innerHTML = isLightTheme
                ? '<i class="fas fa-sun"></i> Light'
                : '<i class="fas fa-moon"></i> Dark';
        }
    }

    function showFilenamePopup() {
        filenamePopup.style.display = 'flex';
        filenameInput.focus();
    }

    function hideFilenamePopup() {
        filenamePopup.style.display = 'none';
        filenameInput.value = '';
    }

    function createNewFile() {
        if (Object.keys(files).length >= 10) {
            alert("Maximum number of files reached.");
            return;
        }

        let fileName = filenameInput.value;
        if (!fileName) {
            return;
        }
        if (!fileName.includes('.')) {
            fileName += ".rzn";
        }

        const fileId = `file-${fileCounter}`;
        files[fileId] = { id: fileId, name: fileName, content: '' };
        fileCounter++;

        renderFileList();
        setActiveFile(fileId);
        hideFilenamePopup();
    }

    filenameConfirm.addEventListener('click', createNewFile);
    filenameCancel.addEventListener('click', hideFilenamePopup);

    function renderFileList() {
        fileList.innerHTML = '';
        for (const fileId in files) {
            const file = files[fileId];
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileId = file.id;
            fileItem.textContent = file.name;

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showPopup(`Are you sure you want to close ${file.name}?`, () => closeFile(file.id));
            });

            fileItem.appendChild(closeBtn);
            fileItem.addEventListener('click', () => setActiveFile(file.id));
            fileList.appendChild(fileItem);
        }
    }

    function renderActiveFiles() {
        activeFilesContainer.innerHTML = '';
        if (Object.keys(files).length === 0) {
            activeFilesContainer.classList.add('empty');
        } else {
            activeFilesContainer.classList.remove('empty');
        }

        for (const fileId in files) {
            const file = files[fileId];
            const activeFileDiv = document.createElement('div');
            activeFileDiv.className = `active-file ${file.id === activeFileId ? 'active' : ''}`;
            activeFileDiv.dataset.fileId = file.id;
            activeFileDiv.textContent = file.name;

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showPopup(`Are you sure you want to close ${file.name}?`, () => closeFile(file.id));
            });

            activeFileDiv.appendChild(closeBtn);
            activeFileDiv.addEventListener('click', () => setActiveFile(file.id));
            activeFilesContainer.appendChild(activeFileDiv);
        }
    }

    function setActiveFile(fileId) {
        if (!files[fileId]) return;

        activeFileId = fileId;
        editor.setValue(files[fileId].content);
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, detectLanguageFromExtension(files[fileId].name));
        renderActiveFiles();
        editor.focus();
    }

    function closeFile(fileId) {
        delete files[fileId];
        if (activeFileId === fileId) {
            activeFileId = Object.keys(files)[0] || null;
            if (activeFileId) {
                setActiveFile(activeFileId);
            } else {
                editor.setValue('');
            }
        }
        renderFileList();
        renderActiveFiles();
    }

    function showPopup(message, onConfirm) {
        popupMessage.textContent = message;
        customPopup.style.display = 'flex';

        popupConfirm.onclick = () => {
            onConfirm();
            customPopup.style.display = 'none';
        };

        popupCancel.onclick = () => {
            customPopup.style.display = 'none';
        };
    }

    function detectLanguageFromExtension(fileName) {
        const ext = fileName.split('.').pop();
        const languages = {
            'js': 'javascript',
            'py': 'python',
            'rzn': 'razor',
            'html': 'html',
            'css': 'css',
            'ts': 'typescript',
            'java': 'java',
            'cs': 'csharp',
            'cpp': 'cpp',
            'go': 'go',
            'php': 'php',
            'rb': 'ruby',
            'rs': 'rust',
            'sql': 'sql',
            'swift': 'swift',
            'kt': 'kotlin',
            'lua': 'lua',
            'pl': 'perl',
            'sh': 'shell',
            'bat': 'bat',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'md': 'markdown',
        };
        return languages[ext] || 'plaintext';
    }

    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        monaco.languages.register({ id: 'razor' });

        monaco.languages.setMonarchTokensProvider('razor', {
            tokenizer: {
                root: [
                    [/".*?"/, "string"],
                    [/\b\d+\b/, "number"],
                    [/\b(if|else|for|while|return)\b/, "keyword"],
                    [/#.*/, "comment"],
                ]
            }
        });

        monaco.editor.defineTheme('razen-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '608b4e', fontStyle: 'italic' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': '#1e1e2e',
            }
        });

        monaco.editor.defineTheme('razen-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
                { token: 'string', foreground: '032f62' },
                { token: 'number', foreground: '005cc5' },
                { token: 'keyword', foreground: 'd73a49', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': '#ffffff',
            }
        });

        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '',
            language: 'plaintext',
            theme: document.body.classList.contains('light-theme') ? 'razen-light' : 'razen-dark',
            fontFamily: 'JetBrains Mono',
            automaticLayout: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            suggestOnTriggerCharacters: true,
            wordWrap: 'on',
            folding: true,
            bracketPairColorization: {
                enabled: true
            },
            'semanticHighlighting.enabled': true,
        });

        editor.onDidChangeModelContent(() => {
            if (activeFileId) {
                files[activeFileId].content = editor.getValue();
            }
        });
    });
});