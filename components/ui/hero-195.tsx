"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabs = [
  {
    title: "Vue d'ensemble",
    description:
      "Statistiques clés, graphiques et messages contact en un coup d'œil.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Analytics",
    description:
      "Suivez les conversions, le trafic et les performances par canal.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Multi-domaines",
    description:
      "Basculez entre vos domaines clients depuis une sidebar unique.",
    image:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
  },
];

export function Hero195() {
  const [activeTab, setActiveTab] = useState(tabs[0].title);

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Pilotez tous vos domaines depuis un seul admin
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Tableau de bord shadcn/ui pour Target Agency — basculez entre vos
            sites clients, suivez les leads et visualisez vos KPIs.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button>
              Commencer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">Documentation</Button>
          </div>
        </div>

        <Tabs
          defaultValue={tabs[0].title}
          onValueChange={setActiveTab}
          className="mx-auto max-w-4xl"
        >
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-3">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.title} value={tab.title}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative rounded-xl border bg-muted/30 p-4 md:p-8">
            {tabs.map((tab) => (
              <TabsContent key={tab.title} value={tab.title} className="mt-0">
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  {tab.description}
                </p>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-lg border bg-background transition-opacity duration-500",
                    {
                      "animate-in fade-in opacity-100": activeTab === tab.title,
                      "opacity-0": activeTab !== tab.title,
                    }
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tab.image}
                    alt={tab.title}
                    className="aspect-[16/10] w-full border border-border object-cover object-top shadow-[0_6px_20px_rgb(0,0,0,0.12)]"
                  />
                  <BorderBeam duration={8} size={100} />
                </div>
              </TabsContent>
            ))}

            <span className="pointer-events-none absolute -inset-x-1/5 top-0 -z-10 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />
            <span className="pointer-events-none absolute -inset-x-1/5 bottom-0 -z-10 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />
          </div>
        </Tabs>
      </div>
    </section>
  );
}
