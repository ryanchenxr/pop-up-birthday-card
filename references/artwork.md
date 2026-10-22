# 照片到纸片素材

使用用户当前照片，不把历史家庭照片、姓名或生成结果带入新任务。所有引用图都明确角色：身份/姿势、画风、场景/结构。

## 默认画风与用户优先级

先看用户是否指定画风；有要求则按要求。没有要求时，采用明显的可爱卡通：头部略放大、圆润轮廓、简化点/弧线五官、腮红、轻松的笑容、粗细自然的深色描边和大块平涂。保留可辨识的发型、衣着、配饰及站位，不追求皮肤、皱纹和头发的照片级细节。不能只给真人照片加绘画纹理就当作卡通。

## 前景提示词骨架

按实际照片填写具体外貌与衣着，不保留示例人物设定：

> Create one flat die-cut illustration for a 3D paper pop-up card. The supplied photograph is the identity, clothing, pose and grouping reference. Preserve the actual number of people, identifying hairstyles, clothing, accessories and overlapping pose. For the default cartoon treatment, simplify faces rather than reproducing photographic facial detail. [Describe the observed group and relevant details.] Keep connected interactions together. Style: [user-specified style; otherwise cute picture-book cartoon with rounded slightly oversized heads, simple dot/curve eyes, rosy cheeks, broad flat colors, navy hand-inked outlines and subtle paper grain. Avoid realistic skin, individually rendered hair, detailed teeth and photographic volume]. Add a thin warm-ivory paper edge. Isolate the entire subject on a genuinely transparent background, including gaps around limbs. Leave transparent margins; no clipped heads or hands. Give the lower edge a clean baseline suitable for a folding tab. No landscape, ground shadow, text, extra people or 3D camera perspective.

内置 imagegen 的 `transparent_background` 设为 true。调用前查看本地引用图；生成后检查实际 alpha 与轮廓。不要用黑白棋盘格图案冒充透明。

## 背景提示词骨架

> Create a full-bleed flat landscape print for a paper pop-up card. Use the supplied photograph only as a scenery reference: [actual scenery]. Match the foreground illustration's medium, line work and colors. No people or repeated portraits, no lettering, no card frame, no perspective mockup. Landscape 3:2. Keep important scenery in the upper area so it remains visible above the foreground group. The lower part should support the scene without excessive detail competing with the people.

人物原本挡住的区域可合理补景，但不要将补出的内容描述为真实照片细节。背景无人物是避免重复身影的关键。

## 资产与构图

- 前景保持单一平面视角；透视由场景统一产生，不能把斜拍的卡片 mockup 当贴图。
- 前景可是一人、合影、宠物或用户指定主体；不自动增减人数或更换服装。
- 多层人物仅在主体容易分离且用户目标需要时增加；优先保留接触关系。
- 模板会按前景长宽比装入固定展示区域；很宽的合照需要调整纸片宽度、两侧装饰和镜头，不靠把人拉长填满。
- 背景按比例居中裁切，不拉伸；重要地标靠边时应重新构图。
- 较长文字默认缩字号。若缩小后不可读，改为多行版式并检查横幅，不能默默删字。
- 记录实际使用的生成提示词和素材路径在用户项目中；生成工具输出是素材成果，不代表整个互动体验已经完成。
