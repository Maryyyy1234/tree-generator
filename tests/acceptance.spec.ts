import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateTree } from '../dist/index.js';

const CLI_CMD = 'node';
const CLI_PATH = join(process.cwd(), 'dist/cli.js');

/** Удаляет временный файл после теста. Ошибку удаления не пробрасываем — на результат теста это не влияет. */
function removeTempFile(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // Файл уже удалён или недоступен — не считаем это падением теста
  }
}

/** Запускает программу: node dist/cli.js <уровни> <путь>. Можно передать произвольный массив аргументов. */
function runCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
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

test.describe('Приёмочные тесты генератора ёлки', () => {
  test('При любом допустимом числе уровней (1–100) ёлка рисуется корректно и сохраняется в файл', async () => {
    const iterations = 20;
    for (let i = 0; i < iterations; i++) {
      const levels = Math.floor(Math.random() * 100) + 1;
      const outPath = join(tmpdir(), `tree-${levels}-${Date.now()}-${i}.txt`);
      const { status, stderr } = runCli([String(levels), outPath]);

      expect(stderr, `Уровни ${levels}: не должно быть ошибок в stderr`).toBe('');
      expect(status, `Уровни ${levels}: код выхода должен быть 0`).toBe(0);
      expect(existsSync(outPath), `Уровни ${levels}: файл должен быть создан`).toBe(true);

      const content = readFileSync(outPath, 'utf-8');
      expect(content, `Уровни ${levels}: содержимое должно совпадать с эталоном`).toBe(generateTree(levels));

      removeTempFile(outPath);
    }
  });

  test('Уровень 1: только верх (W, *) и ствол, без рядов веток', async () => {
    const outPath = join(tmpdir(), `tree-1-only-${Date.now()}.txt`);
    const { status, stderr } = runCli(['1', outPath]);

    expect(stderr).toBe('');
    expect(status).toBe(0);
    const content = readFileSync(outPath, 'utf-8');
    expect(content).toBe(generateTree(1));

    const lines = content.split('\n');
    expect(lines.length).toBe(4);
    expect(lines[0].trim()).toBe('W');
    expect(lines[1].trim()).toBe('*');
    expect(lines[2].trim()).toBe('TTTTT');

    removeTempFile(outPath);
  });

  test('Уровень 0: выводится сообщение, что количество должно быть от 1 до 100', async () => {
    const outPath = join(tmpdir(), `tree-0-${Date.now()}.txt`);
    const { status, stderr } = runCli(['0', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Уровни < 0 (отрицательное): выводится сообщение, что количество должно быть от 1 до 100', async () => {
    const outPath = join(tmpdir(), `tree-neg-${Date.now()}.txt`);
    const { status, stderr } = runCli(['-1', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Уровень 100 (верхняя граница): ёлка рисуется и сохраняется в файл', async () => {
    const outPath = join(tmpdir(), `tree-100-${Date.now()}.txt`);
    const { status, stderr } = runCli(['100', outPath]);

    expect(stderr).toBe('');
    expect(status).toBe(0);
    expect(existsSync(outPath)).toBe(true);
    const content = readFileSync(outPath, 'utf-8');
    expect(content).toBe(generateTree(100));
    removeTempFile(outPath);
  });

  test('Уровни > 100: выводится сообщение, что количество должно быть от 1 до 100', async () => {
    const outPath = join(tmpdir(), `tree-101-${Date.now()}.txt`);
    const { status, stderr } = runCli(['101', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Некорректные данные (не число): выводится сообщение, что значение должно быть целым числом', async () => {
    const outPath = join(tmpdir(), `tree-nan-${Date.now()}.txt`);
    const { status, stderr } = runCli(['abc', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Некорректное значение уровней: должно быть целое число от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Неверное расширение файла (не .txt): выводится сообщение, что ожидается .txt', async () => {
    const outPath = join(tmpdir(), `tree-${Date.now()}.csv`);
    const { status, stderr } = runCli(['2', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается путь к файлу с расширением .txt');
  });

  test('Неверный путь (каталог не существует): выводится сообщение, что каталог не существует', async () => {
    const outPath = join(tmpdir(), 'несуществующий_каталог_xyz_123', `out-${Date.now()}.txt`);
    const { status, stderr } = runCli(['2', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Каталог не существует');
    expect(stderr).toContain('Укажите существующий путь к .txt файлу');
  });

  test('Больше двух аргументов: выводится сообщение, что ожидается 2 аргумента', async () => {
    const outPath = join(tmpdir(), `tree-${Date.now()}.txt`);
    const { status, stderr } = runCli(['2', outPath, 'лишний']);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается 2 аргумента');
  });

  test('Меньше двух аргументов (без аргументов): выводится подсказка об использовании', async () => {
    const { status, stderr } = runCli([]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается 2 аргумента');
  });
});
