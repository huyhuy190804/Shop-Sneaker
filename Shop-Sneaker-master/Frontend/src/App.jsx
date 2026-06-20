import HomePage from "./page/home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserManagement from "./page/userManagement/index.jsx";
import ShopAll from "./page/shopAll";
import Login from "./page/login";
import CartPage from "./page/cart";
import OrderManagement from "./page/orderManagement/index.jsx";
import ProductManagementPage from "./page/product/index.jsx";
import ProductDetailsPage from "./page/productDetails/index.jsx";
import StorefrontLayout from "./components/StorefrontLayout.jsx";
import WishlistPage from "./page/wishlist/index.jsx";
import ProfilePage from "./page/profile/index.jsx";
import OrderHistoryPage from "./page/orderHistory/index.jsx";
import CheckoutPage from "./page/checkout/index.jsx";
import OrderSuccessPage from "./page/orderSuccess/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route
              path="/product-management"
              element={<ProductManagementPage />}
            />
          </Route>
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop-all" element={<ShopAll />} />
            <Route path="/product-details" element={<ProductDetailsPage />} />
            <Route
              path="/product-details/:id"
              element={<ProductDetailsPage />}
            />
            <Route path="/project-details" element={<ProductDetailsPage />} />
            <Route
              path="/project-details/:id"
              element={<ProductDetailsPage />}
            />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
