/**
 * Downloads a file using Chrome Downloads API in extension context,
 * or falls back to standard blob download in web context.
 */
export const downloadFile = (blob: Blob, fileName: string): void => {
    // @ts-ignore
    const isExtension = typeof chrome !== "undefined" && chrome.downloads;

    if (isExtension) {
        // Use Chrome Downloads API (doesn't close popup)
        const reader = new FileReader();
        reader.onload = () => {
            // @ts-ignore
            chrome.downloads.download({
                url: reader.result as string,
                filename: fileName,
                saveAs: false
            });
        };
        reader.readAsDataURL(blob);
    } else {
        // Fallback to standard download for web
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
};
