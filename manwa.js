/** @type {import('./_venera_.js')} */

/**
 * @typedef {Object} PageJumpTarget
 * @Property {string} page - The page name (search, category)
 * @Property {Object} attributes - The attributes of the page
 *
 * @example
 * {
 *     page: "search",
 *     attributes: {
 *         keyword: "example",
 *     },
 * }
 */

class ManwaComicSource extends ComicSource {
    // Note: The fields which are marked as [Optional] should be removed if not used

    // name of the source
    name = "漫蛙"

    // unique id of the source
    key = "manwa"

    version = "1.0.0"

    minAppVersion = "1.4.0"

    // update url
    url = "https://github.com/Y-Ymeow/venera-configs/blob/main/manwa.js"

    /**
     * [Optional] init function
     */
    init() {

    }

    // [Optional] account related
    account = {
        /**
         * [Optional] login with account and password, return any value to indicate success
         * @param account {string}
         * @param pwd {string}
         * @returns {Promise<any>}
         */
        login: async (account, pwd) => {
            /*
            Use Network to send request
            Use this.saveData to save data
            `account` and `pwd` will be saved to local storage automatically if login success
            ```
            let res = await Network.post('https://example.com/login', {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }, `account=${account}&password=${pwd}`)

            if(res.status == 200) {
                let json = JSON.parse(res.body)
                this.saveData('token', json.token)
                return 'ok'
            }

            throw 'Failed to login'
            ```
            */

        },

        /**
         * [Optional] login with webview
         */
        loginWithWebview: {
            url: "",
            /**
             * check login status
             * @param url {string} - current url
             * @param title {string} - current title
             * @returns {boolean} - return true if login success
             */
            checkStatus: (url, title) => {

            },
            /**
             * [Optional] Callback when login success
             */
            onLoginSuccess: () => {

            },
        },

        /**
         * [Optional] login with cookies
         * Note: If `this.account.login` is implemented, this will be ignored
         */
        loginWithCookies: {
            fields: [
                "ipb_member_id",
                "ipb_pass_hash",
                "igneous",
                "star",
            ],
            /**
             * Validate cookies, return false if cookies are invalid.
             *
             * Use `Network.setCookies` to set cookies before validate.
             * @param values {string[]} - same order as `fields`
             * @returns {Promise<boolean>}
             */
            validate: async (values) => {

            },
        },

        /**
         * logout function, clear account related data
         */
        logout: () => {
            /*
            ```
            this.deleteData('token')
            Network.deleteCookies('https://example.com')
            ```
            */
        },

        // {string?} - register url
        registerWebsite: null
    }

