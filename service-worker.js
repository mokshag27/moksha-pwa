self.addEventListener("install", function (event) {
    event.waitUntil(preLoad());
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        checkResponse(event.request)
            .then(function (response) {
                console.log("Fetch successful!");
                return response;
            })
            .catch(function () {
                console.log("Fetch from cache successful!");
                return returnFromCache(event.request);
            })
    );

    event.waitUntil(addToCache(event.request));
});

self.addEventListener("sync", (event) => {
    if (event.tag === "syncMessage") {
        console.log("Sync successful!");
    }
});

self.addEventListener("push", function (event) {
    if (event && event.data) {
        try {
            var data = event.data.json();
            if (data && data.method === "pushMessage") {
                console.log("Push notification sent");
                self.registration.showNotification("Scribble", {
                    body: data.message,
                });
            }
        } catch (error) {
            console.error("Error parsing push data:", error);
        }
    }
});

var preLoad = function () {
    return caches.open("offline").then(function (cache) {
        // caching index and important routes
        return cache.addAll([
            '/',
            '/index.html',
            '/cart.html',
            '/assets/css/style.css',
            '/app.js'
        ]);
    });
};

var checkResponse = function (request) {
    return fetch(request)
        .then(function (response) {
            if (response.status !== 404) {
                return response;
            } else {
                throw new Error("Response not found");
            }
        });
};

var returnFromCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status == 404) {
                return cache.match("offline.html");
            } else {
                return matching;
            }
        });
    });
};

var addToCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response.clone()).then(function () {
                return response;
            });
        });
    });
};