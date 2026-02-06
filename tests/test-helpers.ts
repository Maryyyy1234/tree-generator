import { spawnSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';

const CLI_CMD = 'node';
const CLI_PATH = join(process.cwd(), 'dist/cli.js');

/** Удаляет временный файл после теста. Ошибку удаления не пробрасываем — на результат теста это не влияет. */
export function removeTempFile(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // Файл уже удалён или недоступен — не считаем это падением теста
  }
}

/** Запускает программу: node dist/cli.js <уровни> <путь>. Можно передать произвольный массив аргументов. */
export function runCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(CLI_CMD, [CLI_PATH, ...args], {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}
