class Goda extends ComicSource {
  // Required metadata
  name = "Goda 漫画";
  key = "goda";
  version = "1.2.2";
  minAppVersion = "1.0.0";
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/goda.js";

  ua =
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

  // Main components (some optional)
  settings = {
    mirror: {
      type: "select",
      title: "镜像网址",
      options: [
        { value: "https://baozimh.org", text: "baozimh.org" },
        { value: "https://godamh.com", text: "godamh.com" },
        { value: "https://m.baozimh.one", text: "m.baozimh.one" },
        { value: "https://bzmh.org", text: "bzmh.org" },
        { value: "https://g-mh.org", text: "g-mh.org" },
        { value: "https://m.g-mh.org", text: "m.g-mh.org" },
      ],
      default: "https://baozimh.org",
    },
    refreshGenre: {
      type: "callback",
      title: "刷新分类",
      callback: () => {
        this.fetchGenres();
      },
    },
  };

  // Get the base URL from settings
  getBaseUrl() {
    return this.loadSetting("mirror");
  }

  explore = [
    {
      title: "GoDa 漫画",
      type: "multiPageComicList",
      load: async (page) => {
        const baseUrl = this.getBaseUrl();
        const res = await Network.get(`${baseUrl}/newss/page/${page}`, {
          headers: {
            Referer: `${baseUrl}/`,
            "User-Agent": this.ua,
          },
        });

        if (res.status !== 200) {
          throw new Error(`Failed to fetch latest updates: ${res.status}`);
        }

        const html = res.body;
        const doc = new HtmlDocument(html);

        const comics = [];
        const comicElements = doc.querySelectorAll(
          ".container > .cardlist .pb-2 a",
        );

        for (const element of comicElements) {
          const img = element.querySelector("img");
          const titleElement = element.querySelector("h3");

          if (img && titleElement) {
            const imgSrc = img.attributes["src"];
            // Extract 'url' parameter from imgSrc without using URL constructor
            let thumbnailUrl = imgSrc;
            if (imgSrc.includes("url=")) {
              const urlParam = imgSrc.match(/[?&]url=([^&]*)/);
              if (urlParam && urlParam[1]) {
                thumbnailUrl = decodeURIComponent(urlParam[1]);
              }
            }

            const comic = new Comic({
              id: element.attributes["href"]
                .substring("/manga/".length)
                .replace(/\/$/, "")
                .trim(),
              title: titleElement.text.trim(),
              cover: thumbnailUrl,
              url: element.attributes["href"],
            });
            comics.push(comic);
          }
        }

        // Check for next page
        const nextPageElement = doc.querySelector(
          'a[aria-label="下一頁"] button, a[aria-label="NEXT"] button',
        );
        const hasNextPage = !!nextPageElement;

        return {
          comics: comics,
          maxPage: hasNextPage ? page + 1 : 1,
        };
      },
    },
  ];

