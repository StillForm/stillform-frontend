import { Work } from '@/app/api/mock/data';
import { GalleryCard } from './gallery-card';

interface GalleryGridProps {
  works: Work[];
  pathPrefix?: string;
}

export function GalleryGrid({ works, pathPrefix }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {works.map((work) => (
        <GalleryCard
          key={work.id}
          work={work}
          pathPrefix={pathPrefix}
        />
      ))}
    </div>
  );
}
