class Goda extends ComicSource {
  // Required metadata
  name = "Goda 漫画";
  key = "goda";
  version = "1.1.0";
  minAppVersion = "1.0.0";
  url = "https://github.com/Y-Ymeow/venera-configs/raw/main/goda.js";

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

          console.warn(categories);

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

      // First, we need to get the manga ID from the manga page
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

      // Extract manga ID from the page
      const mangaIdElement = doc.querySelector("#mangachapters");
      if (!mangaIdElement) {
        throw new Error("Could not extract manga ID from the page");
      }
      const mangaId = mangaIdElement.attributes["data-mid"];

      // Now, get detailed manga info via the API
      const apiRes = await fetch(
        `https://api-get-v3.mgsearcher.com/api/manga/get?mid=${mangaId}&mode=all`,
        {
          headers: {
            Referer: `${baseUrl}/`,
            "User-Agent": this.ua,
          },
        },
      );

      if (apiRes.status !== 200) {
        throw new Error(
          `Failed to load manga details from API: ${apiRes.status}`,
        );
      }

      const apiJson = await apiRes.json();
      const mangaInfo = apiJson.data;

      const detailsContainer = doc.querySelector("#info .block");
      // Extract author
      const authorElement = detailsContainer.children[1];
      let author = [];
      if (authorElement) {
        author = Array.from(authorElement.children)
          .slice(1)
          .map((child) => child.text.replace(" ,", "").trim());
      }

      // Parse API response for chapters
      // Based on the Kotlin code, the API returns HTML content that we need to parse

      const statusArray = ["連載中", "完結", "停止更新", "休刊"];
      const id = mangaInfo.id;
      const cover = mangaInfo.cover;
      const title = mangaInfo.title;
      const description = mangaInfo.desc;
      const status = statusArray[mangaInfo.status] || "UNKNOWN";
      const genres = mangaInfo.tagsM.data.map((data) => {
        return data.attributes.name;
      });

      const chapterElements = mangaInfo.chapters;
      const chapters = new Map();

      chapterElements.map((data) => {
        chapters.set(data.id + "/" + id, data.attributes.title);
      });

      // Create ComicDetails
      const details = new ComicDetails({
        id,
        title,
        cover,
        description,
        tags: {
          作者: author,
          状态: [status],
          标签: genres,
        },
        chapters: chapters, // Include the chapters in the ComicDetails response
      });

      return details;
    },

    loadEp: async (comicId, epId) => {
      const [epRealId, comicRealId] = epId.split("/");
      const apiRes = await fetch(
        `https://api-get-v3.mgsearcher.com/api/chapter/getinfo?m=${comicRealId}&c=${epRealId}`,
        {
          headers: {
            Referer: `${this.getBaseUrl()}/`,
            "User-Agent": this.ua,
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
