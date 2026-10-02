// Central catalog data for the Dilizhans Show luxury redesign
// All images are REAL photos scraped from dilizhans-show.ru category pages
// (no AI-generated content — every costume is actually in the boutique's collection)

export type Audience = "children" | "adults" | "all";

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  count: number;
  audience: Audience;
  tags: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    id: "newyear",
    title: "Новогодние",
    subtitle: "Символы года · Дед Мороз · Снегурочка",
    description:
      "Блестящие новогодние образы для детских утренников и взрослых корпоративов: символы года, Деды Морозы, Снегурочки, эльфы и гномики.",
    image: "/images/real/newyear_2_clean.jpg",
    count: 240,
    audience: "all",
    tags: ["сезон", "дети", "взрослые"],
  },
  {
    id: "retro",
    title: "Ретро · Гэтсби",
    subtitle: "Чикаго · Стиляги · Диско 80-х",
    description:
      "Вечеринки в стиле Гэтсби, ретро 20-30-х, Чикаго и стиляг. Платья с бахромой, боа, мундштуки и перья — атмосфера джазовой эпохи.",
    image: "/images/real/retro_1_clean.jpg",
    count: 180,
    audience: "all",
    tags: ["ретро", "вечеринка"],
  },
  {
    id: "historical",
    title: "Исторические",
    subtitle: "Театральные · Древний мир · Средневековье",
    description:
      "Исторические и театральные костюмы: Древний Египет, Рим, Греция, Средневековье, Возрождение — для постановок, фотосессий и тематических вечеров.",
    image: "/images/real/historical_5_clean.jpg",
    count: 95,
    audience: "all",
    tags: ["театр", "фото"],
  },
  {
    id: "national",
    title: "Народы мира",
    subtitle: "Русские · Восточные · Цыганские",
    description:
      "Национальные костюмы народов мира: русские, цыганские, испанские, японские, арабские и восточные наряды для концертных номеров и фотосессий.",
    image: "/images/real/spanish_1_clean.jpg",
    count: 320,
    audience: "all",
    tags: ["фольклор", "концерт"],
  },
  {
    id: "ball",
    title: "Бальные платья",
    subtitle: "Вечерние · Свадебные · Коктейль",
    description:
      "Бальные, вечерние, коктейльные и свадебные наряды премиум-класса: шёлк, фатин, ручная вышивка и кринолины для самых торжественных случаев.",
    image: "/images/real/ball_1_clean.jpg",
    count: 210,
    audience: "all",
    tags: ["вечер", "свадебное"],
  },
  {
    id: "halloween",
    title: "Хэллоуин",
    subtitle: "Мистика · Фэнтези · Стимпанк",
    description:
      "Хэллоуин-образы: ведьмы, вампиры, демоны и стимпанк-костюмы. Самая большая в городе мистическая коллекция для тематических вечеринок.",
    image: "/images/real/halloween_1_clean.jpg",
    count: 130,
    audience: "all",
    tags: ["мистика", "вечеринка"],
  },
];

export const OFFERS = [
  {
    id: "o1",
    title: "Вечеринка в стиле Гэтсби",
    excerpt:
      "Долой серость и посредственность! Платья с бахромой, боа, перья и мундштуки — всё для атмосферы джазовой эпохи 20-х.",
    image: "/images/real/retro_2_clean.jpg",
    badge: "Хит сезона",
    tag: "Ретро · 20-е",
    priceFrom: 2500,
  },
  {
    id: "o2",
    title: "Цыганский табор",
    excerpt:
      "Яркие цыганские костюмы с вышивкой, монистами и широкими юбками — для фольклорных выступлений и тематических праздников.",
    image: "/images/real/gypsy_2_clean.jpg",
    badge: "Эксклюзив",
    tag: "Фольклор",
    priceFrom: 1800,
  },
  {
    id: "o3",
    title: "Восточная сказка",
    excerpt:
      "Арабские, японские и восточные костюмы — для интерактивных программ, танцев и обрядов. Богатые ткани и ручная отделка.",
    image: "/images/real/eastern_6_clean.jpg",
    badge: "Новая коллекция",
    tag: "Восток",
    priceFrom: 2200,
  },
];

