export interface SolidarityNarrative {
  slug: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  content: string[];
}

const solidarityNarratives: SolidarityNarrative[] = [
  {
    slug: "gas-queue-drinks",
    title: "پخش شربت در صف پمپ بنزین",
    description: "مهربانی مردمی که در روزهای سخت جنگ کنار هم ایستادند.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت همدلی",
    content: [
      "در روزهای پراضطراب جنگ، مردم با همدلی مثال‌زدنی به یاری هم شتافتند.",
      "جوانانی که با تهیه شربت و آب سرد، در صف‌های طولانی بنزین به هم‌میهنانشان خدمت می‌کردند."
    ]
  },
  {
    slug: "mothers-shelter",
    title: "پناه مادران در مناطق جنگی",
    description: "روایت آرامش و امید در دل کوچه‌های بمباران شده.",
    image: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت همدلی",
    content: [
      "مادرانی که با دل‌های استوار، پناه کودکان بودند.",
      "خانه‌هایی که هرچند ساده، با گرمای محبت به پناهگاه امید بدل شد."
    ]
  },
  {
    slug: "volunteer-nurses",
    title: "پرستاران داوطلب",
    description: "پرستارانی که در صف مقدم درمان، امید را تزریق کردند.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
    tag: "روایت همدلی",
    content: [
      "پرستاران داوطلب با وجود کمبودها، در کنار مردم ماندند.",
      "دست‌هایشان مرهم دردها و نگاه‌شان نوید فردای بهتر بود."
    ]
  }
];

export default solidarityNarratives;
