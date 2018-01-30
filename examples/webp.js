/**
 * Assume we have an image server able to serve webp, convert png and jpg
 * urls to webp urls if the browser supports it
 */
addEventListener('fetch', event => {
    event.respondWith(makeWebp(event.request))
})


async function makeWebp(request) {

    let regex = /\.jpg$|\.png$/

    if(request.headers.get('Accept')
        && request.headers.get('Accept').match(/image\/webp/) != null
        && request.url.match(regex)) {
        /**
         * Replace jpg / png with webp
         */
        let url = new URL(request.url.replace(regex, '.webp'))

        /**
         * Create a new request with the webp url
         */
        const modifiedRequest = new Request(url, {
            method: request.method,
            headers: request.headers
        })

        /**
         * Fetch the webp response
         */
        const webpResponse = await fetch(modifiedRequest)

        /**
         * Add webworker header to the webp response so we can
         * check live if the webworking is doing what it should do
         */
        const webpHeaders = new Headers(webpResponse.headers)
        webpHeaders.append('X-WebWorker', 'active')

        /**
         * Return a new response object
         */
        return new Response(webpResponse.body, {
            status: webpResponse.status,
            statusText: webpResponse.statusText,
            headers: webpHeaders
        })

    } else {
        const response = await fetch(request)
        return response
    }
}