    get search() {
        const source = this;
        const tagOptions = (this.loadData('tag_list') || []).map(t => `${t.value}-${t.text}`);

        return {
            load: async (keyword, options, page) => {
                let url;
                if (keyword) {
                    url = `${source.baseUrl}/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;
                } else {
                    const params = new URLSearchParams();
                    const [status, type, area, sort, tagsJson] = options;
                    if (status) params.append('end', status);
                    if (type) params.append('gender', type);
                    if (area) params.append('area', area);
                    if (sort) params.append('sort', sort);
                    if (tagsJson) {
                        const tags = JSON.parse(tagsJson);
                        if (Array.isArray(tags) && tags.length > 0) {
                            params.append('tag', tags.join(','));
                        }
                    }
                    params.append('page', page);
                    url = `${source.baseUrl}/booklist?${params.toString()}`;
                }

                const res = await Network.get(url);
                const doc = new HtmlDocument(res.body);

                if (!keyword) {
                    const tags = doc.querySelectorAll('div.manga-filter-row.tags > a').map(a => ({
                        text: a.text,
                        value: a.attributes['data-val']
                    }));
                    if (tags.length > 0) {
                        source.saveData('tag_list', tags);
                    }
                }

                const comics = doc.querySelectorAll('ul.manga-list-2 > li, ul.book-list > li').map(li => {
                    const titleElement = li.querySelector('p.manga-list-2-title, p.book-list-info-title');
                    const linkElement = li.querySelector('a');
                    const imgElement = li.querySelector('img');
                    return new Comic({
                        id: linkElement.attributes.href,
                        title: titleElement.text,
                        cover: imgElement.attributes.src || imgElement.attributes['data-original'],
                    });
                });

                const hasNext = doc.querySelector('ul.pagination2 > li:last-child')?.text === '下一页';
                return {
                    comics: comics,
                    maxPage: hasNext ? page + 1 : page,
                };
            },

            optionList: [
                {
                    label: "状态",
                    options: [
                        '--全部',
                        '2-连载中',
                        '1-完结',
                    ],
                    default: '-',
                },
                {
                    label: "类型",
                    options: [
                        '-1-全部',
                        '2-一般向',
                        '0-BL向',
                        '1-禁漫',
                        '3-TL向',
                    ],
                    default: '-1',
                },
                {
                    label: "地区",
                    options: [
                        '--全部',
                        '2-韩国',
                        '3-日漫',
                        '4-国漫',
                        '5-台漫',
                        '6-其他',
                        '1-未分类',
                    ],
                    default: '-',
                },
                {
                    label: "排序",
                    options: [
                        '-1-最新',
                        '0-最旧',
                        '1-收藏',
                        '2-新漫',
                    ],
                    default: '-1',
                },
                {
                    label: "标签",
                    type: "multi-select",
                    options: tagOptions,
                },
            ],
        }
    }

    // favorite related
    favorites = {
        // whether support multi folders
        multiFolder: false,
        /**
         * add or delete favorite.
         * throw `Login expired` to indicate login expired, App will automatically re-login and re-add/delete favorite
         * @param comicId {string}
         * @param folderId {string}
         * @param isAdding {boolean} - true for add, false for delete
         * @param favoriteId {string?} - [Comic.favoriteId]
         * @returns {Promise<any>} - return any value to indicate success
         */
        addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
            /*
            ```
            let res = await Network.post('...')
            if (res.status === 401) {
                throw `Login expired`;
            }
            return 'ok'
            ```
            */
        },
        /**
         * load favorite folders.
         * throw `Login expired` to indicate login expired, App will automatically re-login retry.
         * if comicId is not null, return favorite folders which contains the comic.
         * @param comicId {string?}
         * @returns {Promise<{folders: {[p: string]: string}, favorited: string[]}>} - `folders` is a map of folder id to folder name, `favorited` is a list of folder id which contains the comic
         */
        loadFolders: async (comicId) => {
            /*
            ```
            let data = JSON.parse((await Network.get('...')).body)

            let folders = {}

            data.folders.forEach((f) => {
                folders[f.id] = f.name
            })

            return {
                folders: folders,
                favorited: data.favorited
            }
            ```
            */
        },
        /**
         * add a folder
         * @param name {string}
         * @returns {Promise<any>} - return any value to indicate success
         */
        addFolder: async (name) => {
            /*
            ```
            let res = await Network.post('...')
            if (res.status === 401) {
                throw `Login expired`;
            }
            return 'ok'
            ```
            */
        },
        /**
         * delete a folder
         * @param folderId {string}
         * @returns {Promise<void>} - return any value to indicate success
         */
        deleteFolder: async (folderId) => {
            /*
            ```
            let res = await Network.delete('...')
            if (res.status === 401) {
                throw `Login expired`;
            }
            return 'ok'
            ```
            */
        },
        /**
         * load comics in a folder
         * throw `Login expired` to indicate login expired, App will automatically re-login retry.
         * @param page {number}
         * @param folder {string?} - folder id, null for non-multi-folder
         * @returns {Promise<{comics: Comic[], maxPage: number}>}
         */
        loadComics: async (page, folder) => {
            /*
            ```
            let data = JSON.parse((await Network.get('...')).body)
            let maxPage = data.maxPage

            function parseComic(comic) {
                // ...

                return new Comic{
                    id: id,
                    title: title,
                    subTitle: author,
                    cover: cover,
                    tags: tags,
                    description: description
                }
            }

            return {
                comics: data.list.map(parseComic),
                maxPage: maxPage
            }
            ```
            */
        },
        /**
         * load comics with next page token
         * @param next {string | null} - next page token, null for first page
         * @param folder {string}
         * @returns {Promise<{comics: Comic[], next: string?}>}
         */
        loadNext: async (next, folder) => {

        },
        /**
         * If the comic source only allows one comic in one folder, set this to true.
         */
        singleFolderForSingleComic: false,
    }




    /*
    [Optional] settings related
    Use this.loadSetting to load setting
    ```
    let setting1Value = this.loadSetting('setting1')
    console.log(setting1Value)
    ```
     */
        get settings() {
        const mirrors = this.loadData('mirror_list') || [
            'https://manwa.me',
            'https://manwass.cc',
            'https://manwatg.cc',
            'https://manwast.cc',
            'https://manwasy.cc',
        ];
        const image_sources = this.loadData('image_source_list') || [{ name: 'None', param: '' }];

        return {
            mirror: {
                title: "使用镜像网址",
                type: "select",
                options: mirrors.map(m => ({ value: m })),
                default: mirrors[0],
            },
            custom_url: {
                title: "自定义URL",
                type: "input",
                default: '',
            },
            image_host: {
                title: "图源",
                type: "select",
                options: image_sources.map(s => ({ value: s.param, text: s.name })),
                default: image_sources[0]?.param || '',
            },
            redirect_url: {
                title: "重定向URL",
                type: "input",
                default: 'https://fuwt.cc/mw666',
            },
            update_mirrors: {
                callback: async () => {
                    const redirectUrl = this.loadSetting('redirect_url') || 'https://fuwt.cc/mw666';
                    try {
                        const res = await Network.get(redirectUrl);
                        if (res.status !== 200) {
                            UI.showMessage(`请求失败: ${res.status}`);
                            return;
                        }
                        const match = res.body.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/);
                        if (!match || !match[1]) {
                            UI.showMessage("无法找到镜像列表");
                            return;
                        }
                        const mirrorList = JSON.parse(Convert.decodeUtf8(Convert.decodeBase64(match[1])));
                        if (!Array.isArray(mirrorList)) {
                            UI.showMessage("镜像列表格式错误");
                            return;
                        }
                        this.saveData('mirror_list', mirrorList.map(m => m.trimEnd('/')));
                        UI.showMessage("镜像列表已更新。请重新进入设置页面查看。");
                    } catch (e) {
                        UI.showMessage(`更新失败: ${e}`);
                    }
                }
            },
            update_image_sources: {
                title: "更新图源列表",
                type: "callback",
                buttonText: "更新",
                callback: async () => {
                    try {
                        const res = await Network.get(this.baseUrl);
                        if (res.status !== 200) {
                            UI.showMessage(`请求失败: ${res.status}`);
                            return;
                        }
                        const doc = new HtmlDocument(res.body);
                        const links = doc.querySelectorAll('#img-host-modal > div.modal-body a');
                        const imageSources = links.map(link => ({
                            name: link.text,
                            param: link.attributes.href
                        }));
                        imageSources.unshift({ name: 'None', param: '' });
                        this.saveData('image_source_list', imageSources);
                        UI.showMessage("图源列表已更新。请重新进入设置页面查看。");
                    } catch (e) {
                        UI.showMessage(`更新失败: ${e}`);
                    }
                }
            }
        }
    }

    get baseUrl() {
        let url = this.loadSetting('custom_url');
        if (url) {
            return url.trim().replace(/\/$/, '');
        }
        return this.loadSetting('mirror') || 'https://manwa.me';
    }

    comic = {
        loadInfo: async (id) => {
            const res = await Network.get(`${this.baseUrl}${id}`);
            const doc = new HtmlDocument(res.body);

            const title = doc.querySelector('.detail-main-info-title').text;
            const cover = doc.querySelector('div.detail-main-cover > img').attributes['data-original'];
            const author = doc.querySelector('p.detail-main-info-author > span.detail-main-info-value > a').text;
            const statusText = doc.querySelector('p.detail-main-info-author:contains(更新状态) > span.detail-main-info-value').text;
            const status = statusText === '连载中' ? 0 : (statusText === '已完结' ? 1 : 2);
            const genre = doc.querySelectorAll('div.detail-main-info-class > a.info-tag').map(e => e.text);
            const description = doc.querySelector('#detail > p.detail-desc').text;

            const chapters = doc.querySelectorAll('ul#detail-list-select > li > a').map(e => ({
                id: e.attributes.href,
                title: e.text,
            })).reverse();

            return new ComicDetails({
                title: title,
                cover: cover,
                author: author,
                status: status,
                tags: { '类型': genre },
                description: description,
                chapters: chapters.reduce((acc, ch) => {
                    acc[ch.id] = ch.title;
                    return acc;
                }, {}),
            });
        },

        loadEp: async (comicId, epId) => {
            const res = await Network.get(`${this.baseUrl}${epId}${this.loadSetting('image_host') || ''}`);
            const doc = new HtmlDocument(res.body);
            const images = doc.querySelectorAll('#cp_img > div.img-content > img[data-r-src]').map(img => img.attributes['data-r-src']);
            return { images };
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                onResponse: (responseBuffer) => {
                    const key = Convert.encodeUtf8("my2ecret782ecret");
                    return Convert.decryptAesCbc(responseBuffer, key, key);
                }
            }
        },
    }

    // categories
    category = {
        title: "",
        parts: [],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            return {
                comics: [],
                maxPage: 1
            }
        },
    }

    // [Optional] translations for the strings in this config
    translation = {
        'zh_CN': {
            '使用镜像网址': '使用镜像网址',
            '自定义URL': '自定义URL',
            '图源': '图源',
            '重定向URL': '重定向URL',
        },
    }
}