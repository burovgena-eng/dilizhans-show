// Central catalog data for the Dilizhans Show luxury redesign
// Preserves original categories from dilizhans-show.ru

export type Audience = "children" | "adults" | "all";

export type Costume = {
  id: string;
  title: string;
  audience: Audience;
  category: string;
  tags: string[];
  price: number; // ₽/day
  image: string;
  available: boolean;
  isNew?: boolean;
  isExclusive?: boolean;
  description: string;
};

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
    title: "Новый год",
    subtitle: "Символы года · Дед Мороз · Снегурочка",
    description:
      "Блестящие новогодние образы для детских утренников и взрослых корпоративов: символы года, Деды Морозы, Снегурочки и маскарадные костюмы.",
    image: "/images/collections/newyear.jpg",
    count: 240,
    audience: "all",
    tags: ["сезон", "дети", "взрослые"],
  },
  {
    id: "gatsby",
    title: "Ретро · Гэтсби",
    subtitle: "Чикаго · Стиляги · Диско 80-х",
    description:
      "Вечеринки в стиле Гэтсби, ретро 20-30-х, Чикаго и стиляг. Платья с бахромой, боа, мундштуки и перья — атмосфера джазовой эпохи.",
    image: "/images/collections/gatsby.jpg",
    count: 180,
    audience: "all",
    tags: ["ретро", "вечеринка"],
  },
  {
    id: "superhero",
    title: "Супергерои",
    subtitle: "Marvel · DC · Фэнтези",
    description:
      "Костюмы супергероев Marvel и DC, Хогвартс, фэнтези-образы для детских праздников и косплея: Человек-паук, Бэтмен, Капитан Америка и другие.",
    image: "/images/collections/superhero.jpg",
    count: 150,
    audience: "all",
    tags: ["дети", "фэнтези"],
  },
  {
    id: "national",
    title: "Народы мира",
    subtitle: "Русские · Казахские · Восточные",
    description:
      "Национальные костюмы народов мира: русские, казахские, кавказские, индийские, азиатские и европейские наряды для концертных номеров и фотосессий.",
    image: "/images/collections/national.jpg",
    count: 320,
    audience: "all",
    tags: ["фольклор", "концерт"],
  },
  {
    id: "evening",
    title: "Вечерние платья",
    subtitle: "Бальные · Свадебные · Коктейль",
    description:
      "Вечерние, бальные и свадебные наряды премиум-класса: шёлк, бархат, ручная вышивка и кружево для самых торжественных случаев.",
    image: "/images/collections/evening.jpg",
    count: 210,
    audience: "all",
    tags: ["вечер", "свадебное"],
  },
  {
    id: "steampunk",
    title: "Стимпанк",
    subtitle: "Викторианская эпоха · Механизмы",
    description:
      "Стимпанк-образы с медными и латунными механизмами, викторианскими корсетами и гогглами. Идеально для фотосессий и тематических вечеринок.",
    image: "/images/collections/steampunk.jpg",
    count: 75,
    audience: "adults",
    tags: ["фэшн", "фото"],
  },
];

export const OFFERS = [
  {
    id: "o1",
    title: "Вечеринка в стиле Гэтсби",
    excerpt:
      "Долой серость и посредственность! Платья с бахромой, боа, перья и мундштуки — всё для атмосферы джазовой эпохи 20-х.",
    image: "/images/offers/offer-gatsby.jpg",
    badge: "Хит сезона",
    tag: "Ретро · 20-е",
    priceFrom: 2500,
  },
  {
    id: "o2",
    title: "Русские народные посиделки",
    excerpt:
      "Народные костюмы для праздников — это не только красочные наряды, но и настоящее искусство, передающее дух древних времён.",
    image: "/images/offers/offer-russian.jpg",
    badge: "Эксклюзив",
    tag: "Фольклор",
    priceFrom: 1800,
  },
  {
    id: "o3",
    title: "Диско 80-х — 90-х",
    excerpt:
      "Пора мечты воплощать в реальность. Большой выбор костюмов для диско-вечеринки: блёстки, неон, легинсы и массивные плечи.",
    image: "/images/offers/offer-disco.jpg",
    badge: "Новая коллекция",
    tag: "Ретро · 80-е",
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

export const GALLERY = [
  { src: "/images/gallery/gal-1.jpg", title: "Венецианская маска", tag: "Аксессуары" },
  { src: "/images/collections/gatsby.jpg", title: "Платье Гэтсби", tag: "Ретро" },
  { src: "/images/gallery/gal-2.jpg", title: "Пират-капитан", tag: "Театр" },
  { src: "/images/collections/newyear.jpg", title: "Новогодний образ", tag: "Сезон" },
  { src: "/images/gallery/gal-3.jpg", title: "Детский наряд", tag: "Дети" },
  { src: "/images/collections/steampunk.jpg", title: "Стимпанк", tag: "Фэшн" },
  { src: "/images/gallery/gal-4.jpg", title: "Хогвартс", tag: "Фэнтези" },
  { src: "/images/collections/national.jpg", title: "Народный костюм", tag: "Фольклор" },
];

export const NAV_LINKS = [
  { title: "Коллекции", href: "#collections" },
  { title: "Категории", href: "#categories" },
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
  hours: "Вт–Сб: 10:00–19:00",
  closed: "Вс и Пн — выходной",
  whatsapp: "https://wa.me/79607959369",
  telegram: "https://t.me/dilizhanshow",
  vk: "https://vk.com/dilizhans_show",
};
