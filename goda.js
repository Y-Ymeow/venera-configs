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
            const nuxtRegex = /<script>window\.__NUXT__=(.*?);<\/script>/;
            const nuxtMatch = comicRes.body.match(nuxtRegex);
            if (!nuxtMatch) {
                throw new Error("Could not find __NUXT__ object");
            }
            const nuxtData = JSON.parse(nuxtMatch[1]);
            const manga = nuxtData.state.data.manga;
            const mangaId = manga.id;

            const res = await Network.get(`https://api-get-v3.mgsearcher.com/api/manga/get?mid=${mangaId}&mode=all`, this.headers);
            const json = JSON.parse(res.body);
            const data = json.data;

            const chapters = data.chapters.reverse().map(ch => ({
                id: `${data.slug}/${ch.attributes.slug}#${data.id}/${ch.id}`,
                title: ch.attributes.title,
                time: new Date(ch.attributes.updatedAt).getTime(),
            }));

            return new ComicDetails({
                title: manga.name,
                cover: manga.cover,
                description: manga.summary,
                tags: { "Tags": manga.tags.map(t => t.name) },
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
        
        idMatch: 'manga/([\w-]+)',

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
                const nuxtRegex = /<script>window\.__NUXT__=(.*?);<\/script>/;
                const nuxtMatch = res.body.match(nuxtRegex);
                if (!nuxtMatch) {
                    throw new Error("Could not find __NUXT__ object");
                }
                const nuxtData = JSON.parse(nuxtMatch[1]);
                const hotComics = nuxtData.state.data.hot.map(comic => new Comic({
                    id: comic.id, // This is the slug
                    title: comic.name,
                    cover: comic.cover,
                }));
                const latestComics = nuxtData.state.data.latest.map(comic => new Comic({
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
                name: "题材",
                type: "fixed",
                categories: [
                    { label: "热血", target: { page: "category", attributes: { category: "rixue" } } },
                    { label: "冒险", target: { page: "category", attributes: { category: "maoxian" } } },
                    { label: "魔幻", target: { page: "category", attributes: { category: "mohuan" } } },
                    { label: "奇幻", target: { page: "category", attributes: { category: "qihuan" } } },
                    { label: "搞笑", target: { page: "category", attributes: { category: "gaoxiao" } } },
                    { label: "校园", target: { page: "category", attributes: { category: "xiaoyuan" } } },
                    { label: "历史", target: { page: "category", attributes: { category: "lishi" } } },
                    { label: "战争", target: { page: "category", attributes: { category: "zhanzheng" } } },
                    { label: "体育", target: { page: "category", attributes: { category: "tiyu" } } },
                    { label: "竞技", target: { page: "category", attributes: { category: "jingji" } } },
                    { label: "科幻", target: { page: "category", attributes: { category: "kehuan" } } },
                    { label: "机甲", target: { page: "category", attributes: { category: "jijia" } } },
                    { label: "悬疑", target: { page: "category", attributes: { category: "xuanyi" } } },
                    { label: "推理", target: { page: "category", attributes: { category: "tuili" } } },
                    { label: "恐怖", target: { page: "category", attributes: { category: "kongbu" } } },
                    { label: "耽美", target: { page: "category", attributes: { category: "danmei" } } },
                    { label: "百合", target: { page: "category", attributes: { category: "baihe" } } },
                    { label: "同人", target: { page: "category", attributes: { category: "tongren" } } },
                    { label: "性转换", target: { page: "category", attributes: { category: "xingzhuanhuan" } } },
                    { label: "伪娘", target: { page: "category", attributes: { category: "weiniang" } } },
                    { label: "都市", target: { page: "category", attributes: { category: "dushi" } } },
                    { label: "恋爱", target: { page: "category", attributes: { category: "lianai" } } },
                    { label: "少女", target: { page: "category", attributes: { category: "shaonv" } } },
                    { label: "治愈", target: { page: "category", attributes: { category: "zhiyu" } } },
                    { label: "生活", target: { page: "category", attributes: { category: "shenghuo" } } },
                    { label: "橘系", target: { page: "category", attributes: { category: "juxi" } } },
                    { label: "纯爱", target: { page: "category", attributes: { category: "chunai" } } },
                    { label: "剧情", target: { page: "category", attributes: { category: "juqing" } } },
                    { label: "后宫", target: { page: "category", attributes: { category: "hougong" } } },
                    { label: "动作", target: { page: "category", attributes: { category: "dongzuo" } } },
                    { label: "穿越", target: { page: "category", attributes: { category: "chuanyue" } } },
                    { label: "重生", target: { page: "category", attributes: { category: "zhongsheng" } } },
                    { label: "古风", target: { page: "category", attributes: { category: "gufeng" } } },
                    { label: "玄幻", target: { page: "category", attributes: { category: "xuanhuan" } } },
                    { label: "修真", target: { page: "category", attributes: { category: "xiuzhen" } } },
                    { label: "逆袭", target: { page: "category", attributes: { category: "nixi" } } },
                    { label: "系统", target: { page: "category", attributes: { category: "xitong" } } },
                    { label: "其他", target: { page: "category", attributes: { category: "qita" } } },
                ]
            },
            {
                name: "地区",
                type: "fixed",
                categories: [
                    { label: "日本", target: { page: "category", attributes: { category: "riben" } } },
                    { label: "韩国", target: { page: "category", attributes: { category: "hanguo" } } },
                    { label: "大陆", target: { page: "category", attributes: { category: "dalu" } } },
                    { label: "其他", target: { page: "category", attributes: { category: "qita" } } },
                ]
            },
            {
                name: "进度",
                type: "fixed",
                categories: [
                    { label: "连载中", target: { page: "category", attributes: { category: "lianzai" } } },
                    { label: "已完结", target: { page: "category", attributes: { category: "wanjie" } } },
                ]
            }
        ],
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            const res = await Network.get(`${this.baseUrl}/classify?type=tag&val=${category}&page=${page}`, this.headers);
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