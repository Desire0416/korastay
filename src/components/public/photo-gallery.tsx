"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Grid3x3, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { CardImageCarousel } from "./card-image-carousel";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  images: { url: string; altText?: string | null }[];
  seedPrefix: string;
  name: string;
}

export function PhotoGallery({ images, seedPrefix, name }: PhotoGalleryProps) {
  const list = images.length ? images : [{ url: "", altText: name }];
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Mobile : carrousel plein largeur */}
      <div className="lg:hidden">
        <CardImageCarousel
          images={list}
          seedPrefix={seedPrefix}
          aspectClass="aspect-[4/3]"
          priority
        />
      </div>

      {/* Desktop : mosaique */}
      <div className="relative hidden overflow-hidden rounded-4xl lg:block">
        <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative col-span-2 row-span-2 overflow-hidden rounded-l-3xl"
          >
            <SmartImage src={list[0]?.url} alt={`${name} - principale`} seed={`${seedPrefix}-0`} priority imgClassName="transition-transform duration-500 hover:scale-105" />
          </button>
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setOpen(true)}
              className={cn(
                "relative overflow-hidden",
                i === 2 && "rounded-tr-3xl",
                i === 4 && "rounded-br-3xl"
              )}
            >
              <SmartImage
                src={list[i]?.url}
                alt={`${name} - ${i}`}
                seed={`${seedPrefix}-${i}`}
                imgClassName="transition-transform duration-500 hover:scale-105"
              />
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-surface-soft"
        >
          <Grid3x3 className="h-4 w-4" />
          Voir les {list.length} photos
        </button>
      </div>

      {/* Visionneuse plein ecran */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm data-[state=open]:animate-fade-in" />
          <Dialog.Content className="fixed inset-0 z-50 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
              <Dialog.Title className="font-bold text-foreground">{name}</Dialog.Title>
              <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-foreground transition-colors hover:bg-border">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
              {list.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-3xl">
                  <SmartImage src={img.url} alt={img.altText ?? `${name} ${i + 1}`} seed={`${seedPrefix}-${i}`} className="aspect-[4/3]" />
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
