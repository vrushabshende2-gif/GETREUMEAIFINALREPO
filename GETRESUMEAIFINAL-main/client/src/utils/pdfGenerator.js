import html2pdf from 'html2pdf.js';

/**
 * PDF Generator — uses html2pdf.js for clean, paginated PDF export.
 *
 * @param {string} elementId - ID of the rendered resume element
 * @param {string} fileName  - Output PDF filename
 * @returns {boolean} true on success, false on failure
 */
export const downloadAsPDF = async (elementId, fileName = 'resume.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return false;
  }

  try {
    // Temporarily remove any scale transforms from the preview container
    // so html2canvas can capture the actual 100% dimensions.
    const originalTransform = element.style.transform;
    element.style.transform = 'none';
    
    // Some templates use Tailwind classes that might behave weirdly if we don't
    // enforce a strict width. The preview container is max-w-[800px].
    const originalWidth = element.style.width;
    element.style.width = '800px';

    const opt = {
      margin:       0, // No margin, templates have their own padding
      filename:     fileName,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { 
        scale: 2, // 2x crisp rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200 // Ensure layout doesn't break into mobile view
      },
      jsPDF:        { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Handle Vite/ESM default export wrapping
    const generatePdf = html2pdf.default || html2pdf;
    
    // Await the generation process
    await generatePdf().set(opt).from(element).save();

    // Restore original styles
    element.style.transform = originalTransform;
    element.style.width = originalWidth;
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
};
