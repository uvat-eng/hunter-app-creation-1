export const huntTypes = ['Перо', 'Копытные', 'Пушнина', 'Заяц', 'Кабан', 'Лось', 'Другое'];

export const SPECIES = [
  { key: 'moose', label: 'Лось', match: ['лос'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/447a74f5-7026-4c0f-88fe-3b65c0c9eeb8.jpg' },
  { key: 'roe', label: 'Косуля', match: ['косул'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/0bd53a4f-4857-4166-9079-da641161665e.jpg' },
  { key: 'boar', label: 'Кабан', match: ['кабан', 'вепр'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/4265ab49-61d8-4a4b-9eae-f86fb5ccf6e8.jpg' },
  { key: 'lynx', label: 'Рысь', match: ['рысь', 'рыс'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/b11f484b-3c29-4f77-9b1b-e5206feab5ce.jpg' },
  { key: 'wolf', label: 'Волк', match: ['волк', 'волч'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/a74be7ee-3caa-448e-b296-cbe0060df08e.jpg' },
  { key: 'bear', label: 'Медведь', match: ['медвед'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/1bb91a26-7f33-48d4-9567-0205657d139f.jpg' },
  { key: 'duck', label: 'Утки', match: ['утк', 'кряк'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/1d5d70fd-30b8-4548-b3ff-657420f75182.jpg' },
  { key: 'goose', label: 'Гуси', match: ['гус'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/da3c22d7-4009-40a1-a700-30f634d49a56.jpg' },
  { key: 'musk', label: 'Кабарга', match: ['кабарг'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/8b7ac197-f59a-4bd6-b6e8-37a3a325fb2a.jpg' },
  { key: 'beaver', label: 'Бобёр', match: ['бобр', 'бобер', 'бобё'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/4f7e9b9c-2512-4016-a553-373956342b1b.jpg' },
  { key: 'wolverine', label: 'Росомаха', match: ['росомах'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/6421fde9-abf4-47b1-a9f0-3cc1b221ce59.jpg' },
  { key: 'other', label: 'Иные', match: [], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/f564d534-d007-454f-92fb-e592a94bdbe9.jpg' },
] as const;

export const matchSpecies = (game: string) => {
  const g = game.toLowerCase();
  for (const s of SPECIES) {
    if (s.match.some((m) => g.includes(m))) return s.key;
  }
  return 'other';
};
