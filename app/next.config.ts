import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // これを指定しないと、上位ディレクトリの package-lock.json を拾って
  // ワークスペースルートを誤検出する（ビルド時に警告が出る）。
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
