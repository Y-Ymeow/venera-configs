/** @type {import('./_venera_.js')} */

class GodaComicSource extends ComicSource {
    name = "GoDa漫画"

    key = "goda"

    version = "2.1.0"

    minAppVersion = "1.4.0"

    url = "https://github.com/Y-Ymeow/venera-configs/blob/main/goda.js"

    get baseUrl() {
        return this.loadSetting('mirror') || 'https://g-mh.org';
    }

    get headers() {
        return {
            "Referer": `${this.baseUrl}/`,
        }
    }

    parseCoverUrl(imgSrc) {
        let url = imgSrc;
        const urlMatch = url.match(/url=(.*)/);
        if (urlMatch) {
            url = decodeURIComponent(urlMatch[1]);
        }
        // Remove resizing parameters like &w=...&q=...
        const resizeMatch = url.match(/^(.*?)&w=\d+&q=\d+$/);
        if (resizeMatch) {
            url = resizeMatch[1];
        }
        return url;
    }

    comic = {
        loadInfo: async (slug) => {
            const comicRes = await Network.get(`${this.baseUrl}/manga/${slug}`, this.headers);
            const doc = new HtmlDocument(comicRes.body);
            
            const mangaId = doc.querySelector('#mangachapters')?.attributes?.['data-mid'];
            const title = doc.querySelector('h1')?.text || '';
            const cover = this.parseCoverUrl(doc.querySelector('img.object-cover')?.attributes?.src || '');
            const description = doc.querySelector('p.text-medium')?.text || '';
            const tags = doc.querySelectorAll('div.flex.flex-wrap.gap-x-unit-xs a').map(a => a.text.replace('#', '').trim());

            // Fetch chapters from API (GoDaManhua.kt logic)
            const res = await Network.get(`https://api-get-v3.mgsearcher.com/api/manga/get?mid=${mangaId}&mode=all`, this.headers);
            const json = JSON.parse(res.body);
            const data = json.data;

            const chapters = data.chapters.reverse().map(ch => ({
                id: `${data.slug}/${ch.attributes.slug}#${data.id}/${ch.id}`,
                title: ch.attributes.title,
                time: new Date(ch.attributes.updatedAt).getTime(),
            })).reduce((acc, ch) => {
                acc[ch.id] = ch.title;
                return acc;
            }, {});

            return new ComicDetails({
                title: title,
                cover: cover,
                description: description,
                tags: { "Tags": tags },
                chapters: chapters,
            });
        },

        loadEp: async (comicId, epId) => {
            const ids = epId.split('#');
            const mangaId = ids[1].split('/')[0];
            const chapterId = ids[1].split('/')[1];
            // Fetch page list from API (GoDaManhua.kt logic)
            const res = await Network.get(`https://api-get-v3.mgsearcher.com/api/chapter/getinfo?m=${mangaId}&c=${chapterId}`, this.headers);
            const json = JSON.parse(res.body);
            const images = json.data.info.images.images.map(img => `https://f40-1-4.g-mh.online${img.url}`);
            return { images };
        },
        
        idMatch: 'manga/([\w-]+)',

        link: {
            domains: [
                "baozimh.org", "godamh.com", "m.baozimh.one", "bzmh.org", "g-mh.org", "m.g-mh.org"
            ],
            linkToId: (url) => {
                const match = url.match(/manga\/([\\w-]+)/);
                if (match) {
                    return match[1];
                }
                return null;
            }
        }
    }

    explore = [
        {
            title: "GoDa",
            type: "multiPageComicList",
            load: async (page) => {
                const res = await Network.get(`${this.baseUrl}/newss/page/${page}`, this.headers);
                const doc = new HtmlDocument(res.body);
                const comics = doc.querySelectorAll('.container > .cardlist .pb-2 a').map(a => {
                    const img = a.querySelector('img');
                    return new Comic({
                        id: a.attributes.href.split('/').pop(),
                        title: a.querySelector('h3').text,
                        cover: this.parseCoverUrl(img.attributes.src),
                    });
                });
                const hasNextPage = doc.querySelector('a[aria-label=下一頁] button') != null;
                return {
                    comics: comics,
                    maxPage: hasNextPage ? page + 1 : page,
                };
            },
        }
    ]

    search = {
        load: async (keyword, options, page) => {
            const res = await Network.get(`${this.baseUrl}/s/${encodeURIComponent(keyword)}?page=${page}`, this.headers);
            const doc = new HtmlDocument(res.body);
            const comics = doc.querySelectorAll('.container > .cardlist .pb-2 a').map(a => {
                const img = a.querySelector('img');
                return new Comic({
                    id: a.attributes.href.split('/').pop(),
                    title: a.querySelector('h3').text,
                    cover: this.parseCoverUrl(img.attributes.src),
                });
            });
            const hasNextPage = doc.querySelector('a[aria-label=下一頁] button') != null;
            return {
                comics: comics,
                maxPage: hasNextPage ? page + 1 : page,
            };
        }
    }
    
