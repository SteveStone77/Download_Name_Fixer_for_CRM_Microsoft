// ==UserScript==
// @name         Download Name Fixer for CRM Microsoft
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Intercept downloads and remove quotes from the filename before saving the file
// @author       Steve Stone
// @copyright    2024 [Steve Stone Dev]
// @license      CC BY-NC-ND 4.0; https://creativecommons.org/licenses/by-nc-nd/4.0/

// @grant        none

// @updateURL    https://github.com/SteveStone77/Download_Name_Fixer_for_CRM_Microsoft/raw/main/Download%20Name%20Fixer%20for%20CRM%20Microsoft.user.js
// @downloadURL  https://github.com/SteveStone77/Download_Name_Fixer_for_CRM_Microsoft/raw/main/Download%20Name%20Fixer%20for%20CRM%20Microsoft.user.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("Download Name Fixer for CRM Microsoft script is running!");

    // Function to remove quotes from the beginning and end of a string
    function removeQuotes(str) {
        if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
            return str.slice(1, -1);
        }
        return str;
    }

    function getDownloadUrl(baseUrl, parameters) {
        const url = new URL(baseUrl, window.location.origin);
        for (const [key, value] of Object.entries(parameters)) {
            if (value) url.searchParams.append(key, value);
        }
        return url.toString();
    }

    // Function to process the file download with corrected filename
    function processFile(url, filename) {
        // Remove quotes from the filename
        let newFilename = removeQuotes(filename);
        //console.log(`Processing file: ${url}, New Filename: ${newFilename}`);

        // Fetch the file content as a blob
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                //console.log(`Blob type: ${blob.type}`);
                // Download the file with the corrected filename
                downloadBlob(blob, newFilename);
            })
            .catch(err => console.error('Error fetching the file:', err));
    }

    // Function to download a blob
    function downloadBlob(blob, filename) {
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        //console.log(`File downloaded as: ${filename}`);
    }

    // Intercept the click event on <a> elements with class "attachmentFileName" or <span> elements with id "crmAttachment"
    document.addEventListener('click', function(event) {
        let target = event.target;

        if (target.tagName === 'A' && target.classList.contains('attachmentFileName')) {
            console.log('Tipo download: A')
            let filename = target.getAttribute('title');
            if (filename) {
                event.preventDefault();
                event.stopPropagation();
                let url = target.href;
                processFile(url, filename);
            }
        } else if (target.id === 'crmAttachment' || target.closest('#crmAttachment')) {
            console.log('Tipo download: crmAttachment');
            let spanTarget = target.id === 'crmAttachment' ? target : target.closest('#crmAttachment');
            let filename = spanTarget.textContent.trim();
            let url = spanTarget.getAttribute('url');

            // Aggiungi i parametri necessari per costruire l'URL completo
            const parameters = {
                AttachmentType: spanTarget.getAttribute('attachmenttype'),
                AttachmentId: spanTarget.getAttribute('attachmentid'),
                IsNotesTabAttachment: 'null'
            };

            if (filename && url) {
                const fullUrl = getDownloadUrl(url, parameters);
                event.preventDefault();
                event.stopPropagation();
                processFile(fullUrl, filename);
            }
        }
    }, true);
})();
