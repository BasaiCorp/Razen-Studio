package com.basaicorp.razenstudio;

import android.content.Context;
import android.os.Environment;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;

public class WebAppInterface {
    private final Context context;
    private static final String PROJECTS_DIR = "RazenStudio/Projects";
    private static final String LOG_TAG = "WebAppInterface";

    // Clipboard for copy/cut operations
    private File clipboardFile = null;
    private boolean isCutOperation = false;

    public WebAppInterface(Context context) {
        this.context = context;
    }

    private File getProjectsRoot() {
        // Use the app-specific directory to comply with Scoped Storage.
        // This does not require special permissions.
        File appSpecificDir = context.getExternalFilesDir(null);
        File root = new File(appSpecificDir, PROJECTS_DIR);
        if (!root.exists()) {
            root.mkdirs();
        }
        return root;
    }

    @JavascriptInterface
    public String listProjects() {
        File projectsRoot = getProjectsRoot();
        File[] projectDirs = projectsRoot.listFiles(File::isDirectory);
        if (projectDirs == null) {
            return "[]";
        }

        // Sort by most recently modified
        Arrays.sort(projectDirs, Comparator.comparingLong(File::lastModified).reversed());

        JSONArray projects = new JSONArray();
        for (File dir : projectDirs) {
            try {
                JSONObject project = new JSONObject();
                project.put("name", dir.getName());
                project.put("path", dir.getPath());
                project.put("createdAt", dir.lastModified());
                projects.put(project);
            } catch (JSONException e) {
                Log.e(LOG_TAG, "Error creating JSON for project " + dir.getName(), e);
            }
        }
        return projects.toString();
    }

    @JavascriptInterface
    public String createProject(String projectName) {
        if (projectName == null || projectName.trim().isEmpty()) {
            return "Error: Project name is invalid.";
        }
        File projectDir = new File(getProjectsRoot(), projectName);
        if (projectDir.exists()) {
            return "Error: Project already exists.";
        }
        if (!projectDir.mkdirs()) {
            return "Error: Could not create project directory.";
        }

        try {
            createFile(projectDir, "index.html", getPresetHtmlContent(projectName));
            createFile(projectDir, "style.css", "/* CSS for " + projectName + " */\n\nbody {\n    font-family: sans-serif;\n}");
            createFile(projectDir, "script.js", "// JavaScript for " + projectName + "\n\nconsole.log('Hello, " + projectName + "!');");
            return "Success";
        } catch (IOException e) {
            Log.e(LOG_TAG, "Error creating files for project " + projectName, e);
            // Clean up created directory if file creation fails
            deleteDirectory(projectDir);
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String deleteProject(String projectName) {
        File projectDir = new File(getProjectsRoot(), projectName);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            return "Error: Project not found.";
        }
        if (deleteDirectory(projectDir)) {
            return "Success";
        } else {
            return "Error: Failed to delete project directory.";
        }
    }

    @JavascriptInterface
    public String listProjectContents(String projectName) {
        File projectDir = new File(getProjectsRoot(), projectName);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            return "[]"; // Return empty array if project not found
        }
        try {
            return getDirContents(projectDir).toString();
        } catch (JSONException e) {
            Log.e(LOG_TAG, "Error generating file tree for " + projectName, e);
            return "[]";
        }
    }

    private JSONArray getDirContents(File directory) throws JSONException {
        JSONArray contents = new JSONArray();
        File[] files = directory.listFiles();
        if (files == null) {
            return contents;
        }

        // Sort files: folders first, then alphabetically
        Arrays.sort(files, (f1, f2) -> {
            if (f1.isDirectory() && !f2.isDirectory()) {
                return -1;
            } else if (!f1.isDirectory() && f2.isDirectory()) {
                return 1;
            } else {
                return f1.getName().compareTo(f2.getName());
            }
        });

        for (File file : files) {
            JSONObject fileJson = new JSONObject();
            fileJson.put("name", file.getName());
            fileJson.put("path", file.getPath());
            if (file.isDirectory()) {
                fileJson.put("type", "folder");
                fileJson.put("children", getDirContents(file));
            } else {
                fileJson.put("type", "file");
            }
            contents.put(fileJson);
        }
        return contents;
    }

