"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Work } from '@/app/api/mock/data';
import { cn } from '@/lib/utils';
import React from "react";

interface GalleryCardProps {
  work: Work;
  className?: string;
  pathPrefix?: string;
}

export function GalleryCard({
  work,
  className,
  pathPrefix = '/art',
}: GalleryCardProps) {
  return (
    <div className={cn("group", className)}>
      <Link href={`${pathPrefix}/${work.slug}`} className="block">
        <div className="overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-lg">
          <Image
            src={work.media[0].url}
            alt={work.title}
            width={500}
            height={625} // 4:5 aspect ratio
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      </Link>
      <div className="mt-4">
        <div>
          <h3 className="text-lg font-semibold">{work.title}</h3>
          <div className="flex items-center mt-2">
            <Image
              src={work.creator.avatarUrl}
              alt={work.creator.displayName}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
            <p className="ml-2 text-sm text-muted-foreground">
              {work.creator.displayName}
            </p>
          </div>
        </div>
        <div className="mt-2 text-sm font-medium">
          {work.editions[0].price} {work.editions[0].currency}
        </div>
      </div>
    </div>
  );
}
