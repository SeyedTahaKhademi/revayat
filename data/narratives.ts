export interface NarrativeItem {
  slug: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  content: string[];
}

const narratives: NarrativeItem[] = [
  {
    slug: "missile-power",
    title: "قدرت موشکی ایران",
    description: "روایت تصویری از یگان‌های موشکی در میدان جنگ ۱۲ روزه.",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت جنگی",
    content: [
      "یگان‌های موشکی با تکیه بر توان بومی، نقش کلیدی در بازدارندگی ایفا کردند.",
      "این روایت بخش‌هایی از آمادگی، آموزش و عملیات‌های دقیق را به تصویر می‌کشد."
    ]
  },
  {
    slug: "sky-heroes",
    title: "حماسه شهیدان آسمانی",
    description: "جزییات نبرد هوایی و تسلط رزمندگان بر آسمان مقاومت.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت جنگی",
    content: [
      "نبرد در آسمان نیازمند دلاوری و مهارت استثنایی بود.",
      "این مجموعه گوشه‌ای از شجاعت‌ها و فداکاری‌های شهیدان آسمان را روایت می‌کند."
    ]
  },
  {
    slug: "armor-frontline",
    title: "یگان زرهی در خطوط مقدم",
    description: "حضور دلاوران زرهی در محورهای نبرد و عملیات زمینی.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت جنگی",
    content: [
      "یگان‌های زرهی با پشتیبانی مؤثر، خطوط مقدم را تثبیت کردند.",
      "در این روایت، صحنه‌های کمتر دیده‌شده از نبرد زمینی بازگو می‌شود."
    ]
  }
];

export default narratives;
