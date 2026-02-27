#!/bin/bash

# GitHub Pages 部署腳本

echo "🚀 開始部署到 GitHub Pages..."

# 1. 建置專案
echo "📦 建置中..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 建置失敗，停止部署"
    exit 1
fi

# 2. 添加 dist 到 git
echo "📁 添加 dist 檔案..."
git add -f dist/

# 3. 提交變更
echo "💾 提交變更..."
git commit -m "deploy: 更新 GitHub Pages ($(date '+%Y-%m-%d %H:%M'))"

# 4. 推送到 gh-pages 分支
echo "📤 推送到 gh-pages 分支..."
git subtree push --prefix dist origin gh-pages

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 網址: https://ctyong629.github.io/champio/"
else
    echo "❌ 部署失敗"
    exit 1
fi
