class ManhwaRawNet extends ComicSource {
    name = "Manhwa Raw Net"
    key = "manhwa_raw_net"
    version = "1.0.1"
    minAppVersion = "1.6.0"
    url =
      "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/manhwa_raw_net.js";

    baseUrl = "https://manhwa-raw.net"

    // Optional: account related
    account = null

    // Optional: settings related
    settings = {
        domain: {
            title: "网站域名",
            type: "input",
            validator: null, // string | null, regex string
            default: "manhwa-raw.net",
        }
    }

    // Optional: search related
    search = {
        /**
         * Load search result
         * @param keyword {string}
         * @param options {string[]} - options from optionList
         * @param page {number}
         * @returns {Promise<{comics: Comic[], maxPage: number}>}
         */
        load: async (keyword, options, page) => {
            if (page > 1) {
                // Use AJAX endpoint for loading more search results
                const result = await this.loadMoreSearchResults(keyword, page, options);
                // For search, we return maxPage instead of hasNextPage
                return { comics: result.comics, maxPage: result.maxPage };
            } else {
                // Use regular search page for first page
                const url = `${this.baseUrl}/?s=${encodeURIComponent(keyword)}&post_type=wp-manga&m_orderby=latest`;
                const response = await Network.get(url);
                if (response.status !== 200) {
                    throw new Error(`Failed to search: ${response.status}`);
                }

                const document = new HtmlDocument(response.body);
                const comicElements = document.querySelectorAll('.c-tabs-item__content');
                const comics = [];

                for (const element of comicElements) {
                    const comic = await this.parseSearchComic(element);
                    if (comic) {
                        comics.push(comic);
                    }
                }

                // Check if there are more pages
                const hasNextPage = document.querySelector('.wp-pagenavi a.next') !== null;
                const maxPage = hasNextPage ? page + 1 : page;

                return { comics, maxPage };
            }
        },

        // Provide options for search
        optionList: [
            {
                // For a single option, use `-` to separate the value and text, left for value, right for text
                options: [
                    "meta_value_num-latest",
                    "post_title-title"
                ],
                label: "Sort by"
            }
        ],

        // Enable tags suggestions
        enableTagsSuggestions: false,
    }

    async parseSearchComic(element) {
        try {
            // Extract thumbnail
            const thumbElement = element.querySelector('.tab-thumb img');
            let thumbnail = '';
            if (thumbElement) {
                thumbnail = thumbElement.attributes['data-src'] || thumbElement.attributes['src'] || '';
                if (thumbnail.startsWith('//')) {
                    thumbnail = 'https:' + thumbnail;
                } else if (thumbnail.startsWith('/')) {
                    thumbnail = this.baseUrl + thumbnail;
                }
            }

            // Extract title and URL
            const titleElement = element.querySelector('.post-title a');
            let title = '';
            let url = '';
            if (titleElement) {
                title = titleElement.text.trim();
                url = titleElement.attributes['href'] || '';
            }

            // Extract latest chapter info
            const latestChapterElement = element.querySelector('.meta-item.latest-chap .chapter a');
            let latestChapter = '';
            if (latestChapterElement) {
                latestChapter = latestChapterElement.text.trim();
            }

            // Extract author (if available)
            const authorElement = element.querySelector('.manga-author');
            let author = '';
            if (authorElement) {
                author = authorElement.text.trim();
            }

            // Extract status (if available)
            const statusElement = element.querySelector('.manga-status');
            let status = 'Unknown';
            if (statusElement) {
                status = statusElement.text.trim();
            }

            if (!title || !url) {
                return null;
            }

            // Extract ID from URL
            const id = url.replace(this.baseUrl, '').replace('/manga/', '').replace('/', '');

            return new Comic({
                id: 'mhn_' + id,
                title: title,
                cover: thumbnail,
                description: latestChapter, // Using latest chapter as description
                tags: [status, author] // Using status and author as tags
            });
        } catch (error) {
            console.error('Error parsing search comic:');
            console.error(error)
            return null;
        }
    }

