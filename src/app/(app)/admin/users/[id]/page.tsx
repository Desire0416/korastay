import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserStatus, setUserRole } from "@/server/actions/admin";
import { setOwnerPayoutTier } from "@/server/actions/payments-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { userRoleMeta } from "@/lib/enums";
import { initials, formatDate } from "@/lib/utils";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { reservations: true, residences: true, reviews: true } } },
  });
  if (!user) notFound();

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const statusActions = [];
  if (user.status === "ACTIVE") {
    statusActions.push({ label: "Suspendre", fn: setUserStatus.bind(null, id, "SUSPENDED"), variant: "danger" as const, confirm: "Suspendre cet utilisateur ?" });
  } else {
    statusActions.push({ label: "Reactiver", fn: setUserStatus.bind(null, id, "ACTIVE"), variant: "primary" as const });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Utilisateurs
      </Link>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{initials(user.firstName, user.lastName)}</AvatarFallback></Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={userRoleMeta[user.role]?.tone}>{userRoleMeta[user.role]?.label}</Badge>
              <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>{user.status === "ACTIVE" ? "Actif" : user.status}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 text-muted" /> {user.email}</p>
          {user.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-muted" /> {user.phone}</p>}
          {user.city && <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted" /> {user.city}</p>}
          <p className="flex items-center gap-2 text-foreground"><Calendar className="h-4 w-4 text-muted" /> Inscrit le {formatDate(user.createdAt)}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
          <Stat value={user._count.reservations} label="Reservations" />
          <Stat value={user._count.residences} label="Residences" />
          <Stat value={user._count.reviews} label="Avis" />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="mb-3 font-bold text-foreground">Actions</h2>
        <AdminActions actions={statusActions} />

        {user.role === "OWNER" && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-1 text-sm font-semibold text-foreground">Fiabilite des reversements</p>
            <p className="mb-2 text-xs text-muted">
              Actuel : <Badge tone={user.payoutTier === "RELIABLE" ? "success" : "neutral"}>{user.payoutTier === "RELIABLE" ? "Fiable (100% au check-in)" : "Nouveau (70% / 30%)"}</Badge>
            </p>
            <AdminActions
              actions={[
                user.payoutTier === "RELIABLE"
                  ? { label: "Repasser en nouveau", fn: setOwnerPayoutTier.bind(null, id, "NEW"), variant: "soft" as const }
                  : { label: "Marquer comme fiable", fn: setOwnerPayoutTier.bind(null, id, "RELIABLE"), variant: "primary" as const },
              ]}
            />
          </div>
        )}

        {isSuperAdmin && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-2 text-sm font-semibold text-foreground">Modifier le role (Super Admin)</p>
            <AdminActions
              actions={["TRAVELER", "OWNER", "PARTNER", "BUSINESS", "ADMIN"].filter((r) => r !== user.role).map((r) => ({
                label: userRoleMeta[r].label,
                fn: setUserRole.bind(null, id, r),
                variant: "soft" as const,
                confirm: `Changer le role en ${userRoleMeta[r].label} ?`,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div><p className="font-display text-2xl font-semibold text-foreground">{value}</p><p className="text-xs text-muted">{label}</p></div>;
}
