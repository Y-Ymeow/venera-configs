/** @type {import('./_venera_.js')} */
class Manwa extends ComicSource {
  name = "漫蛙";
  key = "manwa";
  version = "1.0.1";
  minAppVersion = "1.4.0";

  url =
    "https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/manwa.js";

  static ua =
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

  static domains = [
    "https://manwa.me",
    "https://manwass.cc",
    "https://manwatg.cc",
    "https://manwast.cc",
    "https://manwasy.cc",
  ];

  // 获取域名配置
  get domain() {
    const settingValue = this.loadSetting("domain");
    if (settingValue && !isNaN(settingValue)) {
      const index = parseInt(settingValue) - 1;
      if (index >= 0 && index < Manwa.domains.length) {
        return Manwa.domains[index];
      }
    }
    // Default to the first domain if setting is not valid
    return Manwa.domains[0] || this.settings.domain.default;
  }

  // 获取User-Agent
  get ua() {
    return this.loadSetting("ua") || Manwa.ua;
  }

  // 构建完整URL
  buildUrl(path) {
    return `${this.domain}${path}`;
  }

  settings = {
    domain: {
      type: "select",
      options: [
        { value: "1", text: "Domain 1" },
        { value: "2", text: "Domain 2" },
        { value: "3", text: "Domain 3" },
        { value: "4", text: "Domain 4" },
        { value: "5", text: "Domain 5" },
      ],
      default: "1",
      title: "选择域名",
    },
    imageSource: {
      type: "select",
      title: "图片源",
      options: [
        { value: "", text: "默认" },
        { value: "?v=20220724", text: "图源1" },
        { value: "?v=20220725", text: "图源2" },
        { value: "?v=20220726", text: "图源3" },
      ],
      default: "",
    },
    refreshDomain: {
      type: "callback",
      title: "刷新域名",
      buttonText: "刷新",
      callback: () => this.refreshDomainCallback(),
    },
    ua: {
      type: "input",
      title: "User-Agent",
      default: Manwa.ua,
    },
  };

  // 解析漫画元素
  parseComic(element) {
    const linkElement = element;
    const title =
      element.attributes["title"] ||
      linkElement.querySelector("img")?.attributes["alt"] ||
      "";
    const url = linkElement.attributes["href"] || "";
    const id = url.split("/").pop() || "";
    const cover =
      linkElement.querySelector("img")?.attributes["data-original"] ||
      linkElement.querySelector("img")?.attributes["src"] ||
      "";
    const subTitle =
      linkElement.querySelector("p.manga-list-2-title")?.text ||
      linkElement.querySelector("p.book-list-info-title")?.text ||
      "";

    return {
      id: id,
      title: title,
      cover: cover,
      subTitle: subTitle,
    };
  }

  search = {
    /**
     * load search result
     * @param keyword {string}
     * @param options {string[]} - options from optionList
     * @param page {number}
     * @returns {Promise<{comics: Comic[], maxPage: number}>}
     */
    load: async (keyword, options, page) => {
      const sortOption = options[0] || "0";
      const searchUrl = `${this.buildUrl("/search")}?keyword=${encodeURIComponent(keyword)}&page=${page}`;

      const res = await Network.get(searchUrl, {
        "User-Agent": Manwa.ua,
      });
      if (res.status !== 200) {
        throw new Error(`Failed to load search results: ${res.status}`);
      }

      const document = new HtmlDocument(res.body);

      // Select elements using selector from Kotlin source
      const lis = document.querySelectorAll("ul.book-list > li");
      const comics = lis.map((li) => {
        const titleElement = li.querySelector("p.book-list-info-title");
        const linkElement = li.querySelector("a");
        const imgElement = li.querySelector("img");

        const title = titleElement?.text || "";
        const url = linkElement?.attributes["href"] || "";
        const id = url.split("/").pop() || "";
        const cover =
          imgElement?.attributes["data-original"] ||
          imgElement?.attributes["src"] ||
          "";

        return new Comic({
          id: id,
          title: title,
          cover: cover,
          url: url, // Adding url to comic object in case it's needed
        });
      });

      // Check for pagination
      const paginationElements = document.querySelectorAll(
        "ul.pagination2 > li",
      );
      const lastPaginationElement =
        paginationElements[paginationElements.length - 1];
      const hasNextPage = lastPaginationElement?.text === "下一页";
      const maxPage = hasNextPage ? page + 1 : page;

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
        options: ["0-time", "1-popular"],
        // option label
        label: "sort",
        // default selected options. If not set, use the first option as default
        default: null,
      },
    ],

