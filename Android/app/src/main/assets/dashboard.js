// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createProjectBtn = document.getElementById('create-project-btn');
    const createProjectModal = document.getElementById('create-project-modal');
    const cancelCreateProjectBtn = document.getElementById('cancel-create-project-btn');
    const confirmCreateProjectBtn = document.getElementById('confirm-create-project-btn');
    const projectNameInput = document.getElementById('project-name-input');
    const projectList = document.getElementById('project-list');
    const searchInput = document.getElementById('search-projects-input');
    const themeToggle = document.getElementById('theme-toggle');
    const customPopup = document.getElementById('custom-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const popupConfirm = document.getElementById('popup-confirm');
    const popupCancel = document.getElementById('popup-cancel');

    // --- Event Listeners ---

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLightTheme = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLightTheme ? 'light-theme' : 'dark-theme');
        updateThemeIcon(isLightTheme);
    });

    createProjectBtn.addEventListener('click', () => {
        createProjectModal.style.display = 'flex';
        projectNameInput.focus();
    });

    cancelCreateProjectBtn.addEventListener('click', () => {
        createProjectModal.style.display = 'none';
    });

    confirmCreateProjectBtn.addEventListener('click', async () => {
        const projectName = projectNameInput.value.trim();
        if (projectName) {
            const result = await FileSystem.createProject(projectName);
            createProjectModal.style.display = 'none';
            projectNameInput.value = '';
            if (result.success) {
                await loadAndRenderProjects();
            } else {
                showPopup('Error', result.message, { showCancel: false });
            }
        } else {
            showPopup('Invalid Name', 'Please enter a valid project name.', { showCancel: false });
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = projectList.querySelectorAll('.project-card');
        let visibleCount = 0;
        cards.forEach(card => {
            const projectName = card.dataset.projectName.toLowerCase();
            const isVisible = projectName.includes(searchTerm);
            card.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) visibleCount++;
        });

        // Show a message if no projects match the search
        const noResultsMsg = projectList.querySelector('.no-results-message');
        if (visibleCount === 0 && !noResultsMsg) {
            const p = document.createElement('p');
            p.className = 'no-results-message';
            p.textContent = 'No projects match your search.';
            projectList.appendChild(p);
        } else if (visibleCount > 0 && noResultsMsg) {
            noResultsMsg.remove();
        }
    });

    // --- Functions ---

    function showPopup(title, message, options = {}) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;

        popupConfirm.style.display = options.showConfirm !== false ? 'inline-block' : 'none';
        popupCancel.style.display = options.showCancel !== false ? 'inline-block' : 'none';

        popupConfirm.textContent = options.confirmText || 'Confirm';
        popupCancel.textContent = options.cancelText || 'Cancel';

        customPopup.style.display = 'flex';

        return new Promise((resolve) => {
            popupConfirm.onclick = () => {
                customPopup.style.display = 'none';
                resolve(true);
            };
            popupCancel.onclick = () => {
                customPopup.style.display = 'none';
                resolve(false);
            };
        });
    }

    async function loadAndRenderProjects() {
        const projectsOrError = await FileSystem.listProjects();
        projectList.innerHTML = '';

        if (projectsOrError.error) {
            projectList.innerHTML = `<p class="error-message">Error loading projects: ${projectsOrError.error}</p>`;
            return;
        }

        const projects = projectsOrError;
        if (!projects || projects.length === 0) {
            projectList.innerHTML = '<p>No projects found. Create one to get started!</p>';
            return;
        }

        projects.forEach(project => {
            const card = createProjectCard(project);
            projectList.appendChild(card);
        });
    }

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectName = project.name;

        const projectPath = project.path || project.name;

        card.innerHTML = `
            <div class="project-card-header">
                <h3>${project.name}</h3>
                <p class="project-path"><i class="fas fa-folder"></i> ${projectPath}</p>
            </div>
            <div class="project-card-body">
                <p>Last modified: ${new Date(project.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div class="project-card-footer">
                <button class="btn open-project-btn"><i class="fas fa-external-link-alt"></i> Open</button>
                <button class="btn delete-project-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;

        card.querySelector('.delete-project-btn').style.setProperty('--accent-primary', 'var(--error)');

        card.querySelector('.open-project-btn').addEventListener('click', () => {
            window.location.href = `index.html?project=${encodeURIComponent(project.name)}`;
        });

        card.querySelector('.delete-project-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmed = await showPopup(
                'Delete Project',
                `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
                { confirmText: 'Delete' }
            );
            if (confirmed) {
                const result = await FileSystem.deleteProject(project.name);
                if (result.success) {
                    await loadAndRenderProjects();
                } else {
                    showPopup('Error', result.message, { showCancel: false });
                }
            }
        });

        return card;
    }

    function updateThemeIcon(isLightTheme) {
        themeToggle.innerHTML = isLightTheme ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    function initializeDashboard() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isLight = savedTheme ? savedTheme === 'light-theme' : !prefersDark;

        if (isLight) {
            document.body.classList.add('light-theme');
        }
        updateThemeIcon(isLight);

        loadAndRenderProjects();
    }

    initializeDashboard();
});
