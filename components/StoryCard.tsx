import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface StoryCardProps {
  title: string;
  description?: string;
  image: string;
  tag?: string;
  href?: string;
  variant?: 'wide' | 'compact';
  summary?: string;
}

const StoryCard: React.FC<StoryCardProps> = ({
  title,
  description,
  image,
  tag,
  href,
  variant = 'wide',
  summary,
}) => {
  const normalizeSrc = (src: string) => {
    let s = (src || '').trim();
    const secondData = s.indexOf('data:image', 5);
    if (secondData > 0) s = s.slice(0, secondData);
    const badAttr = s.indexOf("' width=");
    if (badAttr > 0) s = s.slice(0, badAttr);
    // Ensure relative paths are valid for Next/Image by adding a leading slash
    // Acceptable formats: data:, http(s)://, or starting with '/'
    if (
      s &&
      !s.startsWith('data:') &&
      !s.startsWith('http://') &&
      !s.startsWith('https://') &&
      !s.startsWith('/')
    ) {
      s = '/' + s;
    }
    // Fallback to a tiny transparent placeholder if empty
    if (!s) {
      s = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiBmaWxsPSJub25lIi8+PC9zdmc+';
    }
    return s;
  };

  const safeImage = normalizeSrc(image);
  const unoptimized =
    typeof safeImage === 'string' &&
    (safeImage.startsWith('https://') || safeImage.startsWith('http://') || safeImage.startsWith('data:'));
  const CardWrapper = href ? Link : 'div';

  const baseClasses =
    variant === 'wide'
      ? 'flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-lg shadow-gray-900/5 transition-all hover:-translate-y-0.5 hover:shadow-2xl'
      : 'flex flex-col gap-3 rounded-[22px] border border-white/60 bg-white/95 p-3 shadow-md shadow-gray-900/10 transition-all hover:-translate-y-0.5 hover:shadow-xl';

  const imageHeight = variant === 'wide' ? 'h-44 sm:h-56' : 'h-32';

  const tagClasses =
    tag === 'شهید'
      ? 'bg-red-50 text-red-600'
      : 'bg-gray-100 text-gray-700';

  const content = (
    <div className={`${baseClasses}`}>
      <div className="overflow-hidden rounded-[24px] border border-white/70">
        <div className={`relative w-full ${imageHeight}`}>
          <Image
            src={safeImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
            priority={false}
            unoptimized={unoptimized}
          />
        </div>
      </div>
      <div className={`flex flex-col items-center text-center ${variant === 'wide' ? 'sm:items-start sm:text-start' : ''}`}>
        {tag && (
          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${tagClasses}`}>
            {tag}
          </span>
        )}
        <h3 className="mt-2 text-base font-black text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {summary && <p className="mt-2 text-sm leading-7 text-gray-700">{summary}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <CardWrapper href={href} className="group block">
        {content}
      </CardWrapper>
    );
  }

  return <div className="group">{content}</div>;
};

export default StoryCard;