    async loadMoreSearchResults(keyword, page, options) {
        const bodyData = {
            action: 'madara_load_more',
            page: page - 1, // The AJAX API uses 0-based indexing for pages
            template: 'madara-core/content/content-search',
            'vars[s]': keyword,
            'vars[orderby]': 'meta_value_num',
            'vars[paged]': page,
            'vars[template]': 'search',
            'vars[meta_query][0][relation]': 'AND',
            'vars[meta_query][relation]': 'AND',
            'vars[post_type]': 'wp-manga',
            'vars[post_status]': 'publish',
            'vars[meta_key]': '_latest_update',
            'vars[order]': 'desc',
            'vars[manga_archives_item_layout]': 'default'
        };

        // Convert the bodyData object to a query string format for the POST request
        let bodyString = '';
        for (const key in bodyData) {
            bodyString += `${key}=${bodyData[key]}&`;
        }
        bodyString = bodyString.slice(0, -1);

        const response = await Network.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
            'Referer': `${this.baseUrl}/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }, bodyString);

        if (response.status !== 200) {
            throw new Error(`Failed to load more search results: ${response.status}`);
        }

        // The response is HTML content for the comics
        const htmlContent = response.body;
        if (!htmlContent || htmlContent.trim() === '') {
            return { comics: [], maxPage: page - 1 };
        }

        // Parse the HTML response to extract comic elements
        // The AJAX response returns the HTML for the comic list directly
        const document = new HtmlDocument(htmlContent);
        const comicElements = document.querySelectorAll('.c-tabs-item__content');
        const comics = [];

        for (const element of comicElements) {
            const comic = await this.parseSearchComic(element);
            if (comic) {
                comics.push(comic);
            }
        }

        // For AJAX requests, we check if there are more comics to determine if there are more pages
        const hasNextPage = comics.length > 0;
        const maxPage = hasNextPage ? page + 1 : page;

        return { comics, maxPage };
    }

    explore = [
        {
            title: "ManhwaRawNet",
            key: "latest_updates",
            type: "multiPageComicList",
            load: async (page) => {
                return await this.loadLatestUpdates(page)
            }
        }
    ]

    // Favorite related
    favorites = null

    async loadLatestUpdates(page) {
        // Try using the AJAX endpoint for loading more comics
        if (page > 1) {
            return await this.loadMoreComics(page, 'latest', 'desc')
        } else {
            let url;
            if (page === 1) {
                url = `${this.baseUrl}/manga/?m_orderby=latest`;
            } else {
                url = `${this.baseUrl}/manga/page/${page}/?m_orderby=latest`;
            }

            const response = await Network.get(url)
            if (response.status !== 200) {
                throw new Error(`Failed to load latest updates: ${response.status}`)
            }

            const document = new HtmlDocument(response.body)
            const comicElements = document.querySelectorAll('.page-content-listing .manga')
            const comics = []

            for (const element of comicElements) {
                const comic = await this.parseComic(element)
                if (comic) {
                    comics.push(comic)
                }
            }

            // Check if there are more pages
            const hasNextPage = document.querySelector('.wp-pagenavi a.next') !== null

            return { comics, hasNextPage }
        }
    }

    async loadMoreComics(page, orderby = 'meta_value_num', order = 'desc') {
        const bodyData = {
            action: 'madara_load_more',
            page: page - 1, // The AJAX API uses 0-based indexing for pages
            template: 'madara-core/content/content-archive',
            'vars[orderby]': orderby,
            'vars[paged]': page,
            'vars[timerange]': '',
            'vars[posts_per_page]': 20,
            'vars[tax_query][relation]': 'OR',
            'vars[meta_query][0][relation]': 'AND',
            'vars[meta_query][relation]': 'AND',
            'vars[post_type]': 'wp-manga',
            'vars[post_status]': 'publish',
            'vars[meta_key]': '_latest_update',
            'vars[order]': order,
            'vars[sidebar]': 'right',
            'vars[manga_archives_item_layout]': 'default'
        };

        let bodyString = '';
        for (const key in bodyData) {
            bodyString += `${key}=${bodyData[key]}&`;
        }
        bodyString = bodyString.slice(0, -1);

        const response = await Network.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
            'Referer': `${this.baseUrl}/manga/`,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }, bodyString);

        if (response.status !== 200) {
            throw new Error(`Failed to load more comics: ${response.status}`);
        }

        // The response is HTML content for the comics
        const htmlContent = response.body;
        if (!htmlContent || htmlContent.trim() === '') {
            return { comics: [], hasNextPage: false };
        }

        // Parse the HTML response to extract comic elements
        // The AJAX response returns the HTML for the comic list directly
        const document = new HtmlDocument(htmlContent);
        const comicElements = document.querySelectorAll('.manga');
        const comics = [];

        for (const element of comicElements) {
            const comic = await this.parseComic(element);
            if (comic) {
                comics.push(comic);
            }
        }

        // For AJAX requests, we assume there might be more pages
        // This could be improved by checking the actual response for pagination info
        const hasNextPage = comics.length > 0;

        return { comics, hasNextPage };
    }

    async parseComic(element) {
        try {
            // Extract thumbnail
            const thumbElement = element.querySelector('.item-thumb img')
            let thumbnail = ''
            if (thumbElement) {
                thumbnail = thumbElement.attributes['data-src'] || thumbElement.attributes['src'] || ''
                if (thumbnail.startsWith('//')) {
                    thumbnail = 'https:' + thumbnail
                } else if (thumbnail.startsWith('/')) {
                    thumbnail = this.baseUrl + thumbnail
                }
            }

            // Extract title and URL
            const titleElement = element.querySelector('.post-title a')
            let title = ''
            let url = ''
            if (titleElement) {
                title = titleElement.text.trim()
                url = titleElement.attributes['href'] || ''
            }

            // Extract latest chapter info
            const latestChapterElement = element.querySelector('.chapter-item:first-child .chapter a')
            let latestChapter = ''
            if (latestChapterElement) {
                latestChapter = latestChapterElement.text.trim()
            }

            // Extract author (if available)
            const authorElement = element.querySelector('.manga-author')
            let author = ''
            if (authorElement) {
                author = authorElement.text.trim()
            }

            // Extract status (if available)
            const statusElement = element.querySelector('.manga-status')
            let status = 'Unknown'
            if (statusElement) {
                status = statusElement.text.trim()
            }

            if (!title || !url) {
                return null
            }

            // Extract ID from URL
            const id = url.replace(this.baseUrl, '').replace('/manga/', '').replace('/', '')

            return new Comic({
                id: 'mhn_' + id,
                title: title,
                cover: thumbnail,
                description: latestChapter, // Using latest chapter as description
                tags: [status, author] // Using status and author as tags
            })
        } catch (error) {
            console.error('Error parsing comic:', error)
            console.error(error)
            return null
        }
    }

    // Single comic related
    comic = {
        /**
         * Load comic info
         * @param id {string} - comic ID
         * @returns {Promise<ComicDetails>}
         */
        loadInfo: async (id) => {
            id = id.replace('mhn_', '')
            const url = `${this.baseUrl}/manga/${id}/`;
            const response = await Network.get(url);
            if (response.status !== 200) {
                throw new Error(`Failed to load comic info: ${response.status}`);
            }

            const document = new HtmlDocument(response.body);

            // Extract title
            const titleElement = document.querySelector('h1');
            const title = titleElement ? titleElement.text.trim() : 'Unknown Title';

            // Extract cover image
            let cover = '';
            const coverElement = document.querySelector('.summary_image img');
            if (coverElement) {
                cover = coverElement.attributes['data-src'] || coverElement.attributes['src'] || '';
                if (cover.startsWith('//')) {
                    cover = 'https:' + cover;
                } else if (cover.startsWith('/')) {
                    cover = this.baseUrl + cover;
                }
            }

            // Extract description
            let description = '';
            const descriptionElement = document.querySelector('.summary__content .summary-content');
            if (descriptionElement) {
                description = descriptionElement.text.trim();
            }

            // Extract author
            let author = '';
            const authorElements = document.querySelectorAll('.author-content a');
            if (authorElements.length > 0) {
                author = Array.from(authorElements).map(el => el.text.trim()).join(', ');
            }

            // Extract status
            let status = 'Unknown';
            const statusElements = document.querySelectorAll('.post-status .post-content_item');
            for (const element of statusElements) {
                const heading = element.querySelector('.summary-heading');
                if (heading && heading.text.trim().toLowerCase().includes('status')) {
                    const statusValue = element.querySelector('.summary-content');
                    if (statusValue) {
                        status = statusValue.text.trim();
                    }
                    break;
                }
            }

            // Extract genres
            const genres = [];
            const genreElements = document.querySelectorAll('.genres-content a');
            for (const element of genreElements) {
                genres.push(element.text.trim());
            }

            // Extract chapters using AJAX request
            const chapters = new Map();

            // Get the manga ID from the URL to construct the AJAX URL
            const mangaSlug = id; // id is passed as parameter to loadInfo
            const ajaxUrl = `${this.baseUrl}/manga/${mangaSlug}/ajax/chapters/`;

            // Make AJAX request to get chapter list
            const ajaxResponse = await Network.post(ajaxUrl, {});
            if (ajaxResponse.status === 200) {
                // Parse the HTML response from AJAX call
                const ajaxDocument = new HtmlDocument(ajaxResponse.body);
                const ajaxChapterElements = ajaxDocument.querySelectorAll('.wp-manga-chapter a').reverse();

                for (const element of ajaxChapterElements) {
                    const chapterTitle = element.text.trim();
                    const chapterUrl = element.attributes['href'];
                    if (chapterTitle && chapterUrl) {
                        // Use the full chapter URL as the ID to avoid issues with chapter numbers like 45.5
                        const chapterId = chapterUrl;
                        chapters.set(chapterId, chapterTitle);
                    }
                }
            } else {
                // Fallback to parsing chapters from the main page if AJAX fails
                const chapterElements = document.querySelectorAll('.wp-manga-chapter a').reverse();
                for (const element of chapterElements) {
                    const chapterTitle = element.text.trim();
                    const chapterUrl = element.attributes['href'];
                    if (chapterTitle && chapterUrl) {
                        // Use the full chapter URL as the ID to avoid issues with chapter numbers like 45.5
                        const chapterId = chapterUrl;
                        chapters.set(chapterId, chapterTitle);
                    }
                }
            }

            return new ComicDetails({
                title: title,
                cover: cover,
                description: description,
                tags: {
                    作者: [author],
                    状态: [status],
                    类型: genres
                },
                chapters: chapters
            });
        },

        /**
         * Load images of a chapter
         * @param comicId {string} - comic ID
         * @param epId {string} - episode/chapter ID
         * @returns {Promise<{images: string[]}>}
         */
        loadEp: async (comicId, epId) => {
            // epId is now the full chapter URL
            const url = epId;
            const response = await Network.get(url);
            if (response.status !== 200) {
                throw new Error(`Failed to load chapter images: ${response.status}`);
            }

            const document = new HtmlDocument(response.body);
            const images = [];

            // Look for image elements in the chapter page based on the actual HTML structure
            const imageElements = document.querySelectorAll('.reading-content .page-break img');
            for (const element of imageElements) {
                let imageUrl = element.attributes['data-src'] || element.attributes['src'] || '';
                if (imageUrl) {
                    // Clean up the URL - remove extra whitespace and newlines
                    imageUrl = imageUrl.trim();
                    if (imageUrl.startsWith('//')) {
                        imageUrl = 'https:' + imageUrl;
                    } else if (imageUrl.startsWith('/')) {
                        imageUrl = this.baseUrl + imageUrl;
                    }
                    images.push(imageUrl);
                }
            }

            return { images };
        },

        // Enable tags translate
        enableTagsTranslate: false,

        // {string?} - regex string, used to identify comic id from user input
        idMatch: null,

        /**
         * [Optional] Handle tag click event
         * @param namespace {string}
         * @param tag {string}
         * @returns {PageJumpTarget}
         */
        onClickTag: (namespace, tag) => {
            // For now, return a search page jump target
            return new PageJumpTarget({
                page: 'search',
                attributes: {
                    keyword: tag,
                }
            });
        },

        /**
         * [Optional] Handle links
         */
        link: {
            /**
             * set accepted domains
             */
            domains: [
                'manhwa-raw.net'
            ],
            /**
             * parse url to comic id
             * @param url {string}
             * @returns {string | null}
             */
            linkToId: (url) => {
                const match = url.match(/\/manga\/([^\/]+)\//);
                return match ? match[1] : null;
            }
        },

        /**
         * [Optional] like or unlike a comic
         * @param id {string}
         * @param isLike {boolean} - true for like, false for unlike
         * @returns {Promise<void>}
         */
        likeComic: async (id, isLike) => {
            // Not supported by this source
            console.log(`Like comic ${id} set to ${isLike} - not supported by this source`);
        },

        /**
         * [Optional] rate a comic
         * @param id
         * @param rating {number} - [0-10] app use 5 stars, 1 rating = 0.5 stars,
         * @returns {Promise<any>} - return any value to indicate success
         */
        starRating: async (id, rating) => {
            // Not supported by this source
            console.log(`Rating comic ${id} with ${rating} - not supported by this source`);
            return "ok";
        },

        /**
         * [Optional] provide configs for an image loading
         * @param url
         * @param comicId
         * @param epId
         * @returns {ImageLoadingConfig | Promise<ImageLoadingConfig>}
         */
        onImageLoad: (url, comicId, epId) => {
            return {
                url,
                headers: {
                    'Referer': `${this.baseUrl}/`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };
        },

        /**
         * [Optional] provide configs for a thumbnail loading
         * @param url {string}
         * @returns {ImageLoadingConfig | Promise<ImageLoadingConfig>}
         *
         * `ImageLoadingConfig.modifyImage` and `ImageLoadingConfig.onLoadFailed` will be ignored.
         * They are not supported for thumbnails.
         */
        onThumbnailLoad: (url) => {
            return {
                url,
                headers: {
                    'Referer': `${this.baseUrl}/`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };
        }
    }
}
