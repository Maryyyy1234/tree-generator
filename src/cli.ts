import { drawTree } from './tree-generator.js';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

const MIN_LEVELS = 1;
const MAX_LEVELS = 100;

/**
 * CLI: читает аргументы, проверяет ввод и путь, вызывает drawTree.
 * Программа не падает с исключением — при ошибках выводит сообщение и выходит с кодом 1.
 */
function main(): void {
  try {
    const args = process.argv.slice(2);

    if (args.length > 2) {
      console.error(
        `Ожидается 2 аргумента: количество уровней (${MIN_LEVELS}–${MAX_LEVELS}) и путь к .txt файлу. Передано аргументов: ${args.length}.`
      );
      process.exit(1);
    }

    if (args.length < 2) {
      console.error(
        `Ожидается 2 аргумента: количество уровней (${MIN_LEVELS}–${MAX_LEVELS}) и путь к .txt файлу. Использование: node cli.js <уровни> <путь_к_файлу>`
      );
      process.exit(1);
    }

    const levelsArg = args[0];
    const outputPath = args[1];

    const levels = parseInt(levelsArg, 10);
    if (
      levelsArg.trim() === '' ||
      Number.isNaN(levels) ||
      Number(levelsArg) !== levels
    ) {
      console.error(
        `Некорректное значение уровней: должно быть целое число от ${MIN_LEVELS} до ${MAX_LEVELS}. Получено: "${levelsArg}".`
      );
      process.exit(1);
    }

    if (levels < MIN_LEVELS) {
      console.error(
        `Количество уровней должно быть от ${MIN_LEVELS} до ${MAX_LEVELS}. Получено: ${levels}.`
      );
      process.exit(1);
    }

    if (levels > MAX_LEVELS) {
      console.error(
        `Количество уровней должно быть от ${MIN_LEVELS} до ${MAX_LEVELS}. Получено: ${levels}.`
      );
      process.exit(1);
    }

    if (!outputPath.toLowerCase().endsWith('.txt')) {
      console.error(
        `Ожидается путь к файлу с расширением .txt. Получено: "${outputPath}".`
      );
      process.exit(1);
    }

    const dir = dirname(outputPath);
    if (dir !== '.' && dir !== '' && !existsSync(dir)) {
      console.error(`Каталог не существует: ${dir}. Укажите существующий путь к .txt файлу.`);
      process.exit(1);
    }

    drawTree(levels, outputPath);
    console.log(`Ёлка записана в ${outputPath}`);
  } catch (err) {
    console.error('Не удалось записать файл:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
