class HappyComicSource extends ComicSource {
  name = "嗨皮漫画";
  key = "happy";
  version = "1.0.8";
  minAppVersion = "1.0.0";
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/happy.js";

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

  init() {
    // Initialize the cache system
  }

  explore = [
    {
      title: "嗨皮漫画",
      type: "multiPageComicList",
      load: async (page) => {
        var res = await fetch(
          "https://m.happymh.com/apis/c/index?pn=" +
            page +
            "&series_status=-1&order=last_date",
          {
            headers: {
              "User-Agent":
                this.loadSetting("ua") ||
                "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
              Referer: "https://m.happymh.com/latest",
              Priority: "u=4",
              "Sec-GPC": 1,
              Connection: "keep-alive",
            },
          },
        );
        if (res.status !== 200) {
          Network.deleteCookies(
            "https://m.happymh.com/apis/c/index?pn=" +
              page +
              "&series_status=-1&order=last_date",
          );
          throw new Error("Explore failed: " + res.status);
        }

        var data = await res.json();
        var comics = [];
        for (var i = 0; i < data.data.items.length; i++) {
          var item = data.data.items[i];
          var comic = this.parseComic(item);
          comics.push(comic);
        }

        return {
          comics: comics,
          maxPage: data.data.isEnd ? page : page + 1,
        };
      },
    },
  ];

