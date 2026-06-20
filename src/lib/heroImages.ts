/**
 * Background / hero slideshow images.
 *
 * Drop your own photos into  public/images/hero/  named
 * slide-1.jpg … slide-5.jpg  and they're used automatically across the site
 * (the full-page background AND the landing hero). If a file is missing, the
 * matching stock image below is shown instead so nothing ever looks broken.
 */
export interface HeroSlide {
  src: string;
  fallback: string;
  label: string;
  tag: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/images/hero/slide-1.jpg',
    fallback: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80&auto=format&fit=crop',
    label: 'Graphics cards',
    tag: 'GPUs, ready to ship',
  },
  {
    src: '/images/hero/slide-2.jpg',
    fallback: 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=1600&q=80&auto=format&fit=crop',
    label: 'Battlestations',
    tag: 'Full setups & rigs',
  },
  {
    src: '/images/hero/slide-3.jpg',
    fallback: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&q=80&auto=format&fit=crop',
    label: 'Phones & tablets',
    tag: 'Latest mobiles',
  },
  {
    src: '/images/hero/slide-4.jpg',
    fallback: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=80&auto=format&fit=crop',
    label: 'Cameras & lenses',
    tag: 'Shoot more',
  },
  {
    src: '/images/hero/slide-5.jpg',
    fallback: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80&auto=format&fit=crop',
    label: 'PC builds',
    tag: 'Custom & prebuilt',
  },
];
