## Motivation / Background

旧環境から新環境へマイグレーションするときに大量のファイルコピーをする必要がでてきた.

ファイルがディレクトリ構造含めて整理できておらず、依存関係の把握が難しく、かつ対象アプリケーションも膨大なため、どのタイミングでどのファイルがコピーされたのかを追うのが難しくなるのが予想されたためログに残る形にしたくて作成.

## Uses:
```
deno run -A src/main.ts setting.json
```
* ディレクトリ指定のときは includes で指定した拡張子のファイルのみがコピー対象
* 強制上書き
* targets のパスは from からの相対パスの指定
* to 以下に targets で指定したディレクトリ構成ごとコピーする

### `setting.json`
```json
{
  "from": "../repositoryA/src",
  "to": "../repositoryB/apps/siteA/src",
  "targets": [
    "entries/shop.ts",
    "components/",
    "types/",
    "assets/custom.css"
  ],
  "includes": [ "ts", "css", "js", "vue" ]
}
```

## Requests:
- [ ] `dry-run` option
- [ ] `force overwrite` option
- [ ] Correct copy logs
- [ ] glob support
- [ ] Suggestions for identical file names with different extensions
