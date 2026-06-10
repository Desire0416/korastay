"use client";

import { useActionState } from "react";
import { LifeBuoy, AlertCircle } from "lucide-react";
import {
  Drawer, DrawerContent, DrawerTrigger, DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { startSupportConversation, type MsgResult } from "@/server/actions/messaging";

export function StartSupportButton({ label = "Contacter l'assistance" }: { label?: string }) {
  const [state, action, pending] = useActionState<MsgResult, FormData>(startSupportConversation, { ok: false });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button><LifeBuoy className="h-4 w-4" /> {label}</Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <DrawerTitle className="px-1 pt-5 text-xl font-bold">Contacter l'assistance KoraStay</DrawerTitle>
        <p className="px-1 text-sm text-muted">Notre equipe vous repond rapidement.</p>
        <form action={action} className="mt-5 space-y-4 px-1">
          <Field label="Sujet" htmlFor="subject" required>
            <Input id="subject" name="subject" placeholder="Objet de votre demande" required />
          </Field>
          <Field label="Message" htmlFor="message" required>
            <Textarea id="message" name="message" placeholder="Decrivez votre demande..." rows={4} required />
          </Field>
          {state.error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
              <AlertCircle className="h-4 w-4" /> {state.error}
            </div>
          )}
          <Button type="submit" size="lg" loading={pending} className="w-full">Envoyer</Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
