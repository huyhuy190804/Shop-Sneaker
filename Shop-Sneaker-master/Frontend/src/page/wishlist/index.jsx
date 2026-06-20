import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Heart, Loader2, Sparkles, X } from "lucide-react";
import { getWishlist, removeFromWishlist } from "@/services/api";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getProductId = (item) => String(item?._id || item?.productId || "");

const WishlistPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const profile = await getWishlist();
        if (mounted) {
          setWishlist(Array.isArray(profile?.wishlist) ? profile.wishlist : []);
        }
      } catch (err) {
        if (mounted) {
          setWishlist([]);
          setError(err.message || "Không thể tải danh sách yêu thích");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const itemCount = useMemo(() => wishlist.length, [wishlist]);

  const handleRemove = async (productId) => {
    const id = String(productId);
    setSubmittingId(id);
    setError("");
    setMessage("");

    try {
      await removeFromWishlist({ productId: id });
      setWishlist((current) => current.filter((item) => getProductId(item) !== id));
      setMessage("Đã xóa khỏi danh sách yêu thích");
    } catch (err) {
      setError(err.message || "Không thể xóa khỏi wishlist");
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-black/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải wishlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-black">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-x-0 top-0 h-[340px] bg-[linear-gradient(180deg,rgba(0,0,0,0.08),transparent)]" />
        <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[11px] font-black tracking-[1.5px] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Your vault
          </div>
        </div>

        <header className="mb-8 md:mb-10">
          <p className="text-[10px] font-black tracking-[0.45em] uppercase text-black/45 mb-2">
            Archived performance pieces [{itemCount.toString().padStart(2, "0")} items]
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-[-0.05em]">
            YOUR VAULT
          </h1>
          <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.35em] text-black/45">
            Saved products linked to your `project-details` pages
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {!wishlist.length ? (
          <div className="rounded-[32px] border border-dashed border-black/10 bg-white/70 p-10 text-center shadow-sm">
            <Heart className="mx-auto h-12 w-12 text-black/30" />
            <h2 className="mt-4 text-2xl font-black">Wishlist trống</h2>
            <p className="mt-2 text-sm text-black/60">
              Hãy thêm vài sản phẩm yêu thích từ trang sản phẩm.
            </p>
            <Link
              to="/shop-all"
              className="mt-6 inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] !text-white"
            >
              Go shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((item) => {
              const id = getProductId(item);
              const image = item.productImages?.[0] || item.image || "https://via.placeholder.com/600x800";
              const price = item.salePrice || item.basePrice || 0;

              return (
                <article
                  key={id}
                  className="group relative overflow-hidden border border-black/10 bg-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <Link to={`/project-details/${id}`} className="block h-full w-full">
                      <img
                        src={image}
                        alt={item.name || "Wishlist product"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(id)}
                      disabled={submittingId === id}
                      className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-white/80 text-black shadow-sm backdrop-blur hover:bg-white disabled:opacity-60"
                      aria-label="Remove from wishlist"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <Link
                      to={`/project-details/${id}`}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black backdrop-blur"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-2 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">
                      {item.brand?.name || item.category?.name || "Kinetic"}
                    </p>
                    <Link
                      to={`/project-details/${id}`}
                      className="block text-xl font-black uppercase leading-[0.95] tracking-[-0.05em] hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-black/55">{money(price)}</p>
                  </div>

                  <Link
                    to={`/project-details/${id}`}
                    className="block border-t border-black/10 bg-black px-4 py-4 text-center text-[11px] font-black uppercase tracking-[0.3em] !text-white transition-colors hover:bg-black/90"
                  >
                    View details
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
