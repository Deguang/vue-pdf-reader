export default {
  methods: {
    /**
     * render a page of pdf
     * @param {file} pdf
     * @param {number} page
     */
    renderPage(pdf, pageNum, container) {
      const t = this;
      return new Promise(function (resolve, reject) {
          pdf.getPage(pageNum).then(function(page) {
              var pageDom = document.createElement('div');
              pageDom.style.display = 'block';
              pageDom.style.width = '100%';
              pageDom.className = `page-container page-${pageNum}`
              var pageNumDom = document.createElement('p');
              // pageNumDom.className = 'page-num';
              // pageNumDom.innerHTML = `-${pageNum}/${pdf.numPages}-`
              // pageDom.appendChild(pageNumDom)

              var canvasWrapper = document.createElement('div');
              canvasWrapper.classList.add('canvasWrapper');
              canvasWrapper.style.display = 'block';
              canvasWrapper.style.width = '100%';
              pageDom.appendChild(canvasWrapper)

              let canvas = document.createElement('canvas');
              canvas.className = 'page-body';
              // canvas.style.display = 'block';
              // canvas.style.width = '100%';
              // canvas.style.height = 'auto';

              var context = canvas.getContext('2d', {alpha: false});
              console.log(container.offsetWidth, page.getViewport(1).width, window.devicePixelRatio);
              var scale = container.offsetWidth / page.getViewport(1).width * (window.devicePixelRatio || 1);
              // var scale = canvasWrapper.offsetWidth / page.getViewport(1).width;

              console.log('scale: ', scale)
              var viewport = page.getViewport(scale);

              console.log(canvasWrapper.clientWidth + 'px')

              canvas.height = viewport.height;
              canvas.width = viewport.width;
              canvas.style.width = container.clientWidth + 'px';
              canvas.style.height = (container.clientWidth) * (viewport.height / viewport.width) + 'px';


              canvasWrapper.appendChild(canvas);

              let textContentStream = page.streamTextContent({
                  normalizeWhitespace: true,
              });

              page.getTextContent().then(function (textContent) {
                  const textLayerDiv = document.createElement('div');
                  textLayerDiv.className = 'textLayer';
                  textLayerDiv.style.transform = `scale(${viewport.width / (viewport.width * (window.devicePixelRatio || 1))})`;

                  // building SVG and adding that to the DOM
                  // var svg = buildSVG(viewport, textContent);
                  // textWrap.appendChild(svg);

                  let textLayerFrag = document.createDocumentFragment();

                  var textDivs = [],
                      textContentItemsStr = [];
                  var textLayerRenderTask = pdfJsLib.renderTextLayer({
                      textContent: textContent,
                      textContentStream: textContentStream,
                      container: textLayerFrag,
                      viewport: viewport,
                      textDivs: textDivs,
                      textContentItemsStr: textContentItemsStr,
                      timeout: 100,
                      enhanceTextSelection: false,
                  });
                  textLayerRenderTask.promise.then(() => {
                      textLayerDiv.appendChild(textLayerFrag);
                      if (pageDom.querySelector('.annotationLayer')) {
                          pageDom.insertBefore(textLayerDiv, pageDom.querySelector('.annotationLayer'))
                      } else {
                          pageDom.appendChild(textLayerDiv);
                      }
                  }, function (reason) {
                      // Cancelled or failed to render text layer; skipping errors.
                      console.log('error: ', reason)
                  });

              }).catch(function (reason) {
                  console.error('Error: ' + reason);
              });

              // annotation layer start
              page.getAnnotations({ indent: 'disaplay', }).then((annotations) => {
                  if(annotations.length === 0) {
                      return;
                  }
                  var annotationDiv = document.createElement('div');
                  annotationDiv.className = 'annotationLayer';
                  // annotationDiv.style.transform = `scale(${viewport.width / (viewport.width * (window.devicePixelRatio || 1))})`;
                  pageDom.appendChild(annotationDiv);
                  let annotationParam = {
                      viewport: viewport.clone({ dontFlip: true}),
                      div: annotationDiv,
                      annotations,
                      page,
                      imageResourcesPath: './images/',
                      renderInteractiveForms: true,
                      linkService: {
                          externalLinkTarget: null,
                          externalLinkRel: null
                      },
                      // downloadManager:
                  }
                  pdfJsLib.AnnotationLayer.render(annotationParam)
              }).catch(function (reason) {
                  console.error('Error: ' + reason);
              });
              // annotation layer end



              var renderContext = {
                  canvasContext: context,
                  viewport: viewport
              };
              console.log("renderContent: ",renderContext)
              console.log('page: ', page);
              var renderTask = page.render(renderContext);
              renderTask.then(function() {
                  console.log('page rendered');
                  t.fileLoading = false;
                  console.log('pageDom: ', pageDom);
                  resolve(pageDom);
              })
          }, function(error) {
              t.fileLoading = false;
              console.log('error', error);
              reject(error)
          })
      })
    }
  }
}
