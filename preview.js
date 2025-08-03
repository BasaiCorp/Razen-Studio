document.addEventListener('DOMContentLoaded', () => {
    // Dropdown elements
    const manageBtn = document.getElementById('preview-manage-btn');
    const dropdown = document.getElementById('preview-dropdown');

    // Dropdown functionality
    manageBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the window click listener from closing it immediately
        dropdown.classList.toggle('show');
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', (e) => {
        if (!manageBtn.contains(e.target) && !dropdown.contains(e.target)) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });

    // Button functionalities
    const exitPreviewBtn = document.getElementById('exit-preview');
    const desktopModeBtn = document.getElementById('desktop-mode');
    const consoleLogBtn = document.getElementById('console-log');
    const content = document.getElementById('content');

    exitPreviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.close();
    });

    desktopModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        content.classList.toggle('desktop');
        const isDesktop = content.classList.contains('desktop');
        desktopModeBtn.innerHTML = isDesktop
            ? '<i class="fas fa-mobile-alt"></i> Mobile Mode'
            : '<i class="fas fa-desktop"></i> Desktop Mode';
    });

    consoleLogBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // A simple implementation could be to log the iframe's contentWindow
        const iframe = content.querySelector('iframe');
        if (iframe) {
            console.log('Accessing iframe console:', iframe.contentWindow.console);
            alert('Check the browser console (F12) for the iframe\'s console object.');
        } else {
            console.log('No iframe content to log.');
            alert('No iframe content found to log to the console.');
        }
    });

    // Handle code injection from parent window
    window.addEventListener('message', (event) => {
        if (event.data.type === 'code') {
            const { html, css, js } = event.data;
            const iframeContent = `
                <html>
                    <head>
                        <style>${css}</style>
                    </head>
                    <body>
                        ${html}
                        <script>${js}<\/script>
                    </body>
                </html>
            `;
            // Use an iframe to isolate content and prevent script conflicts
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            content.innerHTML = ''; // Clear previous content
            content.appendChild(iframe);
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(iframeContent);
            iframe.contentWindow.document.close();
        }
    });

    // Toast notification logic
    const toast = document.getElementById('reload-toast');
    if (toast) {
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 300); // Small delay to allow the page to render first

        // Hide the toast after a few seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
});
