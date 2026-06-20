### I. Mô hình Dữ liệu (Database Models)

### 1. User Model

- **Chức năng chính:** Quản lý thông tin người dùng, xác thực, phân quyền.
- **Fields:**
    - _id: ObjectId (ID tự động)
    - name: String, required
    - email: String, required, unique
    - password: String, required (hashed)
    - role: Enum ['user', 'admin'], default: 'user'
    - shippingAddresses: Array of Objects (Có thể là Sub-document hoặc riêng biệt)
        - street: String
        - city: String
        - state: String
        - zipCode: String
        - country: String
        - isDefault: Boolean
    - phone: String
    - wishlist: Array of ObjectId (references Product)
    - createdAt: Date, default: Date.now
    - updatedAt: Date

### 2. Category Model

- **Chức năng chính:** Phân loại sản phẩm.
- **Fields:**
    - _id: ObjectId
    - name: String, required, unique
    - slug: String, unique (tự động tạo từ name, dùng cho URL thân thiện)
    - description: String
    - imageUrl: String (ảnh đại diện danh mục)
    - parentCategory: ObjectId (references Category, cho danh mục con)
    - createdAt: Date
    - updatedAt: Date

### 3. Brand Model

- **Chức năng chính:** Quản lý thông tin thương hiệu.
- **Fields:**
    - _id: ObjectId
    - name: String, required, unique
    - slug: String, unique
    - logoUrl: String
    - description: String
    - createdAt: Date
    - updatedAt: Date

### 4. Product Model

- **Chức năng chính:** Thông tin chung về sản phẩm (tên, mô tả, giá). Các thuộc tính biến thể (size, màu, tồn kho) sẽ được quản lý bởi Variant Model.
- **Fields:**
    - _id: ObjectId
    - name: String, required
    - slug: String, unique
    - description: String, required
    - brand: ObjectId, required (references Brand)
    - category: ObjectId, required (references Category)
    - basePrice: Number, required
    - salePrice: Number (optional, nếu có giảm giá)
    - productImages: Array of String (URLs ảnh chung cho sản phẩm)
    - skuPrefix: String (ví dụ: "AD001", dùng để tạo SKU biến thể)
    - averageRating: Number, default: 0
    - numReviews: Number, default: 0
    - isFeatured: Boolean, default: false
    - status: Enum ['active', 'inactive', 'draft'], default: 'draft'
    - createdAt: Date
    - updatedAt: Date

### 5. Variant Model

- **Chức năng chính:** Quản lý các biến thể của sản phẩm (màu, size, tồn kho, SKU cụ thể).
- **Fields:**
    - _id: ObjectId
    - productId: ObjectId, required (references Product)
    - color: String, required
    - size: String, required
    - sku: String, required, unique (ví dụ: "AD001-RED-42")
    - stock: Number, required, default: 0
    - variantImages: Array of String (URLs ảnh riêng cho biến thể màu đó)
    - createdAt: Date
    - updatedAt: Date

### 6. Review Model

- **Chức năng chính:** Đánh giá và bình luận sản phẩm.
- **Fields:**
    - _id: ObjectId
    - userId: ObjectId, required (references User)
    - productId: ObjectId, required (references Product)
    - rating: Number, required (1-5 sao)
    - comment: String
    - status: Enum ['pending', 'approved', 'rejected'], default: 'pending'
    - createdAt: Date
    - updatedAt: Date

### 7. Cart Model (hoặc quản lý giỏ hàng trong Session/Local Storage và đồng bộ với DB khi đăng nhập)

- **Chức năng chính:** Lưu trữ các sản phẩm trong giỏ hàng của người dùng.
- **Fields:**
    - _id: ObjectId
    - userId: ObjectId, required (references User)
    - items: Array of Objects
        - productId: ObjectId, required (references Product)
        - variantId: ObjectId, required (references Variant)
        - quantity: Number, required, default: 1
        - price: Number (Giá tại thời điểm thêm vào giỏ)
    - couponCode: String (Nếu áp dụng mã giảm giá)
    - totalPrice: Number, default: 0 (Tính toán lại khi có sự thay đổi)
    - createdAt: Date
    - updatedAt: Date