  category = {
    title: "嗨皮漫画",
    parts: [
      {
        name: "分类",
        type: "fixed",
        categories: [
          {
            label: "全部",
            target: {
              page: "category",
              attributes: {
                category: "全部",
                param: null,
                title: "全部",
              },
            },
          },
          {
            label: "热血",
            target: {
              page: "category",
              attributes: {
                category: "rexue",
                param: null,
                title: "热血",
              },
            },
          },
          {
            label: "格斗",
            target: {
              page: "category",
              attributes: {
                category: "gedou",
                param: null,
                title: "格斗",
              },
            },
          },
          {
            label: "武侠",
            target: {
              page: "category",
              attributes: {
                category: "wuxia",
                param: null,
                title: "武侠",
              },
            },
          },
          {
            label: "魔幻",
            target: {
              page: "category",
              attributes: {
                category: "mohuan",
                param: null,
                title: "魔幻",
              },
            },
          },
          {
            label: "魔法",
            target: {
              page: "category",
              attributes: {
                category: "mofa",
                param: null,
                title: "魔法",
              },
            },
          },
          {
            label: "冒险",
            target: {
              page: "category",
              attributes: {
                category: "maoxian",
                param: null,
                title: "冒险",
              },
            },
          },
          {
            label: "爱情",
            target: {
              page: "category",
              attributes: {
                category: "aiqing",
                param: null,
                title: "爱情",
              },
            },
          },
          {
            label: "搞笑",
            target: {
              page: "category",
              attributes: {
                category: "gaoxiao",
                param: null,
                title: "搞笑",
              },
            },
          },
          {
            label: "校园",
            target: {
              page: "category",
              attributes: {
                category: "xiaoyuan",
                param: null,
                title: "校园",
              },
            },
          },
          {
            label: "科幻",
            target: {
              page: "category",
              attributes: {
                category: "kehuan",
                param: null,
                title: "科幻",
              },
            },
          },
          {
            label: "后宫",
            target: {
              page: "category",
              attributes: {
                category: "hougong",
                param: null,
                title: "后宫",
              },
            },
          },
          {
            label: "励志",
            target: {
              page: "category",
              attributes: {
                category: "lizhi",
                param: null,
                title: "励志",
              },
            },
          },
          {
            label: "职场",
            target: {
              page: "category",
              attributes: {
                category: "zhichang",
                param: null,
                title: "职场",
              },
            },
          },
          {
            label: "美食",
            target: {
              page: "category",
              attributes: {
                category: "meishi",
                param: null,
                title: "美食",
              },
            },
          },
          {
            label: "社会",
            target: {
              page: "category",
              attributes: {
                category: "shehui",
                param: null,
                title: "社会",
              },
            },
          },
          {
            label: "黑道",
            target: {
              page: "category",
              attributes: {
                category: "heidao",
                param: null,
                title: "黑道",
              },
            },
          },
          {
            label: "战争",
            target: {
              page: "category",
              attributes: {
                category: "zhanzheng",
                param: null,
                title: "战争",
              },
            },
          },
          {
            label: "历史",
            target: {
              page: "category",
              attributes: {
                category: "lishi",
                param: null,
                title: "历史",
              },
            },
          },
          {
            label: "悬疑",
            target: {
              page: "category",
              attributes: {
                category: "xuanyi",
                param: null,
                title: "悬疑",
              },
            },
          },
          {
            label: "竞技",
            target: {
              page: "category",
              attributes: {
                category: "jingji",
                param: null,
                title: "竞技",
              },
            },
          },
          {
            label: "体育",
            target: {
              page: "category",
              attributes: {
                category: "tiyu",
                param: null,
                title: "体育",
              },
            },
          },
          {
            label: "恐怖",
            target: {
              page: "category",
              attributes: {
                category: "kongbu",
                param: null,
                title: "恐怖",
              },
            },
          },
          {
            label: "推理",
            target: {
              page: "category",
              attributes: {
                category: "tuili",
                param: null,
                title: "推理",
              },
            },
          },
          {
            label: "生活",
            target: {
              page: "category",
              attributes: {
                category: "shenghuo",
                param: null,
                title: "生活",
              },
            },
          },
          {
            label: "伪娘",
            target: {
              page: "category",
              attributes: {
                category: "weiniang",
                param: null,
                title: "伪娘",
              },
            },
          },
          {
            label: "治愈",
            target: {
              page: "category",
              attributes: {
                category: "zhiyu",
                param: null,
                title: "治愈",
              },
            },
          },
          {
            label: "神鬼",
            target: {
              page: "category",
              attributes: {
                category: "shengui",
                param: null,
                title: "神鬼",
              },
            },
          },
          {
            label: "四格",
            target: {
              page: "category",
              attributes: {
                category: "sige",
                param: null,
                title: "四格",
              },
            },
          },
          {
            label: "百合",
            target: {
              page: "category",
              attributes: {
                category: "baihe",
                param: null,
                title: "百合",
              },
            },
          },
          {
            label: "耽美",
            target: {
              page: "category",
              attributes: {
                category: "danmei",
                param: null,
                title: "耽美",
              },
            },
          },
          {
            label: "舞蹈",
            target: {
              page: "category",
              attributes: {
                category: "wudao",
                param: null,
                title: "舞蹈",
              },
            },
          },
          {
            label: "侦探",
            target: {
              page: "category",
              attributes: {
                category: "zhentan",
                param: null,
                title: "侦探",
              },
            },
          },
          {
            label: "宅男",
            target: {
              page: "category",
              attributes: {
                category: "zhainan",
                param: null,
                title: "宅男",
              },
            },
          },
          {
            label: "音乐",
            target: {
              page: "category",
              attributes: {
                category: "yinyue",
                param: null,
                title: "音乐",
              },
            },
          },
          {
            label: "萌系",
            target: {
              page: "category",
              attributes: {
                category: "mengxi",
                param: null,
                title: "萌系",
              },
            },
          },
          {
            label: "古风",
            target: {
              page: "category",
              attributes: {
                category: "gufeng",
                param: null,
                title: "古风",
              },
            },
          },
          {
            label: "恋爱",
            target: {
              page: "category",
              attributes: {
                category: "lianai",
                param: null,
                title: "恋爱",
              },
            },
          },
          {
            label: "都市",
            target: {
              page: "category",
              attributes: {
                category: "dushi",
                param: null,
                title: "都市",
              },
            },
          },
          {
            label: "性转",
            target: {
              page: "category",
              attributes: {
                category: "xingzhuan",
                param: null,
                title: "性转",
              },
            },
          },
          {
            label: "穿越",
            target: {
              page: "category",
              attributes: {
                category: "chuanyue",
                param: null,
                title: "穿越",
              },
            },
          },
          {
            label: "游戏",
            target: {
              page: "category",
              attributes: {
                category: "youxi",
                param: null,
                title: "游戏",
              },
            },
          },
          {
            label: "其他",
            target: {
              page: "category",
              attributes: {
                category: "qita",
                param: null,
                title: "其他",
              },
            },
          },
          {
            label: "爱妻",
            target: {
              page: "category",
              attributes: {
                category: "aiqi",
                param: null,
                title: "爱妻",
              },
            },
          },
          {
            label: "日常",
            target: {
              page: "category",
              attributes: {
                category: "richang",
                param: null,
                title: "日常",
              },
            },
          },
          {
            label: "腹黑",
            target: {
              page: "category",
              attributes: {
                category: "fuhei",
                param: null,
                title: "腹黑",
              },
            },
          },
          {
            label: "古装",
            target: {
              page: "category",
              attributes: {
                category: "guzhuang",
                param: null,
                title: "古装",
              },
            },
          },
          {
            label: "仙侠",
            target: {
              page: "category",
              attributes: {
                category: "xianxia",
                param: null,
                title: "仙侠",
              },
            },
          },
          {
            label: "生化",
            target: {
              page: "category",
              attributes: {
                category: "shenghua",
                param: null,
                title: "生化",
              },
            },
          },
          {
            label: "修仙",
            target: {
              page: "category",
              attributes: {
                category: "xiuxian",
                param: null,
                title: "修仙",
              },
            },
          },
          {
            label: "情感",
            target: {
              page: "category",
              attributes: {
                category: "qinggan",
                param: null,
                title: "情感",
              },
            },
          },
          {
            label: "改编",
            target: {
              page: "category",
              attributes: {
                category: "gaibian",
                param: null,
                title: "改编",
              },
            },
          },
          {
            label: "纯爱",
            target: {
              page: "category",
              attributes: {
                category: "chunai",
                param: null,
                title: "纯爱",
              },
            },
          },
          {
            label: "唯美",
            target: {
              page: "category",
              attributes: {
                category: "weimei",
                param: null,
                title: "唯美",
              },
            },
          },
          {
            label: "蔷薇",
            target: {
              page: "category",
              attributes: {
                category: "qiangwei",
                param: null,
                title: "蔷薇",
              },
            },
          },
          {
            label: "明星",
            target: {
              page: "category",
              attributes: {
                category: "mingxing",
                param: null,
                title: "明星",
              },
            },
          },
          {
            label: "猎奇",
            target: {
              page: "category",
              attributes: {
                category: "lieqi",
                param: null,
                title: "猎奇",
              },
            },
          },
          {
            label: "青春",
            target: {
              page: "category",
              attributes: {
                category: "qingchun",
                param: null,
                title: "青春",
              },
            },
          },
          {
            label: "幻想",
            target: {
              page: "category",
              attributes: {
                category: "huanxiang",
                param: null,
                title: "幻想",
              },
            },
          },
          {
            label: "惊奇",
            target: {
              page: "category",
              attributes: {
                category: "jingqi",
                param: null,
                title: "惊奇",
              },
            },
          },
          {
            label: "彩虹",
            target: {
              page: "category",
              attributes: {
                category: "caihong",
                param: null,
                title: "彩虹",
              },
            },
          },
          {
            label: "奇闻",
            target: {
              page: "category",
              attributes: {
                category: "qiwen",
                param: null,
                title: "奇闻",
              },
            },
          },
          {
            label: "权谋",
            target: {
              page: "category",
              attributes: {
                category: "quanmou",
                param: null,
                title: "权谋",
              },
            },
          },
          {
            label: "宅斗",
            target: {
              page: "category",
              attributes: {
                category: "zhaidou",
                param: null,
                title: "宅斗",
              },
            },
          },
          {
            label: "限制级",
            target: {
              page: "category",
              attributes: {
                category: "xianzhiji",
                param: null,
                title: "限制级",
              },
            },
          },
          {
            label: "装逼",
            target: {
              page: "category",
              attributes: {
                category: "zhuangbi",
                param: null,
                title: "装逼",
              },
            },
          },
          {
            label: "浪漫",
            target: {
              page: "category",
              attributes: {
                category: "langman",
                param: null,
                title: "浪漫",
              },
            },
          },
          {
            label: "偶像",
            target: {
              page: "category",
              attributes: {
                category: "ouxiang",
                param: null,
                title: "偶像",
              },
            },
          },
          {
            label: "大女主",
            target: {
              page: "category",
              attributes: {
                category: "danvzhu",
                param: null,
                title: "大女主",
              },
            },
          },
          {
            label: "复仇",
            target: {
              page: "category",
              attributes: {
                category: "fuchou",
                param: null,
                title: "复仇",
              },
            },
          },
          {
            label: "虐心",
            target: {
              page: "category",
              attributes: {
                category: "nuexin",
                param: null,
                title: "虐心",
              },
            },
          },
          {
            label: "恶搞",
            target: {
              page: "category",
              attributes: {
                category: "egao",
                param: null,
                title: "恶搞",
              },
            },
          },
          {
            label: "灵异",
            target: {
              page: "category",
              attributes: {
                category: "lingyi",
                param: null,
                title: "灵异",
              },
            },
          },
          {
            label: "惊险",
            target: {
              page: "category",
              attributes: {
                category: "jingxian",
                param: null,
                title: "惊险",
              },
            },
          },
          {
            label: "宠爱",
            target: {
              page: "category",
              attributes: {
                category: "chongai",
                param: null,
                title: "宠爱",
              },
            },
          },
          {
            label: "逆袭",
            target: {
              page: "category",
              attributes: {
                category: "nixi",
                param: null,
                title: "逆袭",
              },
            },
          },
          {
            label: "妖怪",
            target: {
              page: "category",
              attributes: {
                category: "yaoguai",
                param: null,
                title: "妖怪",
              },
            },
          },
          {
            label: "暧昧",
            target: {
              page: "category",
              attributes: {
                category: "aimei",
                param: null,
                title: "暧昧",
              },
            },
          },
          {
            label: "同人",
            target: {
              page: "category",
              attributes: {
                category: "tongren",
                param: null,
                title: "同人",
              },
            },
          },
          {
            label: "架空",
            target: {
              page: "category",
              attributes: {
                category: "jiakong",
                param: null,
                title: "架空",
              },
            },
          },
          {
            label: "真人",
            target: {
              page: "category",
              attributes: {
                category: "zhenren",
                param: null,
                title: "真人",
              },
            },
          },
          {
            label: "动作",
            target: {
              page: "category",
              attributes: {
                category: "dongzuo",
                param: null,
                title: "动作",
              },
            },
          },
          {
            label: "橘味",
            target: {
              page: "category",
              attributes: {
                category: "juwei",
                param: null,
                title: "橘味",
              },
            },
          },
          {
            label: "宫斗",
            target: {
              page: "category",
              attributes: {
                category: "gongdou",
                param: null,
                title: "宫斗",
              },
            },
          },
          {
            label: "脑洞",
            target: {
              page: "category",
              attributes: {
                category: "naodong",
                param: null,
                title: "脑洞",
              },
            },
          },
          {
            label: "漫改",
            target: {
              page: "category",
              attributes: {
                category: "mangai",
                param: null,
                title: "漫改",
              },
            },
          },
          {
            label: "战斗",
            target: {
              page: "category",
              attributes: {
                category: "zhandou",
                param: null,
                title: "战斗",
              },
            },
          },
          {
            label: "丧尸",
            target: {
              page: "category",
              attributes: {
                category: "sangshi",
                param: null,
                title: "丧尸",
              },
            },
          },
          {
            label: "美少女",
            target: {
              page: "category",
              attributes: {
                category: "meishaonv",
                param: null,
                title: "美少女",
              },
            },
          },
          {
            label: "怪物",
            target: {
              page: "category",
              attributes: {
                category: "guaiwu",
                param: null,
                title: "怪物",
              },
            },
          },
          {
            label: "系统",
            target: {
              page: "category",
              attributes: {
                category: "xitong",
                param: null,
                title: "系统",
              },
            },
          },
          {
            label: "智斗",
            target: {
              page: "category",
              attributes: {
                category: "zhidou",
                param: null,
                title: "智斗",
              },
            },
          },
          {
            label: "机甲",
            target: {
              page: "category",
              attributes: {
                category: "jijia",
                param: null,
                title: "机甲",
              },
            },
          },
          {
            label: "高甜",
            target: {
              page: "category",
              attributes: {
                category: "gaotian",
                param: null,
                title: "高甜",
              },
            },
          },
          {
            label: "僵尸",
            target: {
              page: "category",
              attributes: {
                category: "jiangshi",
                param: null,
                title: "僵尸",
              },
            },
          },
          {
            label: "致郁",
            target: {
              page: "category",
              attributes: {
                category: "zhiyu",
                param: null,
                title: "致郁",
              },
            },
          },
          {
            label: "电竞",
            target: {
              page: "category",
              attributes: {
                category: "dianjing",
                param: null,
                title: "电竞",
              },
            },
          },
          {
            label: "神魔",
            target: {
              page: "category",
              attributes: {
                category: "shenmo",
                param: null,
                title: "神魔",
              },
            },
          },
          {
            label: "异能",
            target: {
              page: "category",
              attributes: {
                category: "yineng",
                param: null,
                title: "异能",
              },
            },
          },
          {
            label: "末日",
            target: {
              page: "category",
              attributes: {
                category: "mori",
                param: null,
                title: "末日",
              },
            },
          },
          {
            label: "乙女",
            target: {
              page: "category",
              attributes: {
                category: "yinv",
                param: null,
                title: "乙女",
              },
            },
          },
          {
            label: "豪快",
            target: {
              page: "category",
              attributes: {
                category: "haokuai",
                param: null,
                title: "豪快",
              },
            },
          },
          {
            label: "奇幻",
            target: {
              page: "category",
              attributes: {
                category: "qihuan",
                param: null,
                title: "奇幻",
              },
            },
          },
          {
            label: "绅士",
            target: {
              page: "category",
              attributes: {
                category: "shenshi",
                param: null,
                title: "绅士",
              },
            },
          },
          {
            label: "正能量",
            target: {
              page: "category",
              attributes: {
                category: "zhengnengliang",
                param: null,
                title: "正能量",
              },
            },
          },
          {
            label: "宫廷",
            target: {
              page: "category",
              attributes: {
                category: "gongting",
                param: null,
                title: "宫廷",
              },
            },
          },
          {
            label: "亲情",
            target: {
              page: "category",
              attributes: {
                category: "qinqing",
                param: null,
                title: "亲情",
              },
            },
          },
          {
            label: "养成",
            target: {
              page: "category",
              attributes: {
                category: "yangcheng",
                param: null,
                title: "养成",
              },
            },
          },
          {
            label: "剧情",
            target: {
              page: "category",
              attributes: {
                category: "juqing",
                param: null,
                title: "剧情",
              },
            },
          },
          {
            label: "轻小说",
            target: {
              page: "category",
              attributes: {
                category: "qingxiaoshuo",
                param: null,
                title: "轻小说",
              },
            },
          },
          {
            label: "暗黑",
            target: {
              page: "category",
              attributes: {
                category: "anhei",
                param: null,
                title: "暗黑",
              },
            },
          },
          {
            label: "长条",
            target: {
              page: "category",
              attributes: {
                category: "changtiao",
                param: null,
                title: "长条",
              },
            },
          },
          {
            label: "玄幻",
            target: {
              page: "category",
              attributes: {
                category: "xuanhuan",
                param: null,
                title: "玄幻",
              },
            },
          },
          {
            label: "霸总",
            target: {
              page: "category",
              attributes: {
                category: "bazong",
                param: null,
                title: "霸总",
              },
            },
          },
          {
            label: "欧皇",
            target: {
              page: "category",
              attributes: {
                category: "ouhuang",
                param: null,
                title: "欧皇",
              },
            },
          },
          {
            label: "生存",
            target: {
              page: "category",
              attributes: {
                category: "shengcun",
                param: null,
                title: "生存",
              },
            },
          },
          {
            label: "异世界",
            target: {
              page: "category",
              attributes: {
                category: "yishijie",
                param: null,
                title: "异世界",
              },
            },
          },
          {
            label: "C99",
            target: {
              page: "category",
              attributes: {
                category: "C99",
                param: null,
                title: "C99",
              },
            },
          },
          {
            label: "节操",
            target: {
              page: "category",
              attributes: {
                category: "jiecao",
                param: null,
                title: "节操",
              },
            },
          },
          {
            label: "AA",
            target: {
              page: "category",
              attributes: {
                category: "AA",
                param: null,
                title: "AA",
              },
            },
          },
          {
            label: "影视化",
            target: {
              page: "category",
              attributes: {
                category: "yingshihua",
                param: null,
                title: "影视化",
              },
            },
          },
          {
            label: "欧风",
            target: {
              page: "category",
              attributes: {
                category: "oufeng",
                param: null,
                title: "欧风",
              },
            },
          },
          {
            label: "女神",
            target: {
              page: "category",
              attributes: {
                category: "nvshen",
                param: null,
                title: "女神",
              },
            },
          },
          {
            label: "爽感",
            target: {
              page: "category",
              attributes: {
                category: "shuanggan",
                param: null,
                title: "爽感",
              },
            },
          },
          {
            label: "转生",
            target: {
              page: "category",
              attributes: {
                category: "zhuansheng",
                param: null,
                title: "转生",
              },
            },
          },
          {
            label: "异形",
            target: {
              page: "category",
              attributes: {
                category: "yixing",
                param: null,
                title: "异形",
              },
            },
          },
          {
            label: "反套路",
            target: {
              page: "category",
              attributes: {
                category: "fantaolu",
                param: null,
                title: "反套路",
              },
            },
          },
          {
            label: "双男主",
            target: {
              page: "category",
              attributes: {
                category: "shuangnanzhu",
                param: null,
                title: "双男主",
              },
            },
          },
          {
            label: "无敌流",
            target: {
              page: "category",
              attributes: {
                category: "wudiliu",
                param: null,
                title: "无敌流",
              },
            },
          },
          {
            label: "性转换",
            target: {
              page: "category",
              attributes: {
                category: "xingzhuanhuan",
                param: null,
                title: "性转换",
              },
            },
          },
          {
            label: "重生",
            target: {
              page: "category",
              attributes: {
                category: "zhongsheng",
                param: null,
                title: "重生",
              },
            },
          },
          {
            label: "血腥",
            target: {
              page: "category",
              attributes: {
                category: "xuexing",
                param: null,
                title: "血腥",
              },
            },
          },
          {
            label: "奇遇",
            target: {
              page: "category",
              attributes: {
                category: "qiyu",
                param: null,
                title: "奇遇",
              },
            },
          },
          {
            label: "泛爱",
            target: {
              page: "category",
              attributes: {
                category: "fanai",
                param: null,
                title: "泛爱",
              },
            },
          },
          {
            label: "软萌",
            target: {
              page: "category",
              attributes: {
                category: "ruanmeng",
                param: null,
                title: "软萌",
              },
            },
          },
          {
            label: "小天使",
            target: {
              page: "category",
              attributes: {
                category: "xiaotianshi",
                param: null,
                title: "小天使",
              },
            },
          },
          {
            label: "邪恶",
            target: {
              page: "category",
              attributes: {
                category: "xiee",
                param: null,
                title: "邪恶",
              },
            },
          },
        ],
      },
      {
        name: "地区",
        type: "fixed",
        categories: [
          {
            label: "全部",
            target: {
              page: "category",
              attributes: {
                category: "全部",
                param: null,
                title: "全部",
              },
            },
          },
          {
            label: "内地",
            target: {
              page: "category",
              attributes: {
                category: "china",
                param: null,
                title: "内地",
              },
            },
          },
          {
            label: "日本",
            target: {
              page: "category",
              attributes: {
                category: "japan",
                param: null,
                title: "日本",
              },
            },
          },
          {
            label: "港台",
            target: {
              page: "category",
              attributes: {
                category: "hongkong",
                param: null,
                title: "港台",
              },
            },
          },
          {
            label: "欧美",
            target: {
              page: "category",
              attributes: {
                category: "europe",
                param: null,
                title: "欧美",
              },
            },
          },
          {
            label: "韩国",
            target: {
              page: "category",
              attributes: {
                category: "korea",
                param: null,
                title: "韩国",
              },
            },
          },
          {
            label: "其他",
            target: {
              page: "category",
              attributes: {
                category: "other",
                param: null,
                title: "其他",
              },
            },
          },
        ],
      },
      {
        name: "受众",
        type: "fixed",
        categories: [
          {
            label: "全部",
            target: {
              page: "category",
              attributes: {
                category: "全部",
                param: null,
                title: "全部",
              },
            },
          },
          {
            label: "少年",
            target: {
              page: "category",
              attributes: {
                category: "shaonian",
                param: null,
                title: "少年",
              },
            },
          },
          {
            label: "少女",
            target: {
              page: "category",
              attributes: {
                category: "shaonv",
                param: null,
                title: "少女",
              },
            },
          },
          {
            label: "青年",
            target: {
              page: "category",
              attributes: {
                category: "qingnian",
                param: null,
                title: "青年",
              },
            },
          },
          {
            label: "BL",
            target: {
              page: "category",
              attributes: {
                category: "BL",
                param: null,
                title: "BL",
              },
            },
          },
          {
            label: "GL",
            target: {
              page: "category",
              attributes: {
                category: "GL",
                param: null,
                title: "GL",
              },
            },
          },
        ],
      },
    ],
    enableRankingPage: false,
  };

