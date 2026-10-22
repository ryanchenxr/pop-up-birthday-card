# Pop-up Birthday Card · 立体生日卡

把照片做成一张可以亲手打开的生日卡：封面翻开，人物纸片立起，音乐随之响起。

这是一个面向 Codex 的可复用 Skill，附带 Three.js 模板和 Python 构建脚本。生成结果是图片、代码、音乐全部内嵌的单文件 HTML。

## 灵感与致谢

这个项目受 **[Zara Zhang（@zarazhangrui）](https://x.com/zarazhangrui)** 在 X 分享的 **[3D 弹出卡片演示及讨论串](https://x.com/zarazhangrui/status/2113055591954526444)** 与提示词启发。感谢她把“让照片里的人物随着卡片展开而立起来”的创意和制作思路分享出来。

Ryan 借助 Codex 参考这一创意独立实现了交互卡片，并把照片分层、纸片开合、音乐控制和单文件导出整理成了这份 Skill。本项目没有使用 Zara 的仓库代码。

欢迎关注她的 [X](https://x.com/zarazhangrui) 和 [GitHub](https://github.com/zarazhangrui)，看看更多有趣的作品。

> Inspired by the 3D pop-up card demo and prompt shared by **Zara Zhang (@zarazhangrui)** on X. Thank you, Zara, for sharing the idea and the prompt! This project was independently implemented by Ryan with Codex and packaged as a reusable skill. It does not incorporate code from Zara's repositories.

## 能做什么

- 根据用户照片生成风格一致的卡通人物与独立背景；默认简化五官、圆润线条，保留发型、服装和相互接触的姿势。用户指定画风时以其要求为准。
- 默认从经典派对、花园祝福、星光月亮中随机选择一款，每张卡固定款式；直接交付一张，不要求先选样式。
- 点击打开/合上卡片，拖动查看层次；透视、纸片背面、支架、阴影和彩纸组成纸艺效果。
- 自定义中文或英文祝福，文字由代码排版，长名字自动适配字号。
- 完全展开约 1 秒后出现祝福按钮；默认是几条通用祝福，用户指定发言人、收件人和内容时则完整使用指定内容。
- 点击打开后播放音乐，可关闭，也可生成无声版。
- 加载完成后首先显示合拢封面，避免提前展示内页。
- 输出自包含 HTML；需要分享时，可在获得授权后部署为 HTTPS 网页。

## 安装

将完整仓库放入个人 Skills 目录，保留 `SKILL.md`、`assets/`、`references/` 和 `scripts/` 的相对位置。例如：

```bash
git clone https://github.com/ryanchenxr/pop-up-birthday-card.git \
  "${CODEX_HOME:-$HOME/.codex}/skills/pop-up-birthday-card"
```

如果目标位置已有同名 Skill，请先检查已有版本，不要覆盖自己的改动。

## 用法

附上照片，告诉 Codex：

```text
用 $pop-up-birthday-card 做一张立体生日卡。
文字：Happy Birthday to Alex
风格：温暖手绘，配轻柔音乐。
先做本地预览，不发布。
```

只需要明确照片、祝福文字与偏好。主体不限定为三口之家，背景也不限定为某个地点。

照片转插画使用运行环境提供的图像生成工具；这一步不是构建脚本自动完成的。没有生图工具时，也可以使用自己准备的透明主体图和背景图。

## 直接构建

已经准备好素材时，只需要 Python 3，无需安装 npm 包或调用额外模型 API。以下命令从仓库根目录运行：

```bash
python3 scripts/build_card.py \
  --foreground /absolute/path/people.png \
  --background /absolute/path/scenery.png \
  --message 'Happy Birthday to Alex' \
  --output /absolute/path/birthday-card.html
```

前景应有真正的透明背景；背景建议为 3:2。PNG/JPEG/WebP 可作为图像输入，透明前景适合使用 PNG/WebP。

| 参数 | 用途 |
| --- | --- |
| `--style` | `random`（默认）、`party`、`garden`、`starlight`；重建保留既有款式 |
| `--wishes-json` | 自定义祝福 JSON 文件，完整替换默认选项，可指定 `from` / `to` |
| `--message` | 完整祝福文字，原样用于标题和卡片排字 |
| `--cover-line` | 可重复指定封面换行，不能漏字或改字 |
| `--music` | 使用指定 MP3/WAV；不提供则使用附带音乐盒旋律 |
| `--silent` | 不带音乐，也不显示声音按钮 |
| `--overwrite` | 更新同一脚本生成的卡片；不会覆盖任意无关 HTML |

自定义人物祝福示例（示例称呼仅供说明）：

```json
[
  {"from": "小明", "to": "奶奶", "text": "祝奶奶生日快乐！"},
  {"label": "小雨的祝福", "from": "小雨", "to": "奶奶", "text": "愿您健康平安，天天开心。"}
]
```

用 `--wishes-json /absolute/path/wishes.json` 传入。指定后不再追加通用祝福；不指定时使用几条不署名的通用祝福。界面只切换文字，不会自动克隆任何人的声音。普通重建保留同一标题卡片的已有祝福，改收件人时请提供新的内容。

## 预览与分享

用本地 HTTP 服务预览输出目录，例如：

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory /absolute/output/directory
```

然后打开 `http://127.0.0.1:8765/birthday-card.html`，检查合拢封面、展开、音乐和手机宽度布局。该地址仅供本机预览。

**单文件不等于任何附件预览器都能运行互动。**微信里的 HTML 附件可能不执行脚本或播放内嵌音频。需要对方在手机上互动时，使用 HTTPS 网页链接；只有用户明确授权后才上传或公开。发布流程见 [sharing.md](references/sharing.md)。

## 包含与不包含

包含 Skill 说明、素材提示词指南、可编辑场景模板、构建脚本、本地合成的音乐盒录音，以及 Three.js 和其许可证。

不包含任何真实家庭照片、已生成的人物插画、个人服务器信息、API 密钥或已发布生日卡的副本。仓库也没有自动部署或付费 API 调用。

## 许可与第三方组件

项目自有代码与文档使用 [MIT License](LICENSE)。

- Three.js 0.160.1 保留其 [MIT License](assets/THREE-LICENSE.txt)；构建脚本会把许可一并保留在 HTML 中。
- 音乐盒录音在本项目中本地合成，没有使用外部录音；旋律采用常见的生日祝福曲调。
- 用户提供的照片、字体、音频与生成素材不因本仓库的许可证而改变其原有权利。
