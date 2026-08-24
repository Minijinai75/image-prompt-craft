# 小縫補工坊

給 Mini 的 Image Prompt 教學小站：溫暖、好讀、可以點、可以複製。

這不是把整份筆記貼上來的文件站。兩分鐘學會**六層順序**與**最小修改原則**，再把骨架、換人、修正輪、Prompt Writer 帶回家。

## 這個站在教什麼

- 第一輪先建立穩定底圖；後面每一輪只修最重要的偏差（不是偷偷連生很多張）
- 六層：任務類型 → 不能變的 → 這一輪只改什麼 → 具體結果 → 攝影語言 → 風格最後
- 身份要拆開鎖，並擋住常見錯
- 關鍵字：`only` / `everything else remains unchanged`
- 第二輪以後的 Minimal Edit Principle
- 失敗診間：Identity Drift、Edit Spillover、Over-stylization、Composition Drift、Lighting Mismatch
- 優先級 P0–P4（身份 > 修改 > 構圖 > 質感 > 風格）
- 三張配方：新圖 / 修改 / 修正
- 八條規則 + 超短萬用版
- 角色身份錨點與 3–5 張 reference 的視覺摘要
- 可複製模板（預設收合）

方法只來自來源指南，沒有另外發明技法，也沒有繞過安全過濾的內容。

## 來源

[image_prompt_engineering_guide_zh_TW.md](https://github.com/Minijinai75/mini-grok-team/blob/main/notes/image_prompt_engineering_guide_zh_TW.md)

## 本機打開

不需要安裝、不需要伺服器。

1. 把這個資料庫 clone 或下載下來
2. 用瀏覽器直接打開 `index.html`

複製按鈕在本機檔案模式通常也能用；若瀏覽器擋住剪貼簿，可用滑鼠選取提示詞區塊再複製。

## 打開 GitHub Pages

1. 進這個 repo 的 **Settings → Pages**
2. Source 選 **Deploy from a branch**
3. Branch 選 `main`（或你合併後的預設分支），資料夾選 `/ (root)`
4. 儲存後等一兩分鐘，網址會是 `https://<使用者>.github.io/image-prompt-craft/`

入口檔是根目錄的 `index.html`，沒有 build 步驟。

## 給下一批插畫

如果之後有更可愛的圖，可直接替換 `assets/img/` 裡同名檔：

- `hero-patch.jpg`
- `layers-cake.jpg`
- `clinic-doc.jpg`
- `identity-faces.jpg`
- `workshop-desk.jpg`
- `goodnight.jpg`
- `mascot-stitch.jpg`
