import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateTree } from '../dist/index.js';
import { removeTempFile, runCli } from './test-helpers.js';

test.describe('Приёмочные тесты генератора ёлки', () => {
  test('Проверка генерации ёлки с допустимыми уровнями отрисовки (1–100)', async () => {
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

  test('Проверка генерации ёлки с заданным значением, равным единице (нижняя граница)', async () => {
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

  test('Проверка вывода ошибки при попытке сгенерировать ёлку с нулевым количеством уровней', async () => {
    const outPath = join(tmpdir(), `tree-0-${Date.now()}.txt`);
    const { status, stderr } = runCli(['0', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Проверка вывода ошибки при попытке сгенерировать ёлку с отрицательным количеством уровней', async () => {
    const outPath = join(tmpdir(), `tree-neg-${Date.now()}.txt`);
    const { status, stderr } = runCli(['-1', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Проверка генерации ёлки с заданным значением, равным 100 (верхняя граница)', async () => {
    const outPath = join(tmpdir(), `tree-100-${Date.now()}.txt`);
    const { status, stderr } = runCli(['100', outPath]);

    expect(stderr).toBe('');
    expect(status).toBe(0);
    expect(existsSync(outPath)).toBe(true);
    const content = readFileSync(outPath, 'utf-8');
    expect(content).toBe(generateTree(100));
    removeTempFile(outPath);
  });

  test('Проверка вывода ошибки при попытке сгенерировать ёлку с количеством уровней, превышающим 100', async () => {
    const outPath = join(tmpdir(), `tree-101-${Date.now()}.txt`);
    const { status, stderr } = runCli(['101', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Количество уровней должно быть от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Проверка вывода ошибки при попытке сгенерировать ёлку с нецелым значением уровней', async () => {
    const outPath = join(tmpdir(), `tree-nan-${Date.now()}.txt`);
    const { status, stderr } = runCli(['abc', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Некорректное значение уровней: должно быть целое число от 1 до 100');
    expect(stderr).toContain('Получено');
  });

  test('Проверка вывода ошибки при указании неверного расширения файла (не .txt)', async () => {
    const outPath = join(tmpdir(), `tree-${Date.now()}.csv`);
    const { status, stderr } = runCli(['2', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается путь к файлу с расширением .txt');
  });

  test('Проверка вывода ошибки при указании неверного пути (каталог не существует)', async () => {
    const outPath = join(tmpdir(), 'несуществующий_каталог_xyz_123', `out-${Date.now()}.txt`);
    const { status, stderr } = runCli(['2', outPath]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Каталог не существует');
    expect(stderr).toContain('Укажите существующий путь к .txt файлу');
  });

  test('Проверка вывода ошибки при передаче больше двух аргументов', async () => {
    const outPath = join(tmpdir(), `tree-${Date.now()}.txt`);
    const { status, stderr } = runCli(['2', outPath, 'лишний']);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается 2 аргумента');
  });

  test('Проверка вывода ошибки при передаче меньше двух аргументов (без аргументов)', async () => {
    const { status, stderr } = runCli([]);

    expect(status).not.toBe(0);
    expect(stderr).toContain('Ожидается 2 аргумента');
  });
});
