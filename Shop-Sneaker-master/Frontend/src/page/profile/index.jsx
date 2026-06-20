import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldUser,
  Trash2,
  UserRound,
} from "lucide-react";
import { getUserProfile, updateUserProfile } from "@/services/api";

const emptyAddress = () => ({
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  isDefault: false,
});

const normalizeAddresses = (addresses = []) => {
  const list = Array.isArray(addresses) ? addresses : [];
  if (!list.length) return [emptyAddress()];

  return list.map((address) => ({
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    zipCode: address?.zipCode || "",
    country: address?.country || "",
    isDefault: Boolean(address?.isDefault),
  }));
};

const buildFormFromProfile = (profile) => ({
  name: profile?.name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  shippingAddresses: normalizeAddresses(profile?.shippingAddresses),
});

const formatAddressLine = (address) => {
  if (!address) return "N/A";

  return [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(", ") || "N/A";
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(buildFormFromProfile(null));

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const data = await getUserProfile();
        if (!mounted) return;

        setProfile(data || null);
        setForm(buildFormFromProfile(data));
      } catch (err) {
        if (mounted) setError(err.message || "Không thể tải hồ sơ");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const addresses = useMemo(() => form.shippingAddresses || [], [form.shippingAddresses]);
  const savedAddressesCount = Array.isArray(profile?.shippingAddresses) ? profile.shippingAddresses.length : 0;
  const previewAddress =
    addresses.find((address) => address.isDefault) ||
    addresses.find((address) => [address.street, address.city, address.state, address.zipCode, address.country].some(Boolean)) ||
    null;

  const updateAddress = (index, field, value) => {
    setForm((current) => ({
      ...current,
      shippingAddresses: current.shippingAddresses.map((address, addressIndex) =>
        addressIndex === index ? { ...address, [field]: value } : address,
      ),
    }));
  };

  const addAddress = () => {
    setForm((current) => ({
      ...current,
      shippingAddresses: [...current.shippingAddresses, emptyAddress()],
    }));
  };

  const removeAddress = (index) => {
    setForm((current) => {
      const next = current.shippingAddresses.filter((_, addressIndex) => addressIndex !== index);
      return {
        ...current,
        shippingAddresses: next.length ? next : [emptyAddress()],
      };
    });
  };

  const resetForm = () => {
    setError("");
    setSuccess("");
    setForm(buildFormFromProfile(profile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const cleanedAddresses = form.shippingAddresses
        .map((address) => ({
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          zipCode: address.zipCode.trim(),
          country: address.country.trim(),
          isDefault: Boolean(address.isDefault),
        }))
        .filter((address) =>
          address.street || address.city || address.state || address.zipCode || address.country,
        );

      const updated = await updateUserProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shippingAddresses: cleanedAddresses,
      });

      const nextProfile = updated || profile;
      setProfile(nextProfile);
      setForm(buildFormFromProfile(nextProfile));
      setSuccess("Profile updated successfully");

      try {
        localStorage.setItem("user", JSON.stringify(nextProfile));
      } catch {
        // Ignore storage errors and keep the server response as source of truth.
      }

      window.dispatchEvent(new Event("auth-changed"));
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-black/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-black">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="mt-8 mb-8">
          <p className="text-[10px] font-black tracking-[0.45em] uppercase text-black/45 mb-2">
            Account profile
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-[-0.05em]">
            EDIT PROFILE
          </h1>
          <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.35em] text-black/45">
            Update your account information and shipping addresses from one place.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                  Primary account
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                  {form.name || form.email || "Signed in user"}
                </h2>
                <p className="mt-1 text-sm text-black/55">
                  {profile?.role === "admin" ? "Administrator" : "Customer account"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#faf7f1] p-3">
                <UserRound className="h-6 w-6 text-black" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="rounded-2xl bg-[#faf7f1] p-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">
                  <UserRound className="h-4 w-4 text-black" />
                  Name
                </div>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-[14px] font-semibold outline-none"
                  placeholder="Your name"
                />
              </label>

              <label className="rounded-2xl bg-[#faf7f1] p-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">
                  <Mail className="h-4 w-4 text-black" />
                  Email
                </div>
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-[14px] font-semibold outline-none"
                  placeholder="you@example.com"
                  type="email"
                />
              </label>

              <label className="rounded-2xl bg-[#faf7f1] p-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">
                  <Phone className="h-4 w-4 text-black" />
                  Phone
                </div>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full bg-transparent text-[14px] font-semibold outline-none"
                  placeholder="Phone number"
                />
              </label>

              <div className="rounded-2xl bg-[#faf7f1] p-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">
                  <ShieldUser className="h-4 w-4 text-black" />
                  Role
                </div>
                <p className="mt-2 text-[14px] font-semibold uppercase">{profile?.role || "user"}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                    Shipping addresses
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    Save one or more delivery addresses for checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addAddress}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-[#faf7f1]"
                >
                  <Plus className="h-4 w-4" />
                  Add address
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {addresses.map((address, index) => (
                  <div key={`address-${index}`} className="rounded-3xl border border-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                        {address.isDefault
                          ? "Default address"
                          : [address.street, address.city].filter(Boolean).join(", ") || "Address"}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#9b1c1c] hover:bg-[#fff1f1]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        value={address.street}
                        onChange={(event) => updateAddress(index, "street", event.target.value)}
                        className="rounded-2xl border border-black/10 bg-[#faf7f1] px-4 py-3 text-sm outline-none"
                        placeholder="Street"
                      />
                      <input
                        value={address.city}
                        onChange={(event) => updateAddress(index, "city", event.target.value)}
                        className="rounded-2xl border border-black/10 bg-[#faf7f1] px-4 py-3 text-sm outline-none"
                        placeholder="City"
                      />
                      <input
                        value={address.state}
                        onChange={(event) => updateAddress(index, "state", event.target.value)}
                        className="rounded-2xl border border-black/10 bg-[#faf7f1] px-4 py-3 text-sm outline-none"
                        placeholder="State"
                      />
                      <input
                        value={address.zipCode}
                        onChange={(event) => updateAddress(index, "zipCode", event.target.value)}
                        className="rounded-2xl border border-black/10 bg-[#faf7f1] px-4 py-3 text-sm outline-none"
                        placeholder="Zip code"
                      />
                      <input
                        value={address.country}
                        onChange={(event) => updateAddress(index, "country", event.target.value)}
                        className="rounded-2xl border border-black/10 bg-[#faf7f1] px-4 py-3 text-sm outline-none md:col-span-2"
                        placeholder="Country"
                      />
                    </div>

                    <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#444]">
                      <input
                        type="checkbox"
                        checked={Boolean(address.isDefault)}
                        onChange={(event) => updateAddress(index, "isDefault", event.target.checked)}
                        className="h-4 w-4 rounded border-black/20"
                      />
                      Set as default address
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] !text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save profile
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-black hover:bg-[#faf7f1]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">Navigation</p>
              <div className="mt-4 space-y-3">
                <Link
                  to="/order-history"
                  className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold hover:bg-[#faf7f1]"
                >
                  <span>Order history</span>
                  <span className="text-black/40">View</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold hover:bg-[#faf7f1]"
                >
                  <span>Wishlist</span>
                  <span className="text-black/40">View</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-sm font-semibold hover:bg-[#faf7f1]"
                >
                  <span>Cart</span>
                  <span className="text-black/40">View</span>
                </Link>
              </div>
            </section>

            <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">Preview</p>
              <div className="mt-4 rounded-3xl bg-black p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <UserRound className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[1.5px] uppercase text-white/55">
                      Signed in user
                    </p>
                    <h3 className="mt-1 text-xl font-black">{form.name || form.email || "N/A"}</h3>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-white/75">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </span>
                    <span className="font-semibold text-white">{form.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </span>
                    <span className="font-semibold text-white">{form.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </span>
                    <span className="max-w-[68%] truncate text-right font-semibold text-white">
                      {formatAddressLine(previewAddress)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-black/55">
                Changes will be saved to your profile and synced to the app menu immediately.
              </p>
            </section>

            <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">Saved data</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#faf7f1] p-4">
                  <div className="text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">Role</div>
                  <div className="mt-2 text-sm font-semibold uppercase">{profile?.role || "user"}</div>
                </div>
                <div className="rounded-2xl bg-[#faf7f1] p-4">
                  <div className="text-[10px] font-black uppercase tracking-[1px] text-[#7b7266]">
                    Saved addresses
                  </div>
                  <div className="mt-2 text-sm font-semibold">{savedAddressesCount}</div>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
