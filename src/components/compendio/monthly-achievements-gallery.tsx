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
  CardDescription,
} from "@/components/ui/card";
import { useMemo, useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function MonthlyAchievementsGallery() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const firestore = useFirestore();
  const achievementsRef = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'monthly_achievements'), orderBy('month', 'desc')) : null,
    [firestore]
  );
  const { data: achievementsData, isLoading } = useCollection(achievementsRef);

  const achievements = useMemo(() => {
    if (!achievementsData) return [];
    return achievementsData.map(item => ({
      ...item,
      monthFormatted: format(parseISO(`${item.month}-01`), "MMMM yyyy", { locale: es }),
    }));
  }, [achievementsData]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Galería de Logros Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando logros...</div>
          ) : achievements.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No hay logros para mostrar.</div>
          ) : (
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
                    {achievements.map((achievement) => (
                    <CarouselItem key={achievement.id}>
                        <div className="p-1">
                        <Card>
                            <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-t-lg">
                                <Image
                                    src={achievement.imageUrl}
                                    alt={`Logro de ${achievement.monthFormatted}`}
                                    width={800}
                                    height={600}
                                    className="object-cover w-full h-full"
                                />
                            </CardContent>
                            <CardDescription className="p-4 text-sm text-muted-foreground">
                                {achievement.description}
                            </CardDescription>
                            <CardFooter className="flex justify-center p-4 bg-muted/50 rounded-b-lg">
                                <span className="text-sm font-medium text-muted-foreground capitalize">{achievement.monthFormatted}</span>
                            </CardFooter>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white" />
            </Carousel>
          )}
        </CardContent>
    </Card>
  );
}

    