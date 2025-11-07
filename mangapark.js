/** @type {import('./_venera_.js')} */
class MangaPark extends ComicSource {
  name = "MangaPark";
  key = "mangapark";
  version = "1.0.6";
  minAppVersion = "1.4.0";

  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/mangapark.js";

  #domain = "mangapark.net";
  #apiUrl = `https://${this.#domain}/apo/`;
  #nsfwHandled = false;

  init() {
    this.#domain = this.loadSetting("mirror") || "mangapark.net";
    this.#apiUrl = `https://${this.#domain}/apo/`;
  }

  /**
   * Sets the NSFW cookie if enabled and not already set for the session.
   */
  async #handleNsfw() {
    if (this.loadSetting("enableNsfw") && !this.#nsfwHandled) {
      // This mimics the logic from the original source to enable NSFW content.
      // It sets site-side settings which results in the correct cookies being issued.
      const settingsUrl = `https://${this.#domain}/aok/settings-save`;
      const payload = {
        data: {
          general_autoLangs: [],
          general_userLangs: [],
          general_excGenres: [],
          general_prefLangs: [],
        },
      };
      try {
        await Network.post(
          settingsUrl,
          {
            "content-type": "application/json",
            referer: `https://${this.#domain}/`,
          },
          JSON.stringify(payload),
        );
      } catch (e) {
        console.error("Failed to set NSFW settings: " + e);
      }
      // Also explicitly set the cookie as a fallback
      await Network.setCookies(`https://${this.#domain}`, [
        { name: "nsfw", value: "2" },
      ]);
      this.#nsfwHandled = true;
    }
  }

  /**
   * GraphQL 请求的核心函数
   * @param {{query: string, variables: any}} payload - 请求体
   * @returns {Promise<any>}
   */
  async #request(payload) {
    await this.#handleNsfw();
    const res = await Network.post(
      this.#apiUrl,
      {
        "content-type": "application/json",
        referer: `https://${this.#domain}/`,
      },
      JSON.stringify(payload),
    );
    if (res.status !== 200) {
      throw `HTTP Error ${res.status}: ${res.body}`;
    }
    const json = JSON.parse(res.body);
    if (json.errors) {
      throw `GraphQL Error: ${json.errors.map((e) => e.message).join("\n")}`;
    }
    return json.data;
  }

  /**
   * 解析漫画对象
   * @param {any} item - 从 API 获取的漫画项目
   * @returns {Comic}
   */
  #parseComic(item) {
    const comicData = item.data;
    let coverUrl = comicData.urlCoverOri || "";
    if (coverUrl.startsWith("//")) {
      coverUrl = "https:" + coverUrl;
    } else if (coverUrl.startsWith("/")) {
      coverUrl = `https://${this.#domain}${coverUrl}`;
    }

    return new Comic({
      id: `${comicData.urlPath}#${comicData.id}`,
      title: comicData.name,
      cover: coverUrl,
      tags: comicData.genres,
      author: comicData.authors?.join(", "),
      artist: comicData.artists?.join(", "),
      description: comicData.summary,
    });
  }

  // 浏览页面
  explore = [
    {
      title: "MangaPark",
      type: "multiPartPage",
      load: async (page) => {
        const popularPayload = {
          query: SEARCH_QUERY,
          variables: {
            select: {
              sortby: "field_score",
              page: 1,
              size: 24,
            },
          },
        };
        const latestPayload = {
          query: SEARCH_QUERY,
          variables: {
            select: {
              sortby: "field_update",
              page: 1,
              size: 24,
            },
          },
        };

        const [popularData, latestData] = await Promise.all([
          this.#request(popularPayload),
          this.#request(latestPayload),
        ]);

        const popularComics = popularData.get_searchComic.items.map(
          this.#parseComic.bind(this),
        );
        const latestComics = latestData.get_searchComic.items.map(
          this.#parseComic.bind(this),
        );

        return [
          {
            title: "热门漫画",
            comics: popularComics,
            viewMore: { page: "search", attributes: { sort: "field_score" } },
          },
          {
            title: "最新更新",
            comics: latestComics,
            viewMore: { page: "search", attributes: { sort: "field_update" } },
          },
        ];
      },
    },
  ];

  // 搜索功能
  search = {
    load: async (keyword, options, page) => {
      const [
        sortOpt,
        originalLangsOpt,
        originalStatusOpt,
        uploadStatusOpt,
        chapterCountOpt,
      ] = options;

      // The app may stringify option values, so we need to parse them.
      const sortby = sortOpt ? JSON.parse(sortOpt) : "field_score";
      const origStatus = originalStatusOpt ? JSON.parse(originalStatusOpt) : "";
      const siteStatus = uploadStatusOpt ? JSON.parse(uploadStatusOpt) : "";
      const chapCount = chapterCountOpt ? JSON.parse(chapterCountOpt) : "";

      // Handle multi-select language option, which can be an array, a JSON string of an array, or a raw string.
      let incOLangs = null;
      if (originalLangsOpt) {
        if (Array.isArray(originalLangsOpt)) {
          incOLangs = originalLangsOpt;
        } else if (typeof originalLangsOpt === "string") {
          try {
            incOLangs = JSON.parse(originalLangsOpt);
          } catch (e) {
            incOLangs = [originalLangsOpt];
          }
        }
      }

      const variables = {
        select: {
          page: page,
          size: 24,
          word: keyword,
          sortby: sortby,
          incOLangs: incOLangs,
          origStatus: origStatus,
          siteStatus: siteStatus,
          chapCount: chapCount,
        },
      };

      const data = await this.#request({ query: SEARCH_QUERY, variables });
      const comics = data.get_searchComic.items.map(
        this.#parseComic.bind(this),
      );
      const hasNextPage = comics.length === 24;

      return {
        comics: comics,
        maxPage: hasNextPage ? page + 1 : page,
      };
    },
    optionList: [
      {
        label: "排序",
        type: "select",
        options: [
          "field_score-评分",
          "field_follow-关注数",
          "field_update-更新时间",
          "field_create-创建时间",
          "field_name-名称 A-Z",
          "views_d000-总阅览数",
        ],
        default: "field_score",
      },
      {
        label: "原作语言",
        type: "multi-select",
        options: ["zh-中文", "en-英文", "ja-日文", "ko-韩文"],
        default: [],
      },
      {
        label: "原作状态",
        type: "select",
        options: [
          "-全部",
          "ongoing-连载中",
          "completed-已完结",
          "hiatus-休刊中",
          "cancelled-已取消",
        ],
        default: "",
      },
      {
        label: "上传状态",
        type: "select",
        options: ["-全部", "ongoing-连载中", "completed-已完结"],
        default: "",
      },
      {
        label: "章节数",
        type: "select",
        options: ["-全部", "1-1+", "10-10+", "50-50+", "100-100+"],
        default: "",
      },
    ],
  };

  comic = {
    loadInfo: async (id) => {
      const comicId = id.split("#")[1];
      const detailsPayload = {
        query: DETAILS_QUERY,
        variables: { id: comicId },
      };
      const chaptersPayload = {
        query: CHAPTERS_QUERY,
        variables: { id: comicId },
      };

      const [detailsData, chaptersData] = await Promise.all([
        this.#request(detailsPayload),
        this.#request(chaptersPayload),
      ]);

      const comicData = detailsData.get_comicNode.data;

      const chapters = new Map();
      chaptersData.get_comicChapterList.forEach((c) => {
        const chap = c.data;
        const chapterId = chap.urlPath + "#" + chap.id;
        const chapterTitle = chap.dname + (chap.title ? `: ${chap.title}` : "");
        chapters.set(chapterId, chapterTitle);
      });

      let coverUrl = comicData.urlCoverOri || "";
      if (coverUrl.startsWith("//")) {
        coverUrl = "https:" + coverUrl;
      } else if (coverUrl.startsWith("/")) {
        coverUrl = `https://${this.#domain}${coverUrl}`;
      }

      const tags = {};
      if (comicData.genres && comicData.genres.length > 0) {
        tags["类型"] = comicData.genres;
      }
      if (comicData.authors && comicData.authors.length > 0) {
        tags["作者"] = comicData.authors;
      }
      if (comicData.artists && comicData.artists.length > 0) {
        tags["画师"] = comicData.artists;
      }

      return new ComicDetails({
        id: id,
        title: comicData.name,
        cover: coverUrl,
        author: comicData.authors?.join(", "),
        artist: comicData.artists?.join(", "),
        description: comicData.summary,
        tags: tags,
        chapters: chapters,
        status: this.#parseStatus(
          comicData.originalStatus,
          comicData.uploadStatus,
        ),
      });
    },
    loadEp: async (comicId, epId) => {
      const chapterId = epId.split("#")[1];
      const payload = { query: PAGES_QUERY, variables: { id: chapterId } };
      const data = await this.#request(payload);

      const images = data?.get_chapterNode?.data?.imageFile?.urlList || [];

      return { images };
    },
  };

  #parseStatus(originalStatus, uploadStatus) {
    switch (originalStatus || uploadStatus) {
      case "ongoing":
        return "ongoing";
      case "completed":
        return uploadStatus === "ongoing" ? "publishing_finished" : "completed";
      case "hiatus":
        return "hiatus";
      case "cancelled":
        return "cancelled";
      default:
        return "unknown";
    }
  }

  // 设置
  settings = {
    mirror: {
      title: "镜像站点",
      type: "select",
      options: [
        { value: "mangapark.net", text: "mangapark.net" },
        { value: "mangapark.com", text: "mangapark.com" },
        { value: "mangapark.org", text: "mangapark.org" },
        { value: "comicpark.org", text: "comicpark.org" },
        { value: "mpark.to", text: "mpark.to" },
      ],
      default: "mangapark.net",
    },
    enableNsfw: {
      title: "允许NSFW内容",
      type: "switch",
      default: true,
    },
  };
}

// GraphQL 查询语句
const SEARCH_QUERY = `
  query ($select: SearchComic_Select) {
    get_searchComic(select: $select) {
      items {
        data { id name altNames artists authors genres originalStatus uploadStatus summary extraInfo urlCoverOri urlPath }
      }
    }
  }
`;

const DETAILS_QUERY = `
  query($id: ID!) {
    get_comicNode(id: $id) {
      data { id name altNames artists authors genres originalStatus uploadStatus summary extraInfo urlCoverOri urlPath }
    }
  }
`;

const CHAPTERS_QUERY = `
  query($id: ID!) {
    get_comicChapterList(comicId: $id) {
      data { id dname title dateModify dateCreate urlPath srcTitle userNode { data { name } } }
    }
  }
`;

const PAGES_QUERY = `
  query($id: ID!) {
    get_chapterNode(id: $id) {
      data { imageFile { urlList } }
    }
  }
`;