    @JavascriptInterface
    public String readFile(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File file = new File(projectDir, relativePath);

        if (!file.exists() || !file.isFile()) {
            return "Error: File not found at " + relativePath;
        }

        // Security check to prevent path traversal
        try {
            if (!file.getCanonicalPath().startsWith(projectDir.getCanonicalPath())) {
                return "Error: Access denied.";
            }
        } catch (IOException e) {
            return "Error: Security check failed.";
        }

        try {
            return readFileContent(file);
        } catch (IOException e) {
            Log.e(LOG_TAG, "Error reading file: " + file.getPath(), e);
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String writeFile(String projectName, String relativePath, String content) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File file = new File(projectDir, relativePath);

        // Security check
        try {
            if (!file.getCanonicalPath().startsWith(projectDir.getCanonicalPath())) {
                return "Error: Access denied.";
            }
        } catch (IOException e) {
            return "Error: Security check failed.";
        }

        File parentDir = file.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            if (!parentDir.mkdirs()) {
                return "Error: Could not create parent directories.";
            }
        }

        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
            return "Success: File saved.";
        } catch (IOException e) {
            Log.e(LOG_TAG, "Error writing file: " + file.getPath(), e);
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String createFile(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File file = new File(projectDir, relativePath);

        try {
            if (!file.getCanonicalPath().startsWith(projectDir.getCanonicalPath())) {
                return "Error: Access denied.";
            }
            if (file.exists()) {
                return "Error: File already exists.";
            }
            if (file.createNewFile()) {
                return "Success";
            } else {
                return "Error: Could not create file.";
            }
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String createFolder(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File folder = new File(projectDir, relativePath);

        try {
            if (!folder.getCanonicalPath().startsWith(projectDir.getCanonicalPath())) {
                return "Error: Access denied.";
            }
            if (folder.exists()) {
                return "Error: Folder already exists.";
            }
            if (folder.mkdirs()) {
                return "Success";
            } else {
                return "Error: Could not create folder.";
            }
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String deletePath(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File path = new File(projectDir, relativePath);

        try {
            if (!path.getCanonicalPath().startsWith(projectDir.getCanonicalPath())) {
                return "Error: Access denied.";
            }
            if (!path.exists()) {
                return "Error: Path not found.";
            }

            if (path.isDirectory()) {
                if (deleteDirectory(path)) {
                    return "Success";
                } else {
                    return "Error: Failed to delete directory.";
                }
            } else {
                if (path.delete()) {
                    return "Success";
                } else {
                    return "Error: Failed to delete file.";
                }
            }
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String importFiles(String projectName, String relativePath) {
        // This is a placeholder. A real implementation would require
        // starting a file picker activity and handling the result, which is
        // complex to do solely from the WebAppInterface.
        return "Error: Not implemented yet.";
    }


    @JavascriptInterface
    public String rename(String projectName, String relativePath, String newName) {
        File projectDir = new File(getProjectsRoot(), projectName);
        File oldFile = new File(projectDir, relativePath);
        File newFile = new File(oldFile.getParent(), newName);

        if (!oldFile.exists()) {
            return "Error: File or folder to rename does not exist.";
        }
        if (newFile.exists()) {
            return "Error: A file or folder with the new name already exists.";
        }
        if (oldFile.renameTo(newFile)) {
            return "Success";
        }
        return "Error: Renaming failed.";
    }

    @JavascriptInterface
    public String copy(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        clipboardFile = new File(projectDir, relativePath);
        isCutOperation = false;
        return "Success";
    }

    @JavascriptInterface
    public String cut(String projectName, String relativePath) {
        File projectDir = new File(getProjectsRoot(), projectName);
        clipboardFile = new File(projectDir, relativePath);
        isCutOperation = true;
        return "Success";
    }

    @JavascriptInterface
    public String paste(String projectName, String destinationRelativePath) {
        if (clipboardFile == null) {
            return "Error: Clipboard is empty.";
        }

        File projectDir = new File(getProjectsRoot(), projectName);
        File destinationDir = new File(projectDir, destinationRelativePath);

        try {
            if (!destinationDir.isDirectory()) {
                return "Error: Destination is not a valid directory.";
            }

            File newFile = new File(destinationDir, clipboardFile.getName());

            if (isCutOperation) {
                if (clipboardFile.renameTo(newFile)) {
                    clipboardFile = null; // Clear clipboard after cut
                    isCutOperation = false;
                    return "Success";
                }
                return "Error: Failed to move the file/folder.";
            } else {
                // Copy operation
                if (clipboardFile.isDirectory()) {
                    copyDirectory(clipboardFile, newFile);
                } else {
                    copyFile(clipboardFile, newFile);
                }
                return "Success";
            }
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public String downloadFile(String path) {
        // Placeholder for download functionality
        return "Error: Download not implemented yet.";
    }

    @JavascriptInterface
    public String getPREVIEW(String... path) {
        // Placeholder for preview functionality
        return "Error: Preview not implemented yet.";
    }

    // --- Helper Methods ---

    private void copyFile(File source, File dest) throws IOException {
        try (FileInputStream in = new FileInputStream(source);
             FileOutputStream out = new FileOutputStream(dest)) {
            byte[] buffer = new byte[1024];
            int length;
            while ((length = in.read(buffer)) > 0) {
                out.write(buffer, 0, length);
            }
        }
    }

    private void copyDirectory(File source, File dest) throws IOException {
        if (!dest.exists()) {
            dest.mkdirs();
        }
        for (String f : source.list()) {
            copyDirectory(new File(source, f), new File(dest, f));
        }
    }

    private void createFile(File parentDir, String fileName, String content) throws IOException {
        File file = new File(parentDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
        }
    }

    private String readFileContent(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            return new String(data, StandardCharsets.UTF_8);
        }
    }

    private boolean deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            String[] children = dir.list();
            if (children != null) {
                for (int i = 0; i < children.length; i++) {
                    boolean success = deleteDirectory(new File(dir, children[i]));
                    if (!success) {
                        return false;
                    }
                }
            }
        }
        return dir.delete();
    }

    private String getPresetHtmlContent(String title) {
        return "<!DOCTYPE html>\n" +
               "<html lang=\"en\">\n" +
               "<head>\n" +
               "    <meta charset=\"UTF-8\">\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
               "    <title>" + title + "</title>\n" +
               "    <link rel=\"stylesheet\" href=\"style.css\">\n" +
               "</head>\n" +
               "<body>\n" +
               "    <h1>" + title + "</h1>\n" +
               "    <script src=\"script.js\"></script>\n" +
               "</body>\n" +
               "</html>";
    }
}