### 8. Order Model

- **Chức năng chính:** Lưu trữ thông tin đơn hàng của khách hàng.
- **Fields:**
    - _id: ObjectId
    - userId: ObjectId, required (references User)
    - orderItems: Array of Objects
        - productId: ObjectId
        - variantId: ObjectId
        - name: String
        - color: String
        - size: String
        - quantity: Number
        - price: Number
        - imageUrl: String
    - shippingAddress: Object (street, city, state, zipCode, country)
    - shippingMethod: String
    - paymentMethod: String (COD, VNPAY...)
    - paymentResult: Object (từ cổng thanh toán: id, status, update_time, email_address)
    - taxPrice: Number
    - shippingPrice: Number
    - totalPrice: Number, required
    - isPaid: Boolean, default: false
    - paidAt: Date
    - isDelivered: Boolean, default: false
    - deliveredAt: Date
    - orderStatus: Enum ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending'
    - createdAt: Date
    - updatedAt: Date

### 9. Coupon Model

- **Chức năng chính:** Quản lý mã giảm giá.
- **Fields:**
    - _id: ObjectId
    - code: String, required, unique
    - discountType: Enum ['percentage', 'fixed'], required
    - value: Number, required (ví dụ: 10% hoặc 50000 VNĐ)
    - minOrderAmount: Number, default: 0
    - maxDiscountAmount: Number (Tùy chọn, giới hạn giảm giá tối đa cho percentage)
    - usageLimit: Number (Tổng số lần có thể sử dụng mã)
    - usedCount: Number, default: 0
    - validFrom: Date, required
    - validUntil: Date, required
    - isActive: Boolean, default: true
    - appliesTo: Enum ['all', 'categories', 'products'], default: 'all'
    - categoryIds: Array of ObjectId (nếu appliesTo là 'categories')
    - productIds: Array of ObjectId (nếu appliesTo là 'products')
    - createdAt: Date
    - updatedAt: Date

### II. API Routes (Backend - Node.js/Express.js) & Chức năng

**Ghi chú:**

- [PROTECTED]: Yêu cầu người dùng phải đăng nhập (có JWT hợp lệ).
- [ADMIN ONLY]: Yêu cầu người dùng phải có vai trò 'admin' và đăng nhập.

### 1. Auth & User Routes (/api/auth, /api/users)

- **POST /api/auth/register**: Đăng ký người dùng mới.
    - **Body:** name, email, password.
    - **Function:** registerUser
- **POST /api/auth/login**: Đăng nhập người dùng.
    - **Body:** email, password.
    - **Function:** loginUser
- **POST /api/auth/logout**: Đăng xuất người dùng.
    - **Function:** logoutUser (xóa cookie JWT)
- **GET /api/users/profile [PROTECTED]**: Lấy thông tin hồ sơ người dùng hiện tại.
    - **Function:** getUserProfile
- **PUT /api/users/profile [PROTECTED]**: Cập nhật thông tin hồ sơ người dùng.
    - **Body:** name, email, phone, shippingAddresses.
    - **Function:** updateUserProfile
- **GET /api/users [ADMIN ONLY]**: Lấy danh sách tất cả người dùng.
    - **Function:** getAllUsers
- **GET /api/users/:id [ADMIN ONLY]**: Lấy thông tin người dùng theo ID.
    - **Function:** getUserById
- **PUT /api/users/:id [ADMIN ONLY]**: Cập nhật thông tin/vai trò người dùng theo ID.
    - **Body:** name, email, role.
    - **Function:** updateUserById
- **DELETE /api/users/:id [ADMIN ONLY]**: Xóa người dùng.
    - **Function:** deleteUser

### 2. Category Routes (/api/categories)

- **GET /api/categories**: Lấy tất cả danh mục (có thể có query parentCategory).
    - **Function:** getAllCategories
