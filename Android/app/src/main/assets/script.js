// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const copyBtn = document.getElementById('copy-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const cursorPosition = document.getElementById('cursor-position');
    const languageIndicator = document.getElementById('language-indicator');
    const tabBtn = document.getElementById('tab-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const bracketBtn = document.getElementById('bracket-btn');
    const searchBtn = document.getElementById('search-btn');
    const cursorUpBtn = document.getElementById('cursor-up-btn');
    const cursorDownBtn = document.getElementById('cursor-down-btn');
    const cursorLeftBtn = document.getElementById('cursor-left-btn');
    const cursorRightBtn = document.getElementById('cursor-right-btn');
    const selectBtn = document.getElementById('select-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const fileListContainer = document.getElementById('file-list');
    const customPopup = document.getElementById('custom-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const popupConfirm = document.getElementById('popup-confirm');
    const popupCancel = document.getElementById('popup-cancel');
    const runBtn = document.getElementById('run-btn');
    const previewModal = document.getElementById('preview-modal');
    const previewIframe = document.getElementById('preview-iframe');
    const previewModalCloseBtn = document.getElementById('preview-modal-close-btn');

    // State
    let editor;
    let currentProject = null;
    let activeFilePath = null;
    const fs = window.FileSystem;
    let contextMenuTarget = null; // To keep track of the context menu target
    let clipboard = null; // To hold {path, type, operation: 'copy' | 'cut'}

    // --- Project Loading ---
    async function loadProjectFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectName = urlParams.get('project');

        if (!projectName) {
            // If no project is specified in the URL, redirect to the dashboard.
            window.location.href = 'dashboard.html';
            return;
        }

        currentProject = projectName;

        if (fs) {
            document.querySelector('header h1').innerHTML = `<i class="fas fa-folder-open"></i> ${projectName}`;
            refreshFileTree(); // Initial load
            const fileTree = await fs.listProjectContents(projectName);
            const firstFile = findDefaultFile(fileTree);
            if (firstFile) {
                openFile(firstFile.path);
            }
        } else {
            fileListContainer.innerHTML = '<p style="padding: 10px;">FileSystem API not available.</p>';
        }
    }

    async function refreshFileTree() {
        if (currentProject && fs) {
            const fileTree = await fs.listProjectContents(currentProject);
            renderFileTree(fileTree, fileListContainer);
        }
    }
    
    function findDefaultFile(nodes) {
        for (const node of nodes) {
            if (node.type === 'file' && (node.name === 'index.html' || node.name === 'main.js')) {
                return node;
            }
            if (node.type === 'folder' && node.children) {
                const found = findDefaultFile(node.children);
                if (found) return found;
            }
        }
        return null;
    }


    // --- File Tree Rendering ---
    function renderFileTree(nodes, container) {
        const tree = container.tagName === 'UL' ? container : document.createElement('ul');
        if (container.tagName !== 'UL') {
            tree.className = 'file-tree';
            container.innerHTML = '';
        }

        nodes.forEach(node => {
            const li = document.createElement('li');
            li.className = 'file-tree-item-container';

            const itemButton = document.createElement('button');
            itemButton.className = 'file-tree-item';
            itemButton.dataset.path = node.path;
            itemButton.dataset.type = node.type;

            // Create a wrapper for the left-side content (icon and name)
            const leftGroup = document.createElement('div');
            leftGroup.style.display = 'flex';
            leftGroup.style.alignItems = 'center';
            leftGroup.style.gap = '8px'; // Consistent spacing
            leftGroup.style.overflow = 'hidden'; // For long text
            leftGroup.style.textOverflow = 'ellipsis';

            let caretIcon;
            if (node.type === 'folder') {
                caretIcon = document.createElement('i');
                caretIcon.className = 'fas fa-chevron-right folder-caret';
                // Remove individual margin as gap is used now
                leftGroup.appendChild(caretIcon);

                const folderIcon = document.createElement('i');
                folderIcon.className = 'fas fa-folder folder-icon';
                leftGroup.appendChild(folderIcon);

                itemButton.addEventListener('click', () => toggleFolder(li, caretIcon));
            } else {
                // Keep alignment with a placeholder
                const placeholder = document.createElement('i');
                placeholder.className = 'fas fa-chevron-right folder-caret'; // Match folder caret for alignment
                placeholder.style.visibility = 'hidden';
                leftGroup.appendChild(placeholder);

                const fileIcon = document.createElement('i');
                const iconInfo = getFileIcon(node.name);
                fileIcon.className = `${iconInfo.icon} file-icon ${iconInfo.colorClass}`;
                fileIcon.title = iconInfo.tooltip; // Add title attribute for accessibility
                leftGroup.appendChild(fileIcon);

                itemButton.addEventListener('click', () => openFile(node.path));
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = node.name;
            leftGroup.appendChild(nameSpan);

            itemButton.appendChild(leftGroup);

            const moreBtn = document.createElement('button');
            moreBtn.className = 'file-options-btn';
            moreBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the file from being opened
                showContextMenu(e, node.path, node.type);
            });

            itemButton.appendChild(moreBtn);

            li.appendChild(itemButton);

            if (node.type === 'folder' && node.children && node.children.length > 0) {
                const childrenContainer = document.createElement('ul');
                li.appendChild(childrenContainer);
                renderFileTree(node.children, childrenContainer);
            }

            tree.appendChild(li);
        });

        if (container.tagName !== 'UL') {
            container.appendChild(tree);
        }
    }

    function toggleFolder(li_container, caret_icon) {
        li_container.classList.toggle('open');
        caret_icon.classList.toggle('open');
    }

    const fileIconMap = {
        // Programming Languages
        js: { icon: 'fab fa-js-square', colorClass: 'icon-js', tooltip: 'JavaScript' },
        ts: { icon: 'fas fa-file-code', colorClass: 'icon-ts', tooltip: 'TypeScript' },
        py: { icon: 'fab fa-python', colorClass: 'icon-py', tooltip: 'Python' },
        java: { icon: 'fab fa-java', colorClass: 'icon-java', tooltip: 'Java' },
        cs: { icon: 'fas fa-file-code', colorClass: 'icon-cs', tooltip: 'C#' },
        cpp: { icon: 'fas fa-file-code', colorClass: 'icon-cpp', tooltip: 'C++' },
        c: { icon: 'fas fa-file-code', colorClass: 'icon-c', tooltip: 'C' },
        html: { icon: 'fab fa-html5', colorClass: 'icon-html', tooltip: 'HTML' },
        css: { icon: 'fab fa-css3-alt', colorClass: 'icon-css', tooltip: 'CSS' },
        scss: { icon: 'fab fa-sass', colorClass: 'icon-scss', tooltip: 'SCSS' },
        sass: { icon: 'fab fa-sass', colorClass: 'icon-sass', tooltip: 'SASS' },
        php: { icon: 'fab fa-php', colorClass: 'icon-php', tooltip: 'PHP' },
        rb: { icon: 'fas fa-gem', colorClass: 'icon-rb', tooltip: 'Ruby' },
        go: { icon: 'fab fa-golang', colorClass: 'icon-go', tooltip: 'Go' },
        rs: { icon: 'fab fa-rust', colorClass: 'icon-rs', tooltip: 'Rust' },
        swift: { icon: 'fab fa-swift', colorClass: 'icon-swift', tooltip: 'Swift' },
        kt: { icon: 'fab fa-kickstarter-k', colorClass: 'icon-kt', tooltip: 'Kotlin' },
        dart: { icon: 'fab fa-dart', colorClass: 'icon-dart', tooltip: 'Dart' },
        r: { icon: 'fab fa-r-project', colorClass: 'icon-r', tooltip: 'R' },
        m: { icon: 'fas fa-file-code', colorClass: 'icon-m', tooltip: 'MATLAB/Objective-C' },
        pl: { icon: 'fas fa-file-code', colorClass: 'icon-pl', tooltip: 'Perl' },
        sh: { icon: 'fas fa-terminal', colorClass: 'icon-sh', tooltip: 'Shell Script' },
        ps1: { icon: 'fas fa-terminal', colorClass: 'icon-ps1', tooltip: 'PowerShell' },
        sql: { icon: 'fas fa-database', colorClass: 'icon-sql', tooltip: 'SQL' },
        vue: { icon: 'fab fa-vuejs', colorClass: 'icon-vue', tooltip: 'Vue' },
        jsx: { icon: 'fab fa-react', colorClass: 'icon-jsx', tooltip: 'React JSX' },
        tsx: { icon: 'fab fa-react', colorClass: 'icon-tsx', tooltip: 'React TSX' },
        svelte: { icon: 'fas fa-file-code', colorClass: 'icon-svelte', tooltip: 'Svelte' },
        lua: { icon: 'fas fa-file-code', colorClass: 'icon-lua', tooltip: 'Lua' },
        scala: { icon: 'fas fa-file-code', colorClass: 'icon-scala', tooltip: 'Scala' },
        hs: { icon: 'fas fa-file-code', colorClass: 'icon-hs', tooltip: 'Haskell' },
        clj: { icon: 'fas fa-file-code', colorClass: 'icon-clj', tooltip: 'Clojure' },
        ex: { icon: 'fas fa-file-code', colorClass: 'icon-ex', tooltip: 'Elixir' },
        erl: { icon: 'fas fa-file-code', colorClass: 'icon-erl', tooltip: 'Erlang' },
        fs: { icon: 'fas fa-file-code', colorClass: 'icon-fs', tooltip: 'F#' },
        vb: { icon: 'fas fa-file-code', colorClass: 'icon-vb', tooltip: 'Visual Basic' },
        asm: { icon: 'fas fa-microchip', colorClass: 'icon-asm', tooltip: 'Assembly' },
        cob: { icon: 'fas fa-file-code', colorClass: 'icon-cob', tooltip: 'COBOL' },
        f90: { icon: 'fas fa-file-code', colorClass: 'icon-f90', tooltip: 'Fortran' },
        ada: { icon: 'fas fa-file-code', colorClass: 'icon-ada', tooltip: 'Ada' },
        pas: { icon: 'fas fa-file-code', colorClass: 'icon-pas', tooltip: 'Pascal' },
        rzn: { icon: 'fas fa-file-code', colorClass: 'icon-rzn', tooltip: 'Razen' },

        // Data & Config
        json: { icon: 'fas fa-file-alt', colorClass: 'icon-json', tooltip: 'JSON' },
        xml: { icon: 'fas fa-file-code', colorClass: 'icon-xml', tooltip: 'XML' },
        yml: { icon: 'fas fa-file-alt', colorClass: 'icon-yml', tooltip: 'YAML' },
        yaml: { icon: 'fas fa-file-alt', colorClass: 'icon-yaml', tooltip: 'YAML' },
        md: { icon: 'fab fa-markdown', colorClass: 'icon-md', tooltip: 'Markdown' },
        config: { icon: 'fas fa-cog', colorClass: 'icon-config', tooltip: 'Config' },
        ini: { icon: 'fas fa-cog', colorClass: 'icon-ini', tooltip: 'INI' },
        env: { icon: 'fas fa-cog', colorClass: 'icon-env', tooltip: 'Environment' },

        // Documents & Images
        pdf: { icon: 'fas fa-file-pdf', colorClass: 'icon-pdf', tooltip: 'PDF' },
        doc: { icon: 'fas fa-file-word', colorClass: 'icon-doc', tooltip: 'Word Document' },
        docx: { icon: 'fas fa-file-word', colorClass: 'icon-docx', tooltip: 'Word Document' },
        txt: { icon: 'fas fa-file-alt', colorClass: 'icon-txt', tooltip: 'Text File' },
        png: { icon: 'fas fa-file-image', colorClass: 'icon-png', tooltip: 'PNG Image' },
        jpg: { icon: 'fas fa-file-image', colorClass: 'icon-jpg', tooltip: 'JPEG Image' },
        jpeg: { icon: 'fas fa-file-image', colorClass: 'icon-jpeg', tooltip: 'JPEG Image' },
        svg: { icon: 'fas fa-file-image', colorClass: 'icon-svg', tooltip: 'SVG Image' },

        // Archives & Other
        zip: { icon: 'fas fa-file-archive', colorClass: 'icon-zip', tooltip: 'ZIP Archive' },
        tar: { icon: 'fas fa-file-archive', colorClass: 'icon-tar', tooltip: 'TAR Archive' },
        gz: { icon: 'fas fa-file-archive', colorClass: 'icon-gz', tooltip: 'Gzip Archive' },
        db: { icon: 'fas fa-database', colorClass: 'icon-db', tooltip: 'Database' },
        sqlite: { icon: 'fas fa-database', colorClass: 'icon-sqlite', tooltip: 'SQLite DB' },
        lock: { icon: 'fas fa-lock', colorClass: 'icon-lock', tooltip: 'Lock File' },
        log: { icon: 'fas fa-file-alt', colorClass: 'icon-log', tooltip: 'Log File' },
    };

    function getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        // Handle special cases like 'README.md'
        if (filename.toLowerCase() === 'readme.md') {
            return { icon: 'fas fa-book-open', colorClass: 'icon-readme', tooltip: 'README' };
        }
        if (filename.toLowerCase() === 'license') {
            return { icon: 'fas fa-id-badge', colorClass: 'icon-license', tooltip: 'License' };
        }
        return fileIconMap[extension] || { icon: 'fas fa-file-alt', colorClass: 'icon-default', tooltip: 'File' };
    }


    // --- File Operations ---
    async function openFile(filePath) {
        if (!currentProject) return;

        const projectRootPath = (await fs.listProjects()).find(p => p.name === currentProject).path;
        const relativePath = filePath.replace(projectRootPath + '/', '');

        const content = await fs.readFile(currentProject, relativePath);
        if (typeof content === 'string' && !content.startsWith('Error:')) {
            editor.setValue(content);
            const languageId = detectLanguageFromExtension(filePath);
            monaco.editor.setModelLanguage(editor.getModel(), languageId);
            languageIndicator.textContent = getLanguageName(languageId);

            updateActiveFileUI(filePath);
            activeFilePath = filePath;
        } else {
            showPopup('Error', `Could not open file: ${content}`, { showCancel: false });
        }
    }

    function updateActiveFileUI(filePath) {
        document.querySelectorAll('.file-tree-item').forEach(item => {
            item.classList.toggle('active', item.dataset.path === filePath);
        });
    }


    // --- Editor and UI Setup ---
    function addToolbarButtonListener(button, action) {
        if (button) {
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (editor) {
                    action(editor);
                    editor.focus();
                }
            });
        }
    }

    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    document.getElementById('new-file-btn').addEventListener('click', () => createNewItem('file'));
    document.getElementById('new-folder-btn').addEventListener('click', () => createNewItem('folder'));
    document.getElementById('import-files-btn').addEventListener('click', async () => {
        // A simple alert for now, as full implementation is complex
        showPopup('Not Implemented', 'File import is not yet available.', { showCancel: false });
    });

    async function createNewItem(type) {
        const promptMessage = type === 'file' ? 'Enter new filename:' : 'Enter new folder name:';
        const itemName = await showInputPopup(promptMessage);

        if (itemName) {
            // For now, creating at the root. A more advanced implementation
            // could create relative to a selected folder.
            const result = type === 'file'
                ? await fs.createFile(currentProject, itemName)
                : await fs.createFolder(currentProject, itemName);

            if (result.success) {
                refreshFileTree();
            } else {
                showPopup('Error', `Could not create ${type}: ${result.message}`, { showCancel: false });
            }
        }
    }

    function showInputPopup(message) {
        // This reuses the existing filename-popup from index.html
        const popup = document.getElementById('filename-popup');
        const input = document.getElementById('filename-input');
        const confirmBtn = document.getElementById('filename-confirm');
        const cancelBtn = document.getElementById('filename-cancel');

        document.getElementById('filename-popup').querySelector('p').textContent = message;
        input.value = '';
        popup.style.display = 'flex';
        input.focus();

        return new Promise((resolve) => {
            confirmBtn.onclick = () => {
                popup.style.display = 'none';
                resolve(input.value.trim());
            };
            cancelBtn.onclick = () => {
                popup.style.display = 'none';
                resolve(null);
            };
            input.onkeydown = (e) => {
                if (e.key === 'Enter') confirmBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };
        });
    }


    addToolbarButtonListener(copyBtn, (editor) => navigator.clipboard.writeText(editor.getValue()));
    addToolbarButtonListener(undoBtn, (editor) => editor.trigger('toolbar', 'undo'));
    addToolbarButtonListener(redoBtn, (editor) => editor.trigger('toolbar', 'redo'));
    addToolbarButtonListener(tabBtn, (editor) => editor.executeEdits('toolbar', [{ range: editor.getSelection(), text: '  ', forceMoveMarkers: true }]));
    addToolbarButtonListener(bracketBtn, (editor) => editor.getContribution('snippetController2')?.insert('($0)'));
    addToolbarButtonListener(searchBtn, (editor) => editor.getAction('editor.action.startFindReplaceAction').run());

    // Arrow buttons
    addToolbarButtonListener(cursorUpBtn, (editor) => editor.trigger('toolbar', 'cursorUp', null));
    addToolbarButtonListener(cursorDownBtn, (editor) => editor.trigger('toolbar', 'cursorDown', null));
    addToolbarButtonListener(cursorLeftBtn, (editor) => editor.trigger('toolbar', 'cursorLeft', null));
    addToolbarButtonListener(cursorRightBtn, (editor) => editor.trigger('toolbar', 'cursorRight', null));

    // Select buttons
    addToolbarButtonListener(selectBtn, (editor) => editor.getAction('editor.action.smartSelect.expand').run());
    addToolbarButtonListener(selectAllBtn, (editor) => editor.getAction('editor.action.selectAll').run());

    themeToggle.addEventListener('click', toggleTheme);
    function toggleTheme() {
        const isLightTheme = document.body.classList.toggle('light-theme');
        const newTheme = isLightTheme ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', newTheme);
        monaco.editor.setTheme(isLightTheme ? 'razen-light' : 'razen-dark');
    }

    runBtn.addEventListener('click', runCode);
    previewModalCloseBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
        previewIframe.srcdoc = '';
    });

    async function runCode() {
        if (!currentProject) {
            showPopup('Error', 'No project is currently open.', { showCancel: false });
            return;
        }

        // Fallback to index.html if no file is active or the active one isn't HTML
        let entryHtmlRelativePath;
        if (activeFilePath && activeFilePath.toLowerCase().endsWith('.html')) {
            const projectRootPath = (await fs.listProjects()).find(p => p.name === currentProject).path;
            entryHtmlRelativePath = activeFilePath.replace(projectRootPath + '/', '');
        } else {
            // Check if index.html exists at the root
            const projectContents = await fs.listProjectContents(currentProject);
            const indexFile = projectContents.find(f => f.name === 'index.html' && f.type === 'file');
            if (indexFile) {
                const projectRootPath = (await fs.listProjects()).find(p => p.name === currentProject).path;
                entryHtmlRelativePath = indexFile.path.replace(projectRootPath + '/', '');
            } else {
                showPopup('Error', 'Could not find an HTML file to preview. Please open an HTML file or create an index.html.', { showCancel: false });
                return;
            }
        }

        try {
            const entryHtmlContent = await fs.readFile(currentProject, entryHtmlRelativePath);
            if (typeof entryHtmlContent !== 'string' || entryHtmlContent.startsWith('Error:')) {
                showPopup('Error', `Could not read the HTML file: ${entryHtmlContent}`, { showCancel: false });
                return;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(entryHtmlContent, 'text/html');
            const basePath = entryHtmlRelativePath.includes('/') ? entryHtmlRelativePath.substring(0, entryHtmlRelativePath.lastIndexOf('/') + 1) : '';

            const processPromises = [];

            // Process CSS <link> tags
            doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http:') && !href.startsWith('https:') && !href.startsWith('//')) {
                    const cssPath = new URL(href, `file:///${basePath}`).pathname.substring(1);
                    const promise = fs.readFile(currentProject, cssPath).then(cssContent => {
                        if (typeof cssContent === 'string' && !cssContent.startsWith('Error:')) {
                            const style = doc.createElement('style');
                            style.textContent = cssContent;
                            link.replaceWith(style);
                        } else {
                            console.warn(`Could not load CSS file: ${cssPath}`);
                        }
                    });
                    processPromises.push(promise);
                }
            });

            // Process <script> tags with src
            doc.querySelectorAll('script[src]').forEach(script => {
                const src = script.getAttribute('src');
                if (src && !src.startsWith('http:') && !src.startsWith('https:') && !src.startsWith('//')) {
                    const jsPath = new URL(src, `file:///${basePath}`).pathname.substring(1);
                    const promise = fs.readFile(currentProject, jsPath).then(jsContent => {
                        if (typeof jsContent === 'string' && !jsContent.startsWith('Error:')) {
                            const newScript = doc.createElement('script');
                            newScript.textContent = jsContent;
                            // Copy other attributes like type, defer, etc.
                            for (const attr of script.attributes) {
                                if (attr.name !== 'src') {
                                    newScript.setAttribute(attr.name, attr.value);
                                }
                            }
                            script.parentNode.replaceChild(newScript, script);
                        } else {
                            console.warn(`Could not load JS file: ${jsPath}`);
                        }
                    });
                    processPromises.push(promise);
                }
            });

            await Promise.all(processPromises);

            // Serialize the document back to a string, ensuring correct doctype
            const finalHtml = '<!DOCTYPE html>' + doc.documentElement.outerHTML;

            previewIframe.srcdoc = finalHtml;
            previewModal.style.display = 'flex';

        } catch (error) {
            console.error("Error during code preview generation:", error);
            showPopup('Preview Error', `An unexpected error occurred: ${error.message}`, { showCancel: false });
        }
    }


    // --- Popups ---
    function showPopup(title, message, options = {}) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;

        const isAlert = options.showCancel === false;

        popupConfirm.style.display = 'inline-block';
        popupCancel.style.display = isAlert ? 'none' : 'inline-block';

        customPopup.style.display = 'flex';
        return new Promise((resolve) => {
            popupConfirm.onclick = () => { customPopup.style.display = 'none'; resolve(true); };
            popupCancel.onclick = () => { customPopup.style.display = 'none'; resolve(false); };
        });
    }

    // --- Language Detection ---
    function detectLanguageFromExtension(fileName) {
        const ext = fileName.split('.').pop();
        const languages = {
            'js': 'javascript', 'py': 'python', 'html': 'html', 'css': 'css', 'json': 'json',
            'ts': 'typescript', 'java': 'java', 'cs': 'csharp', 'cpp': 'cpp', 'go': 'go',
            'php': 'php', 'rb': 'ruby', 'rs': 'rust', 'sql': 'sql', 'swift': 'swift',
            'kt': 'kotlin', 'lua': 'lua', 'pl': 'perl', 'sh': 'shell', 'md': 'markdown',
            'rzn': 'razen',
        };
        return languages[ext] || 'plaintext';
    }

    function getLanguageName(languageId) {
        const names = {
            'javascript': 'JavaScript', 'python': 'Python', 'html': 'HTML', 'css': 'CSS',
            'typescript': 'TypeScript', 'java': 'Java', 'csharp': 'C#', 'cpp': 'C++',
            'go': 'Go', 'php': 'PHP', 'ruby': 'Ruby', 'rust': 'Rust', 'sql': 'SQL',
            'swift': 'Swift', 'kotlin': 'Kotlin', 'lua': 'Lua', 'perl': 'Perl',
            'shell': 'Shell', 'markdown': 'Markdown', 'plaintext': 'Plain Text',
            'razen': 'Razen'
        };
        return names[languageId] || languageId;
    }

    // --- Context Menu ---
    function showContextMenu(event, path, type) {
        const menu = document.getElementById('file-context-menu');
        contextMenuTarget = { path, type };

        // Enable/disable paste
        const pasteItem = document.getElementById('context-menu-paste');
        pasteItem.classList.toggle('disabled', !clipboard || type !== 'folder');

        // Enable/disable preview
        const previewItem = document.getElementById('context-menu-preview');
        previewItem.classList.toggle('disabled', !path.toLowerCase().endsWith('.html'));

        menu.style.display = 'block';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
    }

    function hideContextMenu() {
        document.getElementById('file-context-menu').style.display = 'none';
    }

    async function handleContextMenuAction(action) {
        hideContextMenu();
        if (!contextMenuTarget) return;

        const { path, type } = contextMenuTarget;
        const projectRootPath = (await fs.listProjects()).find(p => p.name === currentProject).path;
        const relativePath = path.replace(projectRootPath + '/', '');

        switch (action) {
            case 'copy':
                clipboard = { path, type, operation: 'copy' };
                break;

            case 'cut':
                clipboard = { path, type, operation: 'cut' };
                break;

            case 'paste':
                if (clipboard && type === 'folder') {
                    const destRelativePath = relativePath;
                    const srcRelativePath = clipboard.path.replace(projectRootPath + '/', '');

                    const result = clipboard.operation === 'cut'
                        ? await fs.rename(currentProject, srcRelativePath, `${destRelativePath}/${clipboard.path.split('/').pop()}`)
                        : await fs.copy(currentProject, srcRelativePath, destRelativePath);

                    if (result.success) {
                        if (clipboard.operation === 'cut') clipboard = null; // Clear after paste
                        refreshFileTree();
                    } else {
                        showPopup('Error', `Paste failed: ${result.message}`, { showCancel: false });
                    }
                }
                break;

            case 'rename':
                const newName = await showInputPopup(`Rename ${type}:`);
                if (newName) {
                    const result = await fs.rename(currentProject, relativePath, newName);
                    if (result.success) {
                        refreshFileTree();
                    } else {
                        showPopup('Error', `Rename failed: ${result.message}`, { showCancel: false });
                    }
                }
                break;

            case 'copy-path':
                navigator.clipboard.writeText(path).catch(err => console.error('Failed to copy path: ', err));
                break;

            case 'preview':
                if (path.toLowerCase().endsWith('.html')) {
                    runCode(path);
                }
                break;

            case 'download':
                showPopup('Not Implemented', 'Download is not yet available.', { showCancel: false });
                break;

            case 'delete':
                const confirm = await showPopup('Confirm Deletion', `Are you sure you want to delete this ${type}?`, { showCancel: true });
                if (confirm) {
                    const result = await fs.deletePath(currentProject, relativePath);
                    if (result.success) {
                        if (path === activeFilePath) {
                            editor.setValue(`// File deleted: ${relativePath}`);
                            activeFilePath = null;
                        }
                        refreshFileTree();
                    } else {
                        showPopup('Error', `Could not delete: ${result.message}`, { showCancel: false });
                    }
                }
                break;
        }
    }

    document.getElementById('context-menu-copy').addEventListener('click', () => handleContextMenuAction('copy'));
    document.getElementById('context-menu-cut').addEventListener('click', () => handleContextMenuAction('cut'));
    document.getElementById('context-menu-paste').addEventListener('click', (e) => {
        if (!e.target.classList.contains('disabled')) handleContextMenuAction('paste');
    });
    document.getElementById('context-menu-rename').addEventListener('click', () => handleContextMenuAction('rename'));
    document.getElementById('context-menu-copy-path').addEventListener('click', () => handleContextMenuAction('copy-path'));
    document.getElementById('context-menu-preview').addEventListener('click', (e) => {
        if (!e.target.classList.contains('disabled')) handleContextMenuAction('preview');
    });
    document.getElementById('context-menu-download').addEventListener('click', () => handleContextMenuAction('download'));
    document.getElementById('context-menu-delete').addEventListener('click', () => handleContextMenuAction('delete'));

    window.addEventListener('click', hideContextMenu);


    // --- Monaco Editor Initialization ---
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        // --- Razen Language Standard Library Definitions ---
        const razenStdLibs = {
            'array': ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'join', 'index_of', 'last_index_of', 'includes', 'reverse', 'sort', 'map', 'filter', 'reduce', 'every', 'some', 'find', 'find_index', 'fill', 'length'],
            'string': ['upper', 'lower', 'capitalize', 'substring', 'replace', 'replace_all', 'trim', 'trim_start', 'trim_end', 'starts_with', 'ends_with', 'includes', 'split', 'repeat', 'pad_start', 'pad_end', 'char_at', 'code_point_at', 'from_char_code', 'length'],
            'math': ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power', 'sqrt', 'abs', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'log', 'exp', 'min', 'max', 'clamp', 'lerp', 'random', 'random_int', 'random_float', 'mean', 'median', 'mode', 'variance', 'stddev'],
            'datetime': ['now', 'parse', 'format', 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond', 'weekday', 'weekday_name', 'is_leap_year', 'days_in_month', 'add_days', 'add_months', 'add_years', 'add_hours', 'add_minutes', 'add_seconds', 'diff_days', 'diff_months', 'diff_years', 'to_timestamp', 'from_timestamp'],
            'random': ['seed', 'int', 'float', 'choice', 'shuffle', 'sample', 'random', 'weighted_choice', 'uuid', 'gaussian', 'noise'],
            'filesystem': ['exists', 'is_file', 'is_dir', 'create_file', 'create_dir', 'remove', 'read_file', 'write_file', 'append_file', 'list_dir', 'copy_file', 'copy_dir', 'move_file', 'delete_file', 'delete_dir', 'absolute_path', 'relative_path', 'extension', 'file_stem', 'parent_dir', 'join_path', 'current_dir', 'change_dir', 'temp_file', 'temp_dir', 'metadata', 'read_json', 'write_json'],
            'json': ['parse', 'stringify', 'validate', 'minify', 'pretty_print'],
            'network': ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'fetch', 'download_file', 'upload_file', 'ping', 'resolve_dns', 'get_ip', 'url_encode', 'url_decode', 'build_query', 'parse_query', 'create_api', 'execute_api', 'parse_json', 'to_json', 'is_success', 'is_client_error', 'is_server_error', 'websocket_connect', 'websocket_send', 'websocket_receive', 'websocket_close', 'form_data', 'multipart_data'],
            'system': ['getpid', 'getcwd', 'execute', 'getenv', 'setenv', 'environ', 'args', 'path_exists', 'realpath', 'exit', 'sleep', 'hostname', 'username', 'uptime', 'os_type', 'os_release', 'cpu_count', 'memory_info', 'disk_usage', 'load_average', 'reboot', 'shutdown', 'suspend'],
            'process': ['create', 'wait', 'is_running', 'kill', 'signal', 'list', 'info', 'read_stdout', 'read_stderr', 'write_stdin', 'priority', 'suspend', 'resume'],
            'validation': ['email', 'phone', 'url', 'ip', 'required', 'min_length', 'max_length', 'between', 'regex', 'is_numeric', 'is_integer', 'is_float', 'is_boolean', 'is_date', 'is_json', 'is_uuid'],
            'regex': ['match', 'search', 'replace', 'split', 'findall', 'compile', 'groups'],
            'crypto': ['hash', 'hmac', 'encrypt', 'decrypt', 'generate_key', 'sign', 'verify', 'random_bytes', 'pbkdf2', 'base64_encode', 'base64_decode', 'md5', 'sha1', 'sha256', 'sha512'],
            'uuid': ['generate', 'parse', 'validate', 'v1', 'v4'],
            'color': ['hex_to_rgb', 'rgb_to_hex', 'lighten', 'darken', 'blend', 'contrast', 'get_ansi_color', 'rgba_to_hex', 'hex_to_rgba'],
            'image': ['load', 'save', 'resize', 'crop', 'rotate', 'flip', 'blur', 'sharpen', 'grayscale', 'invert', 'draw_text', 'draw_shape', 'add_watermark'],
            'audio': ['load', 'play', 'pause', 'stop', 'record', 'save', 'volume', 'balance', 'duration', 'trim', 'fade_in', 'fade_out'],
            'video': ['load', 'play', 'pause', 'stop', 'record', 'save', 'trim', 'resize', 'add_subtitles', 'extract_audio', 'screenshot'],
            'compression': ['zip', 'unzip', 'gzip', 'gunzip', 'tar', 'untar', 'compress', 'decompress'],
            'archive': ['create', 'extract', 'list', 'add_file', 'remove_file'],
            'logging': ['info', 'warn', 'error', 'debug', 'fatal', 'trace', 'set_level', 'get_level', 'add_handler', 'remove_handler', 'format', 'rotate'],
            'config': ['load', 'save', 'get', 'set', 'remove', 'list', 'validate', 'merge', 'default'],
            'cache': ['set', 'get', 'has', 'remove', 'clear', 'keys', 'size', 'ttl'],
            'database': ['connect', 'disconnect', 'execute', 'query', 'fetch_one', 'fetch_all', 'commit', 'rollback', 'begin_transaction', 'migrate', 'seed', 'close', 'escape', 'prepare'],
            'http': ['start', 'stop', 'route', 'listen', 'serve_static', 'send_response', 'set_header', 'get_header', 'parse_request', 'parse_body', 'middleware', 'redirect', 'status'],
            'html': ['parse', 'stringify', 'escape', 'unescape', 'select', 'query', 'add_class', 'remove_class', 'set_attr', 'get_attr', 'inner_html', 'outer_html'],
            'template': ['render', 'compile', 'include', 'escape', 'loop', 'if', 'else', 'set', 'get', 'partial'],
            'csv': ['parse', 'stringify', 'read', 'write', 'validate', 'headers', 'rows', 'columns'],
            'xml': ['parse', 'stringify', 'validate', 'get_attr', 'set_attr', 'find', 'find_all'],
            'yaml': ['parse', 'stringify', 'validate', 'merge', 'flatten'],
            'ini': ['parse', 'stringify', 'get', 'set', 'remove', 'sections'],
            'notification': ['send', 'schedule', 'cancel', 'list', 'history'],
            'email': ['send', 'receive', 'parse', 'validate', 'attach', 'list', 'delete'],
            'sms': ['send', 'receive', 'parse', 'validate', 'history'],
            'websocket': ['connect', 'send', 'receive', 'close', 'broadcast', 'on_open', 'on_message', 'on_close'],
            'event': ['on', 'off', 'once', 'emit', 'listeners', 'remove_all'],
            'queue': ['enqueue', 'dequeue', 'peek', 'is_empty', 'size', 'clear', 'list'],
            'stack': ['push', 'pop', 'peek', 'is_empty', 'size', 'clear', 'list'],
            'graph': ['add_node', 'remove_node', 'add_edge', 'remove_edge', 'neighbors', 'bfs', 'dfs', 'shortest_path', 'has_cycle'],
            'tree': ['add_node', 'remove_node', 'find', 'traverse', 'depth', 'height', 'is_leaf'],
            'geometry': ['distance', 'midpoint', 'area', 'perimeter', 'volume', 'angle', 'rotate', 'scale', 'translate', 'intersect', 'union', 'difference'],
            'seed': ['generate', 'map_seed', 'noise_map', 'perlin', 'simplex', 'name', 'pattern'],
            'box': ['put', 'get', 'has', 'remove', 'clear', 'is_box', 'size'],
            'conversion': ['to_string', 'to_int', 'to_float', 'to_bool', 'to_array', 'to_object', 'to_json', 'to_yaml', 'to_csv', 'to_xml'],
            'headstails': ['coin', 'bool_tos', 'flip', 'probability'],
            'os': ['platform', 'architecture', 'distro', 'kernel', 'release', 'uptime', 'hostname', 'user', 'cpu_info', 'memory_info', 'disk_info'],
            'bolt': ['run', 'parallel', 'threads', 'task', 'await', 'schedule'],
            'animation': ['start', 'stop', 'pause', 'resume', 'set_frame', 'get_frame', 'timeline', 'easing', 'loop', 'reverse'],
            'physics': ['apply_force', 'apply_torque', 'velocity', 'acceleration', 'mass', 'collision', 'gravity', 'friction', 'momentum', 'energy'],
            'ai': ['predict', 'train', 'evaluate', 'load_model', 'save_model', 'preprocess', 'tokenize', 'embed', 'classify', 'cluster', 'generate_text']
        };
        const stdLibNames = Object.keys(razenStdLibs);
        const stdLibFunctions = [].concat(...Object.values(razenStdLibs));

        // Register the Razen language
        monaco.languages.register({
            id: 'razen',
            extensions: ['.rzn'],
            aliases: ['Razen', 'razen'],
        });

        // Set language configuration for Razen
        monaco.languages.setLanguageConfiguration('razen', {
            comments: {
                lineComment: '#',
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '<', close: '>' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '<', close: '>' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
            ],
        });

        // Set tokenizer for Razen
        monaco.languages.setMonarchTokensProvider('razen', {
            keywords: [
                'var', 'const', 'if', 'else', 'while', 'for', 'is', 'when', 'not',
                'append', 'remove', 'key', 'value', 'store', 'box', 'ref', 'show',
                'read', 'fun', 'async', 'await', 'class', 'return', 'continue', 'break', 'import',
                'export', 'use', 'from', 'to', 'lib', 'true', 'false', 'null', 'struct', 'match'
            ],
            typeKeywords: [
                'num', 'str', 'bool', 'map', 'list', 'arr', 'obj', 'tuple'
            ],
            colorKeywords: [
                'cyan', 'red', 'yellow', 'green', 'blue', 'magenta', 'white',
                'light_cyan', 'light_red', 'light_yellow', 'light_green', 'light_blue', 'light_magenta', 'light_white'
            ],
            operators: [
                '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
                '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
                '->', '=>'
            ],
            stdLibNames: stdLibNames,
            stdLibFunctions: stdLibFunctions,
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

            tokenizer: {
                root: [
                    [/#.*$/, 'comment'],
                    [/[ \t\r\n]+/, ''],

                    // f-string
                    [/f"/, { token: 'string.prefix', next: '@f_string' }],

                    // Namespace highlighting (e.g., math::sqrt)
                    [/\b([a-zA-Z_]\w*)\b(?=::)/, {
                        cases: {
                            '@stdLibNames': 'entity.name.library', // Custom green for library name
                            '@default': 'identifier'
                        }
                    }],
                    [/::/, { token: 'metatag', next: '@library_function_call' }], // Yellow for ::

                    [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                    [/'[^\\']'/, 'string.char'],
                    [/(')(@escapes)(')/, ['string.char', 'string.escape', 'string.char']],
                    [/'/, 'string.invalid'],

                    // Keywords and identifiers
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            'use': { token: 'keyword', next: '@use_statement' },
                            'show': { token: 'keyword', next: '@show_arguments' },
                            'var': { token: 'keyword', next: '@variable_declaration' },
                            'const': { token: 'keyword', next: '@variable_declaration' },
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],

                    // Angle brackets for type annotations
                    [/</, { token: 'delimiter.angle', next: '@type_annotation' }],
                    [/>/, 'delimiter.angle'],

                    [/[{}()\[\]]/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': 'delimiter'
                        }
                    }],
                    [/[;,.]/, 'delimiter'],
                ],
                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                ],
                f_string: [
                    [/{/, { token: 'delimiter.curly', next: '@f_string_expression' }],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
                    [/[^"{]+/, 'string']
                ],
                f_string_expression: [
                    [/}/, { token: 'delimiter.curly', next: '@pop' }],
                    { include: 'root' }
                ],
                type_annotation: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@typeKeywords': 'type.identifier',
                            '@default': 'identifier'
                        }
                    }],
                    [/</, { token: 'delimiter.angle', next: '@type_annotation' }],
                    [/>/, { token: 'delimiter.angle', next: '@pop' }]
                ],
                show_arguments: [
                    [/\s*</, { token: 'delimiter.angle', next: '@show_annotation' }],
                    { include: 'root', next: '@pop' }
                ],
                show_annotation: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@colorKeywords': 'metatag',
                            '@default': 'identifier'
                        }
                    }],
                    [/>/, { token: 'delimiter.angle', next: '@pop' }]
                ],
                variable_declaration: [
                    [/\s*</, { token: 'delimiter.angle', next: '@type_annotation' }],
                    { include: 'root', next: '@pop' }
                ],
                use_statement: [
                    [/\s+/, ''],
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@stdLibNames': { token: 'entity.name.library', next: '@pop' },
                            '@default': {token: 'identifier', next: '@pop'}
                        }
                    }],
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string_lib_pop' }],
                    ['', '', '@pop']
                ],
                string_lib_pop: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                ],
                library_function_call: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@stdLibFunctions': { token: 'type.identifier', next: '@pop' },
                            '@default': { token: 'identifier', next: '@pop' }
                        }
                    }],
                    ['', '', '@pop']
                ]
            }
        });

        monaco.editor.defineTheme('razen-dark', {
            base: 'vs-dark', inherit: true,
            rules: [
                { token: 'comment', foreground: '608b4e' },
                { token: 'entity.name.library', foreground: '98C379' }
            ],
            colors: { 'editor.background': '#1e1e2e' }
        });
        monaco.editor.defineTheme('razen-light', {
            base: 'vs', inherit: true,
            rules: [{ token: 'comment', foreground: '6a737d' }],
            colors: { 'editor.background': '#ffffff' }
        });

        const savedFont = localStorage.getItem('editorFont') || 'Google Sans Code';

        editor = monaco.editor.create(document.getElementById('editor'), {
            value: `// Welcome to Razen Studio\n// Open a file from the sidebar to start editing.`,
            language: 'plaintext',
            theme: document.body.classList.contains('light-theme') ? 'razen-light' : 'razen-dark',
            fontFamily: savedFont,
            automaticLayout: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on',
            folding: true,
            bracketPairColorization: { enabled: true },
        });

        editor.onDidChangeModelContent(async () => {
            if (activeFilePath && currentProject) {
                const content = editor.getValue();
                const projectRootPath = (await fs.listProjects()).find(p => p.name === currentProject).path;
                const relativePath = activeFilePath.replace(projectRootPath + '/', '');
                fs.writeFile(currentProject, relativePath, content);
            }
        });

        editor.onDidChangeCursorPosition(e => {
            cursorPosition.textContent = `Line ${e.position.lineNumber}, Column ${e.position.column}`;
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'editorFont' && e.newValue && editor) {
                editor.updateOptions({ fontFamily: e.newValue });
            }
            if (e.key === 'theme' && e.newValue && editor) {
                const newTheme = e.newValue === 'light-theme' ? 'razen-light' : 'razen-dark';
                monaco.editor.setTheme(newTheme);
            }
        });

        loadProjectFromURL();
    });
});