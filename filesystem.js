// filesystem.js

/**
 * A wrapper that delegates to the Android WebAppInterface for file system operations
 * if it exists, otherwise falls back to the IndexedDB-based BrowserStorageProvider.
 */
const FileSystem = {
    /**
     * Checks if the native Android interface is available.
     * @returns {boolean} True if the Android interface is available.
     */
    isAndroid() {
        return typeof window.Android !== 'undefined';
    },

    /**
     * Lists all projects.
     * @returns {Promise<Array<Object>>} A list of project objects.
     */
    async listProjects() {
        if (this.isAndroid()) {
            try {
                const projectsJson = await window.Android.listProjects();
                return JSON.parse(projectsJson);
            } catch (error) {
                console.error("Error listing projects from Android:", error);
                return { error: error.message };
            }
        } else {
            console.warn("Using IndexedDB fallback for project listing.");
            return BrowserStorageProvider.listProjects();
        }
    },

    /**
     * Lists all files and folders within a project recursively.
     * @param {string} projectName - The name of the project.
     * @returns {Promise<Array<Object>>} A tree structure of files and folders.
     */
    async listProjectContents(projectName) {
        if (this.isAndroid()) {
            try {
                const treeJson = await window.Android.listProjectContents(projectName);
                return JSON.parse(treeJson);
            } catch (error) {
                console.error(`Error listing contents for project '${projectName}':`, error);
                return [];
            }
        } else {
            console.warn(`Using IndexedDB fallback for listing contents of: ${projectName}`);
            return BrowserStorageProvider.listProjectContents(projectName);
        }
    },

    /**
     * Reads the content of a single file within a project.
     * @param {string} projectName - The name of the project.
     * @param {string} relativePath - The relative path of the file.
     * @returns {Promise<string>} The content of the file.
     */
    async readFile(projectName, relativePath) {
        if (this.isAndroid()) {
            try {
                const content = await window.Android.readFile(projectName, relativePath);
                if (content.startsWith("Error:")) {
                    throw new Error(content);
                }
                return content;
            } catch (error) {
                console.error(`Error reading file '${relativePath}' in project '${projectName}':`, error);
                return `// Error loading file: ${error.message}`;
            }
        } else {
            console.warn(`Using IndexedDB fallback for reading file: ${relativePath}`);
            return BrowserStorageProvider.readFile(projectName, relativePath);
        }
    },

    /**
     * Writes content to a single file within a project.
     * @param {string} projectName - The name of the project.
     * @param {string} relativePath - The relative path of the file.
     * @param {string} content - The content to write.
     * @returns {Promise<{success: boolean, message: string}>} Result object.
     */
    async writeFile(projectName, relativePath, content) {
        if (this.isAndroid()) {
            try {
                const result = await window.Android.writeFile(projectName, relativePath, content);
                if (result.startsWith("Error:")) {
                    return { success: false, message: result };
                }
                return { success: true, message: result };
            } catch (error) {
                console.error(`Error writing file '${relativePath}':`, error);
                return { success: false, message: error.message };
            }
        } else {
            console.warn(`Using IndexedDB fallback for writing file: ${relativePath}`);
            return BrowserStorageProvider.writeFile(projectName, relativePath, content);
        }
    },

    /**
     * Creates a new project.
     * @param {string} projectName - The name for the new project.
     * @returns {Promise<{success: boolean, message: string}>} Result object.
     */
    async createProject(projectName) {
        if (this.isAndroid()) {
            const result = await window.Android.createProject(projectName);
            if (result === "Success") {
                return { success: true, message: "Project created successfully." };
            }
            return { success: false, message: result };
        } else {
            console.warn(`Using IndexedDB fallback to create project: ${projectName}`);
            return BrowserStorageProvider.createProject(projectName);
        }
    },

    /**
     * Deletes a project.
     * @param {string} projectName - The name of the project to delete.
     * @returns {Promise<{success: boolean, message: string}>} Result object.
     */
    async deleteProject(projectName) {
        if (this.isAndroid()) {
            const result = await window.Android.deleteProject(projectName);
            if (result === "Success") {
                return { success: true, message: "Project deleted successfully." };
            }
            return { success: false, message: result };
        } else {
            console.warn(`Using IndexedDB fallback to delete project: ${projectName}`);
            return BrowserStorageProvider.deleteProject(projectName);
        }
    },

    async createFile(projectName, relativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.createFile(projectName, relativePath);
            return { success: result === "Success", message: result };
        } else {
            console.warn(`Using IndexedDB fallback: Creating file ${relativePath}`);
            return BrowserStorageProvider.createFile(projectName, relativePath);
        }
    },

    async createFolder(projectName, relativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.createFolder(projectName, relativePath);
            return { success: result === "Success", message: result };
        } else {
            console.warn(`Using IndexedDB fallback: Creating folder ${relativePath}`);
            return BrowserStorageProvider.createFolder(projectName, relativePath);
        }
    },

    async deletePath(projectName, relativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.deletePath(projectName, relativePath);
            return { success: result === "Success", message: result };
        } else {
            console.warn(`Using IndexedDB fallback: Deleting path ${relativePath}`);
            return BrowserStorageProvider.deletePath(projectName, relativePath);
        }
    },

    async importFiles(projectName, relativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.importFiles(projectName, relativePath);
            return { success: result === "Success", message: result };
        } else {
            console.warn(`FS Fallback: Importing files to ${relativePath}`);
            return Promise.resolve({ success: false, message: "Not implemented in browser." });
        }
    },

    async rename(projectName, relativePath, newName) {
        if (this.isAndroid()) {
            const result = await window.Android.rename(projectName, relativePath, newName);
            return { success: result === "Success", message: result };
        } else {
            // Fallback implementation
            return { success: false, message: "Not implemented in browser." };
        }
    },

    async copy(projectName, relativePath, destinationRelativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.copy(projectName, relativePath, destinationRelativePath);
            return { success: result === "Success", message: result };
        } else {
            // Fallback implementation
            return { success: false, message: "Not implemented in browser." };
        }
    },

    async cut(projectName, relativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.cut(projectName, relativePath);
            return { success: result === "Success", message: result };
        } else {
            // Fallback implementation
            return { success: false, message: "Not implemented in browser." };
        }
    },

    async paste(projectName, destinationRelativePath) {
        if (this.isAndroid()) {
            const result = await window.Android.paste(projectName, destinationRelativePath);
            return { success: result === "Success", message: result };
        } else {
            // Fallback implementation
            return { success: false, message: "Not implemented in browser." };
        }
    }
};

// This makes the FileSystem object available globally, for script.js to use
window.FileSystem = FileSystem;
