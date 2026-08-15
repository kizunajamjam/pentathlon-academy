/*
 * public/ 配下のファイルへのパスを組み立てる。
 *
 * GitHub Pages のプロジェクトページは /<リポジトリ名>/ 配下に置かれる。
 * next/image や next/link は basePath を自動で付けてくれるが、
 * SVG の <image href> のような生の URL には付かないため、そこだけ自分で補う。
 *
 * 通常のビルドでは NEXT_PUBLIC_BASE_PATH が空なので、そのままのパスになる。
 */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
