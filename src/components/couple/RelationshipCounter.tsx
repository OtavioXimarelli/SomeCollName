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

      let years = differenceInYears(now, startDate);
      let monthsDate = addYears(startDate, years);
      let months = differenceInMonths(now, monthsDate);
      let daysDate = addMonths(monthsDate, months);
      let days = differenceInDays(now, daysDate);
      let hoursDate = addDays(daysDate, days);
      let hours = differenceInHours(now, hoursDate);
      let minutesDate = addHours(hoursDate, hours);
      let minutes = differenceInMinutes(now, minutesDate);
      let secondsDate = addMinutes(minutesDate, minutes);
      let seconds = differenceInSeconds(now, secondsDate);
      
      setDuration({ years, months, days, hours, minutes, seconds });
    };

    calculateDuration(); // Cálculo inicial
    const intervalId = setInterval(calculateDuration, 1000); // Atualiza a cada segundo

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, [startDateString]);

  if (!duration) {
    return (
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-fuchsia-700">
            <CalendarDays className="mr-2 h-6 w-6 text-fuchsia-500" /> Nossa Jornada Até Aqui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rose-600">Carregando duração do relacionamento...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isNaN(startDate.getTime())) {
     return (
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-fuchsia-700">
            <CalendarDays className="mr-2 h-6 w-6 text-fuchsia-500" /> Nossa Jornada Até Aqui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground bg-destructive p-2 rounded-md">Data de início inválida. Por favor, defina uma data válida na seção de edição.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <h2 className="flex items-center text-lg font-headline text-fuchsia-700 mb-4 gap-2">
          <CalendarDays className="h-6 w-6 text-fuchsia-500" /> Nossa Jornada Até Aqui
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-2">
          {Object.entries(duration).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center px-3 py-2 bg-white/80 border-2 border-fuchsia-200 rounded-lg shadow-sm min-w-[60px]">
              <span className="text-2xl font-bold text-fuchsia-700 leading-tight">{value}</span>
              <span className="text-xs text-fuchsia-500 uppercase tracking-wide mt-1">{unit.charAt(0).toUpperCase() + unit.slice(1)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-rose-500 mt-2 text-center">
          Iniciado em: {startDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
