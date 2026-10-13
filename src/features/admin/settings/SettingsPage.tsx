import { adminNav } from "@/features/admin/nav"
import { useRef, useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { Icon } from "@/shared/components/ui/Icon";

type Values = {
  fullName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  facilityName: string;
  location: string;
  capacityT: string;
  produce: string[];
  tempMin: string;
  tempMax: string;
  humMin: string;
  humMax: string;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  profileEmail: string;
  alertPhone: string;
  alertEmail: string;
  rate: string;
};

const INITIAL: Values = {
  fullName: "",
  profileEmail: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
  facilityName: "",
  location: "",
  capacityT: "175",
  tempMin: "7",
  tempMax: "13",
  humMin: "65",
  humMax: "75",
  produce: [],
  sms: true,
  whatsapp: true,
  email: false,
  alertPhone: "",
  alertEmail: "",
  rate: "",
};

const DEFAULT_PRODUCE = ["Onions", "Yam", "Tomatoes", "Sweet potatoes"];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const inputCls =
  "w-full rounded-lg border border-brand-purple-30 bg-white py-2 text-sm outline-none transition focus:border-brand-purple-40 focus:ring-2 focus:ring-brand-purple-10 disabled:bg-brand-purple-10/30 disabled:text-secondary-grey";

// highlighted read-only look for the Produce Name field
const readOnlyCls = inputCls.replace("bg-white", "bg-brand-purple-10/60");
function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-xl bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-purple-10 text-brand-purple-50">
          <Icon name={icon} className="text-[22px]" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-brand-purple-50">{title}</h2>
          <p className="text-xs text-secondary-grey">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  prefix,
  suffix,
  children,
}: {
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  children: (padding: string) => React.ReactNode;
}) {
  const padding = `${prefix ? "pl-8" : "pl-3"} ${suffix ? "pr-9" : "pr-3"}`;
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-secondary-grey">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-grey">
            {prefix}
          </span>
        )}
        {children(padding)}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary-grey">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="text-[11px] text-secondary-grey">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm transition ${checked
          ? "border-brand-purple-40 bg-brand-purple-10/60 text-brand-purple-50"
          : "border-secondary-grey/40 text-secondary-grey hover:bg-brand-purple-10/30"
        }`}
    >
      <span className="flex items-center gap-2">
        <Icon name={icon} className="text-[20px]" />
        {label}
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-brand-purple-40" : "bg-secondary-grey/40"
          }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"
            }`}
        />
      </span>
    </button>
  );
}


function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-secondary-grey">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          className={`${inputCls} pl-3 pr-10`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-grey hover:text-brand-purple-50"
        >
          <Icon name={show ? "visibility_off" : "visibility"} className="text-[18px]" />
        </button>
      </div>
    </label>
  );
}


function validate(v: Values): string | null {
  const n = (s: string) => (s.trim() === "" ? NaN : Number(s));
  if (!v.fullName.trim()) return "Full name is required.";
  if (!/^\S+@\S+\.\S+$/.test(v.profileEmail)) return "Add a valid email address.";
  if (!v.phone.trim()) return "Phone number is required.";
  if (v.password || v.confirmPassword) {
    if (v.password.length < 8) return "Password must be at least 8 characters.";
    if (v.password !== v.confirmPassword) return "Passwords do not match.";
  }
  if (!v.facilityName.trim()) return "Facility name is required.";
  if (!(n(v.capacityT) > 0)) return "Capacity must be greater than 0.";
  if (v.produce.length === 0) return "Select at least one produce.";



  const [tMin, tMax, hMin, hMax] = [n(v.tempMin), n(v.tempMax), n(v.humMin), n(v.humMax)];
  if ([tMin, tMax, hMin, hMax].some(Number.isNaN)) return "Fill in all four thresholds.";
  if (tMin >= tMax) return "Temp min must be lower than temp max.";
  if (hMin >= hMax) return "Humidity min must be lower than humidity max.";
  if (hMin < 0 || hMax > 100) return "Humidity must be between 0 and 100.";

  if ((v.sms || v.whatsapp) && !v.alertPhone.trim()) return "Add a phone number for SMS / WhatsApp alerts.";
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.alertEmail)) return "Add a valid email for email alerts.";

  if (!(n(v.rate) > 0)) return "Tariff rate must be greater than 0.";
  return null;
}