  categoryComics = {
    load: async (category, param, options, page) => {
      // Track which filters have been applied via category to avoid conflicts with options
      let hasCategoryGenre = false;
      let hasCategoryArea = false;
      let hasCategoryAudience = false;
      let hasCategoryStatus = false;

      // Parse parameters
      var genre = "";
      var area = "";
      var audience = "";
      var status = "-1"; // Default to all statuses

      // Handle the main category based on its type
      // Check category type based on predefined values
      const areaValues = [
        "china",
        "japan",
        "hongkong",
        "europe",
        "korea",
        "other",
      ];
      const audienceValues = ["shaonian", "shaonv", "qingnian", "BL", "GL"];
      const statusValues = ["连载中", "完结"];

      if (category !== "全部") {
        if (areaValues.includes(category)) {
          area = category;
          hasCategoryArea = true;
        } else if (audienceValues.includes(category)) {
          audience = category;
          hasCategoryAudience = true;
        } else if (statusValues.includes(category)) {
          status = category === "连载中" ? "0" : "1";
          hasCategoryStatus = true;
        } else {
          // Treat as genre
          genre = category;
          hasCategoryGenre = true;
        }
      }

      // Apply filters from options since now we only have one "all" category
      // But only if the corresponding category filter hasn't been applied yet
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.includes("area@")) {
          // Only apply area option if no category area filter was applied
          if (!hasCategoryArea) {
            area = option.split("-")[0].split("@")[1] || "";
          }
        } else if (option.includes("audience@")) {
          // Only apply audience option if no category audience filter was applied
          if (!hasCategoryAudience) {
            audience = option.split("-")[0].split("@")[1] || "";
          }
        } else if (option.includes("status@")) {
          // Only apply status option if no category status filter was applied
          if (!hasCategoryStatus) {
            status = option.split("-")[0].split("@")[1] || "-1";
          }
        }
      }

