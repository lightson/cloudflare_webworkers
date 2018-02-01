/**
 * Assume we have an image server able to serve webp or jxr, convert png and jpg
 * urls to applicable urls if the browser supports it
 */
addEventListener('fetch', event => {
    event.respondWith(updateCompressionMethod(event.request))
})


async function updateCompressionMethod(request) {

    /**
     * Regex for image formats which can be converted
     * @type {RegExp}
     */
    let regex = /\.jpg$|\.png$/;
    let headerFormat = {webp: /image\/webp/, jxr: /image\/jxr/};
    let acceptHeader = request.headers.get('Accept');
    let compressionMethod = false;

    if(acceptHeader && request.url.match(regex)) {

        for (var format in headerFormat) {
            if (acceptHeader.match(headerFormat[format])) {
                compressionMethod = format;
            }
        }

        if (!compressionMethod) {
            /**
             * No webp or jxr accepted
             */
            const response = await fetch(request);
            return response
        }

        /**
         * Replace jpg / png with webp
         */
        let url = new URL(request.url.replace(regex, '.' + compressionMethod))

        /**
         * Create a new request with the webp url
         */
        const modifiedRequest = new Request(url, {
            method: request.method,
            headers: request.headers
        });

        /**
         * Fetch the webp response
         */
        const webpResponse = await fetch(modifiedRequest);

        /**
         * Add webworker header to the response so we can
         * check live if the webworking is doing what it should do
         */
        const webpHeaders = new Headers(webpResponse.headers);
        webpHeaders.append('X-WebWorker', 'active');
        webpHeaders.append('X-WebWorker-Method', compressionMethod);

        /**
         * Return a new response object
         */
        return new Response(webpResponse.body, {
            status: webpResponse.status,
            statusText: webpResponse.statusText,
            headers: webpHeaders
        })
    } else {
        /**
         * There was no accept header ..
         */
        const response = await fetch(request);
        return response
    }
}