import { resolve } from "https://deno.land/std@0.212.0/path/resolve.ts";
import { relative } from "https://deno.land/std@0.212.0/path/relative.ts";
import { join } from "https://deno.land/std@0.212.0/path/mod.ts";
import { dirname } from "https://deno.land/std@0.212.0/path/dirname.ts";
// import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";
import { walk, type WalkOptions } from "https://deno.land/std@0.206.0/fs/walk.ts";
import { type CopyOptions } from "https://deno.land/std@0.214.0/fs/copy.ts";
import { copy } from "https://deno.land/std@0.214.0/fs/copy.ts";
import { readJson } from './readJson.ts'
import { type SettingJson } from './settingJson.d.ts'

const copyOptions: CopyOptions = {
  overwrite: false,
  preserveTimestamps: true
}

/**
 * 設定をかいた json ファイルのパスを引数に実行する
 */
const relativePath = Deno.args[0]
const resolvePath = resolve(Deno.cwd(), relativePath)

// 設定ファイルを読む
const settings: SettingJson = await readJson(resolvePath)
console.log(settings)

// copy 先のディレクトリパス
const destDir = resolve(Deno.cwd(), settings.to)

// copy 元のパスを解決する utility fn
const resolveTargetPath = (
  from: string,
  targetPath: string
): string => {
  return resolve(Deno.cwd(), from, targetPath)
}

// 解決済みの copy 対象のパス
const resolvedTargets: Array<{
  srcFullPath: string
}> = settings.targets.map((target) => {
  return {
    src: target,
    srcFullPath: resolveTargetPath(settings.from, target)
  }
})

// 設定にある拡張子をマッチさせるパターンを作る
const matchExtPattern = new RegExp(
  `.(${settings.includes.join('|')})$`
)

// walk で検索するオプション
const walkOptions: WalkOptions = {
  includeDirs: false,
  includeSymlinks: false,
  match: [matchExtPattern]
}

const copyFilesUnderDir = async (targetDir: string, copyTo: string) => {
  const resolvedFromPath = resolve(Deno.cwd(), settings.from)

  for await (const entry of walk(targetDir, walkOptions)) {
    const relativePath = relative(resolvedFromPath, entry.path)
    const dirPath = dirname(join(copyTo, relativePath))
    try {
      await Deno.stat(dirPath)
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        Deno.mkdir(dirPath, { recursive: true });
      }
    }
    await copy(entry.path, join(copyTo, relativePath), copyOptions)
  }
}

const copyFile = async (target:string, copyTo: string) => {
  const resolvedFromPath = resolve(Deno.cwd(), settings.from)
  const relativePath = relative(resolvedFromPath, target)
  const dirPath = dirname(join(copyTo, relativePath))
  try {
    await Deno.stat(dirPath)
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      Deno.mkdir(dirPath, { recursive: true });
    }
  }
  try {
    await copy(target, join(copyTo, relativePath), copyOptions)
  } catch (_error) {}
}

// コピー対象の列挙配列をもとに実行
resolvedTargets.map(async (target) => {
  // 対象がファイルかディレクトリか判定する
  const stat = await Deno.stat(target.srcFullPath)
  if (stat.isDirectory === true) {
    // ディレクトリ配下をコピー
    await copyFilesUnderDir(target.srcFullPath, destDir)
  } else if (stat.isFile === true) {
    // ファイルコピー
    copyFile(target.srcFullPath, destDir)
  } else {
    throw new Error('dame dayo')
  }
})
