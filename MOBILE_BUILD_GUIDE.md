# Инструкция: сборка приложения для Google Play и App Store

Проект уже настроен для сборки нативных приложений через Capacitor.
Ниже — пошаговая инструкция, что делать на вашем компьютере.

## Что уже готово в проекте
- Capacitor установлен и настроен (`capacitor.config.ts`)
- appId: `ru.hunterdiary.app`, название: «Охотник»
- Иконки готовы: `public/app-store-assets/`
  - `ios-icon-1024.png` — иконка для App Store (1024×1024, без прозрачности)
  - `android-adaptive-fg.png` — foreground для Android adaptive icon
  - `play-feature-graphic.png` — баннер для карточки Google Play (1024×500)
- Политика конфиденциальности: `/privacy`
- Условия использования: `/terms`

## Шаг 1. Скачайте код проекта
В интерфейсе poehali.dev: **Скачать → Скачать код**

## Шаг 2. Установите зависимости и соберите веб-версию
```bash
cd hunter-app-creation-1
npm install   # или bun install
npm run build
```

## Шаг 3. Добавьте нативные платформы
```bash
npx cap add android
npx cap add ios      # только на Mac
npx cap sync
```

---

## Android (Google Play)

### Требования
- Установленный **Android Studio** (https://developer.android.com/studio) — бесплатно, работает на Windows/Mac/Linux
- Аккаунт **Google Play Console** — https://play.google.com/console ($25 разово)

### Сборка
```bash
npx cap open android
```
Откроется Android Studio. Дальше:
1. Дождитесь синхронизации Gradle (может занять несколько минут)
2. Меню **Build → Generate Signed Bundle / APK**
3. Выберите **Android App Bundle (.aab)** — это формат, который требует Google Play
4. Создайте новый ключ подписи (Keystore) — **сохраните его в надёжном месте**, он понадобится для всех будущих обновлений
5. Соберите Release-версию

### Публикация
1. Зайдите в Google Play Console → **Создать приложение**
2. Заполните карточку: название «Охотник», описание, категория «Спорт» или «Образ жизни»
3. Загрузите иконку (512×512 — возьмите `public/icons/icon-512.png`)
4. Загрузите Feature Graphic — `public/app-store-assets/play-feature-graphic.png`
5. Добавьте 2-8 скриншотов приложения (сделайте на реальном телефоне или эмуляторе)
6. Укажите ссылку на политику конфиденциальности: `https://ваш-домен/privacy`
7. Настройте цену в разделе **Монетизация → Цены и распространение**
8. Загрузите .aab файл в раздел **Production → Create new release**
9. Отправьте на проверку (обычно 1-3 дня)

---

## iOS (App Store)

### Требования
- **Mac** с установленным **Xcode** (бесплатно, из Mac App Store)
- Аккаунт **Apple Developer Program** — https://developer.apple.com/programs ($99/год)

### Сборка
```bash
npx cap open ios
```
Откроется Xcode. Дальше:
1. Выберите ваш Team (аккаунт разработчика) в настройках проекта → Signing & Capabilities
2. Подключите iPhone или выберите симулятор для теста
3. Меню **Product → Archive** для создания билда к публикации
4. После архивации откроется Organizer → **Distribute App → App Store Connect**

### Публикация
1. Зайдите в **App Store Connect** (https://appstoreconnect.apple.com)
2. Создайте новое приложение, укажите Bundle ID: `ru.hunterdiary.app`
3. Заполните карточку: название, описание, ключевые слова, категория
4. Загрузите иконку 1024×1024 — `public/app-store-assets/ios-icon-1024.png`
5. Добавьте скриншоты для разных размеров экрана (обязательно iPhone 6.7" и 6.5")
6. Укажите ссылку на политику конфиденциальности: `https://ваш-домен/privacy`
7. Настройте цену в разделе **Pricing and Availability**
8. Прикрепите собранный билд из Xcode (появится через 10-30 минут после архивации)
9. Отправьте на проверку **Submit for Review** (обычно 1-2 дня)

---

## Важные напоминания
- **Bundle ID / appId должен совпадать** во всех местах: `capacitor.config.ts`, Google Play Console, App Store Connect — `ru.hunterdiary.app`
- Каждое обновление кода требует: `npm run build` → `npx cap sync` → пересборка в Android Studio / Xcode
- Keystore-файл для Android **нельзя терять** — без него нельзя выпускать обновления
- Скриншоты для сторов делайте на реальных устройствах или через симулятор/эмулятор — это отдельная задача, не автоматизируется кодом
