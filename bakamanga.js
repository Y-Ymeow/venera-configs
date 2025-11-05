/** @type {import('./_venera_.js')} */
class Bakamanga extends ComicSource {
  name = "巴卡漫画";
  key = "bakamanga";
  version = "1.3.5";
  minAppVersion = "1.6.0";

  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/bakamanga.js";

  #domain_key = "bakamanga_domain";
  #publisher_url = "https://bakamh.app/";
  #fallback_domain = "bakamh.com";

  get baseUrl() {
    return `https://${this.loadData(this.#domain_key) || this.#fallback_domain}`;
  }

  #imageFromElement(element) {
    if (!element) return null;
    let imageUrl = null;
    if (element.attributes["data-src"]) {
      imageUrl = element.attributes["data-src"];
    } else if (element.attributes["data-lazy-src"]) {
      imageUrl = element.attributes["data-lazy-src"];
    } else if (element.attributes["srcset"]) {
      const srcset = element.attributes["srcset"]
        .split(",")
        .map((s) => s.trim().split(" "));
      imageUrl = srcset[srcset.length - 1][0];
    } else {
      imageUrl = element.attributes["src"];
    }

    return imageUrl ? imageUrl.trim() : null;
  }

  #parseComic(element) {
    const titleElement = element.querySelector("div.post-title a");
    const href = titleElement.attributes["href"];
    const id = href.split("/manga/")[1].replace(/\//g, "");
    const title = titleElement.text;
    const cover = this.#imageFromElement(element.querySelector("img"));
    return new Comic({
      id: id,
      title: title,
      cover: cover,
    });
  }

  explore = [
    {
      title: "巴卡漫画",
      type: "multiPartPage",
      load: async () => {
        const popularUrl = `${this.baseUrl}/manhwa/`;

        try {
          const popularRes = await Network.get(popularUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
              Connection: "keep-alive",
              "Accept-Encoding": "gzip, deflate, br, zstd",
              Priority: "u=0, i",
              "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          });
          const popularDoc = new HtmlDocument(popularRes.body);
          const popularComics = popularDoc
            .querySelectorAll("div.page-item-detail")
            .map((e) => this.#parseComic(e));
          return [
            {
              title: "最新更新",
              comics: popularComics,
            },
          ];
        } catch (e) {
          let randomList = [
            "教授的課後輔導",
            "燃烧",
            "足球型男脱单指南",
            "顶加套房的春天",
          ];
          await Network.get(
            popularUrl +
              randomList[Math.floor(Math.random() * randomList.length)],
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
                Connection: "keep-alive",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                Priority: "u=0, i",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
            },
          );
        }

        return [];
      },
    },
  ];

  search = {
    load: async (keyword, options, page) => {
      const url = `${this.baseUrl}/page/${page}/?s=${keyword}&post_type=wp-manga`;
      const res = await Network.get(url);
      const doc = new HtmlDocument(res.body);
      const comics = doc
        .querySelectorAll("div.c-tabs-item__content")
        .map((e) => this.#parseComic(e));
      const hasNextPage = !!doc.querySelector("a.nextpostslink");
      return {
        comics: comics,
        maxPage: hasNextPage ? page + 1 : page,
      };
    },
  };

  comic = {
    loadInfo: async (id) => {
      const url = `${this.baseUrl}/manga/${id}/`;
      const res = await Network.get(url);
      const doc = new HtmlDocument(res.body);

      const titleElement = doc.querySelector(
        "div.post-title h3, div.post-title h1, #manga-title > h1",
      );
      if (!titleElement) throw "Failed to find title element.";
      const title = titleElement.text.trim();

      const cover = this.#imageFromElement(
        doc.querySelector("div.summary_image img"),
      );

      const descriptionElement = doc.querySelector(
        "div.description-summary div.summary__content, div.summary_content div.post-content_item > h5 + div, div.summary_content div.manga-excerpt",
      );
      const description = descriptionElement
        ? descriptionElement.text.trim()
        : "";

      const tags = {};
      doc.querySelectorAll(".genres-content a").forEach((e) => {
        if (!tags["类型"]) tags["类型"] = [];
        tags["类型"].push(e.text);
      });
      doc.querySelectorAll(".author-content a").forEach((e) => {
        if (!tags["作者"]) tags["作者"] = [];
        tags["作者"].push(e.text);
      });

      const chapters = new Map();
      let chapterElements = doc.querySelectorAll(".chapter-loveYou a");

      if (chapterElements.length === 0) {
        const mangaIdHolder = doc.querySelector(
          "div[id^=manga-chapters-holder]",
        );
        if (mangaIdHolder) {
          const mangaId = mangaIdHolder.attributes["data-id"];
          const ajaxUrl = `${this.baseUrl}/wp-admin/admin-ajax.php`;
          const ajaxRes = await Network.post(
            ajaxUrl,
            { "X-Requested-With": "XMLHttpRequest" },
            `action=manga_get_chapters&manga=${mangaId}`,
          );
          const ajaxDoc = new HtmlDocument(ajaxRes.body);
          chapterElements = ajaxDoc.querySelectorAll(
            ".chapter-loveYou a, .wp-manga-chapter a",
          );
        }
      }

      let list = new Array();

      chapterElements.reverse().forEach((a) => {
        const chapterUrl =
          a.attributes["storage-chapter-url"] || a.attributes["href"];
        if (!chapterUrl || chapterUrl === "#") return;

        const chapterId = chapterUrl
          .split("/")
          .filter((s) => s)
          .pop();
        const chapterTitle = a.text.trim();
        if (chapterId && chapterTitle) {
          chapters.set(chapterId, chapterTitle);
        }
      });

      return new ComicDetails({
        title: title,
        cover: cover,
        description: description,
        tags: tags,
        chapters: chapters,
      });
    },
    loadEp: async (comicId, epId) => {
      const url = `${this.baseUrl}/manga/${comicId}/${epId}/?style=list`;
      const res = await Network.get(url);
      const doc = new HtmlDocument(res.body);

      if (doc.querySelector("#chapter-protector-data")) {
        throw "章节受加密保护，当前版本暂不支持加载。";
      }

      const images = doc
        .querySelectorAll(".reading-content img")
        .map((img) => this.#imageFromElement(img));
      return { images };
    },
    onImageLoad: (url, comicId, epId) => {
      return {
        url,
        headers: {
          Referer: `${this.baseUrl}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      };
    },
  };

  settings = {
    domainSelector: {
      title: "选择域名",
      type: "callback",
      buttonText: "点击更新并选择",
      callback: async () => {
        const loadingId = UI.showLoading();
        let domains = [];
        try {
          const res = await Network.get(this.#publisher_url);
          const doc = new HtmlDocument(res.body);
          domains = doc.querySelectorAll("div.cards a.card").map((a) => {
            const href = a.attributes.href;
            const hostname = href.split("//")[1].split("/")[0];
            const description = a.querySelector("h3").text.replace(":", "");
            return `${hostname} (${description})`;
          });
        } catch (e) {
          UI.showMessage("获取域名列表失败: " + e);
          return;
        } finally {
          UI.cancelLoading(loadingId);
        }

        if (domains.length === 0) {
          UI.showMessage("未找到可用域名。");
          return;
        }

        const currentDomain =
          this.loadData(this.#domain_key) || this.#fallback_domain;
        const initialIndex = domains.findIndex((d) =>
          d.startsWith(currentDomain),
        );

        const selectedIndex = await UI.showSelectDialog(
          "选择一个可用域名",
          domains,
          initialIndex,
        );

        if (selectedIndex != null) {
          const selectedDomain = domains[selectedIndex].split(" ")[0];
          this.saveData(this.#domain_key, selectedDomain);
          UI.showMessage(`已切换域名至: ${selectedDomain}`);
        }
      },
    },
  };
}
