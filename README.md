# Razen Studio

Razen Studio is a modern code editor specifically designed for the Razen Lang programming language. Built with HTML, CSS, and JavaScript, it offers a clean and efficient environment for coding.


### Dashboard Screen
![Razen Studio Screenshot1](Screenshot3.jpg)

### Editor Screen 
![Razen Studio Screenshot2](Screenshot4.jpg)

### Files Tree/Sidebar
![Razen Studio Screenshot3](Screenshot2.jpg)

### Settings/Info Screen
![Razen Studio Screenshot4](Screenshot1.jpg)


## Features

*   **Code Editing:** A core text editor for Razen Lang.
*   **Syntax Highlighting:** Basic syntax highlighting for better readability (using Prism.js).
*   **File Management:** Create and manage multiple files within the editor.
*   **Themes:** Supports both Light and Dark themes, respecting system preferences.
*   **Sidebar Navigation:** Easy access to files and settings via a collapsible sidebar.
*   **Editor Tools:** Includes common tools like Copy, Tab handling, Undo/Redo, and Bracket insertion.
*   **Search & Replace:** Basic find and replace functionality.
*   **Settings Panel:** A dedicated settings area for project information.
*   **Android App:** Razen Studio is also available as an Android application. You can download the latest version from the [Releases page](https://github.com/BasaiCorp/Razen-Studio/releases).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

A modern web browser (Chrome, Firefox, Edge, Safari, etc.)

### Installation

1.  Clone or download this repository to your local machine.
    ```bash
    git clone https://github.com/BasaiCorp/Razen-Studio.git
    ```
2.  Navigate to the project directory.
3.  Open `index.html` in your preferred web browser.

## Usage

1.  **Opening the Editor:** Simply open `index.html` in a web browser.
2.  **Creating Files:** Click the "New File" button in the sidebar.
3.  **Editing Code:** Type your Razen Lang code into the editor area.
4.  **Using Tools:** Utilize the buttons in the toolbar below the editor for common actions.
5.  **Changing Themes:** Click the "Dark" or "Light" button in the toolbar to toggle themes.
6.  **Accessing Settings:** Click the cog icon (`fa-cog`) in the sidebar or navigate to `settings.html` to view project information like GitHub links, version, changelogs, license, and about details.

## Project Structure

```
razen-studio/
├── index.html          # Main editor page
├── settings.html       # Settings page
├── style.css           # Main stylesheet
├── settings.css        # Settings page specific styles
├── ra.js               # (Assumed) Razen Lang specific logic (if applicable)
├── script.js           # Main editor JavaScript (sidebar, editor functionality)
├── settings.js         # Settings page JavaScript (navigation, content loading)
├── screenshot.png      # (Add this) Project screenshot
└── README.md           # This file
```

## Settings

The `settings.html` page provides information about the Razen Studio project:

*   **GitHub:** Links to the repository, issues, and releases.
*   **Version:** Displays the current version (Beta v1.0.3).
*   **Changelogs:** Lists recent changes and updates.
*   **License:** Shows the project's license (MIT).
*   **About:** Provides a brief description and developer information.

Navigation between these sections is handled via the sidebar within the settings page.

## Built With

*   **HTML5**
*   **CSS3** (Variables for theming)
*   **JavaScript** (Vanilla JS for core logic)
*   **[Prism.js](https://prismjs.com/)** - Syntax highlighting
*   **[Font Awesome](https://fontawesome.com/)** - Icons
*   **[Google Fonts](https://fonts.google.com/)** - Work Sans, JetBrains Mono

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to the [GitHub repository](https://github.com/BasaiCorp/Razen-Studio).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases page](https://github.com/BasaiCorp/Razen-Studio/releases).

## Authors

*   **Prathmesh Barot** - *Initial work* - [BasaiCorp](https://github.com/BasaiCorp)

## License

This project is licensed under the MIT License - see the [LICENSE](#) file for details (or include the full license text in a separate file and link it).

## Acknowledgments

*   Inspiration from other modern code editors.