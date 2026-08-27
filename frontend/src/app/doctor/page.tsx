"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PortalShell, StatCard } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const field = "w-full rounded-2xl border border-border bg-surface px-3 py-2 font-ui text-sm text-forest-800 outline-none focus:border-sage";

interface Appt {
  id: number;
  type: string;
  guest: { id: number; name: string };
  booking?: string;
  scheduled_at: string;
  status: string;
}
interface Dashboard {
  today: Appt[];
  upcoming: Appt[];
  in_house_patients: { id: number; name: string }[];
}
interface Patient {
  id: number;
  name: string;
  email?: string;
  bookings: { id: number; reference: string; status: string; check_in: string; check_out: string }[];
  dosha_assessments: { vata: number; pitta: number; kapha: number; prakriti: string; vikriti: string; assessed_at: string }[];
  diet_charts: { id: number; title: string; status: string; meals: unknown[] }[];
  prescriptions: { id: number; items: { medicine: string }[]; status: string; issued_at: string }[];
  progress: { entry_date: string; metrics: Record<string, number> }[];
}

export default function DoctorPage() {
  const { token } = useAuth();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"rx" | "diet" | "progress" | "dosha">("rx");
  const [busy, setBusy] = useState(false);

  // form state
  const [rx, setRx] = useState({ medicine: "", dose: "", timing: "", duration: "", advice: "" });
  const [diet, setDiet] = useState({ meal: "", items: "", avoid: "" });
  const [prog, setProg] = useState({ weight_kg: "", sleep_hours: "", sleep_score: "", stress_score: "", note: "" });
  const [dosha, setDosha] = useState({ vata: "40", pitta: "35", kapha: "25", prakriti: "", vikriti: "" });

  const loadDash = useCallback(async () => {
    if (!token) return;
    try {
      setDash((await api<{ data: Dashboard }>("/staff/doctor/dashboard", { token })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDash();
  }, [loadDash]);

  async function openPatient(id: number) {
    setLoadingPatient(true);
    setPatient(null);
    try {
      setPatient((await api<{ data: Patient }>(`/staff/doctor/patients/${id}`, { token: token ?? undefined })).data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load patient.");
    } finally {
      setLoadingPatient(false);
    }
  }

  async function completeAppt(id: number) {
    await api(`/staff/doctor/appointments/${id}/complete`, { method: "POST", token: token ?? undefined });
    await loadDash();
  }

  async function submit(path: string, body: unknown) {
    if (!patient) return;
    setBusy(true);
    setError("");
    try {
      await api(`/staff/doctor/patients/${patient.id}/${path}`, { method: "POST", token: token ?? undefined, body });
      await openPatient(patient.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell title="Doctor" requireStaff>
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Consults today" value={dash?.today.length ?? "—"} />
        <StatCard label="Upcoming" value={dash?.upcoming.length ?? "—"} />
        <StatCard label="In-house patients" value={dash?.in_house_patients.length ?? "—"} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-2xl">Appointments</h2>
          <div className="mt-3 flex flex-col gap-2">
            {[...(dash?.today ?? []), ...(dash?.upcoming ?? [])].map((a) => (
              <div key={a.id} className="rounded-card border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-ui text-sm font-semibold text-forest-800 capitalize">{a.type.replace("_", " ")} · {a.guest.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.scheduled_at).toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" })} · {a.booking}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => openPatient(a.guest.id)}>Open</Button>
                    {a.status !== "completed" && <Button size="sm" onClick={() => completeAppt(a.id)}>Done</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-heading text-lg text-forest-800">In-house patients</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {(dash?.in_house_patients ?? []).map((p) => (
              <button key={p.id} onClick={() => openPatient(p.id)} className="rounded-pill bg-surface px-3 py-1.5 font-ui text-xs font-semibold text-forest-700 hover:bg-sage-100">
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          {loadingPatient && <p className="font-ui text-sm text-muted-foreground">Loading patient…</p>}
          {patient && (
            <div className="rounded-card border border-border bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl">{patient.name}</h2>
                <span className="font-ui text-xs text-muted-foreground">{patient.email}</span>
              </div>

              {patient.dosha_assessments[0] && (
                <p className="mt-1 font-ui text-sm text-muted-foreground">
                  {patient.dosha_assessments[0].prakriti} · imbalance {patient.dosha_assessments[0].vikriti}
                </p>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2 text-center font-ui text-xs">
                <span className="rounded-xl bg-surface-muted py-1.5">{patient.prescriptions.length} Rx</span>
                <span className="rounded-xl bg-surface-muted py-1.5">{patient.diet_charts.filter((d) => d.status === "active").length} diet</span>
                <span className="rounded-xl bg-surface-muted py-1.5">{patient.progress.length} progress</span>
              </div>

              <div className="mt-5 flex gap-1.5">
                {(["rx", "diet", "progress", "dosha"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={cn("rounded-pill px-3 py-1.5 font-ui text-xs font-semibold capitalize", tab === t ? "bg-forest-700 text-ivory" : "bg-surface-muted text-muted-foreground")}>
                    {t === "rx" ? "Prescription" : t === "diet" ? "Diet chart" : t}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {tab === "rx" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={field} placeholder="Medicine" value={rx.medicine} onChange={(e) => setRx({ ...rx, medicine: e.target.value })} />
                    <input className={field} placeholder="Dose (e.g. 3 g)" value={rx.dose} onChange={(e) => setRx({ ...rx, dose: e.target.value })} />
                    <input className={field} placeholder="Timing" value={rx.timing} onChange={(e) => setRx({ ...rx, timing: e.target.value })} />
                    <input className={field} placeholder="Duration" value={rx.duration} onChange={(e) => setRx({ ...rx, duration: e.target.value })} />
                    <textarea className={cn(field, "sm:col-span-2")} rows={2} placeholder="Advice" value={rx.advice} onChange={(e) => setRx({ ...rx, advice: e.target.value })} />
                    <div className="sm:col-span-2">
                      <Button size="sm" disabled={busy || !rx.medicine} onClick={() => submit("prescription", { items: [{ medicine: rx.medicine, dose: rx.dose, timing: rx.timing, duration: rx.duration }], advice: rx.advice || undefined })}>
                        Add prescription
                      </Button>
                    </div>
                  </div>
                )}
                {tab === "diet" && (
                  <div className="grid gap-2">
                    <input className={field} placeholder="Meal (e.g. Breakfast · 08:00)" value={diet.meal} onChange={(e) => setDiet({ ...diet, meal: e.target.value })} />
                    <input className={field} placeholder="Items (comma-separated)" value={diet.items} onChange={(e) => setDiet({ ...diet, items: e.target.value })} />
                    <input className={field} placeholder="Avoid (comma-separated)" value={diet.avoid} onChange={(e) => setDiet({ ...diet, avoid: e.target.value })} />
                    <Button size="sm" disabled={busy || !diet.meal} onClick={() => submit("diet-chart", {
                      title: "Prescribed diet",
                      meals: [{ meal: diet.meal, items: diet.items.split(",").map((s) => s.trim()).filter(Boolean) }],
                      avoid: diet.avoid.split(",").map((s) => s.trim()).filter(Boolean),
                    })}>
                      Set diet chart
                    </Button>
                    <p className="font-ui text-[0.68rem] text-muted-foreground">This replaces the active chart. Add one meal row here; the full multi-meal editor is a later refinement.</p>
                  </div>
                )}
                {tab === "progress" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["weight_kg", "sleep_hours", "sleep_score", "stress_score"] as const).map((k) => (
                      <input key={k} className={field} placeholder={k.replace("_", " ")} value={prog[k]} onChange={(e) => setProg({ ...prog, [k]: e.target.value })} />
                    ))}
                    <textarea className={cn(field, "sm:col-span-2")} rows={2} placeholder="Note" value={prog.note} onChange={(e) => setProg({ ...prog, note: e.target.value })} />
                    <div className="sm:col-span-2">
                      <Button size="sm" disabled={busy} onClick={() => submit("progress", {
                        entry_date: new Date().toISOString().slice(0, 10),
                        metrics: Object.fromEntries((["weight_kg", "sleep_hours", "sleep_score", "stress_score"] as const).filter((k) => prog[k]).map((k) => [k, Number(prog[k])])),
                        note: prog.note || undefined,
                      })}>
                        Record today
                      </Button>
                    </div>
                  </div>
                )}
                {tab === "dosha" && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["vata", "pitta", "kapha"] as const).map((k) => (
                      <label key={k} className="font-ui text-xs capitalize text-muted-foreground">{k}
                        <input className={field} type="number" value={dosha[k]} onChange={(e) => setDosha({ ...dosha, [k]: e.target.value })} />
                      </label>
                    ))}
                    <input className={cn(field, "sm:col-span-2")} placeholder="Prakriti (e.g. Vata-Pitta)" value={dosha.prakriti} onChange={(e) => setDosha({ ...dosha, prakriti: e.target.value })} />
                    <input className={field} placeholder="Vikriti" value={dosha.vikriti} onChange={(e) => setDosha({ ...dosha, vikriti: e.target.value })} />
                    <div className="sm:col-span-3">
                      <Button size="sm" disabled={busy} onClick={() => submit("dosha", {
                        vata: Number(dosha.vata), pitta: Number(dosha.pitta), kapha: Number(dosha.kapha),
                        prakriti: dosha.prakriti || undefined, vikriti: dosha.vikriti || undefined,
                      })}>
                        Save assessment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