export default function SettingsPage() {
  const [values, setValues] = useState<Values>(INITIAL);
  const [baseline, setBaseline] = useState<Values>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [options, setOptions] = useState(DEFAULT_PRODUCE);
  const [adding, setAdding] = useState(false);
  const [newProduce, setNewProduce] = useState("");

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline) || photoFile !== null;

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };


  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be PNG or JPG, max size 2MB.");
      return;
    }
    setError(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoFile(file);
    setSaved(false);
  };

  const toggleProduce = (name: string) =>
    set(
      "produce",
      values.produce.includes(name)
        ? values.produce.filter((p) => p !== name)
        : [...values.produce, name]
    );

  const addProduce = () => {
    const name = newProduce.trim();
    if (name) {
      const existing = options.find((o) => o.toLowerCase() === name.toLowerCase());
      const final = existing ?? name;
      if (!existing) setOptions((o) => [...o, final]);
      if (!values.produce.includes(final)) set("produce", [...values.produce, final]);
    }
    setNewProduce("");
    setAdding(false);
  };

  const handleDiscard = () => {
    setValues(baseline);
    setError(null);
    setSaved(false);
    if (photoUrl && photoFile) URL.revokeObjectURL(photoUrl);
    setPhotoFile(null);
    setPhotoUrl(null); // TODO: restore the stored avatar URL here
  };


  const handleSave = async () => {
    const err = validate(values);
    setError(err);
    if (err) return;
    setSaving(true);
    try {
      // TODO: supabase.auth.updateUser({ password }) when values.password is set
      // TODO: upload photoFile to supabase.storage, then save the URL on the profile
      // TODO: supabase.from("settings").upsert({ id: 1, ...mapped columns })
      await new Promise((r) => setTimeout(r, 400));
      const next = { ...values, password: "", confirmPassword: "" };
      setValues(next);
      setBaseline(next);
      setPhotoFile(null);
      setSaved(true);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex flex-col gap-6">
        <Header title="Settings" subtitle="Facility and system preferences" />
        <div className="flex gap-[var(--content-gap)]">
          <Sidebar items={adminNav} />
          <main className="flex flex-1 flex-col gap-4">
            <Section icon="person" title="Profile Information" description="Change profile information.">
              <div className="flex gap-6">
                <div className="flex w-40 shrink-0 flex-col items-center gap-2">
                  <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-brand-purple-40 bg-brand-purple-10 text-brand-purple-50">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="size-full object-cover" />
                    ) : (
                      <Icon name="person" className="text-[56px]" />
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={handlePhoto} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-lg bg-brand-purple-40 py-2 text-sm font-semibold text-white hover:bg-brand-purple-50"
                  >
                    Change photo
                  </button>
                  <span className="text-[10px] text-secondary-grey">PNG or JPG, max size 2MB</span>
                </div>

                <div className="grid flex-1 grid-cols-3 gap-4">
                  <Field label="Full name">
                    {(p) => <input className={`${inputCls} ${p}`} value={values.fullName} onChange={(e) => set("fullName", e.target.value)} />}
                  </Field>
                  <Field label="Email">
                   {(p) => <input type="email" className={`${inputCls} ${p}`} value={values.profileEmail} onChange={(e) => set("profileEmail", e.target.value)} />}
                  </Field>
                  <Field label="Phone number">
                    {(p) => <input type="tel" className={`${inputCls} ${p}`} value={values.phone} onChange={(e) => set("phone", e.target.value)} />}
                  </Field>
                  <div className="col-span-3">
                    <Field label="Address">
                      {(p) => <input className={`${inputCls} ${p}`} value={values.address} onChange={(e) => set("address", e.target.value)} />}
                    </Field>
                  </div>
                </div>
              </div>
            </Section>

            <Section icon="lock" title="Security" description="Change and update password. Leave blank to keep the current one.">
              <div className="grid grid-cols-2 gap-4">
                <PasswordField label="Password" value={values.password} onChange={(v) => set("password", v)} />
                <PasswordField label="Confirm password" value={values.confirmPassword} onChange={(v) => set("confirmPassword", v)} />
              </div>
            </Section>


            <Section icon="warehouse" title="Facility Information" description="Basic details about the cold room.">

              <div className="grid grid-cols-3 gap-4">
                <Field label="Facility name">
                  {(p) => (
                    <input className={`${inputCls} ${p}`} value={values.facilityName} onChange={(e) => set("facilityName", e.target.value)} placeholder="Facility name" />
                  )}
                </Field>
                <Field label="Location">
                  {(p) => (
                    <input className={`${inputCls} ${p}`} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Location" />
                  )}
                </Field>
                <Field label="Total Capacity (Tons)" hint="Powers the capacity bar on the dashboard.">
                  {(p) => (
                    <input min={0} className={`${inputCls} ${p}`} value={values.capacityT} onChange={(e) => set("capacityT", e.target.value)} />
                  )}
                </Field>
              </div>
            </Section>

            <Section icon="nutrition" title="Produce Information" description="What's being currently stored in the cold room.">
              <Field label="Produce name">
                {(p) => <input readOnly className={`${readOnlyCls} ${p}`} value={values.produce.join(", ")} />}
              </Field>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-secondary-grey">
                  Produce <span className="font-normal">select all that apply</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {options.map((o) => {
                    const on = values.produce.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleProduce(o)}
                        className={`rounded-md border px-3 py-1 text-xs transition ${on
                            ? "border-brand-purple-40 bg-brand-purple-40 text-white"
                            : "border-secondary-grey/40 text-brand-purple-50 hover:bg-brand-purple-10/30"
                          }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>

                {adding ? (
                  <input
                    autoFocus
                    value={newProduce}
                    onChange={(e) => setNewProduce(e.target.value)}
                    onBlur={addProduce}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addProduce();
                      if (e.key === "Escape") { setNewProduce(""); setAdding(false); }
                    }}
                    placeholder="Produce name, then press Enter"
                    className={`${inputCls} max-w-xs px-3`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="flex w-fit items-center gap-1 rounded-lg bg-brand-purple-40 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-purple-50"
                  >
                    <Icon name="add" className="text-[16px]" />
                    Add produce
                  </button>
                )}
              </div>
            </Section>



            <Section
              icon="device_thermostat"
              title="Alert thresholds"
              description="Readings outside these ranges raise an alert and show as a warning on Monitoring."
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                <Field label="Temp min" suffix="°C">
                  {(p) => <input className={`${inputCls} ${p}`} value={values.tempMin} onChange={(e) => set("tempMin", e.target.value)} />}
                </Field>
                <span className="mb-[18px] h-px w-4 bg-secondary-grey" />
                <Field label="Temp max" suffix="°C">
                  {(p) => <input className={`${inputCls} ${p}`} value={values.tempMax} onChange={(e) => set("tempMax", e.target.value)} />}
                </Field>
                <Field label="Humidity min" suffix="%">
                  {(p) => <input className={`${inputCls} ${p}`} value={values.humMin} onChange={(e) => set("humMin", e.target.value)} />}
                </Field>
                <span className="mb-[18px] h-px w-4 bg-secondary-grey" />
                <Field label="Humidity max" suffix="%">
                  {(p) => <input className={`${inputCls} ${p}`} value={values.humMax} onChange={(e) => set("humMax", e.target.value)} />}
                </Field>
              </div>
            </Section>

            <Section icon="notifications" title="Notifications" description="How admins are told about alerts.">
              <div className="grid grid-cols-3 gap-4">
                <Toggle label="SMS" icon="sms" checked={values.sms} onChange={(v) => set("sms", v)} />
                <Toggle label="WhatsApp" icon="chat" checked={values.whatsapp} onChange={(v) => set("whatsapp", v)} />
                <Toggle label="Email" icon="mail" checked={values.email} onChange={(v) => set("email", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Alert phone (SMS / WhatsApp)">
                  {(p) => (
                    <input className={`${inputCls} ${p}`} disabled={!values.sms && !values.whatsapp} value={values.alertPhone} onChange={(e) => set("alertPhone", e.target.value)} placeholder="080..." />
                  )}
                </Field>
                <Field label="Alert email">
                  {(p) => (
                    <input type="email" className={`${inputCls} ${p}`} disabled={!values.email} value={values.alertEmail} onChange={(e) => set("alertEmail", e.target.value)} placeholder="admin@example.com" />
                  )}
                </Field>
              </div>
            </Section>

            <Section icon="payments" title="Tariff" description="Used to calculate storage fees on the Payments page.">
              <div className="max-w-xs">
                <Field label="Rate per tonne per month" prefix="₦">
                  {(p) => (
                    <input min={0} className={`${inputCls} ${p}`} value={values.rate} onChange={(e) => set("rate", e.target.value)} placeholder="eg. 1500" />
                  )}
                </Field>
              </div>
            </Section>

            {/* Sticky save bar */}
            <div className="sticky bottom-4 flex items-center justify-end gap-4 rounded-xl border border-brand-purple-10 bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
              {error && <span className="text-sm text-accent-critical">{error}</span>}
              {saved && !error && (
                <span className="flex items-center gap-1 text-sm text-accent-success">
                  <Icon name="check_circle" className="text-[18px]" />
                  Saved
                </span>
              )}
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={handleDiscard}
                className="rounded-lg border border-brand-purple-40 bg-white px-8 py-3 text-sm font-medium text-brand-purple-50 hover:bg-brand-purple-10/40 disabled:opacity-50"
              >
                Discard changes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-lg bg-brand-purple-40 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-purple-50 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}