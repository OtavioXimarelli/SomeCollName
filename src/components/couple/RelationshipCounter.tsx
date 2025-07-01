"use client";

import { useEffect, useState } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, addYears, addMonths, addDays, addHours, addMinutes } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

interface RelationshipCounterProps {
  startDate: string;
}

interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function RelationshipCounter({ startDate: startDateString }: RelationshipCounterProps) {
  const [duration, setDuration] = useState<Duration | null>(null);
  const startDate = new Date(startDateString);

  useEffect(() => {
    if (isNaN(startDate.getTime())) {
      // Data inválida
      setDuration(null);
      return;
    }

    const calculateDuration = () => {
      const now = new Date();
      if (now < startDate) {
        setDuration({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const years = differenceInYears(now, startDate);
      const monthsDate = addYears(startDate, years);
      const months = differenceInMonths(now, monthsDate);
      const daysDate = addMonths(monthsDate, months);
      const days = differenceInDays(now, daysDate);
      const hoursDate = addDays(daysDate, days);
      const hours = differenceInHours(now, hoursDate);
      const minutesDate = addHours(hoursDate, hours);
      const minutes = differenceInMinutes(now, minutesDate);
      const secondsDate = addMinutes(minutesDate, minutes);
      const seconds = differenceInSeconds(now, secondsDate);
      
      setDuration({ years, months, days, hours, minutes, seconds });
    };

    calculateDuration(); // Cálculo inicial
    const intervalId = setInterval(calculateDuration, 1000); // Atualiza a cada segundo

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, [startDateString, startDate]);

  if (!duration) {
    return (
      <Card className="bg-white/90 border-2 border-fuchsia-200/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-xl sm:text-2xl font-headline text-fuchsia-700 gap-3">
            <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-fuchsia-500 animate-pulse" /> 
            Nossa Jornada Até Aqui
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500 mx-auto"></div>
            <p className="text-rose-600 font-medium">Carregando duração do relacionamento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isNaN(startDate.getTime())) {
     return (
      <Card className="bg-white/90 border-2 border-red-200/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-xl sm:text-2xl font-headline text-red-700 gap-3">
            <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" /> 
            Nossa Jornada Até Aqui
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium mb-2">📅 Data de início inválida</p>
            <p className="text-sm text-red-600">Por favor, defina uma data válida na seção de edição.</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-white/90 border-2 border-fuchsia-200/50 shadow-lg overflow-hidden">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center text-xl sm:text-2xl font-headline text-fuchsia-700 gap-3">
          <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-fuchsia-500" /> 
          Nossa Jornada Até Aqui
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        <div className="text-center space-y-4">
          {/* Duration Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {Object.entries(duration).map(([unit, value]) => {
              const unitLabels: Record<string, string> = {
                years: 'Anos',
                months: 'Meses', 
                days: 'Dias',
                hours: 'Horas',
                minutes: 'Min',
                seconds: 'Seg'
              };
              
              return (
                <div key={unit} className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-b from-fuchsia-50 to-pink-50 border border-fuchsia-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-fuchsia-700 leading-none">
                    {value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs sm:text-sm text-fuchsia-600 font-medium uppercase tracking-wide mt-1">
                    {unitLabels[unit]}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Start Date Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-fuchsia-50 rounded-xl border border-pink-200/50">
            <p className="text-sm sm:text-base text-rose-600 font-medium">
              💕 Iniciado em: {startDate.toLocaleDateString('pt-BR', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs sm:text-sm text-rose-500 mt-1">
              Cada segundo juntos é especial ✨
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
