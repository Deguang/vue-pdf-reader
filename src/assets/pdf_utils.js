import pdfJsLib from 'pdfjs-dist/build/pdf';

var SVG_NS = 'http://www.w3.org/2000/svg';

function buildSVG(viewport, textContent) {
    console.log(pdfJsLib)
    // Building SVG with size of the viewport (for simplicity)
    var svg = document.createElementNS(SVG_NS, 'svg:svg');
    svg.setAttribute('width', viewport.width + 'px');
    svg.setAttribute('height', viewport.height + 'px');
    // items are transformed to have 1px font size
    svg.setAttribute('font-size', 1);

    // processing all items
    textContent.items.forEach(function (textItem) {
        // we have to take in account viewport transform, which includes scale,
        // rotation and Y-axis flip, and not forgetting to flip text.
        var tx = pdfJsLib.Util.transform(
            pdfJsLib.Util.transform(viewport.transform, textItem.transform),
            [1, 0, 0, -1, 0, 0]);
        var style = textContent.styles[textItem.fontName];
        // adding text element
        var text = document.createElementNS(SVG_NS, 'svg:text');
        text.setAttribute('transform', 'matrix(' + tx.join(' ') + ')');
        text.setAttribute('font-family', style.fontFamily);
        text.textContent = textItem.str;
        svg.appendChild(text);
    });
    return svg;
}

function pageLoaded() {
    // Loading document and page text content
    pdfJsLib.getDocument({url: PDF_PATH}).then(function (pdfDocument) {
        pdfDocument.getPage(PAGE_NUMBER).then(function (page) {
        var viewport = page.getViewport(PAGE_SCALE);
        page.getTextContent().then(function (textContent) {
            // building SVG and adding that to the DOM
            var svg = buildSVG(viewport, textContent);
            document.getElementById('pageContainer').appendChild(svg);
        });
        });
    });
}
export {
    buildSVG,
    pageLoaded
}