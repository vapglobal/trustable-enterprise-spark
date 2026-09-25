import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus, KeyRound, Ban, RotateCcw, Trash2, Plus } from "lucide-react";
import {
  getRbac, saveRole, deleteRole, saveGroup, deleteGroup, updateMember,
  createUser, sendPasswordReset, setSuspended, removeMember,
} from "@/lib/security.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmphasizedControl, EmphasizedField } from "@/components/trustable/EmphasizedField";

export const Route = createFileRoute("/_authenticated/app/access")({
  head: () => ({ meta: [{ title: "Access control — Trustable" }, { name: "description", content: "Members, roles, groups and permissions." }] }),
  component: AccessPage,
});

type Rbac = Awaited<ReturnType<typeof getRbac>>;
type Member = Rbac["members"][number];

function useRun() {
  const qc = useQueryClient();
  return async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
      qc.invalidateQueries({ queryKey: ["rbac"] });
      qc.invalidateQueries({ queryKey: ["access"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };
}

function PermPicker({ all, value, onChange, disabled }: { all: Rbac["permissions"]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const areas = [...new Set(all.map((p) => p.area))];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {areas.map((a) => (
        <div key={a}>
          <p className="eyebrow mb-1">{a}</p>
          {all.filter((p) => p.area === a).map((p) => (
            <label key={p.key} className="flex items-center gap-2 py-0.5 text-xs" title={p.description}>
              <input type="checkbox" disabled={disabled} checked={value.includes(p.key)} onChange={(e) => onChange(e.target.checked ? [...value, p.key] : value.filter((x) => x !== p.key))} />
              <span className="font-mono">{p.key}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function AccessPage() {
  const fn = useServerFn(getRbac);
  const q = useQuery({ queryKey: ["rbac"], queryFn: () => fn() });
  if (q.isLoading) return <p className="text-muted-foreground">Loading access model…</p>;
  if (q.error || !q.data) return <p className="text-destructive">{q.error instanceof Error ? q.error.message : "Unavailable"}</p>;
  const d = q.data;
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Tenant RBAC · least privilege · deny overrides win</p>
        <h1 className="text-3xl font-bold">Access control</h1>
        {!d.canManage && <p className="mt-1 text-sm text-muted-foreground">Read-only view. Changes require the access.manage permission.</p>}
      </div>
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({d.members.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles ({d.roles.length})</TabsTrigger>
          <TabsTrigger value="groups">Groups ({d.groups.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-6">
          {d.canManage && <CreateUser isOwner={d.isOwner} />}
          <div className="space-y-3">{d.members.map((m) => <MemberCard key={m.userId} m={m} d={d} />)}</div>
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          {d.canManage && <RoleEditor d={d} />}
          {d.roles.map((r) => <RoleEditor key={r.id} d={d} role={r} />)}
        </TabsContent>
        <TabsContent value="groups" className="space-y-4">
          {d.canManage && <GroupEditor d={d} />}
          {d.groups.map((g) => <GroupEditor key={g.id} d={d} group={g} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateUser({ isOwner }: { isOwner: boolean }) {
  const create = useServerFn(createUser);
  const run = useRun();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "operator" | "auditor">("auditor");
  return (
    <form
      className="panel grid gap-3 p-5 md:grid-cols-[1fr_1fr_180px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        run(`Account created. ${email} will get an email to set a password.`, () =>
          create({ data: { email, role, displayName: name || undefined, redirectTo: `${window.location.origin}/reset-password` } }),
        ).then(() => { setEmail(""); setName(""); });
      }}
    >
      <EmphasizedField label="Name" value={name} onChange={setName}><Input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></EmphasizedField>
      <EmphasizedField label="Email" ai={false} value={email} onChange={setEmail}><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></EmphasizedField>
      <EmphasizedControl label="Base role">
        <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="auditor">Auditor</option><option value="operator">Operator</option>{isOwner && <option value="admin">Administrator</option>}
        </select>
      </EmphasizedControl>
      <div className="flex items-end"><Button type="submit"><UserPlus className="mr-2 h-4 w-4" /> Create user</Button></div>
    </form>
  );
}

function MemberCard({ m, d }: { m: Member; d: Rbac }) {
  const upd = useServerFn(updateMember);
  const reset = useServerFn(sendPasswordReset);
  const susp = useServerFn(setSuspended);
  const rm = useServerFn(removeMember);
  const run = useRun();
  const [edit, setEdit] = useState(false);
  const [sys, setSys] = useState(m.systemRole === "owner" ? "admin" : m.systemRole);
  const [custom, setCustom] = useState(m.customRoles);
  const [ov, setOv] = useState(m.overrides);
  const isOwner = m.systemRole === "owner";
  const customRoles = d.roles.filter((r) => !r.is_system);
  const setOverride = (perm: string, effect: "" | "grant" | "deny") =>
    setOv([...ov.filter((o) => o.permission !== perm), ...(effect ? [{ permission: perm, effect }] : [])]);

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{m.email}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono uppercase text-primary">{m.systemRole}</span>
            {m.customRoles.length > 0 && ` · +${m.customRoles.length} role(s)`}
            {m.groups.length > 0 && ` · ${m.groups.length} group(s)`}
            {m.overrides.length > 0 && ` · ${m.overrides.length} override(s)`}
            {m.suspended && <span className="text-destructive"> · SUSPENDED</span>}
            {!m.confirmed && <span className="text-warning"> · awaiting email confirmation</span>}
            {m.lastSignIn && ` · last sign-in ${m.lastSignIn.slice(0, 10)}`}
          </p>
        </div>
        {d.canManage && (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" onClick={() => run("Password reset email sent.", () => reset({ data: { userId: m.userId, redirectTo: `${window.location.origin}/reset-password` } }))}><KeyRound className="mr-1 h-3.5 w-3.5" />Reset password</Button>
            {!isOwner && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEdit(!edit)}>Permissions</Button>
                <Button size="sm" variant="ghost" onClick={() => run(m.suspended ? "User reinstated." : "User suspended and signed out.", () => susp({ data: { userId: m.userId, suspended: !m.suspended } }))}>
                  {m.suspended ? <><RotateCcw className="mr-1 h-3.5 w-3.5" />Reinstate</> : <><Ban className="mr-1 h-3.5 w-3.5" />Suspend</>}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm(`Remove ${m.email} from this tenant?`) && run("Member removed.", () => rm({ data: { userId: m.userId } }))}><Trash2 className="mr-1 h-3.5 w-3.5" />Remove</Button>
              </>
            )}
          </div>
        )}
      </div>
      {edit && !isOwner && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1.5">
              <Label>Base role</Label>
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={sys} onChange={(e) => setSys(e.target.value as typeof sys)}>
                <option value="auditor">Auditor</option><option value="operator">Operator</option>{d.isOwner && <option value="admin">Administrator</option>}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Additional roles</Label>
              <div className="flex flex-wrap gap-3">
                {customRoles.length === 0 && <span className="text-xs text-muted-foreground">Create custom roles in the Roles tab.</span>}
                {customRoles.map((r) => (
                  <label key={r.id} className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={custom.includes(r.id)} onChange={(e) => setCustom(e.target.checked ? [...custom, r.id] : custom.filter((x) => x !== r.id))} />{r.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label>User-level overrides (deny always wins)</Label>
            <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {d.permissions.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono">{p.key}</span>
                  <select className="h-7 rounded border border-input bg-background px-1 text-xs" value={ov.find((o) => o.permission === p.key)?.effect ?? ""} onChange={(e) => setOverride(p.key, e.target.value as "" | "grant" | "deny")}>
                    <option value="">inherit</option><option value="grant">grant</option><option value="deny">deny</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={() => run("Member permissions saved.", () => upd({ data: { userId: m.userId, systemRole: sys as "admin" | "operator" | "auditor", customRoles: custom, overrides: ov as { permission: string; effect: "grant" | "deny" }[] } })).then(() => setEdit(false))}>Save</Button>
        </div>
      )}
    </div>
  );
}

function RoleEditor({ d, role }: { d: Rbac; role?: Rbac["roles"][number] }) {
  const save = useServerFn(saveRole);
  const del = useServerFn(deleteRole);
  const run = useRun();
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.description ?? "");
  const [perms, setPerms] = useState<string[]>(role?.permissions ?? []);
  const locked = !d.canManage || role?.key === "owner";
  return (
    <div className="panel space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {role ? <h3 className="font-semibold">{role.name}</h3> : <h3 className="font-semibold"><Plus className="mr-1 inline h-4 w-4" />New custom role</h3>}
          {role?.is_system && <span className="rounded border border-border px-1.5 font-mono text-[10px] uppercase text-muted-foreground">system</span>}
        </div>
        {role && !role.is_system && d.canManage && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => run("Role deleted.", () => del({ data: { id: role.id } }))}>Delete</Button>}
      </div>
      {role?.key === "owner" ? (
        <p className="text-xs text-muted-foreground">Holds every permission. Bound to the owner identity kept in secure server configuration; cannot be assigned in the app.</p>
      ) : (
        <>
          {(!role || !role.is_system) && (
            <div className="grid gap-3 md:grid-cols-2">
              <EmphasizedField label="Role name" value={name} onChange={setName}><Input placeholder="Role name" value={name} disabled={locked} onChange={(e) => setName(e.target.value)} /></EmphasizedField>
              <EmphasizedField label="Description" value={desc} onChange={setDesc}><Input placeholder="Description" value={desc} disabled={locked} onChange={(e) => setDesc(e.target.value)} /></EmphasizedField>
            </div>
          )}
          <PermPicker all={d.permissions} value={perms} onChange={setPerms} disabled={locked} />
          {!locked && <Button size="sm" onClick={() => run("Role saved.", () => save({ data: { id: role?.id, name: name || role?.name || "", description: desc || undefined, permissions: perms } })).then(() => { if (!role) { setName(""); setDesc(""); setPerms([]); } })}>Save role</Button>}
        </>
      )}
    </div>
  );
}

function GroupEditor({ d, group }: { d: Rbac; group?: Rbac["groups"][number] }) {
  const save = useServerFn(saveGroup);
  const del = useServerFn(deleteGroup);
  const run = useRun();
  const [name, setName] = useState(group?.name ?? "");
  const [desc, setDesc] = useState(group?.description ?? "");
  const [perms, setPerms] = useState<string[]>(group?.permissions ?? []);
  const [members, setMembers] = useState<string[]>(group?.members ?? []);
  const locked = !d.canManage;
  return (
    <div className="panel space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{group ? group.name : <><Plus className="mr-1 inline h-4 w-4" />New group</>}</h3>
        {group && d.canManage && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => run("Group deleted.", () => del({ data: { id: group.id } }))}>Delete</Button>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <EmphasizedField label="Group name" value={name} onChange={setName}><Input placeholder="Group name (e.g. Security Engineering)" value={name} disabled={locked} onChange={(e) => setName(e.target.value)} /></EmphasizedField>
        <EmphasizedField label="Description" value={desc} onChange={setDesc}><Input placeholder="Description" value={desc} disabled={locked} onChange={(e) => setDesc(e.target.value)} /></EmphasizedField>
      </div>
      <div>
        <Label>Members</Label>
        <div className="mt-1 flex flex-wrap gap-3">
          {d.members.map((m) => (
            <label key={m.userId} className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" disabled={locked} checked={members.includes(m.userId)} onChange={(e) => setMembers(e.target.checked ? [...members, m.userId] : members.filter((x) => x !== m.userId))} />{m.email}
            </label>
          ))}
        </div>
      </div>
      <PermPicker all={d.permissions} value={perms} onChange={setPerms} disabled={locked} />
      {!locked && <Button size="sm" onClick={() => run("Group saved.", () => save({ data: { id: group?.id, name, description: desc || undefined, permissions: perms, members } })).then(() => { if (!group) { setName(""); setDesc(""); setPerms([]); setMembers([]); } })}>Save group</Button>}
    </div>
  );
}
