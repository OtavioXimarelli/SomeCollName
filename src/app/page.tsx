import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center animate-fade-in">
      <Heart className="w-24 h-24 text-primary mb-8 animate-pulse" />
      <h1 className="text-6xl font-headline text-primary-foreground mb-6">
        Evermore Bond
      </h1>
      <p className="text-2xl font-body text-muted-foreground mb-12 max-w-2xl">
        Craft your unique digital love story. A private space to cherish memories, celebrate milestones, and grow together, forever.
      </p>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-10 py-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/couple/our-story/edit">Create Your Couple Space</Link>
        </Button>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
        <Card className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="text-primary w-6 h-6" /> Shared Gallery</CardTitle>
            <CardDescription>Fill your space with photos that tell your unique love story.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Relive your favorite moments, from grand adventures to quiet evenings together.</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: '1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="text-primary w-6 h-6" /> Love Counter</CardTitle>
            <CardDescription>Watch your love grow with a counter marking your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Celebrate every day, month, and year of your beautiful relationship.</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="text-primary w-6 h-6" /> Our Soundtrack</CardTitle>
            <CardDescription>Set the mood with background music that means something to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create a playlist of your special songs, the soundtrack of your love.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