  async fetchGenres() {
    const baseUrl = this.getBaseUrl();
    const res = await Network.get(`${baseUrl}/hots/page/1`, {
      headers: {
        Referer: `${baseUrl}/`,
        "User-Agent": this.ua,
      },
    });

    if (res.status !== 200) {
      console.error(`Failed to fetch genres: ${res.status}`);
      return [];
    }

    const html = res.body;
    const doc = new HtmlDocument(html);

    // Find the genre elements in the page
    const h2Element = doc.querySelector("h2");
    if (!h2Element) return [];

    const parent = h2Element.parent?.parent;
    if (!parent) return [];

    const genreElements = parent.querySelectorAll("a");
    const genres = [];

    for (const element of genreElements) {
      const text = element.text.trim().replace("#", "");
      // Extract the URL path for the genre
      const href = element.attributes["href"];
      let key = text.toLowerCase();

      // If href exists, extract the category key from it
      if (href) {
        key = href.replace(/^\//, "").trim(); // Get the first part after the leading slash
      }

      const genre = {
        text: text,
        key: key,
      };
      genres.push(genre);
    }

    this.saveData("genres", genres);
    UI.showMessage("分类刷新成功");
  }

  // categories
  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: "GoDa 漫画",
    parts: [
      {
        // title of the part
        name: "测试动态",

        // fixed or random or dynamic
        // if random, need to provide `randomNumber` field, which indicates the number of comics to display at the same time
        // if dynamic, need to provide `loader` field, which indicates the function to load comics
        type: "dynamic",

        loader: () => {
          const genres = this.loadData("genres");
          const categories = [];
          // If we couldn't fetch genres, provide a default list
          if (genres.length > 0) {
            // Add fetched genres as categories
            for (const genre of genres) {
              categories.push({
                label: genre.text,
                target: {
                  page: "category",
                  attributes: {
                    category: genre.key,
                    title: genre.text,
                    param: null,
                  },
                },
              });
            }
          } else {
            categories.push({
              label: "全部",
              /**
               * @type {PageJumpTarget}
               */
              target: {
                page: "category",
                attributes: {},
              },
            });
          }

          return categories;
        },
      },
    ],
    // enable ranking page
    enableRankingPage: false,
  };