    category = {
        title: "Classify",
        parts: [
            {
                name: "Genre",
                type: "fixed",
                categories: [
                    { label: "韩漫", target: { page: "category", attributes: { category: "genre-kr" } } },
                    { label: "热门漫画", target: { page: "category", attributes: { category: "genre-hots" } } },
                    { label: "国漫", target: { page: "category", attributes: { category: "genre-cn" } } },
                    { label: "其他", target: { page: "category", attributes: { category: "genre-qita" } } },
                    { label: "日漫", target: { page: "category", attributes: { category: "genre-jp" } } },
                    { label: "欧美", target: { page: "category", attributes: { category: "genre-ou-mei" } } },
                ]
            },
            {
                name: "热门标签",
                type: "fixed",
                categories: [
                    { label: "#复仇", target: { page: "category", attributes: { category: "tag-fuchou" } } },
                    { label: "#古风", target: { page: "category", attributes: { category: "tag-gufeng" } } },
                    { label: "#奇幻", target: { page: "category", attributes: { category: "tag-qihuan" } } },
                    { label: "#逆袭", target: { page: "category", attributes: { category: "tag-nixi" } } },
                    { label: "#异能", target: { page: "category", attributes: { category: "tag-yineng" } } },
                    { label: "#宅向", target: { page: "category", attributes: { category: "tag-zhaixiang" } } },
                    { label: "#穿越", target: { page: "category", attributes: { category: "tag-chuanyue" } } },
                    { label: "#热血", target: { page: "category", attributes: { category: "tag-rexue" } } },
                    { label: "#纯爱", target: { page: "category", attributes: { category: "tag-chunai" } } },
                    { label: "#系统", target: { page: "category", attributes: { category: "tag-xitong" } } },
                    { label: "#重生", target: { page: "category", attributes: { category: "tag-zhongsheng" } } },
                    { label: "#冒险", target: { page: "category", attributes: { category: "tag-maoxian" } } },
                    { label: "#灵异", target: { page: "category", attributes: { category: "tag-lingyi" } } },
                    { label: "#大女主", target: { page: "category", attributes: { category: "tag-danvzhu" } } },
                    { label: "#剧情", target: { page: "category", attributes: { category: "tag-juqing" } } },
                    { label: "#恋爱", target: { page: "category", attributes: { category: "tag-lianai" } } },
                    { label: "#玄幻", target: { page: "category", attributes: { category: "tag-xuanhuan" } } },
                    { label: "#女神", target: { page: "category", attributes: { category: "tag-nvshen" } } },
                    { label: "#科幻", target: { page: "category", attributes: { category: "tag-kehuan" } } },
                    { label: "#魔幻", target: { page: "category", attributes: { category: "tag-mohuan" } } },
                    { label: "#推理", target: { page: "category", attributes: { category: "tag-tuili" } } },
                    { label: "#猎奇", target: { page: "category", attributes: { category: "tag-lieqi" } } },
                    { label: "#治愈", target: { page: "category", attributes: { category: "tag-zhiyu" } } },
                    { label: "#都市", target: { page: "category", attributes: { category: "tag-doushi" } } },
                    { label: "#异形", target: { page: "category", attributes: { category: "tag-yixing" } } },
                    { label: "#青春", target: { page: "category", attributes: { category: "tag-qingchun" } } },
                    { label: "#末日", target: { page: "category", attributes: { category: "tag-mori" } } },
                    { label: "#悬疑", target: { page: "category", attributes: { category: "tag-xuanyi" } } },
                    { label: "#修仙", target: { page: "category", attributes: { category: "tag-xiuxian" } } },
                    { label: "#战斗", target: { page: "category", attributes: { category: "tag-zhandou" } } },
                ]
            }
        ],
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            const [type, id] = category.split('-');
            const url = `${this.baseUrl}/manga-${type}/${id}/page/${page}`;
            const res = await Network.get(url, this.headers);
            const doc = new HtmlDocument(res.body);
            const comics = doc.querySelectorAll('.container > .cardlist .pb-2 a').map(a => {
                const img = a.querySelector('img');
                return new Comic({
                    id: a.attributes.href.split('/').pop(),
                    title: a.querySelector('h3').text,
                    cover: this.parseCoverUrl(img.attributes.src),
                });
            });
            const hasNextPage = doc.querySelector('a[aria-label=下一頁] button') != null;
            return {
                comics: comics,
                maxPage: hasNextPage ? page + 1 : page,
            };
        }
    }

    get settings() {
        const mirrors = [
            "baozimh.org", "godamh.com", "m.baozimh.one", "bzmh.org", "g-mh.org", "m.g-mh.org"
        ];
        return {
            mirror: {
                title: "镜像网址",
                type: "select",
                options: mirrors.map(m => ({ value: `https://${m}` })),
                default: `https://${mirrors[0]}`,
            },
        }
    }
}
