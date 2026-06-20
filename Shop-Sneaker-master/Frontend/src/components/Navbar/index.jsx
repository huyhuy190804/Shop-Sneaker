import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "@/services/api";
import {
  clearAuthSession,
  ensureValidAuthSession,
  getStoredToken,
} from "@/services/authSession";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [authToken, setAuthToken] = useState(() =>
    ensureValidAuthSession() ? getStoredToken() : "",
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const navItems = useMemo(
    () => [
      { label: "SHOP", to: "/shop-all" },
      {
        label: "NEW ARRIVALS",
        to: "/shop-all?collection=new-arrivals",
      },

      { label: "SALE", to: "/shop-all?collection=sale" },
    ],
    [],
  );

  const isNavItemActive = (to) => {
    const [pathname, search = ""] = to.split("?");
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;

    return location.pathname === pathname && currentSearch === search;
  };

  const isAuthenticated = Boolean(authToken);
  const isAdmin = currentUser?.role === "admin";
  const currentCollection = new URLSearchParams(location.search).get(
    "collection",
  );

  const isNavItemActive = (item) => {
    if (item.label === "COLLECTIONS") {
      return false;
    }

    const itemPath = item.path;
    const [pathname, search = ""] = itemPath.split("?");
    const itemCollection = new URLSearchParams(search).get("collection");

    return (
      location.pathname === pathname && currentCollection === itemCollection
    );
  };

  useEffect(() => {
    const syncAuthState = () => {
      const hasValidSession = ensureValidAuthSession();
      setAuthToken(hasValidSession ? getStoredToken() : "");
      try {
        setCurrentUser(
          hasValidSession
            ? JSON.parse(localStorage.getItem("user") || "null")
            : null,
        );
      } catch {
        setCurrentUser(null);
      }
    };

    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("auth-session-expired", syncAuthState);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("auth-session-expired", syncAuthState);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleWishlistClick = () => {
    if (!ensureValidAuthSession()) {
      navigate(`/login?redirect=${encodeURIComponent("/wishlist")}`);
    } else {
      navigate("/wishlist");
    }
  };

  const handleCartClick = () => {
    if (!ensureValidAuthSession()) {
      navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
    } else {
      navigate("/cart");
    }
  };
  const handleSearch = (event) => {
    event?.preventDefault();
    const keyword = searchTerm.trim();
    navigate(
      keyword ? `/shop-all?search=${encodeURIComponent(keyword)}` : "/shop-all",
    );
  };
  useEffect(() => {
    let cancelled = false;

    const getItemCount = (cart) => {
      const items = Array.isArray(cart?.items) ? cart.items : [];
      return items.reduce(
        (total, item) => total + Number(item?.quantity || 0),
        0,
      );
    };

    const loadCartCount = async () => {
      try {
        const data = await getCart();
        if (!cancelled) {
          setCartCount(getItemCount(data?.cart || data));
        }
      } catch {
        if (!cancelled) {
          setCartCount(0);
        }
      }
    };

    loadCartCount();

    const handleCartUpdated = () => {
      loadCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  const adminMenuItems = useMemo(
    () => [
      { label: "User Management", path: "/user-management", icon: Users },
      {
        label: "Order Management",
        path: "/order-management",
        icon: ShoppingBag,
      },
      {
        label: "Product Management",
        path: "/product-management",
        icon: Package,
      },
    ],
    [],
  );

  const userMenuItems = useMemo(
    () => [
      { label: "Profile", path: "/profile", icon: User },
      { label: "Order History", path: "/order-history", icon: ShoppingBag },
    ],
    [],
  );

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdminMenuOpen((value) => !value);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthToken("");
    setCurrentUser(null);
    setIsAdminMenuOpen(false);
    setCartCount(0);
    window.dispatchEvent(new Event("auth-changed"));
    window.dispatchEvent(new Event("cart-updated"));
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white flex items-center justify-between px-4 md:px-8 h-16 border-b">
      {/* Mobile Menu & Logo Container */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] flex flex-col gap-6 pt-12"
          >
            <div className="flex flex-col gap-4 text-sm font-bold tracking-wider">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`border-b pb-2 cursor-pointer ${
                    isNavItemActive(item.to)
                      ? "text-blue-600"
                      : "hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-black italic tracking-tighter cursor-pointer"
        >
          ShopSneaker
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8 text-[13px] font-bold text-gray-500 tracking-wider h-full absolute left-1/2 -translate-x-1/2">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative cursor-pointer h-full flex items-center transition-colors ${
                isActive ? "text-black" : "hover:text-black"
              }`}
            >
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="hidden lg:block relative">
          <Input
            type="text"
            placeholder="SEARCH"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-gray-100/80 border-none rounded-none text-xs font-semibold focus-visible:ring-0 focus-visible:bg-gray-200/80 h-9 pl-4 pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label="Search products"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        <Button
          onClick={handleSearch}
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full lg:hidden hidden md:flex"
        >
          <Search className="w-5 h-5" />
        </Button>
        <div className="relative" ref={menuRef}>
          <Button
            onClick={handleAccountClick}
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full"
            aria-haspopup="menu"
            aria-expanded={isAdminMenuOpen}
          >
            <User className="w-5 h-5" />
          </Button>

          {isAuthenticated && isAdminMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_40px_rgba(17,17,17,0.14)]">
              <div className="border-b border-black/5 px-4 py-4">
                <p className="text-[10px] font-black tracking-[1.4px] uppercase text-[#7b7266]">
                  {isAdmin ? "Admin Header" : "Account"}
                </p>
                <p className="mt-1 text-sm font-bold text-black">
                  {currentUser?.name || currentUser?.email || "Signed in user"}
                </p>
                <p className="mt-1 text-xs text-[#7b7266]">
                  {isAdmin
                    ? "Manage catalog, users and orders."
                    : "Access your account options."}
                </p>
              </div>

              <div className="p-2">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsAdminMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#222] transition-colors hover:bg-[#f7f3eb]"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#9b9184]" />
                    </Link>
                  );
                })}

                {isAdmin && <div className="my-2 border-t border-black/5" />}

                {isAdmin &&
                  adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsAdminMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#222] transition-colors hover:bg-[#f7f3eb]"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#9b9184]" />
                      </Link>
                    );
                  })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#9b1c1c] transition-colors hover:bg-[#fff1f1]"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* <Button
          // onClick={handleLogin}
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full"
        >
          <User className="w-5 h-5" />
        </Button> */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full"
          onClick={handleWishlistClick}
        >
          <Heart className="w-5 h-5" />
        </Button> */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full relative"
          onClick={handleCartClick}
        >
          <ShoppingCart className="w-5 h-5" />
          <Badge className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] bg-[#1a447c] hover:bg-[#1a447c] rounded-full text-white">
            2
          </Badge>
        </Button> */}
        <Button
          onClick={handleWishlistClick}
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleCartClick}
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full relative"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] bg-[#1a447c] hover:bg-[#1a447c] rounded-full text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}