- **GET /api/categories/:id**: Lấy chi tiết danh mục theo ID.
    - **Function:** getCategoryById
- **POST /api/categories [ADMIN ONLY]**: Tạo danh mục mới.
    - **Body:** name, description, imageUrl, parentCategory.
    - **Function:** createCategory
- **PUT /api/categories/:id [ADMIN ONLY]**: Cập nhật danh mục.
    - **Body:** name, description, imageUrl, parentCategory.
    - **Function:** updateCategory
- **DELETE /api/categories/:id [ADMIN ONLY]**: Xóa danh mục.
    - **Function:** deleteCategory

### 3. Brand Routes (/api/brands)

- **GET /api/brands**: Lấy tất cả thương hiệu.
    - **Function:** getAllBrands
- **GET /api/brands/:id**: Lấy chi tiết thương hiệu theo ID.
    - **Function:** getBrandById
- **POST /api/brands [ADMIN ONLY]**: Tạo thương hiệu mới.
    - **Body:** name, description, logoUrl.
    - **Function:** createBrand
- **PUT /api/brands/:id [ADMIN ONLY]**: Cập nhật thương hiệu.
    - **Body:** name, description, logoUrl.
    - **Function:** updateBrand
- **DELETE /api/brands/:id [ADMIN ONLY]**: Xóa thương hiệu.
    - **Function:** deleteBrand

### 4. Product & Variant Routes (/api/products)

- **GET /api/products**: Lấy tất cả sản phẩm (có thể có query category, brand, search, minPrice, maxPrice, sort, page, limit).
    - **Function:** getAllProducts
- **GET /api/products/:id**: Lấy chi tiết sản phẩm theo ID (bao gồm tất cả variants).
    - **Function:** getProductById
- **POST /api/products [ADMIN ONLY]**: Tạo sản phẩm mới.
    - **Body:** name, description, brand, category, basePrice, salePrice, productImages, skuPrefix, isFeatured, status.
    - **Function:** createProduct
- **PUT /api/products/:id [ADMIN ONLY]**: Cập nhật sản phẩm.
    - **Body:** name, description, brand, category, basePrice, salePrice, productImages, skuPrefix, isFeatured, status.
    - **Function:** updateProduct
- **DELETE /api/products/:id [ADMIN ONLY]**: Xóa sản phẩm (bao gồm cả variants liên quan).
    - **Function:** deleteProduct
- **POST /api/products/:productId/variants [ADMIN ONLY]**: Thêm biến thể cho sản phẩm.
    - **Body:** color, size, sku, stock, variantImages.
    - **Function:** createVariant
- **PUT /api/products/:productId/variants/:variantId [ADMIN ONLY]**: Cập nhật biến thể.
    - **Body:** color, size, sku, stock, variantImages.
    - **Function:** updateVariant
- **DELETE /api/products/:productId/variants/:variantId [ADMIN ONLY]**: Xóa biến thể.
    - **Function:** deleteVariant
- **GET /api/products/top-selling**: Lấy các sản phẩm bán chạy nhất.
    - **Function:** getTopSellingProducts

### 5. Review Routes (/api/reviews)

- **GET /api/reviews/:productId**: Lấy tất cả đánh giá cho một sản phẩm.
    - **Function:** getReviewsForProduct
- **POST /api/reviews/:productId [PROTECTED]**: Tạo đánh giá mới cho sản phẩm (chỉ người dùng đã mua mới được đánh giá - logic cần check).
    - **Body:** rating, comment.
    - **Function:** createReview
- **PUT /api/reviews/:id [PROTECTED]**: Cập nhật đánh giá của mình.
    - **Body:** rating, comment.
    - **Function:** updateReview
- **DELETE /api/reviews/:id [PROTECTED]**: Xóa đánh giá của mình.
    - **Function:** deleteReview
- **GET /api/admin/reviews [ADMIN ONLY]**: Lấy tất cả đánh giá để kiểm duyệt.
    - **Function:** getAllReviewsAdmin
