// src/components/CategoryCard.tsx (طراحی جدید کارت‌ها)

import React from 'react';
import Link from 'next/link';
import { BookOpen, Rocket, Atom, Zap, HeartHandshake, ImageOff } from 'lucide-react'; 

interface CategoryCardProps {
  title: string;
  href: string;
  iconName: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'شهدای هسته ای': <Atom size={28} />,
  'روایات جنگ': <BookOpen size={28} />,
  'روایات همدلی': <HeartHandshake size={28} />,
  'موشکی': <Rocket size={28} />, 
  'دستاورد ها': <Zap size={28} />, 
  'تصاویر جنایات': <ImageOff size={28} />, 
};

const CategoryCard: React.FC<CategoryCardProps> = ({ title, href, iconName }) => {
  const icon = iconMap[iconName] || <BookOpen size={28} />;

  return (
    <Link
      href={href}
      className="group block rounded-[28px] border border-white/70 bg-white/80 p-4 text-center shadow-lg shadow-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="category-icon mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-gray-900 group-hover:from-rose-200 group-hover:to-orange-200">
        {icon}
      </div>
      <h3 className="text-base font-black text-gray-900 leading-snug">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">مشاهده روایت</p>
    </Link>
  );
};

export default CategoryCard;
