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

## Шаг 4. Разрешения для добавления событий в календарь телефона
Приложение умеет само добавлять события охоты в системный календарь устройства
(плагин `@ebarooni/capacitor-calendar`). Чтобы это заработало, нужно один раз
прописать разрешения в нативных проектах — они не генерируются автоматически.

**Android** — добавьте в `android/app/src/main/AndroidManifest.xml` (внутри тега `<manifest>`, рядом с другими `<uses-permission>`):
```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

**iOS** — добавьте в `ios/App/App/Info.plist` (внутри `<dict>`):
```xml
<key>NSCalendarsUsageDescription</key>
<string>Приложению нужен доступ к календарю, чтобы добавлять туда даты охот.</string>
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>Приложению нужно разрешение, чтобы добавлять события охоты в ваш календарь.</string>
```

После добавления разрешений выполните `npx cap sync` ещё раз и пересоберите приложение.
Если пользователь не даст разрешение (или на вебе), приложение вернётся к старому
способу — скачает файл события (.ics) для ручного добавления.

---

## Android (RuStore)

### Требования
- Установленный **Android Studio** (https://developer.android.com/studio) — бесплатно, работает на Windows/Mac/Linux
- Аккаунт разработчика в **RuStore Console** — https://console.rustore.ru (регистрация бесплатная; для юрлиц/ИП — через ЕСИА/Госуслуги, для физлиц — по паспорту)

### Сборка
```bash
npx cap open android
```
Откроется Android Studio. Дальше:
1. Дождитесь синхронизации Gradle (может занять несколько минут)
2. Убедитесь, что `targetSdkVersion` в `android/variables.gradle` не ниже 28 (Android 9.0) — RuStore не принимает более старые сборки
3. Меню **Build → Generate Signed Bundle / APK**
4. Выберите **Android App Bundle (.aab)** — RuStore принимает и .aab, и .apk, но .aab даёт файл меньшего размера пользователю
5. Создайте новый ключ подписи (Keystore) — **сохраните его в надёжном месте**, он понадобится для всех будущих обновлений. Если приложение уже публиковалось в Google Play — используйте тот же keystore, чтобы пользователи могли обновляться независимо от магазина
6. Соберите Release-версию

### Публикация
1. Зайдите в RuStore Console → **Добавить приложение**
2. Заполните карточку: название «Охотник», описание, категория «Спорт» или «Образ жизни»
3. Загрузите иконку (512×512 — возьмите `public/icons/icon-512.png`)
4. Добавьте 2-8 скриншотов приложения (сделайте на реальном телефоне или эмуляторе)
5. Укажите ссылку на политику конфиденциальности: `https://ваш-домен/privacy`
6. В разделе **Версии** создайте новую версию, загрузите подписанный .aab/.apk файл
7. При первой загрузке добавьте сертификат ключа подписи в консоли — далее система проверит подпись, targetSdkVersion, наличие 64-bit библиотек (arm64-v8a) и совпадение packageName с карточкой
8. Заполните раздел про запрашиваемые разрешения (в т.ч. доступ к календарю — см. Шаг 4 выше) — обоснуйте, зачем они нужны
9. Отправьте на модерацию

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