- **PUT /api/admin/reviews/:id/status [ADMIN ONLY]**: Cập nhật trạng thái đánh giá (pending, approved, rejected).
    - **Body:** status.
    - **Function:** updateReviewStatus

### 6. Cart Routes (/api/cart)

- **GET /api/cart [PROTECTED]**: Lấy giỏ hàng của người dùng hiện tại.
    - **Function:** getCart
- **POST /api/cart/add [PROTECTED]**: Thêm sản phẩm vào giỏ hàng.
    - **Body:** productId, variantId, quantity.
    - **Function:** addToCart
- **PUT /api/cart/update [PROTECTED]**: Cập nhật số lượng sản phẩm trong giỏ.
    - **Body:** productId, variantId, quantity.
    - **Function:** updateCartItemQuantity
- **DELETE /api/cart/remove/:productId/:variantId [PROTECTED]**: Xóa sản phẩm khỏi giỏ hàng.
    - **Function:** removeCartItem
- **POST /api/cart/apply-coupon [PROTECTED]**: Áp dụng mã giảm giá vào giỏ hàng.
    - **Body:** couponCode.
    - **Function:** applyCouponToCart

### 7. Order Routes (/api/orders)

- **POST /api/orders [PROTECTED]**: Tạo đơn hàng mới từ giỏ hàng.
    - **Body:** shippingAddress, shippingMethod, paymentMethod, couponCode (nếu có).
    - **Function:** createOrder
- **GET /api/orders [PROTECTED]**: Lấy danh sách đơn hàng của người dùng hiện tại.
    - **Function:** getUserOrders
- **GET /api/orders/:id [PROTECTED]**: Lấy chi tiết đơn hàng theo ID.
    - **Function:** getOrderById
- **GET /api/admin/orders [ADMIN ONLY]**: Lấy tất cả đơn hàng.
    - **Function:** getAllOrdersAdmin
- **PUT /api/admin/orders/:id/status [ADMIN ONLY]**: Cập nhật trạng thái đơn hàng (Pending, Processing...).
    - **Body:** orderStatus.
    - **Function:** updateOrderStatus
- **PUT /api/orders/:id/pay [PROTECTED]**: Cập nhật trạng thái thanh toán (dành cho cổng thanh toán).
    - **Body:** paymentResult (id, status...).
    - **Function:** updateOrderToPaid

### 8. Coupon Routes (/api/coupons)

- **GET /api/coupons [ADMIN ONLY]**: Lấy tất cả mã giảm giá.
    - **Function:** getAllCoupons
- **POST /api/coupons [ADMIN ONLY]**: Tạo mã giảm giá mới.
    - **Body:** code, discountType, value, minOrderAmount, usageLimit, validFrom, validUntil, appliesTo, categoryIds, productIds.
    - **Function:** createCoupon
- **PUT /api/coupons/:id [ADMIN ONLY]**: Cập nhật mã giảm giá.
    - **Body:** code, discountType, value, minOrderAmount, usageLimit, validFrom, validUntil, isActive, appliesTo, categoryIds, productIds.
    - **Function:** updateCoupon
- **DELETE /api/coupons/:id [ADMIN ONLY]**: Xóa mã giảm giá.
    - **Function:** deleteCoupon

### 9. Upload Routes (/api/uploads)

- **POST /api/uploads/product-image [ADMIN ONLY]**: Tải lên hình ảnh sản phẩm.
    - **Body:** file (multipart/form-data).
    - **Function:** uploadProductImage (trả về URL của ảnh)
- **POST /api/uploads/brand-logo [ADMIN ONLY]**: Tải lên logo thương hiệu.
    - **Body:** file.
    - **Function:** uploadBrandLogo

### 10. Dashboard Routes (/api/admin/dashboard)

- **GET /api/admin/dashboard/summary [ADMIN ONLY]**: Lấy dữ liệu tổng quan cho dashboard (doanh thu, đơn hàng, sản phẩm bán chạy).
    - **Function:** getDashboardSummary