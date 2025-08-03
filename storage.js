// storage.js - IndexedDB implementation for file system

const DB_NAME = 'RazenStudioDB';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const FILES_STORE = 'files';

let db;

/**
 * Initializes the IndexedDB database.
 * This function should be called once when the application loads.
 */
function initializeDB() {
    return new Promise((resolve, reject) => {
        // Prevent re-initialization
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const tempDb = event.target.result;

            // Create 'projects' object store if it doesn't exist
            if (!tempDb.objectStoreNames.contains(PROJECTS_STORE)) {
                const projectsStore = tempDb.createObjectStore(PROJECTS_STORE, { keyPath: 'name' });
                projectsStore.createIndex('by_name', 'name', { unique: true });
                console.log(`Object store '${PROJECTS_STORE}' created.`);
            }

            // Create 'files' object store if it doesn't exist
            // It will store files and folders for all projects
            if (!tempDb.objectStoreNames.contains(FILES_STORE)) {
                // The keyPath is a composite key [projectName, path] to uniquely identify each file/folder
                const filesStore = tempDb.createObjectStore(FILES_STORE, { keyPath: ['projectName', 'path'] });
                // This index allows us to efficiently query all files/folders for a specific project
                filesStore.createIndex('by_project', 'projectName', { unique: false });
                console.log(`Object store '${FILES_STORE}' created.`);
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database initialized successfully.');
            // Set up a global error handler for the database connection
            db.onerror = (event) => {
                console.error("Database error:", event.target.error);
            };
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Failed to open database:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Initialize the database as soon as the script loads.
// We will chain subsequent operations on the promise returned by this.
const dbReady = initializeDB();

const BrowserStorageProvider = {
    async listProjects() {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(PROJECTS_STORE, 'readonly');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                const projects = request.result.map(p => ({ ...p, path: `IndexedDB/${p.name}` }));
                resolve(projects);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async createProject(projectName) {
        await dbReady;
        if (!projectName || projectName.trim().length === 0) {
            return { success: false, message: "Project name cannot be empty." };
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(PROJECTS_STORE, 'readwrite');
            const store = transaction.objectStore(PROJECTS_STORE);
            const request = store.add({ name: projectName, createdAt: new Date() });

            request.onsuccess = () => {
                resolve({ success: true, message: "Project created successfully." });
            };
            request.onerror = (event) => {
                if (event.target.error.name === 'ConstraintError') {
                    resolve({ success: false, message: `Project '${projectName}' already exists.` });
                } else {
                    reject(event.target.error);
                }
            };
        });
    },

    async deleteProject(projectName) {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([PROJECTS_STORE, FILES_STORE], 'readwrite');
            const projectsStore = transaction.objectStore(PROJECTS_STORE);
            const filesStore = transaction.objectStore(FILES_STORE);
            const filesIndex = filesStore.index('by_project');

            const cursorRequest = filesIndex.openCursor(IDBKeyRange.only(projectName));
            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            const projectDeleteRequest = projectsStore.delete(projectName);
            projectDeleteRequest.onerror = (event) => reject(event.target.error);

            transaction.oncomplete = () => resolve({ success: true, message: "Project deleted." });
            transaction.onerror = (event) => reject(event.target.error);
        });
    },

    async listProjectContents(projectName) {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(FILES_STORE, 'readonly');
            const store = transaction.objectStore(FILES_STORE);
            const index = store.index('by_project');
            const request = index.getAll(projectName);

            request.onsuccess = () => {
                resolve(this.buildFileTree(request.result, projectName));
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    buildFileTree(nodes, projectName) {
        const tree = [];
        const lookup = {};

        nodes.forEach(node => {
            lookup[node.path] = {
                name: node.path.split('/').pop(),
                type: node.type,
                path: `${projectName}/${node.path}`,
                children: node.type === 'folder' ? [] : undefined
            };
        });

        nodes.forEach(node => {
            const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
            if (lookup[parentPath] && lookup[parentPath].type === 'folder') {
                lookup[parentPath].children.push(lookup[node.path]);
            } else {
                tree.push(lookup[node.path]);
            }
        });

        return tree;
    },

    async readFile(projectName, relativePath) {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(FILES_STORE, 'readonly');
            const store = transaction.objectStore(FILES_STORE);
            const request = store.get([projectName, relativePath]);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.content);
                } else {
                    resolve(`Error: File not found: ${relativePath}`);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async writeFile(projectName, relativePath, content) {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(FILES_STORE, 'readwrite');
            const store = transaction.objectStore(FILES_STORE);

            const getRequest = store.get([projectName, relativePath]);
            getRequest.onsuccess = () => {
                const data = getRequest.result || {
                    projectName: projectName,
                    path: relativePath,
                    type: 'file',
                    createdAt: new Date()
                };

                data.content = content;
                data.modifiedAt = new Date();

                const putRequest = store.put(data);
                putRequest.onsuccess = () => resolve({ success: true, message: "File saved." });
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    },

    async createFile(projectName, relativePath) {
        await dbReady;
        const file = {
            projectName,
            path: relativePath,
            type: 'file',
            content: '',
            createdAt: new Date()
        };
        return this._addFileOrFolder(file);
    },

    async createFolder(projectName, relativePath) {
        await dbReady;
        const folder = {
            projectName,
            path: relativePath,
            type: 'folder',
            createdAt: new Date()
        };
        return this._addFileOrFolder(folder);
    },

    async _addFileOrFolder(item) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(FILES_STORE, 'readwrite');
            const store = transaction.objectStore(FILES_STORE);
            const request = store.add(item);

            request.onsuccess = () => resolve({ success: true, message: `${item.type} created.` });
            request.onerror = (event) => {
                 if (event.target.error.name === 'ConstraintError') {
                    resolve({ success: false, message: `Path '${item.path}' already exists.` });
                } else {
                    reject(event.target.error);
                }
            };
        });
    },

    async deletePath(projectName, relativePath) {
        await dbReady;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(FILES_STORE, 'readwrite');
            const store = transaction.objectStore(FILES_STORE);

            const getRequest = store.get([projectName, relativePath]);
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    return resolve({ success: false, message: "Path not found." });
                }

                if (item.type === 'folder') {
                    const index = store.index('by_project');
                    const cursorRequest = index.openCursor(IDBKeyRange.only(projectName));
                    cursorRequest.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            if (cursor.value.path.startsWith(relativePath + '/')) {
                                cursor.delete();
                            }
                            cursor.continue();
                        }
                    };
                }

                const deleteRequest = store.delete([projectName, relativePath]);
                deleteRequest.onerror = (e) => reject(e.target.error);
            };
            getRequest.onerror = (e) => reject(e.target.error);

            transaction.oncomplete = () => resolve({ success: true, message: "Path deleted." });
            transaction.onerror = (e) => reject(e.target.error);
        });
    }
};
