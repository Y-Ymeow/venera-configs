/** @type {import('./_venera_.js')} */

class MangaDistrictComicSource extends ComicSource {
  // name of the source
  name = "Manga District";

  // unique id of the source
  key = "manga_district";

  version = "1.0.3";

  minAppVersion = "1.4.0";

  // update url
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/manga_district.js";

  /**
   * [Optional] init function
   */
  init() {
    this.baseUrl = "https://mangadistrict.com";
  }

  // explore page list
  explore = [
    {
      // title of the page.
      // title is used to identify the page, it should be unique
      title: "Manga District",
      type: "multiPageComicList",
      load: async (page) => {
        const res = await Network.get(
          `${this.baseUrl}/latest-releases/page/${page}/`,
        );
        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }

        const document = new HtmlDocument(res.body);
        const comicElements = document.querySelectorAll("div.page-item-detail");
        const comics = comicElements.map((element) => this.parseComic(element));

        // Determine max page
        let maxPage = 1;
        // Check for WordPress-style pagination (wp-pagenavi)
        let paginationElements = document.querySelectorAll(
          "div.wp-pagenavi a.page-numbers, div.wp-pagenavi a.larger, div.wp-pagenavi a.last",
        );
        if (paginationElements.length === 0) {
          // Fallback to the original selector
          paginationElements = document.querySelectorAll(
            "div[role=navigation] a.page-numbers",
          );
        }
        if (paginationElements.length > 0) {
          // Look for the last page element which might have "last" class
          let lastPageElement = null;
          // First look for the "last" page link
          for (let i = paginationElements.length - 1; i >= 0; i--) {
            if (
              paginationElements[i].attributes["class"] &&
              paginationElements[i].attributes["class"].includes("last")
            ) {
              lastPageElement = paginationElements[i];
              break;
            }
          }
          // If no "last" element found, use the last element in the list
          if (!lastPageElement) {
            lastPageElement = paginationElements[paginationElements.length - 1];
          }
          const href = lastPageElement.attributes["href"];
          if (href) {
            const match = href.match(/page\/(\d+)|\?page=(\d+)|\/(\d+)\/\?/);
            if (match) {
              // Check all capture groups for the page number
              const pageNumber = match[1] || match[2] || match[3] || "1";
              maxPage = Math.max(parseInt(pageNumber), 1);
            }
          }
        }

        return {
          comics,
          maxPage: maxPage,
        };
      },
    },
  ];

  // categories
  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: "Manga District",
    parts: [
      {
        // title of the part
        name: "Genre",

        // fixed categories
        type: "fixed",
        categories: [
          {
            label: "3D",
            target: {
              page: "category",
              attributes: { category: "3d", param: null },
            },
          },
          {
            label: "Action",
            target: {
              page: "category",
              attributes: { category: "action", param: null },
            },
          },
          {
            label: "Adventure",
            target: {
              page: "category",
              attributes: { category: "adventure", param: null },
            },
          },
          {
            label: "Comedy",
            target: {
              page: "category",
              attributes: { category: "comedy", param: null },
            },
          },
          {
            label: "Drama",
            target: {
              page: "category",
              attributes: { category: "drama", param: null },
            },
          },
          {
            label: "Fantasy",
            target: {
              page: "category",
              attributes: { category: "fantasy", param: null },
            },
          },
          {
            label: "Romance",
            target: {
              page: "category",
              attributes: { category: "romance", param: null },
            },
          },
          {
            label: "Horror",
            target: {
              page: "category",
              attributes: { category: "horror", param: null },
            },
          },
          {
            label: "Mecha",
            target: {
              page: "category",
              attributes: { category: "mecha", param: null },
            },
          },
          {
            label: "Martial Arts",
            target: {
              page: "category",
              attributes: { category: "martial-arts", param: null },
            },
          },
          {
            label: "Mature Romance",
            target: {
              page: "category",
              attributes: { category: "mature-romance", param: null },
            },
          },
          {
            label: "Mystery",
            target: {
              page: "category",
              attributes: { category: "mystery", param: null },
            },
          },
          {
            label: "Psychological",
            target: {
              page: "category",
              attributes: { category: "psychological", param: null },
            },
          },
          {
            label: "Sci Fi",
            target: {
              page: "category",
              attributes: { category: "sci-fi", param: null },
            },
          },
          {
            label: "Seinen",
            target: {
              page: "category",
              attributes: { category: "seinen", param: null },
            },
          },
          {
            label: "Shoujo",
            target: {
              page: "category",
              attributes: { category: "shoujo", param: null },
            },
          },
          {
            label: "Shounen",
            target: {
              page: "category",
              attributes: { category: "shounen", param: null },
            },
          },
          {
            label: "Slice of Life",
            target: {
              page: "category",
              attributes: { category: "slice-of-life", param: null },
            },
          },
          {
            label: "Sports",
            target: {
              page: "category",
              attributes: { category: "sports", param: null },
            },
          },
          {
            label: "Supernatural",
            target: {
              page: "category",
              attributes: { category: "supernatural", param: null },
            },
          },
          {
            label: "3D Anime",
            target: {
              page: "category",
              attributes: { category: "3d-anime", param: null },
            },
          },
          {
            label: "Action",
            target: {
              page: "category",
              attributes: { category: "action", param: null },
            },
          },
          {
            label: "Adapted to Anime",
            target: {
              page: "category",
              attributes: { category: "adapted-to-anime", param: null },
            },
          },
          {
            label: "Adventure",
            target: {
              page: "category",
              attributes: { category: "adventure", param: null },
            },
          },
          {
            label: "AI Art",
            target: {
              page: "category",
              attributes: { category: "ai-art", param: null },
            },
          },
          {
            label: "Aliens",
            target: {
              page: "category",
              attributes: { category: "aliens", param: null },
            },
          },
          {
            label: "Animation",
            target: {
              page: "category",
              attributes: { category: "animation", param: null },
            },
          },
          {
            label: "Based on Another Work",
            target: {
              page: "category",
              attributes: { category: "based-on-another-work", param: null },
            },
          },
          {
            label: "BL",
            target: {
              page: "category",
              attributes: { category: "bl", param: null },
            },
          },
          {
            label: "BL Uncensored",
            target: {
              page: "category",
              attributes: { category: "bl-uncensored", param: null },
            },
          },
          {
            label: "Borderline H",
            target: {
              page: "category",
              attributes: { category: "borderline-h", param: null },
            },
          },
          {
            label: "Cohabitation",
            target: {
              page: "category",
              attributes: { category: "cohabitation", param: null },
            },
          },
          {
            label: "Collection of Stories",
            target: {
              page: "category",
              attributes: { category: "collection-of-stories", param: null },
            },
          },
          {
            label: "Comedy",
            target: {
              page: "category",
              attributes: { category: "comedy", param: null },
            },
          },
          {
            label: "Comics",
            target: {
              page: "category",
              attributes: { category: "comics", param: null },
            },
          },
          {
            label: "Cooking",
            target: {
              page: "category",
              attributes: { category: "cooking", param: null },
            },
          },
          {
            label: "Coworkers",
            target: {
              page: "category",
              attributes: { category: "coworkers", param: null },
            },
          },
          {
            label: "Crime",
            target: {
              page: "category",
              attributes: { category: "crime", param: null },
            },
          },
          {
            label: "Crossdressing",
            target: {
              page: "category",
              attributes: { category: "crossdressing", param: null },
            },
          },
          {
            label: "Delinquents",
            target: {
              page: "category",
              attributes: { category: "delinquents", param: null },
            },
          },
          {
            label: "Demons",
            target: {
              page: "category",
              attributes: { category: "demons", param: null },
            },
          },
          {
            label: "Detectives",
            target: {
              page: "category",
              attributes: { category: "detectives", param: null },
            },
          },
          {
            label: "Doujinshi",
            target: {
              page: "category",
              attributes: { category: "doujinshi", param: null },
            },
          },
          {
            label: "Drama",
            target: {
              page: "category",
              attributes: { category: "drama", param: null },
            },
          },
          {
            label: "Ecchi",
            target: {
              page: "category",
              attributes: { category: "ecchi", param: null },
            },
          },
          {
            label: "Fantasy",
            target: {
              page: "category",
              attributes: { category: "fantasy", param: null },
            },
          },
          {
            label: "Fetish",
            target: {
              page: "category",
              attributes: { category: "fetish", param: null },
            },
          },
          {
            label: "Full Color",
            target: {
              page: "category",
              attributes: { category: "full-color", param: null },
            },
          },
          {
            label: "Gender Bender",
            target: {
              page: "category",
              attributes: { category: "gender-bender", param: null },
            },
          },
          {
            label: "Ghosts",
            target: {
              page: "category",
              attributes: { category: "ghosts", param: null },
            },
          },
          {
            label: "GL",
            target: {
              page: "category",
              attributes: { category: "gl", param: null },
            },
          },
          {
            label: "Gyaru",
            target: {
              page: "category",
              attributes: { category: "gyaru", param: null },
            },
          },
          {
            label: "Harem",
            target: {
              page: "category",
              attributes: { category: "harem", param: null },
            },
          },
          {
            label: "Hentai Anime",
            target: {
              page: "category",
              attributes: { category: "hentai-anime", param: null },
            },
          },
          {
            label: "Historical",
            target: {
              page: "category",
              attributes: { category: "historical", param: null },
            },
          },
          {
            label: "Horror",
            target: {
              page: "category",
              attributes: { category: "horror", param: null },
            },
          },
          {
            label: "Incest",
            target: {
              page: "category",
              attributes: { category: "incest", param: null },
            },
          },
          {
            label: "Isekai",
            target: {
              page: "category",
              attributes: { category: "isekai", param: null },
            },
          },
          {
            label: "Japanese Webtoons",
            target: {
              page: "category",
              attributes: { category: "japanese-webtoons", param: null },
            },
          },
          {
            label: "Josei",
            target: {
              page: "category",
              attributes: { category: "josei", param: null },
            },
          },
          {
            label: "Light Novels",
            target: {
              page: "category",
              attributes: { category: "light-novels", param: null },
            },
          },
          {
            label: "Magic",
            target: {
              page: "category",
              attributes: { category: "magic", param: null },
            },
          },
          {
            label: "Manhua",
            target: {
              page: "category",
              attributes: { category: "manhua", param: null },
            },
          },
          {
            label: "Manhwa",
            target: {
              page: "category",
              attributes: { category: "manhwa", param: null },
            },
          },
          {
            label: "Martial Arts",
            target: {
              page: "category",
              attributes: { category: "martial-arts", param: null },
            },
          },
          {
            label: "Mature Romance",
            target: {
              page: "category",
              attributes: { category: "mature-romance", param: null },
            },
          },
          {
            label: "Mecha",
            target: {
              page: "category",
              attributes: { category: "mecha", param: null },
            },
          },
          {
            label: "Medical",
            target: {
              page: "category",
              attributes: { category: "medical", param: null },
            },
          },
          {
            label: "Military",
            target: {
              page: "category",
              attributes: { category: "military", param: null },
            },
          },
          {
            label: "Monster Girls",
            target: {
              page: "category",
              attributes: { category: "monster-girls", param: null },
            },
          },
          {
            label: "Monsters",
            target: {
              page: "category",
              attributes: { category: "monsters", param: null },
            },
          },
          {
            label: "Music",
            target: {
              page: "category",
              attributes: { category: "music", param: null },
            },
          },
          {
            label: "Mystery",
            target: {
              page: "category",
              attributes: { category: "mystery", param: null },
            },
          },
          {
            label: "Ninja",
            target: {
              page: "category",
              attributes: { category: "ninja", param: null },
            },
          },
          {
            label: "One Shot",
            target: {
              page: "category",
              attributes: { category: "one-shot", param: null },
            },
          },
          {
            label: "Parody Anime",
            target: {
              page: "category",
              attributes: { category: "parody-anime", param: null },
            },
          },
          {
            label: "Person in a Strange World",
            target: {
              page: "category",
              attributes: {
                category: "person-in-a-strange-world",
                param: null,
              },
            },
          },
          {
            label: "Police",
            target: {
              page: "category",
              attributes: { category: "police", param: null },
            },
          },
          {
            label: "Psychological",
            target: {
              page: "category",
              attributes: { category: "psychological", param: null },
            },
          },
          {
            label: "Reincarnation",
            target: {
              page: "category",
              attributes: { category: "reincarnation", param: null },
            },
          },
          {
            label: "Reverse Harem",
            target: {
              page: "category",
              attributes: { category: "reverse-harem", param: null },
            },
          },
          {
            label: "Romance",
            target: {
              page: "category",
              attributes: { category: "romance", param: null },
            },
          },
          {
            label: "Samurai",
            target: {
              page: "category",
              attributes: { category: "samurai", param: null },
            },
          },
          {
            label: "School Life",
            target: {
              page: "category",
              attributes: { category: "school-life", param: null },
            },
          },
          {
            label: "Sci Fi",
            target: {
              page: "category",
              attributes: { category: "sci-fi", param: null },
            },
          },
          {
            label: "Seinen",
            target: {
              page: "category",
              attributes: { category: "seinen", param: null },
            },
          },
          {
            label: "Shoujo",
            target: {
              page: "category",
              attributes: { category: "shoujo", param: null },
            },
          },
          {
            label: "Shoujo-ai",
            target: {
              page: "category",
              attributes: { category: "shoujo-ai", param: null },
            },
          },
          {
            label: "Shounen",
            target: {
              page: "category",
              attributes: { category: "shounen", param: null },
            },
          },
          {
            label: "Shounen-ai",
            target: {
              page: "category",
              attributes: { category: "shounen-ai", param: null },
            },
          },
          {
            label: "Siblings",
            target: {
              page: "category",
              attributes: { category: "siblings", param: null },
            },
          },
          {
            label: "Slice of Life",
            target: {
              page: "category",
              attributes: { category: "slice-of-life", param: null },
            },
          },
          {
            label: "Smut",
            target: {
              page: "category",
              attributes: { category: "smut", param: null },
            },
          },
          {
            label: "Sports",
            target: {
              page: "category",
              attributes: { category: "sports", param: null },
            },
          },
          {
            label: "Superheroes",
            target: {
              page: "category",
              attributes: { category: "superheroes", param: null },
            },
          },
          {
            label: "Supernatural",
            target: {
              page: "category",
              attributes: { category: "supernatural", param: null },
            },
          },
          {
            label: "Survival",
            target: {
              page: "category",
              attributes: { category: "survival", param: null },
            },
          },
          {
            label: "Thriller",
            target: {
              page: "category",
              attributes: { category: "thriller", param: null },
            },
          },
          {
            label: "Transfer Students",
            target: {
              page: "category",
              attributes: { category: "transfer-students", param: null },
            },
          },
          {
            label: "Uncensored",
            target: {
              page: "category",
              attributes: { category: "uncensored", param: null },
            },
          },
          {
            label: "Uncensored Anime",
            target: {
              page: "category",
              attributes: { category: "uncensored-anime", param: null },
            },
          },
          {
            label: "Vampires",
            target: {
              page: "category",
              attributes: { category: "vampires", param: null },
            },
          },
          {
            label: "Web Novels",
            target: {
              page: "category",
              attributes: { category: "web-novels", param: null },
            },
          },
          {
            label: "Webtoons",
            target: {
              page: "category",
              attributes: { category: "webtoons", param: null },
            },
          },
          {
            label: "Western",
            target: {
              page: "category",
              attributes: { category: "western", param: null },
            },
          },
          {
            label: "Work Life",
            target: {
              page: "category",
              attributes: { category: "work-life", param: null },
            },
          },
          {
            label: "Yaoi",
            target: {
              page: "category",
              attributes: { category: "yaoi", param: null },
            },
          },
          {
            label: "Yuri",
            target: {
              page: "category",
              attributes: { category: "yuri", param: null },
            },
          },
          {
            label: "Zombies",
            target: {
              page: "category",
              attributes: { category: "zombies", param: null },
            },
          },
        ],
      },
    ],
    // enable ranking page
    enableRankingPage: true,
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
      let url = `${this.baseUrl}/manga/`;

      if (category === "popular") {
        url = `${this.baseUrl}/manga/?m_orderby=views`;
      } else if (category === "latest") {
        url = `${this.baseUrl}/manga/?m_orderby=latest`;
      } else {
        // For genre categories, use the publication-genre URL format
        url = `${this.baseUrl}/publication-genre/${category}/page/${page}/`;
      }

      // Apply sorting options if provided
      if (options && options.length > 0) {
        const sortOption = options[0]; // Use the first option as sort parameter
        if (sortOption && sortOption !== "default") {
          // Assuming "default" means no sorting
          // Add sort parameter to URL
          const separator = url.includes("?") ? "&" : "?";
          url += `${separator}m_orderby=${sortOption}`;
        }
      }

      const res = await Network.get(url);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);
      const comicElements = document.querySelectorAll("div.page-item-detail");
      const comics = comicElements.map((element) => this.parseComic(element));

      // Determine max page
      let maxPage = 1;
      // Check for WordPress-style pagination (wp-pagenavi)
      let paginationElements = document.querySelectorAll(
        "div.wp-pagenavi a.page-numbers, div.wp-pagenavi a.larger, div.wp-pagenavi a.last",
      );
      if (paginationElements.length === 0) {
        // Fallback to the original selector
        paginationElements = document.querySelectorAll(
          "div[role=navigation] a.page-numbers",
        );
      }
      if (paginationElements.length > 0) {
        // Look for the last page element which might have "last" class
        let lastPageElement = null;
        // First look for the "last" page link
        for (let i = paginationElements.length - 1; i >= 0; i--) {
          if (
            paginationElements[i].attributes["class"] &&
            paginationElements[i].attributes["class"].includes("last")
          ) {
            lastPageElement = paginationElements[i];
            break;
          }
        }
        // If no "last" element found, use the last element in the list
        if (!lastPageElement) {
          lastPageElement = paginationElements[paginationElements.length - 1];
        }
        const href = lastPageElement.attributes["href"];
        if (href) {
          const match = href.match(/page\/(\d+)|\?page=(\d+)|\/(\d+)\/\?/);
          if (match) {
            // Check all capture groups for the page number
            const pageNumber = match[1] || match[2] || match[3] || "1";
            maxPage = Math.max(parseInt(pageNumber), 1);
          }
        }
      }

      return {
        comics,
        maxPage: maxPage,
      };
    },
    // [Optional] provide options for category comic loading
    optionList: [
      {
        // [Optional] The label will not be displayed if it is empty.
        label: "Sort",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: [
          "default-Default",
          "views-Popular",
          "latest-Latest",
          "new-manga-New",
          "rating-Rating",
          "title-Title",
        ],
        // [Optional] {string[]} - show this option only when the category not in the list
        notShowWhen: null,
        // [Optional] {string[]} - show this option only when the category in the list
        showWhen: null,
      },
    ],
    ranking: {
      // For a single option, use `-` to separate the value and text, left for value, right for text
      options: ["week-Week", "month-Month", "all-Time"],
      /**
       * load ranking comics
       * @param option {string} - option from optionList
       * @param page {number} - page number
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (option, page) => {
        let orderBy = "views";
        if (option === "week") {
          orderBy = "week";
        } else if (option === "month") {
          orderBy = "month";
        } else {
          orderBy = "all";
        }

        const res = await Network.get(
          `${this.baseUrl}/manga/?m_orderby=${orderBy}`,
        );
        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }

        const document = new HtmlDocument(res.body);
        const comicElements = document.querySelectorAll("div.page-item-detail");
        const comics = comicElements.map((element) => this.parseComic(element));

        return {
          comics,
          maxPage: 1,
        };
      },
    },
  };

  /// search related
  search = {
    /**
     * load search result
     * @param keyword {string}
     * @param options {string[]} - options from optionList
     * @param page {number}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (keyword, options, page) => {
      // Build search URL
      let url = `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`;

      // Apply options if provided
      if (options && options.length > 0) {
        const sortOption = options[0]; // Use the first option as sort parameter
        if (sortOption && sortOption !== "default") {
          // Assuming "default" means no sorting
          url += `&m_orderby=${sortOption}`;
        }
      }

      const res = await Network.get(url);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);
      // Use different selectors for search results
      const comicElements = document.querySelectorAll(
        "div.page-listing-item div.page-item-detail.manga, div.c-tabs-item__content, .manga__item",
      );
      const comics = comicElements.map((element) => this.parseComic(element));

      // Determine max page
      let maxPage = 1;
      // Check for WordPress-style pagination (wp-pagenavi)
      let paginationElements = document.querySelectorAll(
        "div.wp-pagenavi a.page-numbers, div.wp-pagenavi a.larger, div.wp-pagenavi a.last",
      );
      if (paginationElements.length === 0) {
        // Fallback to the original selector
        paginationElements = document.querySelectorAll(
          "div[role=navigation] a.page-numbers",
        );
      }
      if (paginationElements.length > 0) {
        // Look for the last page element which might have "last" class
        let lastPageElement = null;
        // First look for the "last" page link
        for (let i = paginationElements.length - 1; i >= 0; i--) {
          if (
            paginationElements[i].attributes["class"] &&
            paginationElements[i].attributes["class"].includes("last")
          ) {
            lastPageElement = paginationElements[i];
            break;
          }
        }
        // If no "last" element found, use the last element in the list
        if (!lastPageElement) {
          lastPageElement = paginationElements[paginationElements.length - 1];
        }
        const href = lastPageElement.attributes["href"];
        if (href) {
          const match = href.match(/page\/(\d+)|\?page=(\d+)|\/(\d+)\/\?/);
          if (match) {
            // Check all capture groups for the page number
            const pageNumber = match[1] || match[2] || match[3] || "1";
            maxPage = Math.max(parseInt(pageNumber), 1);
          }
        }
      }

      return {
        comics,
        maxPage: maxPage,
      };
    },

    // provide options for search
    optionList: [
      {
        // [Optional] default is `select`
        // type: select, multi-select, dropdown
        type: "select",
        // For a single option, use `-` to separate the value and text, left for value, right for text
        options: [
          "default-Default",
          "latest-Latest",
          "popular-Popular",
          "new-manga-New",
          "rating-Rating",
          "title-Title",
        ],
        // option label
        label: "Sort",
        // default selected options. If not set, use the first option as default
        default: null,
      },
    ],

    // enable tags suggestions
    enableTagsSuggestions: false,
  };

  /// single comic related
  comic = {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      const res = await Network.get(this.generateMangaUrl(id));
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);

      // Extract comic details
      const titleElement = document.querySelector(
        "div.post-title h3, div.post-title h1, #manga-title > h1",
      );
      const title = titleElement ? titleElement.text.trim() : "Unknown Title";

      const thumbnailElement = document.querySelector("div.summary_image img");
      const cover = thumbnailElement ? this.getImageUrl(thumbnailElement) : "";

      const descriptionElement = document.querySelector(
        "div.description-summary div.summary__content, div.summary_content div.post-content_item > h5 + div, div.summary_content div.manga-excerpt",
      );
      const description = descriptionElement
        ? descriptionElement.text.trim()
        : "";

      const authorElement = document.querySelector(
        "div.author-content > a, div.manga-authors > a",
      );
      const author = authorElement
        ? authorElement.text.trim()
        : "Unknown Author";

      const statusElement = document.querySelector(
        "div.summary-content, .post-status div",
      );
      let status = "Unknown";
      if (statusElement) {
        const statusText = statusElement.text.trim().toLowerCase();
        if (statusText.includes("completed")) status = "Completed";
        else if (
          statusText.includes("ongoing") ||
          statusText.includes("updating")
        )
          status = "Ongoing";
        else if (statusText.includes("on hold")) status = "On Hiatus";
        else if (statusText.includes("canceled")) status = "Cancelled";
      }

      const genreElements = document.querySelectorAll("div.genres-content a");
      const genres = Array.from(genreElements).map((el) => el.text.trim());

      // Extract alternative names
      let altNames = "";
      const altNameElements = document.querySelectorAll(".post-content_item");
      for (const element of Array.from(altNameElements)) {
        const heading = element.querySelector("h5, .summary-heading");
        if (heading && heading.text.toLowerCase().includes("alternative")) {
          const content = element.querySelector(".summary-content");
          if (content) {
            altNames = content.text.trim();
            break;
          }
        }
      }

      let subtitle = "";
      // Add alternative names to description if available
      if (altNames && altNames.length > 0) {
        subtitle = altNames;
      }

      // Get chapters
      const chapterElements = document.querySelectorAll("li.wp-manga-chapter");
      const chapters = [];
      for (let i = 0; i < chapterElements.length; i++) {
        const element = chapterElements[i];
        const linkElement = element.querySelector("a");
        if (linkElement) {
          const chapterTitle = linkElement.text.trim();
          const chapterUrl = linkElement.attributes["href"];

          // Extract chapter number from URL if possible
          const chapterNumberMatch = chapterUrl.match(
            /chapter-(\d+(?:\.\d+)?)/i,
          );
          const chapterNumber = chapterNumberMatch
            ? parseFloat(chapterNumberMatch[1])
            : i + 1;

          // Get release date
          const dateElement = element.querySelector("span.timediff");
          const releaseDate = dateElement ? dateElement.text.trim() : "";

          chapters.push({
            id: this.extractChapterSlug(chapterUrl),
            title: chapterTitle,
            number: chapterNumber,
            date: releaseDate,
          });
        }
      }

      let chaptersList = new Map();

      chapters.reverse().forEach((e) => {
        chaptersList.set(e.id, e.title);
      });

      // Get update time from first chapter
      let updateTime = "";
      if (chapters.length > 0) {
        // Try to get the date from the first chapter's date field
        const firstChapterDate = chapters[0].date;
        if (firstChapterDate && firstChapterDate.length > 0) {
          // Parse date string in format like "October 5, 2025"
          // First, try to parse it as is
          let date = new Date(firstChapterDate);
          if (isNaN(date.getTime())) {
            // If that fails, try to reformat the date string to be more JS-friendly
            // Assuming format like "October 5, 2025"
            const dateMatch = firstChapterDate.match(
              /(\w+)\s+(\d+),\s*(\d{4})/,
            );
            if (dateMatch) {
              const monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              const monthIndex = monthNames.findIndex(
                (name) => name.toLowerCase() === dateMatch[1].toLowerCase(),
              );
              const day = parseInt(dateMatch[2]);
              const year = parseInt(dateMatch[3]);

              if (monthIndex !== -1) {
                date = new Date(year, monthIndex, day);
              }
            }
          }

          if (!isNaN(date.getTime())) {
            // Check if date is valid
            updateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          } else {
            // If parsing fails, use current date
            const today = new Date();
            updateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          }
        } else {
          // If no date found in the first chapter, use current date
          const today = new Date();
          updateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        }
      } else {
        // If no chapters, use current date
        const today = new Date();
        updateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      }

      return new ComicDetails({
        id: id,
        title: title,
        cover: cover,
        subtitle: subtitle,
        description: description,
        author: author,
        status: status,
        updateTime: updateTime,
        tags: {
          作者: [author],
          标签: genres,
          状态: [status],
        },
        chapters: chaptersList,
      });
    },

    /**
     * load images of a chapter
     * @param comicId {string}
     * @param epId {string?}
     * @returns {Promise<{images: string[]}>}
     */
    loadEp: async (comicId, epId) => {
      const res = await Network.get(this.generateMangaUrl(comicId, epId));
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);

      // Try multiple selectors for images
      let images = [];
      const imageElements = document.querySelectorAll(
        "div.reading-content .wp-manga-chapter-img",
      );
      images = Array.from(imageElements).map((img) => this.getImageUrl(img));

      // If images are still empty, try with data-src attributes (for lazy loading)
      if (images.length === 0) {
        const dataImageElements = document.querySelectorAll(
          "div.page-break img[data-src], div.reading-content img[data-src]",
        );
        images = Array.from(dataImageElements).map(
          (img) =>
            img.attributes["src"] ||
            img.attributes["data-src"] ||
            img.attributes["abs:data-src"],
        );
      }

      // Filter out any null/undefined values
      images = images.filter((img) => img && img.length > 0);

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
      return {
        headers: {
          Referer: this.baseUrl,
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
    removeTitleVersion: {
      title: "Remove version information from titles",
      type: "switch",
      default: false,
    },
    imageQuality: {
      title: "Image Quality",
      type: "select",
      options: [
        { value: "all", text: "All" },
        { value: "high", text: "High quality" },
        { value: "full", text: "Full quality" },
      ],
      default: "all",
    },
  };

  // [Optional] translations for the strings in this config
  translation = {
    zh_CN: {
      "Remove version information from titles": "从标题中移除版本信息",
      "Image Quality": "图片质量",
      All: "全部",
      "High quality": "高质量",
      "Full quality": "完整质量",
    },
    zh_TW: {
      "Remove version information from titles": "從標題中移除版本資訊",
      "Image Quality": "圖片品質",
      All: "全部",
      "High quality": "高品質",
      "Full quality": "完整品質",
    },
    en: {
      "Remove version information from titles":
        "Remove version information from titles",
      "Image Quality": "Image Quality",
      All: "All",
      "High quality": "High quality",
      "Full quality": "Full quality",
    },
  };

  // Helper method to parse comic elements
  parseComic(element) {
    let id = "";
    let title = "";
    let cover = "";
    let description = "";
    let subTitle = "";

    // For search results, the structure is different
    const linkElement = element.querySelector(
      "div.post-title a, .manga__item a, .item-thumb a, .page-item-detail a, .item-summary .post-title a",
    );
    if (linkElement) {
      const fullUrl = linkElement.attributes["href"];
      id = this.extractMangaSlug(fullUrl);
    }
    // Fallback to other selectors
    const titleElement = element.querySelector(
      ".post-title h3, .post-title h4, .manga-item h3, .item-summary .post-title a",
    );
    if (titleElement) {
      title = (
        titleElement.text ||
        titleElement.attributes["title"] ||
        ""
      ).trim();
    }

    // Extract cover image - might be in different containers
    const imgElement = element.querySelector("img, .item-thumb img");
    if (imgElement) {
      cover = this.getImageUrl(imgElement);
    }

    // Extract subtitle (author or additional info) - can be in different locations
    const subtitleElement = element.querySelector(" .meta-item.rating .score");
    if (subtitleElement) {
      subTitle = subtitleElement.text.trim();
    }

    return new Comic({
      id: id,
      title: title,
      cover: cover,
      description: description,
      rating: subTitle,
    });
  }

  // Helper method to extract manga slug from URL
  extractMangaSlug = (url) => {
    const trimmedUrl = url.trim().replace(/^\/+|\/+$/g, "");
    const parts = trimmedUrl.split("/");
    return parts[parts.length - 1];
  };

  // Helper method to extract chapter slug from URL
  extractChapterSlug = (url) => {
    const match = url.match(/chapter-([\d.-]+[a-zA-Z-]*)/);
    return match ? `chapter-${match[1]}` : "";
  };

  // Helper method to generate manga URL from slug
  generateMangaUrl = (slug, chapter = null) => {
    if (chapter) {
      return `${this.baseUrl}/title/${slug}/${chapter}/`;
    }
    return `${this.baseUrl}/title/${slug}`;
  };

  // Helper method to get image URL from element
  getImageUrl = (element) => {
    // Check for various attribute values that might contain the image URL
    let url =
      element.attributes["src"] ||
      element.attributes["data-src"] ||
      element.attributes["data-lazy-src"] ||
      element.attributes["data-cfsrc"] ||
      element.attributes["abs:src"] ||
      element.attributes["abs:data-src"] ||
      element.attributes["abs:data-lazy-src"] ||
      element.attributes["abs:data-cfsrc"];

    // If none of the common attributes have a value, try srcset
    if (!url || url === "") {
      const srcset = element.attributes["srcset"];
      if (srcset) {
        // Get the highest resolution image from srcset
        const urls = srcset.split(",");
        if (urls.length > 0) {
          // Get the last URL which is usually the highest resolution
          url = urls[urls.length - 1].trim().split(" ")[0];
        }
      }
    }

    // If still no URL found, try to get the original image from wp-manga-protector
    if (!url || url === "") {
      const originalSrc = element.attributes["data-wpfc-original-src"];
      if (originalSrc) {
        url = originalSrc;
      }
    }

    return url || "";
  };
}
