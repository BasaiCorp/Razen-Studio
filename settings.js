// settings.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Settings Navigation Logic ---
    const navButtons = document.querySelectorAll('.settings-nav-btn'); // Use the specific class
    const contentContainer = document.getElementById('settings-content');
    const contentTemplates = document.getElementById('settings-data'); // Hidden div containing templates
    
    // Function to load content based on target ID
    function loadContent(targetId) {
        // Clear current content
        contentContainer.innerHTML = '';
        
        // Find the corresponding content template
        const template = contentTemplates.querySelector(`#${targetId}-content`);
        
        if (template) {
            // Clone the template content and append it
            const clonedContent = template.cloneNode(true);
            // Remove the ID from the clone to avoid duplicates
            clonedContent.removeAttribute('id');
            contentContainer.appendChild(clonedContent);
        } else {
            // Handle case where content is not found
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
    
    // --- Optional: Theme Toggle Persistence ---
    // If you have a theme toggle button in the settings toolbar, you'd handle it here
    // Example (assuming a button with id 'settings-theme-toggle'):
    /*
    const themeToggleBtn = document.getElementById('settings-theme-toggle');
    if (themeToggleBtn) {
         themeToggleBtn.addEventListener('click', () => {
             // Logic similar to index.html's theme toggle
             const currentTheme = document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
             const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
             document.body.classList.remove(currentTheme);
             document.body.classList.add(newTheme);
             localStorage.setItem('theme', newTheme);
             // Update button text/icon if needed
             // themeToggleBtn.innerHTML = newTheme === 'dark-theme' ? '<i class="fas fa-sun"></i> Light' : '<i class="fas fa-moon"></i> Dark';
         });
    }
    */
});