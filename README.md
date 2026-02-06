# Генератор ёлки (TypeScript + Playwright)

Генерирует симметричную текстовую ёлку в .txt файл.

## Установка

```bash
npm install
```

## Использование

**Входные параметры:** количество уровней (1–100), путь к выходному .txt файлу.

**Из терминала (CLI):**

```bash
npm run build
node dist/cli.js 4 output.txt
```

## Тесты

```bash
npm test
```

Только приёмочные тесты (после сборки):

```bash
npm run test:acceptance
```

Отладка тестов :

```bash
npm run test:debug
```

## Docker

**Сборка образа:**

```bash
docker build -t tree-generator .
```

**Запуск тестов:**

```bash
docker run --rm tree-generator
```


## CI

На каждый Pull Request в ветки `main` или `master` запускаются приёмочные тесты (`.github/workflows/ci.yml`).

