(function() {
    if ("undefined" == typeof window.powerbiframehandlerscript) {
        window.powerbiframehandlerscript = 1;
        window.onmessage = function(event) {
            var isReportPageLoadedEvent = function(event) {
                try {
                    if (event && event.data && event.data.url === '/reports/undefined/events/pageChanged') {
                        return !0
                    }
                } catch (error) {
                    return undefined
                }
            };
            if (isReportPageLoadedEvent(event)) {
                var iframe = getIframeElement(event.source)
                setTimeout(function() {
                    if (iframe && iframe.parentNode.children.length > 1) {
                        switch (iframe.parentNode.getAttribute('pbi-resize-load-event')) {
                            case 'click':
                                showElement(iframe);
                                break;
                            case 'page-load':
                            case 'seconds-timeout':
                            case 'in-view':
                                var button = getChildByTag(iframe.parentNode, 'div');
                                setButtonState(button, 'readynow');
                                break
                        }
                    }
                }, (iframe.parentNode.getAttribute('pbi-resize-delay-show') || 1) * 1000)
            }
        };

        function getChildByTag(parent, tagName) {
            if (parent) {
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].tagName.toLowerCase() === tagName.toLowerCase()) {
                        return parent.children[i]
                    }
                }
            }
            return null
        }

        function getIframeElement(srcWindow) {
            var frames = document.getElementsByTagName('iframe');
            for (var i = 0; i < frames.length; i++) {
                if (frames[i].contentWindow === srcWindow) {
                    return frames[i]
                }
            }
        }

        function showElement(iframe) {
            if (!iframe) {
                return
            }
            var parent = iframe.parentNode;
            var button = getChildByTag(parent, 'div');
            if (button) {
                parent.removeChild(button)
            }
            var spinner = getChildByTag(parent, 'span');
            if (spinner) {
                parent.removeChild(spinner)
            }
            iframe.style.position = 'static';
            iframe.style.visibility = 'visible';
            var img = getChildByTag(parent, 'img');
            if (img) {
                img.style.display = 'none';
            }
        }

        function setButtonState(button, state) {
            button.setAttribute('data-state', state);
            var text = '';
            var spinner = getChildByTag(button, 'span');
            button.innerHTML = text + spinner.outerHTML;
            switch (state) {
                case 'loading':
                    button.onclick = function() {
                        setButtonState(button, 'loadingnow')
                    }
                    button.parentNode.onclick = function() {
                        setButtonState(button, 'loadingnow')
                    }
                    break;
                case 'readynow':
                    resize();
                    var iframe = getChildByTag(button.parentNode, 'iframe');
                    showElement(iframe)
                    break;
                case 'ready':
                    resize();
                    var spinner = getChildByTag(button, 'span');
                    spinner.style.display = 'none';
                    button.style.width = 'auto';
                    button.onclick = function(e) {
                        var iframe = getChildByTag(e.target.parentNode, 'iframe');
                        showElement(iframe)
                    }
                    button.parentNode.onclick = function(e) {
                        var iframe = getChildByTag(e.target.parentNode, 'iframe');
                        showElement(iframe)
                    }
                    break;
            }
        }
        var e = function() {
            var imgOnlys = ['top-hub', 'multis'];
            for (var e = document.querySelectorAll('.pbi-resize-container'), i = 0; i < e.length; i++) {
                prepareForResize(e, i, imgOnlys);
            }
		};
		
		function findInArr(arr, str) {
			for ( i=0 ; i < arr.length ; i++ ) {
				if ( str.includes(arr[i]) ) {
					return true;
				}
			}
			return false;
		}

        function prepareForResize(e, i, imgOnlys) {
            var pbiSrcSlug = 'https://app.powerbi.com/view?r=';
            e[i].style.width = '100%';
            var pageWidth = getPageWidth();
            var actualWidth = e[i].clientWidth;
            var mobileMinWidth = e[i].getAttribute("pbi-resize-mobile-min-width");
            var webImg = e[i].getAttribute('pbi-resize-img');
            var mobileImg = e[i].getAttribute('pbi-resize-m-img') || webImg;
            var webWidth = e[i].getAttribute("pbi-resize-width");
            var webHeight = e[i].getAttribute("pbi-resize-height");
            var webSrc = e[i].getAttribute("pbi-resize-rid");
            webSrc = webSrc ? pbiSrcSlug + webSrc : webSrc;
            var mobileWidth = e[i].getAttribute("pbi-resize-m-width");
            var mobileHeight = e[i].getAttribute("pbi-resize-m-height");
            var mobileSrc = e[i].getAttribute("pbi-resize-m-rid");
            mobileSrc = mobileSrc ? pbiSrcSlug + mobileSrc : mobileSrc;
            var loadEvent = e[i].getAttribute('pbi-resize-load-event');
            var header = false;
            var img = getChildByTag(e[i], 'img');
            var iframe = getChildByTag(e[i], 'iframe');
            var currentSrc = iframe ? iframe.getAttribute('src') : null;
            var mobileRatio = mobileHeight / mobileWidth;
            var webRatio = webHeight / webWidth;
            var isWebSize = pageWidth > mobileMinWidth;
            var newSrc = !(webSrc && mobileSrc) ? webSrc : (isWebSize ? webSrc : mobileSrc);
            var resizedToWeb = ((iframe && iframe.src === mobileSrc) || (img && img.src === mobileImg)) && isWebSize && mobileSrc !== webSrc;
            var resizedToMobile = ((iframe && iframe.src == webSrc) || (img && img.src == webImg)) && !isWebSize && mobileSrc != webSrc;
            var currentSrcIsImage = e[i].children.length > 1 ? !0 : !1;
            var imgSrcToUse = (!isWebSize && mobileImg) ? mobileImg : webImg;
            if (img && findInArr(imgOnlys, imgSrcToUse) ) {
                var parent = img.parentNode;
                var button = getChildByTag(parent, 'div');
                if (button) {
                    parent.removeChild(button)
                }
                var spinner = getChildByTag(parent, 'span');
                if (spinner) {
                    parent.removeChild(spinner)
                }
                img.setAttribute('src', imgSrcToUse);
                if (iframe) {
                    iframe.style.position = 'absolute';
                    iframe.style.top = 0;
                    iframe.style.left = 0;
                    iframe.style.visibility = 'hidden'
                }
                return;
            }
            if (!currentSrc) {
                if (iframe) {
                    iframe.style.position = 'absolute';
                    iframe.style.top = 0;
                    iframe.style.left = 0;
                    iframe.style.visibility = 'hidden'
                }
                if (img) {
                    img.setAttribute('src', imgSrcToUse);
                }
                if ((!webImg && webSrc && isWebSize) || (!mobileImg && mobileSrc && !isWebSize)) {
                    iframe.setAttribute('src', (!isWebSize && mobileSrc) ? mobileSrc : webSrc);
                    showElement(iframe);
                    resize();
                    return;
                } else if ((webImg && webSrc) || (mobileImg && mobileSrc)) {
                    var button = getChildByTag(e[i], 'div');
                    setButtonState(button, 'waiting');
                    switch (loadEvent) {
                        case 'page-load':
                            console.log('go');
                            loadIframe(iframe.parentNode, newSrc);
                            break;
                        case 'seconds-timeout':
                            var timeout = parseInt(e[i].getAttribute('pbi-resize-seconds')) * 1000;
                            console.log(timeout)
                            t = setTimeout(function() {
                                loadIframe(iframe.parentNode, newSrc)
                            }, timeout);
                            break;
                        case 'in-view':
                            if (currentSrcIsImage && !iframe.src && isInViewport(img)) {
                                loadIframe(iframe.parentNode, newSrc)
                            }
                            window.addEventListener('scroll', function() {
                                if (currentSrcIsImage && !iframe.src && isInViewport(img)) {
                                    loadIframe(iframe.parentNode, newSrc)
                                }
                            }, !1);
                            break;
                        case 'click':
                            button.onclick = function() {
                                loadIframe(iframe.parentNode, newSrc)
                            }
                            e[i].firstChild.onclick = function() {
                                loadIframe(iframe.parentNode, newSrc)
                            }
                            break
                    }
                }
            }
            if ((currentSrc == webImg && !webImg && webSrc && isWebSize) || (currentSrc == mobileImg && !mobileImg && mobileSrc && !isWebSize)) {
                showElement(iframe)
            } else if (resizedToMobile || resizedToWeb) {
                changeCurrentSrc(e[i].children[0], isWebSize, currentSrcIsImage ? webImg : webSrc, currentSrcIsImage ? mobileImg : mobileSrc, newSrc)
            }
            if (currentSrcIsImage && ((resizedToMobile && !mobileImg && mobileSrc) || (resizedToWeb && !webImg && webSrc))) {
                showElement(iframe)
            } else if (!currentSrcIsImage && ((resizedToMobile && mobileImg && !mobileSrc) || (resizedToWeb && webImg && !webSrc))) {
                showElement(iframe)
            }
            if (img && img.parentNode) {
                resizeElement(img, header, actualWidth, isWebSize, webRatio, mobileRatio, webHeight, mobileHeight, true)
            }
            if (iframe) {
                resizeElement(iframe, header, actualWidth, isWebSize, webRatio, mobileRatio, webHeight, mobileHeight, false)
            }
        }

        function getPageWidth() {
            return Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.offsetWidth,
                document.documentElement.clientWidth
            );
        }

        function resizeElement(element, header, actualWidth, isWebSize, webRatio, mobileRatio, webHeight, mobileHeight, isImage) {
            var bottomFrameCut = isImage ? 0 : 45;
            var curRatio = isWebSize ? webRatio : mobileRatio;
            element.parentNode.style.height = actualWidth * curRatio + 'px';
            element.style.height = (actualWidth * curRatio) + bottomFrameCut + 'px';
        }
        document.addEventListener("DOMContentLoaded", e);
        window.addEventListener("resize", e);
        window.addEventListener("orientationchange", e);

        function isInViewport(e) {
            var bounding = e.getBoundingClientRect();
            return (bounding.top >= 0 && bounding.left >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) && bounding.right <= (window.innerWidth || document.documentElement.clientWidth))
        };

        function changeCurrentSrc(e, isWebSize, web, mobile, newSrc) {
            if (web && mobile) {
                var iframe = e.nextElementSibling;
                if (e instanceof HTMLImageElement && iframe.src && (newSrc != iframe.src)) {
                    iframe.setAttribute('src', newSrc);
                    setButtonState(iframe.nextElementSibling, 'loading')
                }
                var currentSrc = isWebSize ? web : mobile;
                e.setAttribute('src', currentSrc)
            }
        }

        function resize() {
            if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                var evt = document.createEvent('UIEvents');
                evt.initUIEvent('resize', !0, !1, window, 0);
                window.dispatchEvent(evt)
            } else {
                window.dispatchEvent(new Event('resize'))
            }
        }

        function loadIframe(parent, src) {
            var iframe = getChildByTag(parent, 'iframe');
            var button = getChildByTag(parent, 'div');
            var spinner = getChildByTag(button, 'span');
            spinner.style.display = 'block';
            iframe.setAttribute('src', src);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowFullScreen', 'true');
            setButtonState(button, 'loading')
        }
    }
}());
