import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type TileSize = 'normal' | 'wide' | 'tall' | 'hero';

export interface DocumentTileProps {
  title: string;
  category: string;
  image: string;
  href?: string;
  size?: TileSize;
  priority?: boolean;
}

const sizeClasses: Record<TileSize, string> = {
  normal: 'col-span-1 row-span-1',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
  hero: 'col-span-2 row-span-2',
};

const DocumentTile: React.FC<DocumentTileProps> = ({
  title,
  category,
  image,
  href,
  size = 'normal',
  priority = false,
}) => {
  const Wrapper = href ? Link : 'div';
  const className = `group relative block h-full overflow-hidden rounded-3xl border border-white/50 bg-white/10 shadow-md shadow-gray-900/5 transition duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl focus-visible:scale-[1.02] ${sizeClasses[size]}`;

  const normalizeSrc = (src: string) => {
    let s = (src || '').trim();
    const secondData = s.indexOf('data:image', 5);
    if (secondData > 0) s = s.slice(0, secondData);
    const badAttr = s.indexOf("' width=");
    if (badAttr > 0) s = s.slice(0, badAttr);
    if (s && !s.startsWith('data:') && !s.startsWith('http://') && !s.startsWith('https://') && !s.startsWith('/')) {
      s = '/' + s;
    }
    if (!s) {
      s = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiBmaWxsPSJub25lIi8+PC9zdmc+';
    }
    return s;
  };
  const safeImage = normalizeSrc(image);
  const unoptimized = typeof safeImage === 'string' && (safeImage.startsWith('https://') || safeImage.startsWith('http://') || safeImage.startsWith('data:'));

  const content = (
    <>
      <div className="relative h-full w-full">
        <Image
          src={safeImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
          priority={priority}
          unoptimized={unoptimized}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-white">
        <span className="text-xs font-semibold opacity-80">{category}</span>
        <p className="text-sm font-black leading-tight drop-shadow">{title}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Wrapper href={href} className={className} aria-label={title}>
        {content}
      </Wrapper>
    );
  }

  return <div className={className}>{content}</div>;
};

export default DocumentTile;
