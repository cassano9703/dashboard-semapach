"use client";

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo, useRef } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from "embla-carousel-autoplay";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function MonthlyAchievementsGallery() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const achievements = useMemo(() => {
    return months.slice(0, 6).map((month, index) => {
      const placeholder = PlaceHolderImages.find(img => img.id === `logro-${month.toLowerCase()}`);
      return {
        month: `${month} 2025`,
        imageUrl: placeholder?.imageUrl || `https://picsum.photos/seed/${month.toLowerCase()}2025/800/600`,
        imageHint: placeholder?.imageHint || 'achievement'
      };
    });
  }, []);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Galería de Logros Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
            <Carousel
                plugins={[plugin.current]}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full group"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {achievements.map((achievement, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                        <Card>
                            <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-t-lg">
                                <Image
                                    src={achievement.imageUrl}
                                    alt={`Logro de ${achievement.month}`}
                                    width={800}
                                    height={600}
                                    className="object-cover w-full h-full"
                                    data-ai-hint={achievement.imageHint}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-center p-4 bg-muted/50 rounded-b-lg">
                                <span className="text-sm font-medium text-muted-foreground">{achievement.month}</span>
                            </CardFooter>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white" />
            </Carousel>
        </CardContent>
    </Card>
  );
}
