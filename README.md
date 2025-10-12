# venera-configs

Configuration file repository for venera

## 已包含漫画源
- 拷贝漫画
- Komiic
- 包子漫画
- Picacg
- nhentai
- 紳士漫畫
- ehentai
- 禁漫天堂
- MangaDex
- 爱看漫
- 少年ジャンプ＋
- hitomi.la
- comick
- 优酷漫画
- 再漫画
- 漫画柜
- 漫蛙吧
- Lanraragi

## 此为此仓库新增
- 漫蛙
- Manhwa18.cc
- 늑대닷컴 (Wolf)
- Goda
- Manhwa Raw

## 通过 JSON 自动添加漫画源

可通过 `index2.json` 文件自动添加漫画源，无需手动配置。直接使用以下原始链接导入：

```
https://raw.githubusercontent.com/Y-Ymeow/venera-configs/refs/heads/main/index2.json
```

**注意事项：**
- 仓库每天自动同步源仓库，确保源列表保持最新
- 如访问速度较慢，可使用 [gh-proxy](https://ghproxy.com/) 加速：
  ```
  https://ghproxy.com/https://raw.githubusercontent.com/Y-Ymeow/venera-configs/refs/heads/main/index2.json
  ```

## 创建新配置

1. 下载 `_template_.js` 和 `_venera_.js` 文件，放入同一目录
2. 将 `_template_.js` 重命名为 `your_config_name.js`
3. 根据需求编辑 `your_config_name.js` 文件
   - `_template_.js` 文件中包含详细注释以帮助配置
   - `_venera_.js` 用于 IDE 中的代码补全

## 添加新漫画源
1. 在项目中新建漫画源配置文件（如 `new_source.js`）
2. 按照现有源文件的格式编写配置
3. 提交 PR 到本仓库以共享给其他用户
