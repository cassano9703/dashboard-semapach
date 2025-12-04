'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyAchievementsGallery } from '@/components/compendio/monthly-achievements-gallery';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { ServiceOperationStats } from '@/components/compendio/service-operation-stats';
import { DistrictProgressChart } from '@/components/dashboard/district-progress-chart';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ReporteCobranzaPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        setSelectedDate(new Date());
    }, []);

    if (!selectedDate) {
        return <div className="flex justify-center items-center h-full">Cargando...</div>;
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
          Compendio General de Gestión Comercial
        </h1>
        <p className="text-muted-foreground mt-2">
          Un resumen de los logros y avances más importantes del año.
        </p>
      </div>
      <AnnualCollectionGoal />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className='lg:col-span-5 flex flex-col gap-8'>
            <div className='flex flex-col gap-4'>
                <MonthlyAchievementsGallery selectedDate={selectedDate} />
                <div className='flex justify-center'>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full sm:w-auto justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                            locale={es}
                            defaultMonth={selectedDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <ServiceOperationStats selectedDate={selectedDate} />
            </div>
        </div>
        <div className='lg:col-span-7 flex flex-col gap-8'>
            <MonthlyCollectionGoal />
            <DistrictProgressChart />
        </div>
      </div>
    </div>
  );
}
