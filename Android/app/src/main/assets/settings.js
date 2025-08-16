// settings.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Settings Navigation Logic ---
    const navButtons = document.querySelectorAll('.settings-nav-btn'); // Use the specific class
    const contentContainer = document.getElementById('settings-content');
    const contentTemplates = document.getElementById('settings-data'); // Hidden div containing templates
    
    // Function to apply currently saved customisation settings to the UI
    function applyCustomisationSettings() {
        // --- Theme ---
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme');
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });

        // --- Font Dropdown ---
        const fontDropdown = document.getElementById('font-dropdown');
        if (fontDropdown) {
            const selectedFontName = document.getElementById('selected-font-name');
            const fontItems = fontDropdown.querySelectorAll('.dropdown-menu li');
            const savedFont = localStorage.getItem('editorFont') || 'Google Sans Code';
            const fontPreview = document.getElementById('font-preview-code');

            // Set initial text and selected item
            if(selectedFontName) {
                selectedFontName.textContent = savedFont;
            }
            fontItems.forEach(item => {
                item.classList.toggle('selected', item.dataset.font === savedFont);
            });

            // Set initial font for preview
            if (fontPreview) {
                fontPreview.style.fontFamily = savedFont;
            }
        }
    }

    // Function to load content based on target ID
    function loadContent(targetId) {
        contentContainer.innerHTML = '';
        const template = contentTemplates.querySelector(`#${targetId}-content`);
        if (template) {
            const clonedContent = template.cloneNode(true);
            clonedContent.removeAttribute('id');
            contentContainer.appendChild(clonedContent);

            if (targetId === 'customisation') {
                applyCustomisationSettings();
                setupCustomDropdown(); // New function call
            }
        } else {
            contentContainer.innerHTML = '<p>Content not found.</p>';
        }
    }
    
    // Function to update active button state
    function setActiveButton(targetButton) {
        // Remove active class from all buttons
        navButtons.forEach(button => button.classList.remove('active'));
        // Add active class to the clicked button
        targetButton.classList.add('active');
    }
    
    // Event listener for navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (targetId) {
                loadContent(targetId);
                setActiveButton(button);
                
                // Optionally close sidebar on mobile after selection
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });
    
    // --- Load initial content (e.g., GitHub) ---
    // Find the initially active button
    const initialActiveButton = document.querySelector('.settings-nav-btn.active');
    if (initialActiveButton) {
        const initialTargetId = initialActiveButton.getAttribute('data-target');
        if (initialTargetId) {
            loadContent(initialTargetId);
        }
    } else if (navButtons.length > 0) {
        // If no button is marked active, load the first one
        const firstButton = navButtons[0];
        const firstTargetId = firstButton.getAttribute('data-target');
        if (firstTargetId) {
            loadContent(firstTargetId);
            setActiveButton(firstButton);
        }
    }
    
    function setupCustomDropdown() {
        const fontDropdown = document.getElementById('font-dropdown');
        if (!fontDropdown) return;

        const toggleButton = document.getElementById('font-dropdown-toggle');
        const dropdownMenu = document.getElementById('font-dropdown-menu');
        const selectedFontName = document.getElementById('selected-font-name');

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            fontDropdown.classList.toggle('open');
        });

        dropdownMenu.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'LI') {
                const newFont = target.dataset.font;
                selectedFontName.textContent = newFont;
                localStorage.setItem('editorFont', newFont);

                // Update selected class
                dropdownMenu.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
                target.classList.add('selected');

                // Update preview font
                const fontPreview = document.getElementById('font-preview-code');
                if (fontPreview) {
                    fontPreview.style.fontFamily = newFont;
                }

                fontDropdown.classList.remove('open');
            }
        });
    }

    // --- Event Delegation for Settings ---
    contentContainer.addEventListener('click', (e) => {
        // Theme switcher logic
        const themeButton = e.target.closest('.theme-btn');
        if (themeButton) {
            const newTheme = themeButton.dataset.theme;
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(newTheme);
            localStorage.setItem('theme', newTheme);

            document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
            themeButton.classList.add('active');
        }
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        const fontDropdown = document.getElementById('font-dropdown');
        if (fontDropdown && !fontDropdown.contains(e.target)) {
            fontDropdown.classList.remove('open');
        }
    });
});