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
      // Invalid date
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

    calculateDuration(); // Initial calculation
    const intervalId = setInterval(calculateDuration, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [startDateString]);

  if (!duration) {
    return (
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <CalendarDays className="mr-2 h-6 w-6 text-accent" /> Our Journey So Far
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading relationship duration...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isNaN(startDate.getTime())) {
     return (
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <CalendarDays className="mr-2 h-6 w-6 text-accent" /> Our Journey So Far
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground bg-destructive p-2 rounded-md">Invalid start date provided. Please set a valid date in the edit section.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg animate-fade-in mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline text-primary-foreground">
          <CalendarDays className="mr-3 h-8 w-8 text-accent" /> Our Journey So Far
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {Object.entries(duration).map(([unit, value]) => (
            <div key={unit} className="bg-primary/20 p-4 rounded-lg shadow">
              <div className="text-4xl font-headline text-accent-foreground">{value}</div>
              <div className="text-sm font-body text-muted-foreground capitalize">{unit}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Started on: {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </CardContent>
    </Card>
  );
}