export const CATEGORIES = [
  { id: "c1", title: "Детские новогодние", audience: "children" as Audience, count: 95 },
  { id: "c2", title: "Карнавальные для девочек", audience: "children" as Audience, count: 120 },
  { id: "c3", title: "Карнавальные для мальчиков", audience: "children" as Audience, count: 110 },
  { id: "c4", title: "Marvel и DC", audience: "all" as Audience, count: 75 },
  { id: "c5", title: "Дисней", audience: "children" as Audience, count: 65 },
  { id: "c6", title: "Пираты и ковбои", audience: "all" as Audience, count: 80 },
  { id: "c7", title: "Стимпанк", audience: "adults" as Audience, count: 45 },
  { id: "c8", title: "Ретро и Стиляги", audience: "all" as Audience, count: 90 },
  { id: "c9", title: "Древний Египет · Рим · Греция", audience: "all" as Audience, count: 70 },
  { id: "c10", title: "Хогвартс", audience: "all" as Audience, count: 35 },
  { id: "c11", title: "Восточные сказки", audience: "all" as Audience, count: 60 },
  { id: "c12", title: "Хэллоуин", audience: "all" as Audience, count: 130 },
  { id: "c13", title: "Венецианский карнавал", audience: "adults" as Audience, count: 55 },
  { id: "c14", title: "Русские народные", audience: "all" as Audience, count: 85 },
  { id: "c15", title: "Цыганский табор", audience: "adults" as Audience, count: 40 },
  { id: "c16", title: "Бальные и вечерние платья", audience: "adults" as Audience, count: 110 },
  { id: "c17", title: "Смокинги и фраки", audience: "adults" as Audience, count: 45 },
  { id: "c18", title: "Ростовые куклы", audience: "all" as Audience, count: 25 },
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Анна Ковалёва",
    role: "Свадьба в стиле Гэтсби",
    rating: 5,
    text:
      "Арендовала платье для свадебной фотосессии в стиле Гэтсби — это было за гранью фантазий. Качество, посадка, аксессуары — всё на высочайшем уровне. Гости не верили, что это прокат, а не авторский пошив.",
    initials: "АК",
  },
  {
    id: "t2",
    name: "Дмитрий Орлов",
    role: "Корпоратив · 80 человек",
    rating: 5,
    text:
      "Организовали корпоративную вечеринку в стиле Чикаго. Дилижанс Шоу одели всю команду — 80 человек. Каждый образ был продуман до деталей. Сервис уровня европейского бутика.",
    initials: "ДО",
  },
  {
    id: "t3",
    name: "Марина Соколова",
    role: "Детский утренник",
    rating: 5,
    text:
      "Дочь была Снегурочкой на школьном утреннике — костюм сшили идеально по фигуре, всё чистое, отглаженное. Вернёмся обязательно — у вас потрясающий выбор для детей.",
    initials: "МС",
  },
  {
    id: "t4",
    name: "Игорь Лебедев",
    role: "Театральная постановка",
    rating: 5,
    text:
      "Делали постановку «Цыганский табор» — взяли наряды для всей труппы. Аутентичность, состояние тканей и фурнитура — на высоте. Это не просто прокат, это театральная мастерская.",
    initials: "ИЛ",
  },
];

export const STATS = [
  { value: "2000+", label: "Костюмов в коллекции", sub: "от детских до вечерних" },
  { value: "12+", label: "Лет на рынке", sub: "с 2013 года" },
  { value: "50 000+", label: "Довольных клиентов", sub: "дети и взрослые" },
  { value: "4.9", label: "Средняя оценка", sub: "из 5 по отзывам" },
];

export const PROCESS_STEPS = [
  {
    n: "01",
    title: "Заявка и консультация",
    text: "Оставляете заявку на сайте или звоните. Стилист подберёт образы под мероприятие, тематику и бюджет.",
  },
  {
    n: "02",
    title: "Примерка в бутике",
    text: "Приезжаете на Державина 13 — примеряете 2–3 варианта. Подбираем аксессуары, корректируем по фигуре.",
  },
  {
    n: "03",
    title: "Бронь и договор",
    text: "Фиксируем костюм на ваши даты, оформляем договор проката и вносим залог. Готово — образ ваш.",
  },
  {
    n: "04",
    title: "Возврат",
    text: "После мероприятия возвращаете костюм. Чистка включена. Возможно продление на следующий день.",
  },
];

export const ADVANTAGES = [
  {
    icon: "Crown",
    title: "Премиум-качество",
    text: "Только авторские и коллекционные наряды — ручная вышивка, итальянские ткани, театральная фурнитура.",
  },
  {
    icon: "Sparkles",
    title: "Чистка включена",
    text: "Профессиональная чистка и отпаривание после каждого использования. Гарантия гигиены и свежести.",
  },
  {
    icon: "Ruler",
    title: "Подгон по фигуре",
    text: "Бесплатная примерка и подгон в нашем ателье на Державина 13. Корректируем длину и посадку.",
  },
  {
    icon: "Truck",
    title: "Доставка по городу",
    text: "Привезём и заберём костюм в любой район Новосибирска. Возможна доставка в другие города области.",
  },
];

