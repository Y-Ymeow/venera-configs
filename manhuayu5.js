/** @type {import('./_venera_.js')} */

class Manhuayu5 extends ComicSource {
  name = "漫画鱼";
  key = "manhuayu5";
  version = "1.0.0";
  minAppVersion = "1.4.0";
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/manhuayu5.js";

  removePkcs7Padding(bytes) {
    const len = bytes.length;
    const pad = bytes[len - 1];
    if (pad < 1 || pad > 16) return bytes; // 非法填充，直接返回
    return bytes.slice(0, len - pad);
  }

  async decryptChapterDataQuickJS(encryptedParams) {
    try {
      // 1. Key 固定
      const keyStr = await this.aesKey(); // "5V&RoR%Jf@pJPydF";
      const key = await Convert.encodeUtf8(keyStr);

      // 2. Base64 decode
      const decoded = await Convert.decodeBase64(encryptedParams); // ArrayBuffer

      // 3. 取 IV 和 ciphertext
      const decodedBytes = new Uint8Array(decoded);
      const ivBytes = decodedBytes.slice(0, 16); // 前16字节
      const ciphertextBytes = decodedBytes.slice(16); // 剩余部分

      // 4. CBC 解密
      const decryptedBuffer = await Convert.decryptAesCbc(
        ciphertextBytes.buffer,
        key,
        ivBytes.buffer,
      );

      // 5. 转 UTF-8
      let decryptedBytes = new Uint8Array(decryptedBuffer);
      decryptedBytes = this.removePkcs7Padding(decryptedBytes); // 去掉 PKCS7

      const decryptedText = await Convert.decodeUtf8(decryptedBytes.buffer);
      // 6. JSON parse
      return JSON.parse(decryptedText);
    } catch (e) {
      console.error("An error occurred during decryption:" + e.message);
      return null;
    }
  }

  async init() {}

  // Obfuscated key - decoded at runtime
  async aesKey() {
    // This key is obfuscated to avoid being easily extracted
    const encodedKey = "NVYmUm9SJUpmQHBKUHlkRg==";
    return await Convert.decodeUtf8(await Convert.decodeBase64(encodedKey));
  }

  get baseUrl() {
    return "https://www.manhuayu5.com";
  }

  // Parse comic from HTML element
  parseComic(element) {
    const linkEl = element.querySelector(".media-left a");
    const titleEl = element.querySelector(".media-content .title");
    const coverEl = element.querySelector(".media-left a.image");
    const statusEl = element.querySelector(".media-content ul li");
    const latestChapEl = element.querySelector(".media-content ul li a");
    const genreEl = element.querySelector(".media-content ul li:nth-child(3)");
    const descriptionEl = element.querySelector(".media-content ul li.info");

    const id = linkEl?.attributes?.href?.split("/").pop() || "";
    const title = titleEl?.text?.trim() || "";
    let cover = coverEl?.attributes?.["data-original"] || "";
    if (!cover) {
      // Try to extract from style attribute
      const styleAttr = coverEl?.attributes?.style || "";
      const match = styleAttr.match(/url\(["']?([^"']*)["']?\)/);
      if (match && match[1]) {
        cover = match[1];
      }
    }
    const status = statusEl?.text?.replace("状态：", "").trim() || "";
    const latestChapter = latestChapEl
      ? `最新：${latestChapEl?.text?.trim()}`
      : "";
    const genre = genreEl?.text?.replace("题材：", "").trim() || "";
    const description = descriptionEl?.text?.replace("简介：", "").trim() || "";

    // Get tags
    const tags = [genre].filter((tag) => tag); // Only genre is available in this structure

    return new Comic({
      id: id,
      title: title,
      subTitle: status,
      cover: cover,
      tags: tags,
      description: `${latestChapter}\n${description}`,
    });
  }

