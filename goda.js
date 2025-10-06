/** @type {import('./_venera_.js')} */

class GodaComicSource extends ComicSource {
    name = "GoDa漫画"

    key = "goda"

    version = "1.0.0"

    minAppVersion = "1.4.0"

    url = "https://github.com/Y-Ymeow/venera-configs/blob/main/goda.js"

    get baseUrl() {
        return this.loadSetting('mirror') || 'https://baozimh.org';
    }

    get headers() {
        return {
            "Referer": `${this.baseUrl}/`,
            "Origin": this.baseUrl,
        }
    }

    comic = {
        loadInfo: async (slug) => {
            const comicRes = await Network.get(`${this.baseUrl}/manga/${slug}`, this.headers);
            let title, cover, description, tags, mangaId;

            let match = comicRes.body.match(/<script>window\.__INITIAL_STATE__=(.*?);<\/script>/) || comicRes.body.match(/<script>window\.__NUXT__=(.*?);<\/script>/);

            if (match) {
                const data = JSON.parse(match[1]);
                const manga = data.manga || data.state.data.manga;
                mangaId = manga.id;
                title = manga.name;
                cover = manga.cover;
                description = manga.summary;
                tags = manga.tags.map(t => t.name);
            } else {
                throw new Error("Could not find __INITIAL_STATE__ or __NUXT__ object");
            }

            const res = await Network.get(`https://api-get-v3.mgsearcher.com/api/manga/get?mid=${mangaId}&mode=all`, this.headers);
            const json = JSON.parse(res.body);
            const data = json.data;

            const chapters = data.chapters.reverse().map(ch => ({
                id: `${data.slug}/${ch.attributes.slug}#${data.id}/${ch.id}`,
                title: ch.attributes.title,
                time: new Date(ch.attributes.updatedAt).getTime(),
            }));

            return new ComicDetails({
                title: title,
                cover: cover,
                description: description,
                tags: { "Tags": tags },
                chapters: chapters.reduce((acc, ch) => {
                    acc[ch.id] = ch.title;
                    return acc;
                }, {}),
            });
        },

        loadEp: async (comicId, epId) => {
            const ids = epId.split('#')[1].split('/');
            const mId = ids[0];
            const cId = ids[1];
            const res = await Network.get(`https://api-get-v3.mgsearcher.com/api/chapter/getinfo?m=${mId}&c=${cId}`, this.headers);
            const json = JSON.parse(res.body);
            const images = json.data.info.images.images.map(img => `https://f40-1-4.g-mh.online${img.url}`);
            return { images };
        },
        
        idMatch: 'manga/([\\w-]+)',

        link: {
            domains: [
                "baozimh.org", "godamh.com", "m.baozimh.one", "bzmh.org", "g-mh.org", "m.g-mh.org"
            ],
            linkToId: (url) => {
                const match = url.match(/manga\/([\w-]+)/);
                if (match) {
                    return match[1];
                }
                return null;
            }
        }
    }

    explore = [
        {
            title: "Home",
            type: "multiPartPage",
            load: async (page) => {
                const res = await Network.get(this.baseUrl, this.headers);
                let match = res.body.match(/<script>window\.__INITIAL_STATE__=(.*?);<\/script>/) || res.body.match(/<script>window\.__NUXT__=(.*?);<\/script>/);
                if (!match) {
                    throw new Error("Could not find __INITIAL_STATE__ or __NUXT__ object");
                }
                const data = JSON.parse(match[1]);
                const homeData = data.home || data.state.data;
                const hotComics = homeData.hot.map(comic => new Comic({
                    id: comic.id, // This is the slug
                    title: comic.name,
                    cover: comic.cover,
                }));
                const latestComics = homeData.latest.map(comic => new Comic({
                    id: comic.id, // This is the slug
                    title: comic.name,
                    cover: comic.cover,
                }));
                return [
                    { title: "Popular", comics: hotComics },
                    { title: "Latest", comics: latestComics },
                ];
            },
        }
    ]

    search = {
        load: async (keyword, options, page) => {
            const res = await Network.get(`${this.baseUrl}/search?q=${encodeURIComponent(keyword)}&p=${page}`, this.headers);
            const doc = new HtmlDocument(res.body);
            const comics = doc.querySelectorAll('div.comics-grid > div.comics-card').map(div => {
                const a = div.querySelector('a');
                const img = div.querySelector('a > div.card-image-container > img');
                const title = div.querySelector('a > h2.card-title');
                const id = a.attributes.href.split('/').pop();
                return new Comic({
                    id: id,
                    title: title.text,
                    cover: img.attributes.src,
                });
            });
            const pageLinks = doc.querySelectorAll('ul.pagination li a');
            let maxPage = page;
            if (pageLinks.length > 0) {
                const lastPageText = pageLinks[pageLinks.length - 1].text;
                if (lastPageText === '>') {
                    maxPage = page + 1;
                } else {
                    maxPage = parseInt(lastPageText);
                }
            }
            return {
                comics: comics,
                maxPage: maxPage,
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
            const url = `${this.baseUrl}/manga-${type}/${id}?page=${page}`;
            const res = await Network.get(url, this.headers);
            const doc = new HtmlDocument(res.body);
            const comics = doc.querySelectorAll('div.comics-grid > div.comics-card').map(div => {
                const a = div.querySelector('a');
                const img = div.querySelector('a > div.card-image-container > img');
                const title = div.querySelector('a > h2.card-title');
                const slug = a.attributes.href.split('/').pop();
                return new Comic({
                    id: slug,
                    title: title.text,
                    cover: img.attributes.src,
                });
            });
            const pageLinks = doc.querySelectorAll('ul.pagination li a');
            let maxPage = page;
            if (pageLinks.length > 0) {
                const lastPageText = pageLinks[pageLinks.length - 1].text;
                if (lastPageText === '>') {
                    maxPage = page + 1;
                } else {
                    maxPage = parseInt(lastPageText);
                }
            }
            return {
                comics: comics,
                maxPage: maxPage,
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
