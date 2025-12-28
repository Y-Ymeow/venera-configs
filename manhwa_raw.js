/** @type {import('./_venera_.js')} */

class ManhwaRawComicSource extends ComicSource {
  // name of the source
  name = "Manhwa Raw";
  // unique id of the source
  key = "manhwa_raw";

  version = "1.1.5";

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

  // --- Cache Implementation ---
  async _withCache(key, fetcher) {
    const enableCache = this.loadSetting("enableCache");
    if (!enableCache) {
      return await fetcher();
    }

    const durationHours = parseFloat(this.loadSetting("cacheDuration") || "1");
    const CACHE_DURATION = durationHours * 60 * 60 * 1000;

    const get = (obj, p) =>
      p.split(".").reduce((acc, part) => acc && acc[part], obj);

    const timestamps = this.loadData("cache_timestamps") || {};
    const cachedTimestamp = get(timestamps, key);
    const data = this.loadData("cache_data") || {};
    const cachedData = get(data, key);

    if (cachedTimestamp && cachedData) {
      const isExpired = Date.now() - cachedTimestamp > CACHE_DURATION;
      if (!isExpired) {
        console.log(`[Cache] HIT: ${key}`);
        return cachedData;
      }
    }

    try {
      console.log(
        `[Cache] ${cachedTimestamp ? "EXPIRED" : "MISS"}: ${key}. Fetching...`,
      );
      const newData = await fetcher();

      const set = (obj, p, val) => {
        const parts = p.split(".");
        const last = parts.pop();
        let current = obj;
        for (const part of parts) {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        current[last] = val;
        return obj;
      };

      let allTimestamps = this.loadData("cache_timestamps") || {};
      let allData = this.loadData("cache_data") || {};
      let allKeys = this.loadData("cache_keys") || {};

      set(allTimestamps, key, Date.now());
      set(allData, key, newData);
      set(allKeys, key, true);

      this.saveData("cache_timestamps", allTimestamps);
      this.saveData("cache_data", allData);
      this.saveData("cache_keys", allKeys);

      return newData;
    } catch (e) {
      console.error(`[Cache] FETCH FAILED for ${key}: ${e}`);
      if (cachedData) {
        console.log(
          `[Cache] Using STALE data for ${key} due to network error.`,
        );
        return cachedData;
      }
      throw e;
    }
  }

  /**
   * Extracts the manga slug from a URL like https://manhwa-raw.com/manga/love-motion-capture/
   * @param {string} url
   * @returns {string}
   */
  extractMangaSlug(url) {
    const trimmedUrl = url.trim().replace(/^\/+|\/+$/g, "");
    const parts = trimmedUrl.split("/");
    return parts[parts.length - 1];
  }

  /**
   * Extracts the chapter number from a URL like https://manhwa-raw.com/manga/love-motion-capture/chapter-38/
   * Supports formats like chapter-38, chapter-38.5, chapter-38a, chapter-38-b, chapter-38-5, etc.
   * @param {string} url
   * @returns {string}
   */
  extractChapterNumber(url) {
    const match = url.match(/chapter-([\d.-]+[a-zA-Z-]*)/);
    return match ? `chapter-${match[1]}` : "";
  }

  /**
   * Generates a manga URL from a slug
   * @param {string} slug
   * @returns {string}
   */
  generateMangaUrl(slug, chapter = null) {
    if (chapter) {
      return `${this.domain}/manga/${slug}/${chapter}/`;
    }
    return `${this.domain}/manga/${slug}/`;
  }

  parseComicEx(element) {
    let linkElement = element.querySelector(".post-title a");
    let id = this.extractMangaSlug(linkElement.attributes["href"]);
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

    // Clean up cover URL
    if (cover) {
      cover = cover.replace("awi.", "");
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
          maxPage: hasNext ? page + 1 : page,
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
      let res = await Network.get(url, {
        headers: {
          "User-Agent": this.ua,
        },
      });
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      let document = new HtmlDocument(res.body);

      // Query for search results with the correct selector
      let searchResults = document
        .querySelectorAll("div.c-tabs-item__content")
        .map((element) => {
          // Find the link element for the manga title
          let linkElement = element.querySelector("div.post-title a");

          // Extract ID from the URL
          let id = linkElement
            ? this.extractMangaSlug(linkElement.attributes["href"])
            : undefined;

          // Get the title from the link element
          let title = linkElement ? linkElement.text.trim() : "Unknown Title";

          // Find the cover image
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

          // Clean up cover URL
          if (cover) {
            cover = cover.replace("awi.", "");
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
        })
        .filter((comic) => comic.title !== "Unknown Title"); // Filter out comics with unknown title

      // Check for pagination
      const hasNext = !!document.querySelector("a.nextpostslink");
      let maxPage = hasNext ? page + 1 : page;

      return {
        comics: searchResults,
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
      const cacheKey = `comic.${id}.info`;
      return this._withCache(cacheKey, async () => {
        let res = await Network.get(this.generateMangaUrl(id), {
          headers: {
            "User-Agent": this.ua,
          },
        });
        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }

        let document = new HtmlDocument(res.body);

        // Parse title
        let titleElement = document.querySelector(
          "div.post-title h3, div.post-title h1, #manga-title > h1",
        );

        let title = titleElement.text.replace(">> MANHWA", "");
        titleElement.querySelectorAll("span").map((e) => {
          title = title.replace(e.text, "");
        });
        title = title.trim();

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

        cover = cover.replace("awi.", "");

        // Parse author
        let authorElements = document.querySelectorAll(
          "div.author-content > a , div.artist-content > a",
        );
        let author = [];
        authorElements.map((el) => {
          author.push(el.text.trim());
        });

        // Parse description
        let descriptionElement = document.querySelector(
          "div.summary-container",
        );
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

        let chapterDateElements = document.querySelectorAll(
          "li.wp-manga-chapter .chapter-release-date",
        );

        let updateTime = null;

        if (chapterDateElements.length > 0) {
          const firstDateElement = chapterDateElements[0];
          const isNew = firstDateElement.querySelector("a.c-new-tag");

          const parseDate = (timeText) => {
            if (!timeText) return null;
            const today = new Date();
            const currentYear = today.getFullYear();
            const parts = timeText.split("/");
            if (parts.length !== 2) return null;

            const [month, day] = parts.map((num) => parseInt(num, 10));
            if (isNaN(month) || isNaN(day)) return null;

            const date = new Date(currentYear, month - 1, day);
            if (date > today) {
              date.setFullYear(currentYear - 1);
            }
            return date;
          };

          if (isNew) {
            const pastDates = [];
            for (let i = 1; i < chapterDateElements.length; i++) {
              const timeText = chapterDateElements[i].text.trim();
              const date = parseDate(timeText);
              if (date) {
                pastDates.push(date);
              }
              if (pastDates.length >= 5) break; // Use up to 5 past dates
            }

            if (pastDates.length > 0) {
              let estimatedDate;
              if (pastDates.length > 1) {
                // Calculate average interval
                let totalInterval = 0;
                for (let i = 0; i < pastDates.length - 1; i++) {
                  const interval =
                    pastDates[i].getTime() - pastDates[i + 1].getTime();
                  totalInterval += interval;
                }
                const avgInterval = totalInterval / (pastDates.length - 1);
                estimatedDate = new Date(pastDates[0].getTime() + avgInterval);
              } else {
                // Fallback for only one past chapter: add 7 days
                estimatedDate = new Date(pastDates[0].getTime());
                estimatedDate.setDate(estimatedDate.getDate() + 7);
              }

              // Do not go past today
              const today = new Date();
              if (estimatedDate > today) {
                estimatedDate = today;
              }

              updateTime = `${estimatedDate.getFullYear()}-${String(estimatedDate.getMonth() + 1).padStart(2, "0")}-${String(estimatedDate.getDate()).padStart(2, "0")}`;
            }
            // If no past dates, updateTime remains null
          } else {
            const timeText = firstDateElement.text.trim();
            const date = parseDate(timeText);
            if (date) {
              updateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            }
          }
        }
        // Parse chapters
        let chapterElements = document.querySelectorAll("li.wp-manga-chapter");
        const chapters = new Map();
        let episodes = chapterElements
          .map((el, index) => {
            let chapterLinkElement = el.querySelector("a");
            let chapterUrl = chapterLinkElement.attributes["href"];
            let chapterTitle = chapterLinkElement.text.trim();

            return {
              id: this.extractChapterNumber(chapterUrl),
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
          updateTime,
        });
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
      let res = await Network.get(
        this.generateMangaUrl(comicId, chapterId) + "?style=list",
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
      let realUrl = url.replace("awi.", "");

      return {
        realUrl,
        headers: {
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
      let realUrl = url.replace("awi.", "");
      return {
        realUrl,
        headers: {
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
  settings = {
    enableCache: {
      title: "启用缓存",
      type: "switch",
      default: true,
    },
    cacheDuration: {
      title: "缓存时间 (小时)",
      type: "input",
      default: "1",
    },
    setCookie: {
      title: "设置Cookie",
      description: "设置漫画网站的Cookie, 用于解决需要登录才能访问的内容",
      type: "callback",
      buttonText: "设置",
      callback: async () => {
        try {
          const cookieString = await UI.showInputDialog(
            "请输入Cookie字符串",
            (input) => {
              if (!input || input.trim().length === 0) {
                return "Cookie字符串不能为空";
              }
              return null; // Return null if validation passes
            }
          );

          if (cookieString !== null) {
            // Parse cookie string into individual cookies
            const cookies = cookieString.split(';').map(cookie => {
              const [nameValue] = cookie.split(';'); // Only take the name=value part
              const [name, value] = nameValue.trim().split('=');

              // Sanitize the name and value to remove problematic content
              const sanitizedName = name ? name.trim().replace(/\s/g, '') : '';
              let sanitizedValue = value ? decodeURIComponent(value.trim()) : "";

              // Remove [object Promise] if present in the value
              sanitizedValue = sanitizedValue.replace(/\[object Promise\]/g, 'object');

              return {
                name: sanitizedName,
                value: sanitizedValue,
                domain: this.domain.replace('https://', '')
              };
            }).filter(cookie => cookie.name && cookie.value);

            // Set the cookies using Network.setCookies
            Network.setCookies(this.domain, cookies);
            UI.showMessage("Cookie设置成功");
          }
        } catch (error) {
          console.error("设置Cookie时出错:", error);
          UI.showMessage("设置Cookie失败: " + error.message);
        }
      },
    },
    clearCookie: {
      title: "清除Cookie",
      description: "清除漫画网站的Cookie, 用于解决403 Forbidden等问题",
      type: "callback",
      buttonText: "清除",
      callback: () => {
        Network.deleteCookies(this.domain);
        UI.showMessage("已清除Cookie");
      },
    },
    clearCache: {
      title: "清除缓存",
      type: "callback",
      buttonText: "清除缓存",
      callback: () => {
        this.deleteData("cache_timestamps");
        this.deleteData("cache_data");
        this.deleteData("cache_keys");
        UI.showMessage("已清除缓存");
      },
    },
  };
}
