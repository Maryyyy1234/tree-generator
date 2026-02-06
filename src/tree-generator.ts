import { writeFileSync } from 'node:fs';

/**
 * Рисует симметричную ёлку в файл.
 * Формат: W и * сверху, затем уровни веток (5, 9, 13, 17... звёздочек, +4 каждый раз),
 * шарик @ поочерёдно слева/справа, ствол TTTTT по центру под звездой.
 *
 * @param levels — количество слоёв ёлки 
 * @param outputPath — путь к выходному .txt файлу
 */
export function drawTree(levels: number, outputPath: string): void {
  const content = generateTree(levels);

  writeFileSync(outputPath, content, 'utf-8');
}

/**
 * Генерирует текст симметричной ёлки (каждая строка отцентрована).
 */
const MIN_LEVELS = 1;
const MAX_LEVELS = 100;

export function generateTree(levels: number): string {
  if (levels < MIN_LEVELS) {
    throw new Error(`Количество уровней должно быть от ${MIN_LEVELS} до ${MAX_LEVELS}. Получено: ${levels}`);
  }
  if (levels > MAX_LEVELS) {
    throw new Error(`Количество уровней должно быть от ${MIN_LEVELS} до ${MAX_LEVELS}. Получено: ${levels}`);
  }

  const lines: string[] = [];

  lines.push('W');
  lines.push('*');

  const branchRows = Math.max(0, levels - 1);
  for (let i = 0; i < branchRows; i++) {
    const count = 4 * (i + 1) + 1; 

    const row = Array(count).fill('*').join(' ');
    if (i % 2 === 0) {
      lines.push(i >= 2 ? `@ ${row}` : `@${row}`);

    } else {
      lines.push(`${row}@`);

    }
  }

  const trunk = 'TTTTT';
  lines.push(trunk);
  lines.push(trunk);

  // Ширина по самой длинной строке — ёлка симметрична
  const maxWidth = Math.max(...lines.map((l) => l.length));

  // Центрируем каждую строку
  return lines.map((line) => centerLine(line, maxWidth)).join('\n');
}

function centerLine(line: string, width: number): string {
  const pad = Math.floor((width - line.length) / 2);
  
  return (pad > 0 ? ' '.repeat(pad) : '') + line;
}
