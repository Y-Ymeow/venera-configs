/** @type {import('./_venera_.js')} */

class ManhwaRawComicSource extends ComicSource {
  // name of the source
  name = "Manhwa Raw";

  // unique id of the source
  key = "manhwa_raw";

  version = "1.0.1";

  minAppVersion = "1.4.0";

  // update url
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/manhwa_raw.js";

  // domain constant
  domain = "https://manhwa-raw.com";

  ua =
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

  /**
   * [Optional] init function
   */
  init() {}

  parseComicEx(element) {
    let linkElement = element.querySelector(".post-title a");
    let id = linkElement.attributes["href"];
    let title = linkElement.text;
    let coverElement = element.querySelector("img");
    let cover = null;
    if (coverElement) {
      let attrs = coverElement.attributes;
      cover =
        attrs["data-src"] ||
        attrs["data-lazy-src"] ||
        attrs["src"] ||
        attrs["data-cfsrc"];
    }
    let tags = [];
    let description = "";

    return new Comic({
      id: id,
      title: title,
      cover: cover.replace("awi.", ""),
      tags: tags,
      description: description,
    });
  }

  // explore page list
  explore = [
    {
      // title of the page.
      // title is used to identify the page, it should be unique
      title: "Manhwa raw",

      /// multiPartPage or multiPageComicList or mixed
      type: "multiPageComicList",

      /**
       * load function
       * @param page {number | null} - page number, null for `singlePageWithMultiPart` type
       * @returns {{}}
       * - for `multiPartPage` type, return [{title: string, comics: Comic[], viewMore: PageJumpTarget}]
       * - for `multiPageComicList` type, for each page(1-based), return {comics: Comic[], maxPage: number}
       * - for `mixed` type, use param `page` as index. for each index(0-based), return {data: [], maxPage: number?}, data is an array contains Comic[] or {title: string, comics: Comic[], viewMore: string?}
       */
      load: async (page) => {
        // return {
        //   comics: [],
        //   maxPage: 1,
        // };
        let res = await Network.get(
          this.domain + (page > 1 ? "/page/" + page : ""),
          {
            headers: {
              "User-Agent": this.ua,
            },
          },
        );

        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }

        let document = new HtmlDocument(res.body);

        let latestComics = document
          .querySelectorAll("div.page-item-detail")
          .map((e) => this.parseComicEx(e));

        const hasNext = !!document.querySelector("a.nextpostslink");

        return {
          comics: latestComics,
          maxPage: hasNext ? page + 1 : 1,
        };
      },
    },
  ];
  // /// search related
  search = {
    /**
     * load search result
     * @param keyword {string}
     * @param options {string[]} - options from optionList
     * @param page {number}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (keyword, options, page) => {
      let url = `${this.domain}/page/${page}/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`;
      let res = await Network.get(url);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let document = new HtmlDocument(res.body);

      function parseComic(element) {
        let linkElement =
          element.querySelector("div.c-tabs-item__content a, .manga__item a") ||
          element.querySelector("div.post-title a");
        let id = linkElement ? linkElement.attributes["href"] : undefined;
        let titleElement = element.querySelector("div.post-title a");
        let imgElement = element.querySelector("img");
        let title =
          (titleElement ? titleElement.text : "") ||
          (imgElement ? imgElement.attributes["alt"] : "") ||
          "Unknown Title";
        let coverElement = element.querySelector("img");
        let cover = null;
        if (coverElement) {
          let attrs = coverElement.attributes;
          cover =
            attrs["data-src"] ||
            attrs["data-lazy-src"] ||
            attrs["src"] ||
            attrs["data-cfsrc"];
        }
        let tags = [];
        let description = "";

        return new Comic({
          id: id,
          title: title,
          cover: cover,
          tags: tags,
          description: description,
        });
      }

      let comics = document
        .querySelectorAll(
          "div.c-tabs-item__content , .manga__item, div.page-item-detail",
        )
        .map(parseComic)
        .filter((comic) => comic.title !== "Unknown Title"); // Filter out comics with unknown title

      // For search, we'll return 1 as maxPage since Madara themes typically don't have reliable pagination info in search results
      let maxPage = document.querySelector("a.nextpostslink") ? page + 1 : page;

      return {
        comics: comics,
        maxPage: maxPage,
      };
    },

    /**
     * load search result with next page token.
     * The field will be ignored if `load` function is implemented.
     * @param keyword {string}
     * @param options {(string)[]} - options from optionList
     * @param next {string | null}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    loadNext: async (keyword, options, next) => {},

    // provide options for search
    optionList: [
      {
        // [Optional] default is `select`
        // type: select, multi-select, dropdown
        // For select, there is only one selected value
        // For multi-select, there are multiple selected values or none. The `load` function will receive a json string which is an array of selected values
        // For dropdown, there is one selected value at most. If no selected value, the `load` function will receive a null
        type: "select",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: ["date-Date", "views-Views", "title-Title", "rating-Rating"],
        // option label
        label: "Sort",
        // default selected options. If not set, use the first option as default
        default: "date",
      },
    ],

    // enable tags suggestions
    enableTagsSuggestions: false,
  };
  // /// single comic related
  comic = {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      let res = await Network.get(id);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let document = new HtmlDocument(res.body);

      // Parse title
      let titleElement = document.querySelector(
        "div.post-title h3, div.post-title h1, #manga-title > h1",
      );
      let title = titleElement.text.trim().replace(" >> MANHWA", "");

      // Parse cover image
      let coverElement = document.querySelector("div.summary_image img");
      let cover = null;
      if (coverElement) {
        let attrs = coverElement.attributes;
        cover =
          attrs["data-src"] ||
          attrs["data-lazy-src"] ||
          attrs["src"] ||
          attrs["data-cfsrc"];
      }

      // Parse author
      let authorElements = document.querySelectorAll(
        "div.author-content > a , div.artist-content > a",
      );
      let author = [];
      authorElements.map((el) => {
        author.push(el.text.trim());
      });

      // Parse description
      let descriptionElement = document.querySelector("div.summary-container");
      let description =
        (descriptionElement ? descriptionElement.text.trim() : "") ||
        "No description available";

      // Parse status
      let statusElement = document.querySelectorAll(
        ".profile-manga div.summary-content",
      )[7];
      let statusText = statusElement?.text.trim() || "Unknown";

      // Parse genres
      let genreElements = document.querySelectorAll("div.genres-content a");
      let tags = genreElements
        .map((el) => el.text)
        .filter((tag) => tag.trim() !== "");

      // Parse alternative names
      let altNameElement = document.querySelector(
        ".post-content_item .summary-content h3",
      );
      let altName = (altNameElement ? altNameElement.text.trim() : "") || "";

      // Parse chapters
      let chapterElements = document.querySelectorAll("li.wp-manga-chapter");
      const chapters = new Map();
      let episodes = chapterElements
        .map((el, index) => {
          let chapterLinkElement = el.querySelector("a");
          let chapterUrl = chapterLinkElement.attributes["href"];
          let chapterTitle = chapterLinkElement.text.trim();

          return {
            id: chapterUrl,
            title: chapterTitle,
          };
        })
        .reverse(); // Reverse to have oldest chapters first

      episodes.forEach((episode, index) => {
        chapters.set(episode.id, episode.title);
      });

      return new ComicDetails({
        id: id,
        title: title,
        subTitle: altName,
        cover: cover,
        description: description,
        tags: {
          作者: author,
          标签: tags,
          状态: [statusText],
        },
        chapters: chapters,
      });
    },
    /**
     * [Optional] load thumbnails of a comic
     *
     * To render a part of an image as thumbnail, return `${url}@x=${start}-${end}&y=${start}-${end}`
     * - If width is not provided, use full width
     * - If height is not provided, use full height
     * @param id {string}
     * @param next {string?} - next page token, null for first page
     * @returns {Promise<{thumbnails: string[], next: string?}>} - `next` is next page token, null for no more
     */
    loadThumbnails: async (id, next) => {
      return {
        thumbnails: [],
        next: null,
      };
    },
    /**
     * load images of a chapter
     * @param comicId {string}
     * @param epId {string?}
     * @returns {Promise<{images: string[]}>}
     */
    loadEp: async (comicId, epId) => {
      let chapterId = epId || comicId; // Use epId if provided, otherwise use comicId
      let res = await Network.get(chapterId);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let document = new HtmlDocument(res.body);

      // Get images from the chapter page
      // Try multiple selectors based on the Madara theme structure
      let imageElements = document.querySelectorAll(
        ".reading-content img.wp-manga-chapter-img",
      );

      let images = [];
      imageElements.map((el) => {
        images.push(el.attributes["data-src"].trim());
      });

      return {
        images: images,
      };
    },
    /**
     * [Optional] provide configs for an image loading
     * @param url
     * @param comicId
     * @param epId
     * @returns {ImageLoadingConfig | Promise<ImageLoadingConfig>}
     */
    onImageLoad: (url, comicId, epId) => {
      const mainDomainCookies = Network.getCookies(this.domain);

      let uniqueCookies = mainDomainCookies.reduce((acc, cookie) => {
        if (!acc.some((c) => c.name === cookie.name)) {
          acc.push(cookie);
        }
        return acc;
      }, []);

      let cookieString = uniqueCookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      let realUrl = url.replace("awi.", "");

      return {
        realUrl,
        headers: {
          Cookie: cookieString,
          Referer: this.domain + "/",
          "Sec-GPC": "1",
          "User-Agent": this.ua,
          Pragma: "no-cache",
        },
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
      const mainDomainCookies = Network.getCookies(this.domain);

      let uniqueCookies = mainDomainCookies.reduce((acc, cookie) => {
        if (!acc.some((c) => c.name === cookie.name)) {
          acc.push(cookie);
        }
        return acc;
      }, []);

      let cookieString = uniqueCookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      let realUrl = url.replace("awi.", "");
      return {
        realUrl,
        headers: {
          Cookie: cookieString,
          Referer: this.domain + "/",
          "Sec-GPC": "1",
          "User-Agent": this.ua,
          Pragma: "no-cache",
        },
      };
    },
    // enable tags translate
    enableTagsTranslate: false,
  };

  /*
    [Optional] settings related
    Use this.loadSetting to load setting
    ```
    let setting1Value = this.loadSetting('setting1')
    console.log(setting1Value)
    ```
     */
  settings = {};
}
