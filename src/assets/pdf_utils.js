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

/**
 *  Approximates float number as a fraction using Farey sequence (max order
 *  of 8).
 *  @param {number} x - Positive float number.
 *  @returns {Array} Estimated fraction: the first array item is a numerator,
 *                   the second one is a denominator.
 */
function approximateFraction(x) {
    // Fast paths for int numbers or their inversions.
    if (Math.floor(x) === x) {
        return [x, 1];
    }
    let xinv = 1 / x;
    let limit = 8;
    if (xinv > limit) {
        return [1, limit];
    } else if (Math.floor(xinv) === xinv) {
        return [1, xinv];
    }
  
    let x_ = x > 1 ? xinv : x;
    // a/b and c/d are neighbours in Farey sequence.
    let a = 0, b = 1, c = 1, d = 1;
    // Limiting search to order 8.
    while (true) {
        // Generating next term in sequence (order of q).
        let p = a + c, q = b + d;
        if (q > limit) {
            break;
        }
        if (x_ <= p / q) {
            c = p; d = q;
        } else {
            a = p; b = q;
        }
    }
    let result;
    // Select closest of the neighbours to x.
    if (x_ - a / b < c / d - x_) {
        result = x_ === x ? [a, b] : [b, a];
    } else {
        result = x_ === x ? [c, d] : [d, c];
    }
    return result;
}

function roundToDivide(x, div) {
    let r = x % div;
    return r === 0 ? x : Math.round(x - r + div);
}

/**
 * Returns scale factor for the canvas. It makes sense for the HiDPI displays.
 * @return {Object} The object with horizontal (sx) and vertical (sy)
                    scales. The scaled property is set to false if scaling is
                    not required, true otherwise.
 */
function getOutputScale(ctx) {
    let devicePixelRatio = window.devicePixelRatio || 1;
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    let pixelRatio = devicePixelRatio / backingStoreRatio;
    return {
        sx: pixelRatio,
        sy: pixelRatio,
        scaled: pixelRatio !== 1,
    };
}

export {
    buildSVG,
    pageLoaded,
    approximateFraction,
    roundToDivide,
    getOutputScale
}