    // enable tags suggestions
    enableTagsSuggestions: false,
  };

  explore = [
    {
      title: "漫蛙",
      type: "multiPartPage",
      load: async () => {
        /** 读取推荐 */
        const res = await Network.get(this.buildUrl("/rank"), {
          "User-Agent": Manwa.ua,
        });
        if (res.status !== 200) {
          throw new Error(`Failed to load recommendations: ${res.status}`);
        }

        const document = new HtmlDocument(res.body);
        const comicElements = document.querySelectorAll("#rankList_2 > a");
        const comics = comicElements.map((element) => this.parseComic(element));

        // Return as a single category
        return [
          {
            title: "推荐",
            comics: comics,
          },
        ];
      },
    },
  ];

  comic = {
    /**
     * load comic info
     * @param id {string}
     * @returns {Promise<ComicDetails>}
     */
    loadInfo: async (id) => {
      const res = await Network.get(this.buildUrl(`/book/${id}`), {
        "User-Agent": Manwa.ua,
      });
      if (res.status !== 200) {
        throw new Error(`Failed to load comic info: ${res.status}`);
      }

      const document = new HtmlDocument(res.body);

      // Extract comic details
      const title =
        document.querySelector(".detail-main-info-title")?.text || "";
      const cover =
        document.querySelector("div.detail-main-cover > img")?.attributes[
          "data-original"
        ] || "";
      const author =
        document.querySelector(
          "p.detail-main-info-author > span.detail-main-info-value > a",
        )?.text || "";
      const statusText =
        document.querySelector(
          "p.detail-main-info-author > span.detail-main-info-value",
        )?.text || "";
      const status =
        statusText === "连载中"
          ? "连载中"
          : statusText === "已完结"
            ? "已完结"
            : "未知";
      const tags = document
        .querySelectorAll("div.detail-main-info-class > a.info-tag")
        .map((e) => e.text.trim());
      const description =
        document.querySelector("#detail > p.detail-desc")?.text || "";

      // Extract chapters
      const chapterElements = document.querySelectorAll(
        "ul#detail-list-select > li > a",
      );
      const chapters = new Map();
      chapterElements.forEach((element, index) => {
        const url = element.attributes["href"];
        const name = element.text.trim();
        // Extract chapter ID from URL
        const chapterId = url.split("/").pop() || `${index}`;
        chapters.set(chapterId, name);
      });

      // Reverse the chapters order to show latest first
      const reversedChapters = new Map([...chapters].reverse());

      return new ComicDetails({
        title: title,
        cover: cover,
        description: description,
        tags: {
          作者: [author],
          状态: [status],
          标签: tags,
        },
        chapters: reversedChapters,
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
      // This is optional and not typically needed for this source
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
      // Get the image source setting
      const imageSourceParam = this.loadSetting("imageSource") || "";

      const res = await Network.get(
        this.buildUrl(`/chapter/${epId}${imageSourceParam}`),
        {
          "User-Agent": Manwa.ua,
        },
      );

      if (res.status !== 200) {
        throw new Error(`Failed to load chapter images: ${res.status}`);
      }

      const document = new HtmlDocument(res.body);
      const imageElements = document.querySelectorAll(
        "#cp_img > div.img-content > img[data-r-src]",
      );
      const images = imageElements.map(
        (element) => element.attributes["data-r-src"],
      );

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
      // console.warn(`Image URL: ${url}`);

      const isEncrypted = url.includes("?v=20220724");

      if (isEncrypted) {
        return {
          url: url,
          headers: {
            Referer: this.domain,
            "User-Agent": Manwa.ua,
            Pragma: "no-cache",
          },
          onResponse: (data) => {
            const keyStr = "my2ecret782ecret";
            const key = Convert.encodeUtf8(keyStr);
            return Convert.decryptAesCbc(data, key, key);
          },
        };
      }

      return {
        url: url,
        headers: {
          Referer: this.domain,
          "User-Agent": Manwa.ua,
          Pragma: "no-cache",
        },
      };
    },
    /**
     * [Optional] Handle tag click event
     * @param namespace {string}
     * @param tag {string}
     * @returns {PageJumpTarget}
     */
    onClickTag: (namespace, tag) => {
      return {
        action: "search",
        keyword: tag,
      };
    },

    enableTagsTranslate: false,
  };

  async refreshDomainCallback() {
    const res = await Network.get("https://fuwt.cc/mw666", {
      "User-Agent": this.ua,
    });
    if (res.status !== 200) {
      throw new Error("Failed to refresh domain");
    }

    // Find the base64 encoded domain list from the JavaScript variable
    const match = res.body.match(/atob\('([A-Za-z0-9+/=]+)'\)/);
    if (!match || !match[1]) {
      throw new Error("No domain list found in response");
    }

    const base64 = match[1];
    const decodedString = Convert.decodeUtf8(Convert.decodeBase64(base64));
    const json = JSON.parse(decodedString);
    const domains = json.map((domain) => domain.trimEnd("/"));

    // Update the static domain list
    Manwa.domains = domains;

    // Update the options in settings to match the new domain count
    this.settings.domain.options = domains.map((domain, index) => ({
      value: (index + 1).toString(),
      text: `${domain}`,
    }));

    // Save the new domain list
    this.saveData("domains", JSON.stringify(domains));

    // Show success message
    UI.showMessage("域名列表已刷新");
  }

  async init() {
    // Load domains from saved data if available
    try {
      const savedDomains = await this.loadData("domains");
      if (savedDomains) {
        const domains = JSON.parse(savedDomains);
        if (Array.isArray(domains) && domains.length > 0) {
          Manwa.domains = domains;

          // Update the options in settings to match the loaded domain count
          this.settings.domain.options = domains.map((domain, index) => ({
            value: (index + 1).toString(),
            text: `${domain}`,
          }));
        }
      }
    } catch (e) {
      // If there's an error loading saved domains, continue with defaults
      console.warn("Could not load saved domains, using defaults:", e);
    }
  }

  category = {
    /// title of the category page, used to identify the page, it should be unique
    title: "漫蛙分类",
    parts: [
      {
        // Single "All" category
        name: "分类",
        type: "fixed",
        categories: [
          {
            label: "全部",
            target: {
              page: "category",
              attributes: {
                category: "all",
                param: "",
              },
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
      // Build URL with filters - following the original Kotlin source code
      let url = `${this.domain}/booklist?page=${page}`;

      // Apply the filters from the category
      if (category === "end") {
        if (param !== "") {
          url += `&end=${param}`;
        } else {
          url += "&end="; // for "全部" status
        }
      } else if (category === "gender") {
        url += `&gender=${param}`;
      } else if (category === "area") {
        if (param !== "") {
          url += `&area=${param}`;
        } else {
          url += "&area="; // for "全部" area
        }
      } else if (category === "tag") {
        if (param !== "") {
          url += `&tag=${param}`;
        } else {
          // For "全部" tag, don't add a tag parameter
        }
      }

      // Apply filters from options since now we only have one "all" category
      for (const option of options) {
        if (option.startsWith("status@")) {
          // Handle status options
          const parts = option.split("-")[0].split("@");
          if (parts.length >= 2) {
            // Has a value (e.g. "status-2-连载中")
            const statusValue = parts[1];
            url += `&end=${statusValue}`;
          } else {
            // For "全部" status (e.g. "status-全部")
            url += "&end=";
          }
        } else if (option.startsWith("type@")) {
          // Handle type options
          const typeValue = option.split("-")[0].split("@")[1];
          if (typeValue !== "_1") {
            // -1 is for "全部" (all)
            url += `&gender=${typeValue}`;
          } else {
            url += "&gender=-1";
          }
        } else if (option.startsWith("region@")) {
          // Handle region options
          const parts = option.split("-")[0].split("@");
          if (parts.length >= 2) {
            // Has a value (e.g. "region-2-韩国")
            const regionValue = parts[1];
            url += `&area=${regionValue}`;
          } else {
            // For "全部" region (e.g. "region-全部")
            url += "&area=";
          }
        } else if (option.startsWith("sort@")) {
          // Handle sort options
          const sortValue = option
            .split("-")[0]
            .split("@")[1]
            .replace("_", "-");
          url += `&sort=${sortValue}`;
        }
      }

      const res = await Network.get(url);
      if (res.status !== 200) {
        throw new Error(`Failed to load category comics: ${res.status}`);
      }

      const html = new HtmlDocument(res.body);

      const parseComic = (element) => {
        const titleElement =
          element.querySelector("p.manga-list-2-title") ||
          element.querySelector("p.book-list-info-title");
        const title = titleElement?.text?.trim() || "";

        const linkElement = element.querySelector("a");
        const url = linkElement.attributes["href"] || "";
        const id = url.split("/").pop() || "";

        const coverElement = element.querySelector("img");
        const cover = coverElement.attributes["src"];

        const tags = Array.from(
          element.querySelectorAll("div.manga-list-2-class > a.info-tag") ||
            element.querySelectorAll("div.book-list-info-class > a.info-tag") ||
            [],
        ).map((tag) => tag.text.trim());

        const descElement =
          element.querySelector("p.manga-list-2-desc") ||
          element.querySelector("p.book-list-info-desc");
        const description = descElement?.text?.trim() || "";

        const authorElement =
          element.querySelector("p.manga-list-2-author > span") ||
          element.querySelector("p.book-list-info-author > span");
        const author = authorElement?.text?.trim() || "";

        return new Comic({
          id: id,
          title: title,
          subTitle: author,
          cover: cover,
          tags: tags,
          description: description,
        });
      };

      const comicElements = html.querySelectorAll("ul.manga-list-2 > li");
      const comics = Array.from(comicElements).map(parseComic);

      // Check for next page - using the Chinese text for next page
      const paginationElements = html.querySelectorAll("ul.pagination2 > li");
      const next =
        paginationElements.length > 0
          ? paginationElements[paginationElements.length - 1].text.trim() ===
            "下一页"
          : false;
      const maxPage = next ? page + 1 : page;

      return {
        comics: comics,
        maxPage: maxPage,
      };
    },
    // [Optional] provide options for category comic loading
    optionList: [
      {
        label: "状态",
        options: ["status@-全部", "status@2-连载中", "status@1-完结"],
      },
      {
        label: "类型",
        options: [
          "type@_1-全部",
          "type@2-一般向",
          "type@0-BL向",
          "type@1-禁漫",
          "type@3-TL向",
        ],
      },
      {
        label: "地区",
        options: [
          "region@-全部",
          "region@2-韩国",
          "region@3-日漫",
          "region@4-国漫",
          "region@5-台漫",
          "region@6-其他",
          "region@1-未分类",
        ],
      },
      {
        label: "排序",
        options: ["sort@_1-最新", "sort@0-最旧", "sort@1-收藏", "sort@2-新漫"],
      },
    ],
    ranking: {
      // For a single option, use `-` to separate the value and text, left for value, right for text
      options: ["day-日榜", "week-周榜", "month-月榜"],
      /**
       * load ranking comics
       * @param option {string} - option from optionList
       * @param page {number} - page number
       * @returns {Promise<{comics: Comic[], maxPage: number}>}
       */
      load: async (option, page) => {
        // Build ranking URL based on option
        let url = `${this.domain}/rank`;

        const res = await Network.get(url);
        if (res.status !== 200) {
          throw new Error(`Failed to load ranking comics: ${res.status}`);
        }

        const html = new HtmlDocument(res.body);

        function parseComic(element) {
          const title = element.attributes["title"] || "";
          const id = element.href || "";
          const coverElement = element.querySelector("img");
          const cover = coverElement?.attributes["data-original"] || "";

          return new Comic({
            id: id,
            title: title,
            cover: cover,
          });
        }

        const comicElements = html.querySelectorAll("#rankList_2 > a");
        const comics = Array.from(comicElements).map(parseComic);

        // For ranking, we'll assume a fixed max page for simplicity
        return {
          comics: comics,
          maxPage: 1,
        };
      },
    },
  };
}
