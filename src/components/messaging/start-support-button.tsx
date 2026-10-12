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
import { useI18n } from "@/components/i18n/provider";

export function StartSupportButton({ label }: { label?: string }) {
  const dict = useI18n();
  const m = dict.dash.messaging;
  const [state, action, pending] = useActionState<MsgResult, FormData>(startSupportConversation, { ok: false });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button><LifeBuoy className="h-4 w-4" /> {label ?? m.supportButton}</Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <DrawerTitle className="px-1 pt-5 font-display text-2xl font-normal">{m.supportTitle}</DrawerTitle>
        <p className="px-1 text-sm text-muted">{m.supportText}</p>
        <form action={action} className="mt-5 space-y-4 px-1">
          <Field label={m.subject} htmlFor="subject" required>
            <Input id="subject" name="subject" placeholder={m.subjectPlaceholder} required />
          </Field>
          <Field label={m.message} htmlFor="message" required>
            <Textarea id="message" name="message" placeholder={m.messagePlaceholder} rows={4} required />
          </Field>
          {state.error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-danger-200/70">
              <AlertCircle className="h-4 w-4" /> {state.error}
            </div>
          )}
          <Button type="submit" size="lg" loading={pending} className="w-full">{m.send}</Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