export type GalleryItem = {
  src: string;
  title: string;
  tag: string;
  audience: Audience;
  description: string;
};

// 12 real photos from across the collection — clickable → opens lightbox
export const GALLERY: GalleryItem[] = [
  {
    src: "/images/real/ball_1_clean.jpg",
    title: "Бальное платье",
    tag: "Вечерние",
    audience: "adults",
    description: "Пышное бальное платье в пол — для выпускного, свадьбы или фотосессии.",
  },
  {
    src: "/images/real/children_6_4437039a.jpg",
    title: "Снегурочка",
    tag: "Новый год",
    audience: "children",
    description: "Детский костюм Снегурочки в стиле гжель с белыми косами.",
  },
  {
    src: "/images/real/historical_7_fd6decfd.jpg",
    title: "Средневековый наряд",
    tag: "Исторические",
    audience: "adults",
    description: "Средневековое платье с корсетом на шнуровке и белым чепцом.",
  },
  {
    src: "/images/real/wedding_2_b0e621c3.jpg",
    title: "Свадебное платье",
    tag: "Свадебные",
    audience: "adults",
    description: "Пышное свадебное платье бального кроя с многоярусной юбкой из фатина.",
  },
  {
    src: "/images/real/spanish_2_5bdb6bac.jpg",
    title: "Испанский костюм",
    tag: "Народы мира",
    audience: "adults",
    description: "Традиционный испанский наряд с рюшами и кружевом — для фольклорных программ.",
  },
  {
    src: "/images/real/eastern_8_effa7f53.jpg",
    title: "Восточный наряд",
    tag: "Восточные",
    audience: "adults",
    description: "Богатый восточный костюм с золотой вышивкой и накидкой.",
  },
  {
    src: "/images/real/retro_3_df347d25.jpg",
    title: "Ретро-образ",
    tag: "Ретро",
    audience: "adults",
    description: "Ретро-костюм в стиле 20-х годов с перьями и боа.",
  },
  {
    src: "/images/real/gypsy_5_513fbb93.jpg",
    title: "Цыганский костюм",
    tag: "Народы мира",
    audience: "adults",
    description: "Яркий цыганский наряд с монистами и широкой юбкой.",
  },
  {
    src: "/images/real/tuxedo_1_d994d2f9.jpg",
    title: "Смокинг",
    tag: "Мужские",
    audience: "adults",
    description: "Классический мужской смокинг для торжественных случаев.",
  },
  {
    src: "/images/real/girls_5_b8848407.jpg",
    title: "Детский наряд",
    tag: "Детские",
    audience: "children",
    description: "Элегантное детское платье для праздника или фотосессии.",
  },
  {
    src: "/images/real/japanese_1_ad104774.jpg",
    title: "Японский кимоно",
    tag: "Народы мира",
    audience: "adults",
    description: "Традиционный японский костюм с поясом-оби.",
  },
  {
    src: "/images/real/vegetables2_2_b4de806f.jpg",
    title: "Осенний бал",
    tag: "Сезонные",
    audience: "children",
    description: "Костюм для осеннего бала — овощи, фрукты, грибы и ягоды.",
  },
];

export const NAV_LINKS = [
  { title: "Коллекции", href: "#collections" },
  { title: "Каталог", href: "#catalog" },
  { title: "Спецпредложения", href: "#offers" },
  { title: "Как мы работаем", href: "#process" },
  { title: "Галерея", href: "#gallery" },
  { title: "Отзывы", href: "#testimonials" },
  { title: "Контакты", href: "#contact" },
];

export const CONTACT = {
  phone1: "+7 (960) 795 93 69",
  phone2: "+7 (960) 795 73 69",
  phone1Href: "+79607959369",
  phone2Href: "+79607957369",
  address: "г. Новосибирск, ул. Державина, 13",
  hours: "Без выходных · 10:00–19:00",
  closed: "",
  whatsapp: "https://wa.me/79607959369",
  telegram: "https://t.me/dilizhanshow",
  vk: "https://vk.com/dilizhans_show",
};

// All real photo paths — used by gallery + collections + offers
export const REAL_PHOTOS = {
  hero: "/images/real/ball_1_clean.jpg",
  bookingSide: "/images/real/wedding_3_clean.jpg",
};