      // Build URL
      var url = "https://m.happymh.com/apis/c/index?";
      if (genre !== "") url += "genre=" + genre + "&";
      if (area !== "") url += "area=" + area + "&";
      if (audience !== "") url += "audience=" + audience + "&";
      if (status !== "-1") url += "series_status=" + status + "&";
      url += "pn=" + page;

      var res = await fetch(url, {
        headers: {
          "User-Agent":
            this.loadSetting("ua") ||
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
          Referer: "https://m.happymh.com/latest",
        },
      });
      if (res.status !== 200) {
        throw new Error("CategoryComics failed: " + res.status);
      }
      var data = await res.json();
      var comics = [];
      for (var i = 0; i < data.data.items.length; i++) {
        var item = data.data.items[i];
        var comic = this.parseComic(item);
        comics.push(comic);
      }

      return {
        comics: comics,
        maxPage: data.data.isEnd ? page : page + 1,
      };
    },
    optionList: [
      {
        label: "地区",
        options: [
          "area@-全部",
          "area@china-内地",
          "area@japan-日本",
          "area@hongkong-港台",
          "area@europe-欧美",
          "area@korea-韩国",
          "area@other-其他",
        ],
        notShowWhen: ["china", "japan", "hongkong", "europe", "korea", "other"], // Hide when area category is selected
      },
      {
        label: "受众",
        options: [
          "audience@-全部",
          "audience@shaonian-少年",
          "audience@shaonv-少女",
          "audience@qingnian-青年",
          "audience@BL-BL",
          "audience@GL-GL",
        ],
        notShowWhen: ["shaonian", "shaonv", "qingnian", "BL", "GL"], // Hide when audience category is selected
      },
      {
        label: "状态",
        options: ["status@-全部", "status@0-连载中", "status@1-完结"],
        notShowWhen: ["连载中", "完结"], // Hide when status category is selected
      },
    ],
  };

  search = {
    load: async (keyword, options, page) => {
      if (!keyword) {
        // Default to "全部" category when no keyword is provided
        return await this.categoryComics.load("全部", null, options, page);
      }

      var res = await Network.post(
        "https://m.happymh.com/v2.0/apis/manga/ssearch",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Referer: "https://m.happymh.com/sssearch",
            "User-Agent":
              this.loadSetting("ua") ||
              "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
          },
          body: "searchkey=" + encodeURIComponent(keyword) + "&v=v2.13",
        },
      );
      if (res.status !== 200) {
        throw new Error("Search failed: " + res.status);
      }
      var data = await res.json();
      var comics = [];
      for (var i = 0; i < data.data.items.length; i++) {
        var item = data.data.items[i];
        var comic = this.parseComic(item);
        comics.push(comic);
      }

      return {
        comics: comics,
        maxPage: page, // Search typically doesn't have pagination in this API
      };
    },
  };

  comic = {
    loadInfo: async (id) => {
      return this._withCache(`comic_${id}.info`, async () => {
        var res = await Network.get("https://m.happymh.com/manga/" + id, {
          headers: {
            "User-Agent":
              this.loadSetting("ua") ||
              "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
            Referer: "https://m.happymh.com/latest",
          },
        });
        if (res.status !== 200) {
          throw new Error("Comic info failed: " + res.status);
        }
        var document = new HtmlDocument(res.body);

        // Extract comic details
        var title = document.querySelector(
          "div.mg-property > h2.mg-title",
        ).text;
        var cover = document.querySelector("div.mg-cover > mip-img").attributes[
          "src"
        ];
        var author = document
          .querySelectorAll("div.mg-property > p.mg-sub-title")[1]
          .text.trim();
        var genre = [];
        var genreElements = document.querySelectorAll(
          "div.mg-property > p.mg-cate > a",
        );
        for (var i = 0; i < genreElements.length; i++) {
          genre.push(genreElements[i].text);
        }
        var description = document.querySelector(
          "div.manga-introduction > mip-showmore#showmore",
        ).text;

        const time = document.querySelector(".time").text.trim();
        // Get comic code from URL
        var comicId = id.split("/").pop();

        // Load chapters (with pagination)
        var chapters = new Map();
        let listChapters = [];
        var chapterPage = 1;
        var hasMoreChapters = true;

        while (hasMoreChapters) {
          var chapterRes = await fetch(
            "https://m.happymh.com/v2.0/apis/manga/chapterByPage?code=" +
              comicId +
              "&lang=cn&order=asc&page=" +
              chapterPage +
              "&v=v2.1818134",
            {
              headers: {
                "User-Agent":
                  this.loadSetting("ua") ||
                  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
                Referer: "https://m.happymh.com" + id,
                "X-Requested-With": "XMLHttpRequest",
              },
            },
          );
          if (chapterRes.status !== 200) {
            break; // If chapter API fails, continue with available chapters
          }
          var chapterData = await chapterRes.json();

          if (chapterData.data.items.length === 0) {
            hasMoreChapters = false;
          } else {
            // Process chapters from current page
            for (var i = 0; i < chapterData.data.items.length; i++) {
              var item = chapterData.data.items[i];
              // Format the chapter key to include comicId and chapterId
              var chapterKey =
                "/" + comicId + "/dummy-mark/" + item.id + "#" + chapterPage;
              listChapters.push({
                key: item.codes,
                name: item.chapterName,
              });
            }
            // Check if this is the last page
            if (chapterData.data.isEnd === 1) {
              hasMoreChapters = false;
            }
            chapterPage++;
          }
        }

        listChapters.map((e) => {
          chapters.set(e.key, e.name);
        });

        const result = {
          id: id,
          title: title,
          cover: cover,
          tags: {
            标签: genre,
            作者: [author],
          },
          description: description,
          chapters: chapters,
          updateTime: time,
        };

        return new ComicDetails(result);
      });
    },

    loadEp: async (comicId, epId) => {
      // Get chapter id from epId
      var chapterCode = epId;

      var res = await fetch(
        "https://m.happymh.com/v2.0/apis/manga/reading?code=" +
          chapterId +
          "&v=v3.1818134",
        {
          headers: {
            "User-Agent":
              this.loadSetting("ua") ||
              "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
            Referer: "https://m.happymh.com" + epId,
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );
      if (res.status !== 200) {
        throw new Error("LoadEp failed: " + res.status);
      }
      var data = await res.json();

      // Extract images that belong to current chapter (n == 0)
      var images = [];
      for (var i = 0; i < data.data.scans.length; i++) {
        var scan = data.data.scans[i];
        if (scan.n === 0) {
          // Only include images from current chapter, not next chapter
          images.push(scan.url);
        }
      }

      return {
        images: images,
      };
    },

    onImageLoad: function (url, comicId, epId) {
      return {
        headers: {
          Referer: "https://m.happymh.com/",
          "User-Agent":
            this.loadSetting("ua") ||
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        },
      };
    }.bind(this),
  };

  parseComic(item) {
    return new Comic({
      id: item.manga_code, // Keep the full URL as id
      title: item.name,
      cover: item.cover,
      subtitle: `最后更新: ${item.last_chapter}`,
      // Remove author field since it's obtained in comic details
    });
  }

  settings = {
    ua: {
      title: "User-Agent",
      type: "input",
      default:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    clearCookie: {
      title: "清除Cookie",
      type: "callback",
      buttonText: "清除",
      callback: () => {
        Network.deleteCookies("https://m.happymh.com/");
        UI.showMessage("已清除Cookie");
      },
    },
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
    clearCache: {
      title: "清除缓存",
      type: "callback",
      buttonText: "清除",
      callback: () => {
        this.deleteData("cache_timestamps");
        this.deleteData("cache_data");
        this.deleteData("cache_keys");
        UI.showMessage("已清除缓存");
      },
    },
  };
}
