'use client';

import { AnnualCollectionGoal } from '@/components/compendio/annual-collection-goal';
import { MonthlyCollectionGoal } from '@/components/compendio/monthly-collection-goal';
import { DistrictProgressChart } from '@/components/dashboard/district-progress-chart';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { es } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scissors, Repeat, Building, UserCog } from 'lucide-react';


const formatNumber = (value: number) => value.toLocaleString('es-PE');

export default function ReporteCobranzaPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        setSelectedDate(new Date());
    }, []);

    const firestore = useFirestore();
    const selectedMonth = selectedDate ? format(selectedDate, 'yyyy-MM') : null;

    // Data for Achievements Gallery
    const achievementsRef = useMemoFirebase(
        () => (firestore && selectedMonth) ? query(collection(firestore, 'monthly_achievements'), where('month', '==', selectedMonth)) : null,
        [firestore, selectedMonth]
    );
    const { data: achievementsData, isLoading: isLoadingAchievements } = useCollection(achievementsRef);
    const achievement = useMemo(() => {
        if (!achievementsData || achievementsData.length === 0) return null;
        const item = achievementsData[0];
        return {
        ...item,
        monthFormatted: format(parse(item.month, 'yyyy-MM', new Date()), "MMMM yyyy", { locale: es }),
        };
    }, [achievementsData]);


    // Data for Service Operations
    const operationsRef = useMemoFirebase(
      () => (firestore && selectedMonth) ? query(collection(firestore, 'service_operations'), where('month', '==', selectedMonth)) : null,
      [firestore, selectedMonth]
    );
    const { data: operationsData, isLoading: isLoadingOperations } = useCollection(operationsRef);
    const stats = useMemo(() => {
        if (!operationsData) return { semapachCuts: 0, servisCuts: 0, semapachReconnections: 0, servisReconnections: 0 };
        const semapachCuts = operationsData.filter(op => op.entity === 'semapach' && op.operationType === 'cut').reduce((sum, op) => sum + op.quantity, 0);
        const servisCuts = operationsData.filter(op => op.entity === 'servis' && op.operationType === 'cut').reduce((sum, op) => sum + op.quantity, 0);
        const semapachReconnections = operationsData.filter(op => op.entity === 'semapach' && op.operationType === 'reconnection').reduce((sum, op) => sum + op.quantity, 0);
        const servisReconnections = operationsData.filter(op => op.entity === 'servis' && op.operationType === 'reconnection').reduce((sum, op) => sum + op.quantity, 0);
        return { semapachCuts, servisCuts, semapachReconnections, servisReconnections };
    }, [operationsData]);


    if (!selectedDate) {
        return <div className="flex justify-center items-center h-full">Cargando...</div>;
    }

    const StatCard = ({ title, value, description, icon, isLoading, borderColor }: { title: string, value: number, description: string, icon: React.ReactNode, isLoading: boolean, borderColor: string }) => (
        <Card className={`border-l-4 ${borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatNumber(value)}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

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
            <Card>
                <CardHeader>
                    <CardTitle>Galería de Logros Mensuales</CardTitle>
                    <CardDescription>Hitos importantes alcanzados cada mes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingAchievements ? (
                        <div className="flex items-center justify-center h-80 text-muted-foreground">Cargando logros...</div>
                    ) : !achievement ? (
                        <div className="flex items-center justify-center h-80 text-muted-foreground">No hay logro para el mes seleccionado.</div>
                    ) : (
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
                                <div className="p-4 text-sm text-muted-foreground">
                                    {achievement.description}
                                </div>
                                <CardFooter className="flex justify-center p-2 bg-muted/50">
                                    <span className="text-sm font-medium text-muted-foreground capitalize">{achievement.monthFormatted}</span>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                    <div className='flex justify-center mt-4'>
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
                    <div className="grid gap-4 grid-cols-2 mt-6">
                        <StatCard 
                            title="Cortes SEMAPACH" 
                            value={stats.semapachCuts} 
                            description={`Total en ${format(selectedDate, 'LLLL', { locale: es })}`}
                            icon={<Scissors className="h-4 w-4 text-muted-foreground" />}
                            isLoading={isLoadingOperations}
                            borderColor="border-red-500"
                        />
                        <StatCard 
                            title="Cortes SERVIS" 
                            value={stats.servisCuts} 
                            description="Total por la entidad"
                            icon={<Building className="h-4 w-4 text-muted-foreground" />}
                            isLoading={isLoadingOperations}
                            borderColor="border-amber-500"
                        />
                        <StatCard 
                            title="Reaperturas SEMAPACH" 
                            value={stats.semapachReconnections} 
                            description="Total de reconexiones"
                            icon={<Repeat className="h-4 w-4 text-muted-foreground" />}
                            isLoading={isLoadingOperations}
                            borderColor="border-green-500"
                        />
                        <StatCard 
                            title="Reaperturas SERVIS" 
                            value={stats.servisReconnections} 
                            description="Total por la entidad"
                            icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
                            isLoading={isLoadingOperations}
                            borderColor="border-sky-500"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className='lg:col-span-7 flex flex-col gap-8'>
            <MonthlyCollectionGoal />
            <DistrictProgressChart />
        </div>
      </div>
    </div>
  );
}