  /// category comic loading related
  categoryComics = {
    /**
     * load comics of a category
     * @param category {string} - category name
     * @param param {string?} - category param
     * @param options {string[]} - options from optionList
     * @param page {number} - page number
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (category, param, options, page) => {
      if (category === "all" || !category) {
        // If 'all' or no category specified, return popular manga
        const baseUrl = this.getBaseUrl();
        let cate = "manga";
        const res = await Network.get(`${baseUrl}/${cate}/page/${page}`, {
          headers: {
            Referer: `${baseUrl}/`,
            "User-Agent": this.ua,
          },
        });

        if (res.status !== 200) {
          throw new Error(`Failed to fetch popular manga: ${res.status}`);
        }

        const html = res.body;
        const doc = new HtmlDocument(html);

        const comics = [];
        const comicElements = doc.querySelectorAll(
          ".container > .cardlist .pb-2 a",
        );

        for (const element of comicElements) {
          const img = element.querySelector("img");
          const titleElement = element.querySelector("h3");

          if (img && titleElement) {
            const imgSrc = img.attributes["src"];
            // Extract 'url' parameter from imgSrc without using URL constructor
            let thumbnailUrl = imgSrc;
            if (imgSrc.includes("url=")) {
              const urlParam = imgSrc.match(/[?&]url=([^&]*)/);
              if (urlParam && urlParam[1]) {
                thumbnailUrl = decodeURIComponent(urlParam[1]);
              }
            }

            const comic = new Comic({
              id: element.attributes["href"]
                .substring("/manga/".length)
                .replace(/\/$/, "")
                .trim(),
              title: titleElement.text.trim(),
              cover: thumbnailUrl,
              url: element.attributes["href"],
            });
            comics.push(comic);
          }
        }

        // Check for next page
        const nextPageElement = doc.querySelector(
          'a[aria-label="下一頁"] button, a[aria-label="NEXT"] button',
        );
        const hasNextPage = !!nextPageElement;

        return {
          comics: comics,
          maxPage: hasNextPage ? page + 1 : page, // Convert hasNextPage to maxPage format
        };
      } else {
        // For category filtering, we need to use the category key that corresponds to a URL
        const baseUrl = this.getBaseUrl();
        // In the original implementation, category keys are URLs
        const categoryPath = category.startsWith("/")
          ? category
          : `/${category}`;
        const res = await Network.get(
          `${baseUrl}${categoryPath}/page/${page}`,
          {
            headers: {
              Referer: `${baseUrl}/`,
              "User-Agent": this.ua,
            },
          },
        );

        if (res.status !== 200) {
          throw new Error(`Failed to fetch category manga: ${res.status}`);
        }

        const html = res.body;
        const doc = new HtmlDocument(html);

        const comics = [];
        const comicElements = doc.querySelectorAll(
          ".container > .cardlist .pb-2 a",
        );

        for (const element of comicElements) {
          const img = element.querySelector("img");
          const titleElement = element.querySelector("h3");

          if (img && titleElement) {
            const imgSrc = img.attributes["src"];
            // Extract 'url' parameter from imgSrc without using URL constructor
            let thumbnailUrl = imgSrc;
            if (imgSrc.includes("url=")) {
              const urlParam = imgSrc.match(/[?&]url=([^&]*)/);
              if (urlParam && urlParam[1]) {
                thumbnailUrl = decodeURIComponent(urlParam[1]);
              }
            }

            const comic = new Comic({
              id: element.attributes["href"]
                .substring("/manga/".length)
                .replace(/\/$/, "")
                .trim(),
              title: titleElement.text.trim(),
              cover: thumbnailUrl,
              url: element.attributes["href"],
            });
            comics.push(comic);
          }
        }

        // Check for next page
        const nextPageElement = doc.querySelector(
          'a[aria-label="下一頁"] button, a[aria-label="NEXT"] button',
        );
        const hasNextPage = !!nextPageElement;

        return {
          comics: comics,
          maxPage: hasNextPage ? page + 1 : page, // Convert hasNextPage to maxPage format
        };
      }
    },
    // [Optional] provide options for category comic loading
    optionList: [
      {
        // [Optional] The label will not be displayed if it is empty.
        label: "",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: ["newToOld-最新发布", "oldToNew-最早发布"],
        // [Optional] {string[]} - show this option only when the category not in the list
        notShowWhen: null,
        // [Optional] {string[]} - show this option only when the category in the list
        showWhen: null,
      },
    ],
    /**
     * [Optional] load options dynamically. If `optionList` is provided, this will be ignored.
     * @since 1.5.0
     * @param category {string}
     * @param param {string?}
     * @return {Promise<{options: string[], label?: string}[]>} - return a list of option group, each group contains a list of options
     */
    optionLoader: async (category, param) => {
      return [
        {
          // [Optional] The label will not be displayed if it is empty.
          label: "",
          // For a single option, use `-` to separate the value and text, left for value, right for text
          options: ["newToOld-最新发布", "oldToNew-最早发布"],
        },
      ];
    },
    ranking: {
      // For a single option, use `-` to separate the value and text, left for value, right for text
      options: ["day-Day", "week-Week"],
      /**
       * load ranking comics
       * @param option {string} - option from optionList
       * @param page {number} - page number
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (option, page) => {
        // Ranking function would go here if implemented
      },
    },
  };

  search = {
    load: async (query, options, page) => {
      if (!query || query.trim() === "") {
        return {
          comics: [],
          hasNextPage: false,
        };
      }

      const baseUrl = this.getBaseUrl();
      const encodedQuery = encodeURIComponent(query);
      const res = await Network.get(
        `${baseUrl}/s/${encodedQuery}?page=${page}`,
        {
          headers: {
            Referer: `${baseUrl}/`,
            "User-Agent": this.ua,
          },
        },
      );

      if (res.status !== 200) {
        throw new Error(`Failed to search: ${res.status}`);
      }

      const html = res.body;
      const doc = new HtmlDocument(html);

      const comics = [];
      const comicElements = doc.querySelectorAll(
        ".container > .cardlist .pb-2 a",
      );

      for (const element of comicElements) {
        const img = element.querySelector("img");
        const titleElement = element.querySelector("h3");

        if (img && titleElement) {
          const imgSrc = img.attributes["src"];
          // Extract 'url' parameter from imgSrc without using URL constructor
          let thumbnailUrl = imgSrc;
          if (imgSrc.includes("url=")) {
            const urlParam = imgSrc.match(/[?&]url=([^&]*)/);
            if (urlParam && urlParam[1]) {
              thumbnailUrl = decodeURIComponent(urlParam[1]);
            }
          }

          const comic = new Comic({
            id: element.attributes["href"]
              .substring("/manga/".length)
              .replace(/\/$/, "")
              .trim(),
            title: titleElement.text.trim(),
            cover: thumbnailUrl,
            url: element.attributes["href"],
          });
          comics.push(comic);
        }
      }

      // Check for next page
      const nextPageElement = doc.querySelector(
        'a[aria-label="下一頁"] button, a[aria-label="NEXT"] button',
      );
      const hasNextPage = !!nextPageElement;

      return {
        comics: comics,
        maxPage: hasNextPage ? page + 1 : page,
      };
    },
    // enable tags suggestions
    enableTagsSuggestions: false,
  };

  comic = {
    loadInfo: async (mangaUrl) => {
      const baseUrl = this.getBaseUrl();

      // Get the manga page
      const mangaPageRes = await Network.get(`${baseUrl}/manga/${mangaUrl}`, {
        headers: {
          Referer: `${baseUrl}/`,
          "User-Agent": this.ua,
        },
      });

      if (mangaPageRes.status !== 200) {
        throw new Error(`Failed to load manga page: ${mangaPageRes.status}`);
      }

      const html = mangaPageRes.body;
      const doc = new HtmlDocument(html);

      // Extract cover
      let cover = "";
      const coverElement = doc.querySelector(
        'div[style*="background-image:url"] img, .aspect-3-4 img',
      );
      if (coverElement) {
        cover =
          coverElement.attributes["src"] ||
          coverElement.attributes["data-src"] ||
          "";
      } else {
        // Try to get the cover from the background style
        const coverDiv = doc.querySelector(
          'div[style*="background-image:url"]',
        );
        if (coverDiv) {
          const style = coverDiv.attributes["style"];
          const match = style.match(
            /background-image:url\(['"]?([^'"]*?)['"]?\)/,
          );
          if (match && match[1]) {
            cover = match[1];
          }
        }
      }

      // Extract title
      const titleElement = doc.querySelector("h1");
      let title = titleElement ? titleElement.text.trim() : "Unknown Title";

      // Extract author
      const authorElement = doc.querySelector('a[href*="/manga-author/"]');
      const author = authorElement ? [authorElement.text.trim()] : [];

      // Extract status
      const statusSpans = doc.querySelectorAll("h1 span");

      let status = [];
      for (const span of statusSpans) {
        if (
          span.text.includes("連載") ||
          span.text.includes("完結") ||
          span.text.includes("休刊")
        ) {
          title = title.replace(span.text, "");
          status = [span.text.trim()];
          break;
        }
      }

      // Extract genres/tags
      const genres = [];
      const genreElements = doc.querySelectorAll('a[href*="/manga-tag/"]');
      for (const genreElement of genreElements) {
        genres.push(genreElement.text.trim());
      }

      // Extract description
      const descElement = doc.querySelector("p.line-clamp-4");
      const description = descElement ? descElement.text.trim() : "";

      // Extract manga ID from the page for API call
      const mangaIdElement = doc.querySelector("#mangachapters, #chaplistlast");
      let mangaId = null;
      if (mangaIdElement) {
        mangaId = mangaIdElement.attributes["data-mid"];
      }

      // If we couldn't get the manga ID from the page, try other selectors
      if (!mangaId) {
        const bookmarkData = doc.querySelector("#bookmarkData");
        if (bookmarkData) {
          mangaId = bookmarkData.attributes["data-mid"];
        }
      }

      // Get detailed chapter info from API using the manga ID
      const chapters = new Map();
      let updateTime = "";
      if (mangaId) {
        const apiRes = await fetch(
          `https://api-get-v3.mgsearcher.com/api/manga/get?mid=${mangaId}&mode=all`,
          {
            headers: {
              Referer: `${baseUrl}/`,
              Origin: `${baseUrl}/`,
              Connection: "keep-alive",
              "Sec-GPC": 1,
              "User-Agent": this.ua,
              Pragma: "no-cache",
            },
          },
        );

        if (apiRes.status === 200) {
          const apiJson = await apiRes.json();
          title = apiJson.data.title;
          const apiChapters = apiJson.data?.chapters;

          updateTime = apiChapters[apiChapters.length - 1].attributes.updatedAt
            .replace("T", " ")
            .replace("Z", "");
          if (apiChapters) {
            // The API returns chapters as an indexed object
            for (const key in apiChapters) {
              if (apiChapters.hasOwnProperty(key)) {
                const chapterData = apiChapters[key];
                const chapterId = chapterData.id;
                const chapterTitle = chapterData.attributes.title;
                // Use chapterId/mangaId format to maintain consistency
                chapters.set(`${chapterId}/${mangaId}`, chapterTitle);
              }
            }
          }
        }
      } else {
        // Fallback to extracting chapters from the HTML if we couldn't get manga ID for API
        const chapterElements = doc.querySelectorAll(
          "#mangachapters a, .chapteritem a",
        );
        for (const chapterElement of chapterElements) {
          const chapterTitle = chapterElement.text.trim();
          const chapterUrl = chapterElement.attributes["href"];
          if (chapterTitle && chapterUrl) {
            // Extract chapter ID from URL - it's in format /manga/{slug}/{chapter-id}
            const urlParts = chapterUrl.split("/");
            if (urlParts.length >= 4) {
              const chapterId = urlParts[3];
              if (chapterId) {
                // Use mangaUrl/chapterId as the chapter ID to maintain consistency
                chapters.set(`${chapterId}/${mangaUrl}`, chapterTitle);
              }
            }
          }
        }
      }

      // Create ComicDetails
      const details = new ComicDetails({
        id: mangaUrl, // Using mangaUrl as the ID since we're not using API
        title,
        cover,
        description,
        tags: {
          作者: author,
          状态: status,
          标签: genres,
        },
        chapters: chapters,
        updateTime,
      });

      return details;
    },

    loadEp: async (comicId, epId) => {
      const baseUrl = this.getBaseUrl();

      // Extract chapter ID from epId (format is chapterId/mangaId)
      const [chapterId, mangaId] = epId.split("/");

      // Use the API to get chapter info
      const apiRes = await fetch(
        `https://api-get-v3.mgsearcher.com/api/chapter/getinfo?m=${mangaId}&c=${chapterId}`,
        {
          headers: {
            Referer: `${baseUrl}/`,
            Origin: `${baseUrl}/`,
            Connection: "keep-alive",
            "Sec-GPC": 1,
            "User-Agent": this.ua,
            Pragma: "no-cache",
          },
        },
      );

      const jsonData = await apiRes.json();

      if (!jsonData.data || !jsonData.data.info || !jsonData.data.info.images) {
        throw new Error("Invalid API response format");
      }

      // Extract image URLs from the JSON response
      const imageList = jsonData.data.info.images.images;
      const images = [];

      for (let i = 0; i < imageList.length; i++) {
        let imageUrl = imageList[i].url;
        if (imageUrl) {
          // If the image URL is a relative path, prepend the base API URL
          if (imageUrl.startsWith("/")) {
            imageUrl = "https://t40-1-4.g-mh.online" + imageUrl;
          }
          images.push(imageUrl);
        }
      }

      return { images };
    },

    onThumbnailLoad: (url) => {
      return {
        url: url,
        headers: {
          Referer: this.getBaseUrl(),
          "User-Agent": this.ua,
          Pragma: "no-cache",
        },
      };
    },
    onImageLoad: (url) => {
      return {
        url: url,
        headers: {
          Referer: this.getBaseUrl(),
          "User-Agent": this.ua,
          Pragma: "no-cache",
        },
      };
    },
  };
}