  // Explore pages
  explore = [
    {
      title: "漫画鱼",
      type: "multiPageComicList",
      load: async (page) => {
        const res = await Network.get(
          `${this.baseUrl}/update?page=${page || 1}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
          },
        );
        if (res.status !== 200) {
          throw `Invalid status code: ${res.status}`;
        }

        const document = new HtmlDocument(res.body);
        const comicElements = document.querySelectorAll(".media");
        const comics = [];

        for (let element of comicElements) {
          comics.push(this.parseComic(element));
        }

        // Try to determine max page - this is a rough estimation since pagination structure varies
        // This is a simple approach - in a real implementation, you'd need to find the actual pagination
        let maxPage = 10; // Just a default value, in practice you'd determine this from the page

        return {
          comics: comics,
          maxPage: maxPage,
        };
      },
    },
  ];

  // Categories
  category = {
    title: "漫画鱼",
    parts: [
      {
        name: "题材",
        type: "fixed",
        categories: [
          "全部",
          "热血",
          "玄幻",
          "都市",
          "言情",
          "校园",
          "恋爱",
          "穿越",
          "搞笑",
          "竞技",
          "治愈",
          "大女主",
          "格斗",
          "体育",
          "冒险",
          "励志",
          "纯情",
          "奇幻",
          "团宠",
          "系统",
          "古风",
          "灵异",
          "剧情",
          "唯美",
          "动作",
          "科幻",
          "推理",
          "爱情",
          "欢乐向",
          "日常",
          "宫廷",
          "非现代",
          "妖怪",
          "职场",
          "偶像",
          "魔幻",
          "萌系",
          "神仙",
          "浪漫",
          "逆袭",
          "古装",
          "异能",
          "悬疑",
          "架空",
          "恐怖",
          "少女",
          "魔法",
          "武侠",
          "后宫",
          "重生",
          "游戏",
          "少年",
          "神鬼",
          "脑洞",
          "妖精",
          "傲娇",
          "纯爱",
          "百合",
          "剧情向",
          "骑士",
          "亲情",
          "少男",
          "电竞",
          "养成",
          "复仇",
          "战斗",
          "腹黑",
          "末日",
          "修真",
          "非人类",
          "天使",
          "霸总",
          "女神",
          "高甜",
          "幽灵",
          "吸血鬼",
          "精灵",
          "总裁",
          "运动",
          "生活",
          "修仙",
          "战争",
          "美食",
          "全彩",
          "本子",
          "同人",
          "青春",
          "丧尸",
          "历史",
          "惊悚",
          "生存",
          "欧风",
          "橘味",
          "宫斗",
          "装逼",
          "侦探",
          "怪物",
          "萝莉",
          "贵族",
          "机甲",
          "虐心",
          "权谋",
          "幻想",
          "惊险",
          "僵尸",
          "四格",
          "甜宠",
          "萌宝",
          "探险",
          "音乐",
          "正能量",
          "女仆",
          "伪娘",
          "直播",
          "欧皇",
          "现代",
          "明星",
          "宅男",
          "单行本",
          "女生",
          "黑道",
          "生化",
          "橘系",
          "仙侠",
          "耽美",
          "男生",
          "节操",
          "青年",
          "反套路",
          "成长",
          "病娇",
          "医生",
          "西幻",
          "东方",
          "甜蜜",
          "可爱",
          "猎奇",
          "惊奇",
          "学生",
          "末世",
          "单恋",
          "彩虹",
          "暗黑",
          "转生",
          "机战",
          "暗恋",
          "宅系",
          "神魔",
          "虐恋",
          "神豪",
          "异界",
          "豪门",
          "兄妹",
          "伦理",
          "舞蹈",
          "无敌流",
          "金手指",
          "燃向",
          "双女主",
          "异形",
          "萌宠",
          "复活",
          "魔法师",
          "诡异",
          "C99",
          "C105",
          "项圈",
          "怀旧",
          "宅向",
          "生活漫画",
          "畅销",
          "异世",
          "兄弟",
          "邪恶",
          "女高中生",
          "限制级",
          "追杀",
          "花美男",
          "美少女",
          "媲美金城武",
          "死亡",
          "魔王",
          "BL",
          "宫廷东方",
          "恶搞",
          "萌",
          "辣妹",
          "滑稽",
          "欧美",
          "洛丽塔",
          "C106",
          "橘里橘气",
          "克苏鲁",
          "强强",
          "大人系",
          "探案",
          "社会",
          "其他",
          "热血",
          "玄幻",
          "都市",
          "言情",
          "校园",
          "恋爱",
          "穿越",
          "搞笑",
          "竞技",
          "治愈",
          "大女主",
          "格斗",
          "体育",
          "冒险",
          "励志",
          "纯情",
          "奇幻",
          "团宠",
          "系统",
          "古风",
          "灵异",
          "剧情",
          "唯美",
          "动作",
          "科幻",
          "推理",
          "爱情",
          "欢乐向",
          "日常",
          "宫廷",
          "非现代",
          "妖怪",
          "职场",
          "偶像",
          "魔幻",
          "萌系",
          "神仙",
          "浪漫",
          "逆袭",
          "古装",
          "异能",
          "悬疑",
          "架空",
          "恐怖",
          "少女",
          "魔法",
          "武侠",
          "后宫",
          "重生",
          "游戏",
          "少年",
          "神鬼",
          "脑洞",
          "妖精",
          "傲娇",
          "纯爱",
          "百合",
          "剧情向",
          "骑士",
          "亲情",
          "少男",
          "电竞",
          "养成",
          "复仇",
          "战斗",
          "腹黑",
          "末日",
          "修真",
          "非人类",
          "天使",
          "霸总",
          "女神",
          "高甜",
          "幽灵",
          "吸血鬼",
          "精灵",
          "总裁",
          "运动",
          "生活",
          "修仙",
          "战争",
          "美食",
          "全彩",
          "本子",
          "同人",
          "青春",
          "丧尸",
          "历史",
          "惊悚",
          "生存",
          "欧风",
          "橘味",
          "宫斗",
          "装逼",
          "侦探",
          "怪物",
          "萝莉",
          "贵族",
          "机甲",
          "虐心",
          "权谋",
          "幻想",
          "惊险",
          "僵尸",
          "四格",
          "甜宠",
          "萌宝",
          "探险",
          "音乐",
          "正能量",
          "女仆",
          "伪娘",
          "直播",
          "欧皇",
          "现代",
          "明星",
          "宅男",
          "单行本",
          "女生",
          "黑道",
          "生化",
          "橘系",
          "仙侠",
          "耽美",
          "男生",
          "节操",
          "青年",
          "反套路",
          "成长",
          "病娇",
          "医生",
          "西幻",
          "东方",
          "甜蜜",
          "可爱",
          "猎奇",
          "惊奇",
          "学生",
          "末世",
          "单恋",
          "彩虹",
          "暗黑",
          "转生",
          "机战",
          "暗恋",
          "宅系",
          "神魔",
          "虐恋",
          "神豪",
          "异界",
          "豪门",
          "兄妹",
          "伦理",
          "舞蹈",
          "无敌流",
          "金手指",
          "燃向",
          "双女主",
          "异形",
          "萌宠",
          "复活",
          "魔法师",
          "诡异",
          "C99",
          "C105",
          "项圈",
          "怀旧",
          "宅向",
          "生活漫画",
          "畅销",
          "异世",
          "兄弟",
          "邪恶",
          "女高中生",
          "限制级",
          "追杀",
          "花美男",
          "美少女",
          "媲美金城武",
          "死亡",
          "魔王",
          "BL",
          "宫廷东方",
          "恶搞",
          "萌",
          "辣妹",
          "滑稽",
          "欧美",
          "洛丽塔",
          "C106",
          "橘里橘气",
          "克苏鲁",
          "强强",
          "大人系",
          "探案",
          "社会",
          "其他",
        ],
        categoryParams: [
          "",
          "rexue",
          "xuanhuan",
          "dushi",
          "yanqing",
          "xiaoyuan",
          "lianai",
          "chuanyue",
          "gaoxiao",
          "jingji",
          "zhiyu",
          "danvzhu",
          "gedou",
          "tiyu",
          "maoxian",
          "lizhi",
          "chunqing",
          "qihuan",
          "tuanchong",
          "xitong",
          "gufeng",
          "lingyi",
          "juqing",
          "weimei",
          "dongzuo",
          "kehuan",
          "tuili",
          "aiqing",
          "huanlexiang",
          "richang",
          "gongting",
          "feixiandai",
          "yaoguai",
          "zhichang",
          "ouxiang",
          "mohuan",
          "mengxi",
          "shenxian",
          "langman",
          "nixi",
          "guzhuang",
          "yineng",
          "xuanyi",
          "jiakong",
          "kongbu",
          "shaonv",
          "mofa",
          "wuxia",
          "hougong",
          "zhongsheng",
          "youxi",
          "shaonian",
          "shengui",
          "naodong",
          "yaojing",
          "aojiao",
          "chunai",
          "baihe",
          "juqingxiang",
          "qishi",
          "qinqing",
          "shaonan",
          "dianjing",
          "yangcheng",
          "fuchou",
          "zhandou",
          "fuhei",
          "mori",
          "xiuzhen",
          "feirenlei",
          "tianshi",
          "bazong",
          "nvshen",
          "gaotian",
          "youling",
          "xixiegui",
          "jingling",
          "zongcai",
          "yundong",
          "shenghuo",
          "xiuxian",
          "zhanzheng",
          "meishi",
          "quancai",
          "benzi",
          "tongren",
          "qingchun",
          "sangshi",
          "lishi",
          "jingsong",
          "shengcun",
          "oufeng",
          "juwei",
          "gongdou",
          "zhuangbi",
          "zhentan",
          "guaiwu",
          "luoli",
          "guizu",
          "jijia",
          "nuexin",
          "quanmou",
          "huanxiang",
          "jingxian",
          "jiangshi",
          "sige",
          "tianchong",
          "mengbao",
          "tanxian",
          "yinyue",
          "zhengnengliang",
          "nvpu",
          "weiniang",
          "zhibo",
          "ouhuang",
          "xiandai",
          "mingxing",
          "zhainan",
          "danxingben",
          "nvsheng",
          "heidao",
          "shenghua",
          "juxi",
          "xianxia",
          "danmei",
          "nansheng",
          "jiecao",
          "qingnian",
          "fantaolu",
          "chengzhang",
          "bingjiao",
          "yisheng",
          "xihuan",
          "dongfang",
          "tianmi",
          "keai",
          "lieqi",
          "jingqi",
          "xuesheng",
          "moshi",
          "danlian",
          "caihong",
          "anhei",
          "zhuansheng",
          "jizhan",
          "anlian",
          "zhaixi",
          "shenmo",
          "nuelian",
          "shenhao",
          "yijie",
          "haomen",
          "xiongmei",
          "lunli",
          "wudao",
          "wudiliu",
          "jinshouzhi",
          "ranxiang",
          "shuangnvzhu",
          "yixing",
          "mengchong",
          "fuhuo",
          "mofashi",
          "guiyi",
          "C99",
          "C105",
          "xiangquan",
          "huaijiu",
          "zhaixiang",
          "shenghuomanhua",
          "changxiao",
          "yishi",
          "xiongdi",
          "xiee",
          "nvgaozhongsheng",
          "xianzhiji",
          "zhuisha",
          "huameinan",
          "meishaonv",
          "pimeijinchengwu",
          "siwang",
          "mowang",
          "BL",
          "gongtingdongfang",
          "egao",
          "meng",
          "lamei",
          "huaji",
          "oumei",
          "luolita",
          "C106",
          "julijuqi",
          "kesulu",
          "qiangqiang",
          "darenxi",
          "tanan",
          "shehui",
          "qita",
          "rexue",
          "xuanhuan",
          "dushi",
          "yanqing",
          "xiaoyuan",
          "lianai",
          "chuanyue",
          "gaoxiao",
          "jingji",
          "zhiyu",
          "danvzhu",
          "gedou",
          "tiyu",
          "maoxian",
          "lizhi",
          "chunqing",
          "qihuan",
          "tuanchong",
          "xitong",
          "gufeng",
          "lingyi",
          "juqing",
          "weimei",
          "dongzuo",
          "kehuan",
          "tuili",
          "aiqing",
          "huanlexiang",
          "richang",
          "gongting",
          "feixiandai",
          "yaoguai",
          "zhichang",
          "ouxiang",
          "mohuan",
          "mengxi",
          "shenxian",
          "langman",
          "nixi",
          "guzhuang",
          "yineng",
          "xuanyi",
          "jiakong",
          "kongbu",
          "shaonv",
          "mofa",
          "wuxia",
          "hougong",
          "zhongsheng",
          "youxi",
          "shaonian",
          "shengui",
          "naodong",
          "yaojing",
          "aojiao",
          "chunai",
          "baihe",
          "juqingxiang",
          "qishi",
          "qinqing",
          "shaonan",
          "dianjing",
          "yangcheng",
          "fuchou",
          "zhandou",
          "fuhei",
          "mori",
          "xiuzhen",
          "feirenlei",
          "tianshi",
          "bazong",
          "nvshen",
          "gaotian",
          "youling",
          "xixiegui",
          "jingling",
          "zongcai",
          "yundong",
          "shenghuo",
          "xiuxian",
          "zhanzheng",
          "meishi",
          "quancai",
          "benzi",
          "tongren",
          "qingchun",
          "sangshi",
          "lishi",
          "jingsong",
          "shengcun",
          "oufeng",
          "juwei",
          "gongdou",
          "zhuangbi",
          "zhentan",
          "guaiwu",
          "luoli",
          "guizu",
          "jijia",
          "nuexin",
          "quanmou",
          "huanxiang",
          "jingxian",
          "jiangshi",
          "sige",
          "tianchong",
          "mengbao",
          "tanxian",
          "yinyue",
          "zhengnengliang",
          "nvpu",
          "weiniang",
          "zhibo",
          "ouhuang",
          "xiandai",
          "mingxing",
          "zhainan",
          "danxingben",
          "nvsheng",
          "heidao",
          "shenghua",
          "juxi",
          "xianxia",
          "danmei",
          "nansheng",
          "jiecao",
          "qingnian",
          "fantaolu",
          "chengzhang",
          "bingjiao",
          "yisheng",
          "xihuan",
          "dongfang",
          "tianmi",
          "keai",
          "lieqi",
          "jingqi",
          "xuesheng",
          "moshi",
          "danlian",
          "caihong",
          "anhei",
          "zhuansheng",
          "jizhan",
          "anlian",
          "zhaixi",
          "shenmo",
          "nuelian",
          "shenhao",
          "yijie",
          "haomen",
          "xiongmei",
          "lunli",
          "wudao",
          "wudiliu",
          "jinshouzhi",
          "ranxiang",
          "shuangnvzhu",
          "yixing",
          "mengchong",
          "fuhuo",
          "mofashi",
          "guiyi",
          "C99",
          "C105",
          "xiangquan",
          "huaijiu",
          "zhaixiang",
          "shenghuomanhua",
          "changxiao",
          "yishi",
          "xiongdi",
          "xiee",
          "nvgaozhongsheng",
          "xianzhiji",
          "zhuisha",
          "huameinan",
          "meishaonv",
          "pimeijinchengwu",
          "siwang",
          "mowang",
          "BL",
          "gongtingdongfang",
          "egao",
          "meng",
          "lamei",
          "huaji",
          "oumei",
          "luolita",
          "C106",
          "julijuqi",
          "kesulu",
          "qiangqiang",
          "darenxi",
          "tanan",
          "shehui",
          "qita",
        ],
        itemType: "category",
      },
    ],
    enableRankingPage: false,
  };

  // Category comics
  categoryComics = {
    load: async (category, param, options, page) => {
      // Construct category URL based on selected filters
      let categoryUrl = `${this.baseUrl}/category/`;

      // Add filters based on options (region, status, sort)
      let hasFilters = false;

      // Add theme if present (param contains theme value)
      if (param) {
        categoryUrl += `/theme/${param}`;
        hasFilters = true;
      }

      // Add other filters from options array
      // options[0] - region (area), options[1] - status (state), options[2] - sort (order)
      if (options && options.length >= 2) {
        const regionOption = options[0];
        if (regionOption && regionOption !== "all") {
          categoryUrl += `/area/${regionOption}`;
          hasFilters = true;
        }

        const statusOption = options[1];
        if (statusOption && statusOption !== "all") {
          categoryUrl += `/state/${statusOption}`;
          hasFilters = true;
        }

        if (options.length >= 3) {
          const sortOption = options[2];
          if (sortOption && sortOption !== "all") {
            categoryUrl += `/order/${sortOption}`;
            hasFilters = true;
          }
        }
      }

      // Append page number if needed
      categoryUrl += `?page=${page}`;

      const res = await Network.get(categoryUrl);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);
      const comicElements = document.querySelectorAll(".media");
      const comics = [];

      for (let element of comicElements) {
        comics.push(this.parseComic(element));
      }

      // Determine max page from pagination
      let maxPage = 1;
      const paginationEls = document.querySelectorAll(".pagination li");
      if (paginationEls && paginationEls.length > 0) {
        for (let i = paginationEls.length - 1; i >= 0; i--) {
          const pageLink = paginationEls[i].querySelector("a");
          if (pageLink) {
            const href = pageLink.attributes.href;
            const pageMatch = href ? href.match(/page=(\d+)/) : null;
            if (pageMatch && pageMatch[1]) {
              maxPage = parseInt(pageMatch[1]);
              break;
            }
          }
        }
      }

      return {
        comics: comics,
        maxPage: maxPage,
      };
    },
    optionList: [
      {
        options: ["all-全部", "guonei-国内", "riben-日本", "hanguo-韩国"],
      },
      {
        options: ["all-全部", "lianzai-连载", "wanjie-完结"],
      },
      {
        options: ["all-全部", "views-热门人气", "update-更新时间"],
      },
    ],
  };

  // Search
  search = {
    load: async (keyword, options, page) => {
      // First, we need to get the search token from the homepage
      const homeRes = await Network.get(`${this.baseUrl}/`);
      if (homeRes.status !== 200) {
        throw `Invalid status code: ${homeRes.status}`;
      }

      const homeDoc = new HtmlDocument(homeRes.body);
      const searchTokenEl = homeDoc.querySelector(
        "input[name='__searchtoken__']",
      );
      const searchToken = searchTokenEl?.attributes?.value || "";

      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}&__searchtoken__=${encodeURIComponent(searchToken)}&page=${page}`;
      const res = await Network.get(searchUrl);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);
      const comicElements = document.querySelectorAll(".media");
      const comics = [];

      for (let element of comicElements) {
        comics.push(this.parseComic(element));
      }

      // Determine max page from pagination
      let maxPage = 1;
      const paginationEls = document.querySelectorAll(".pagination li");
      if (paginationEls && paginationEls.length > 0) {
        for (let i = paginationEls.length - 1; i >= 0; i--) {
          const pageLink = paginationEls[i].querySelector("a");
          if (pageLink) {
            const href = pageLink.attributes.href;
            const pageMatch = href ? href.match(/page=(\d+)/) : null;
            if (pageMatch && pageMatch[1]) {
              maxPage = parseInt(pageMatch[1]);
              break;
            }
          }
        }
      }

      return {
        comics: comics,
        maxPage: maxPage,
      };
    },
    optionList: [],
  };

  // Comic details and reading
  comic = {
    loadInfo: async (id) => {
      const res = await Network.get(`${this.baseUrl}/${id}`);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const document = new HtmlDocument(res.body);

      const title = document.querySelector(".metas-title")?.text?.trim() || "";
      const cover =
        document.querySelector(".metas-image img")?.attributes?.src || "";
      const authorText =
        document.querySelector(".author:nth-child(1)")?.text?.trim() || "";
      const author = authorText.replace("作者：", "").trim();
      const statusText =
        document.querySelector(".author:nth-child(2)")?.text?.trim() || "";
      const status = statusText.replace("状态：", "").trim();
      const regionText =
        document.querySelector(".author:nth-child(3)")?.text?.trim() || "";
      const region = regionText.replace("地区：", "").trim();
      const genreText =
        document.querySelector(".author:nth-child(4)")?.text?.trim() || "";
      const genre = genreText.replace("题材：", "").trim();
      const updateTime =
        document.querySelector(".has-text-danger")?.text?.trim() || "";
      const description =
        document.querySelector(".metas-desc p")?.text?.trim() || "";

      // Get tags
      const tags = [genre].filter((tag) => tag); // Genre is the only tag in this structure

      // Get chapters
      const chapterElements = document.querySelectorAll(".comic-chapters li a");
      const chapters = new Map();
      for (let element of chapterElements) {
        const title = element?.text?.trim() || "";
        const href = element?.attributes?.href || "";
        const chapterId = href.split("/").pop()?.replace(".html", "") || "";
        if (title && chapterId) {
          chapters.set(chapterId, title);
        }
      }

      return new ComicDetails({
        title: title,
        cover: cover,
        description: description,
        tags: {
          作者: [author],
          状态: [status],
          地区: [region],
          标签: tags,
          更新时间: [updateTime],
        },
        chapters: chapters,
      });
    },

    loadEp: async (comicId, epId) => {
      // Get the chapter page to extract the encrypted params
      const res = await Network.get(`${this.baseUrl}/${comicId}/${epId}.html`);
      if (res.status !== 200) {
        throw `Invalid status code: ${res.status}`;
      }

      const body = res.body;

      // Extract the params variable from the script
      const paramsMatch = body.match(/params\s*=\s*["']([^"']+)["']/);

      if (!paramsMatch || !paramsMatch[1]) {
        throw "Could not extract params from chapter page";
      }

      console.log(paramsMatch[1]);
      const encryptedParams = paramsMatch[1];

      // Perform AES/CBC decryption using Venera's built-in function
      // try {
      const jsonData = await this.decryptChapterDataQuickJS(encryptedParams);

      const images = jsonData.chapter_images || [];
      const domain = jsonData.images_domain || "https://six.mhpic.net";

      // Construct full image URLs
      const fullUrls = images.map((imgPath) => {
        if (imgPath.startsWith("http")) {
          return imgPath;
        } else {
          return domain + imgPath;
        }
      });
      console.log([fullUrls]);

      return { images: fullUrls };
      // } catch (error) {
      //   console.error("Error decrypting chapter images:", error);
      //   throw new Error("Failed to decrypt chapter images: " + error.message);
      // }
    },

    // Handle image loading with proper headers to avoid 500 errors
    onImageLoad: (url, comicId, epId) => {
      return {
        headers: {
          Referer: `${this.baseUrl}/`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      };
    },
  };
}
