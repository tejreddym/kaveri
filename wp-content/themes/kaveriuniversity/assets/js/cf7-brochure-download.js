document.addEventListener('wpcf7mailsent', function(event) {
    if (event.detail.contactFormId == '68') { // Replace '123' with your Contact Form 7 ID
        const brochureUrl = '/pdf/fee-structure-brochure.pdf'; // Replace with the actual path to your brochure
        const link = document.createElement('a');
        link.href = brochureUrl;
        link.download = 'Brochure.pdf'; // Replace with your desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}, false);
