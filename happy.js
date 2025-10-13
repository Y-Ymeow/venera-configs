class HappyComicSource extends ComicSource {
  name = "嗨皮漫画";
  key = "happy";
  version = "1.0.1";
  minAppVersion = "1.0.0";
  url =
    "https://gh-proxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/main/happy.js";

  init() {}

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
    title: "分类",
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
              },
            },
          },
        ],
      },
      {
        name: "状态",
        type: "fixed",
        categories: [
          {
            label: "全部",
            target: {
              page: "category",
              attributes: {
                category: "全部",
                param: null,
              },
            },
          },
          {
            label: "连载中",
            target: {
              page: "category",
              attributes: {
                category: "连载中",
                param: null,
              },
            },
          },
          {
            label: "完结",
            target: {
              page: "category",
              attributes: {
                category: "完结",
                param: null,
              },
            },
          },
        ],
      },
    ],
    enableRankingPage: false,
  };

  categoryComics = {
    load: async function (category, param, options, page) {
      // Parse options
      var genre = category === "全部" ? "" : category;
      var area = "";
      var audience = "";
      var status = "-1"; // Default to all statuses

      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.includes("area@")) {
          area = option.split("-")[0].split("@")[1] || "";
        } else if (option.includes("audience@")) {
          audience = option.split("-")[0].split("@")[1] || "";
        } else if (option.includes("status@")) {
          status = option.split("-")[0].split("@")[1] || "-1";
        }
      }

      var url = "https://m.happymh.com/apis/c/index?";
      if (genre !== "") url += "genre=" + genre + "&";
      if (area !== "") url += "area=" + area + "&";
      if (audience !== "") url += "audience=" + audience + "&";
      if (status !== "") url += "series_status=" + status + "&";
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
    }.bind(this),
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
      },
      {
        label: "状态",
        options: ["status@-全部", "status@0-连载中", "status@1-完结"],
      },
    ],
  };

  search = {
    load: async function (keyword, options, page) {
      if (keyword === "") {
        // If keyword is empty, perform category search with filters
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
    }.bind(this),
  };

  comic = {
    loadInfo: async (id) => {
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
      var title = document.querySelector("div.mg-property > h2.mg-title").text;
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

      return new ComicDetails({
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
      });
    },

    loadEp: async (comicId, epId) => {
      // First, find the chapter code using the chapterId
      var chapterCode = epId;
      // Now get the images using the chapter code
      var res = await fetch(
        "https://m.happymh.com/v2.0/apis/manga/reading?code=" +
          chapterCode +
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
      title: "User Agent",
      type: "input",
      default:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      description: "User agent for requests. Leave empty to use default.",
    },
  };

  translation = {
    zh_CN: {
      分类: "分类",
      地区: "地区",
      受众: "受众",
      状态: "状态",
      Setting1: "设置1",
      Setting2: "设置2",
      Setting3: "设置3",
    },
    zh_TW: {},
    en: {},
  };
}
