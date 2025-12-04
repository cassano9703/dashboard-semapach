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
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

export function MonthlyAchievementsGallery() {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
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
      monthFormatted: format(parse(item.month, 'yyyy-MM', new Date()), "MMMM yyyy", { locale: es }),
    }));
  }, [achievementsData]);

  return (
    <Card className="rounded-b-none">
        <CardHeader>
            <CardTitle>Galería de Logros Mensuales</CardTitle>
            <CardDescription>Hitos importantes alcanzados cada mes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">Cargando logros...</div>
          ) : achievements.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">No hay logros para mostrar.</div>
          ) : (
             <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{ loop: true }}
            >
                <CarouselContent>
                    {achievements.map((achievement) => (
                        <CarouselItem key={achievement.id}>
                            <div className="p-1">
                                <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="h-64 relative">
                                        <Image
                                            src={achievement.imageUrl}
                                            alt={`Logro de ${achievement.monthFormatted}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                </CardContent>
                                <div className="p-4 text-sm text-muted-foreground min-h-[60px]">
                                    {achievement.description}
                                </div>
                                <CardFooter className="flex justify-center p-2 bg-blue-100 dark:bg-blue-900/30">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 capitalize">{achievement.monthFormatted}</span>
                                </CardFooter>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
          )}
        </CardContent>
    </Card>
  );
}
