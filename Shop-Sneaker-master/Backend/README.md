# Backend API README

Tài liệu này được cập nhật vào ngày `2026-05-08` với Firebase Authentication.

## Tổng quan

- Entry point: [src/server.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/server.js:1)
- Base URL local: `http://localhost:3001`
- API prefix:
  - `/api/auth` - Authentication routes (Firebase)
  - `/api/categories`
  - `/api/brands`
  - `/api/products`
  - `/api/cart`
  - `/api/reviews`
  - `/api/admin/reviews`
  - `/api/users`
  - `/api/orders`

## Authentication

### Firebase Authentication

Backend sử dụng **Firebase Admin SDK** để xác thực Firebase ID tokens từ frontend.

Config file: [src/config/firebase.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/config/firebase.js:1)

**Environment Variables Required:**

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
# hoặc
FIREBASE_PROJECT_ID=your-project-id
```

**Flow đăng nhập:**

1. Frontend đăng nhập qua Firebase Auth (Google Sign-In)
2. Frontend nhận Firebase ID Token
3. Frontend gửi ID Token đến `/api/auth/google`
4. Backend verify ID Token bằng Firebase Admin SDK
5. Backend tạo user (nếu chưa có) và trả về JWT token
6. Frontend lưu JWT token và dùng cho các request tiếp theo

### JWT Middleware

Middleware auth nằm ở [src/middleware/authMiddleware.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/middleware/authMiddleware.js:1).

- `authenticateUser` là default export, nên một số route import alias là `auth`.
- `authenticateUser` và `authenticateAdmin` verify JWT token được tạo bởi backend.
- `authorizeAdmin` kiểm tra role của user.
- Header đang dùng:

```http
Authorization: Bearer <jwt_token>
```

## Health Check

### `GET /`

Response:

```json
{
  "message": "Server is running"
}
```

## Authentication Routes

Route file: [src/routes/authRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/authRoutes.js:1)
Controller: [src/controllers/authController.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/controllers/authController.js:1)

### `POST /api/auth/google`

Xác thực Firebase ID token và tạo/cập nhật user, trả về JWT token.

Body:

```json
{
  "idToken": "firebase_id_token_here"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Firebase login successful",
  "accessToken": "jwt_token",
  "token": "jwt_token",
  "user": {
    "_id": "userId",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "googleId": "firebase_uid",
    "avatar": "https://...",
    "authProvider": "google",
    "lastLoginAt": "date"
  }
}
```

Response `400`:

```json
{
  "success": false,
  "message": "Firebase ID token is required"
}
```

Response `401` (các trường hợp lỗi Firebase):

```json
{
  "success": false,
  "message": "Firebase Admin is not initialized. Please check your Firebase configuration."
}
```

hoặc:

```json
{
  "success": false,
  "message": "Firebase token has expired"
}
```

hoặc:

```json
{
  "success": false,
  "message": "Invalid Firebase token format"
}
```

hoặc:

```json
{
  "success": false,
  "message": "Email is not verified in Firebase"
}
```

### `GET /api/auth/google-config`

Trả về Google Client ID (legacy endpoint, không cần thiết với Firebase flow).

Response `200`:

```json
{
  "success": true,
  "googleClientId": "client_id_here"
}
```

### `GET /api/auth/me`

Auth required. Lấy thông tin user hiện tại từ JWT token.

Response `200`:

```json
{
  "success": true,
  "user": {
    "_id": "userId",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "googleId": "firebase_uid",
    "avatar": "https://...",
    "authProvider": "google"
  }
}
```

### `POST /api/auth/logout`

Auth required. Logout user (client-side xóa token).

Response `200`:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Categories

Route file: [src/routes/categoryRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/categoryRoutes.js:1)

### `GET /api/categories`

Query:

```json
{
  "type": "tree"
}
```

- `type=tree`: trả về cây category lồng nhau
- không truyền `type`: trả về mảng category thường

Response `200`:

```json
{
  "success": true,
  "message": "Get all categories successfully",
  "data": [
    {
      "_id": "categoryId",
      "name": "Sneakers",
      "slug": "sneakers",
      "description": "string",
      "imageUrl": "string",
      "parentCategory": {
        "_id": "parentId",
        "name": "Shoes",
        "slug": "shoes"
      }
    }
  ]
}
```

Response `200` khi `type=tree`:

```json
{
  "success": true,
  "message": "Get all categories successfully",
  "data": [
    {
      "_id": "categoryId",
      "name": "Sneakers",
      "slug": "sneakers",
      "description": "string",
      "imageUrl": "string",
      "children": []
    }
  ]
}
```

Response `500`:

```json
{
  "success": false,
  "message": "Error getting categories",
  "error": "error message"
}
```

### `GET /api/categories/:id`

Params:

```json
{
  "id": "categoryId"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Get category successfully",
  "data": {
    "_id": "categoryId",
    "name": "Sneakers",
    "slug": "sneakers",
    "description": "string",
    "imageUrl": "string",
    "parentCategory": {
      "_id": "parentId",
      "name": "Shoes",
      "slug": "shoes"
    }
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

### `POST /api/categories`

Body:

```json
{
  "name": "Sneakers",
  "slug": "sneakers",
  "description": "string",
  "imageUrl": "string",
  "parentCategory": "parentCategoryId"
}
```

- bắt buộc: `name`, `slug`

Response `201`:

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "categoryId",
    "name": "Sneakers",
    "slug": "sneakers",
    "description": "string",
    "imageUrl": "string",
    "parentCategory": {
      "_id": "parentId",
      "name": "Shoes",
      "slug": "shoes"
    }
  }
}
```

Response `400`:

```json
{
  "success": false,
  "message": "Name and slug are required"
}
```

hoặc:

```json
{
  "success": false,
  "message": "Category with this name or slug already exists"
}
```

hoặc:

```json
{
  "success": false,
  "message": "Parent category not found"
}
```

### `PUT /api/categories/:id`

Params:

```json
{
  "id": "categoryId"
}
```

Body:

```json
{
  "name": "Updated name",
  "slug": "updated-slug",
  "description": "string",
  "imageUrl": "string",
  "parentCategory": "parentCategoryId hoặc null"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "categoryId",
    "name": "Updated name",
    "slug": "updated-slug",
    "description": "string",
    "imageUrl": "string",
    "parentCategory": {
      "_id": "parentId",
      "name": "Shoes",
      "slug": "shoes"
    }
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

Response `400` có thể là:

```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

```json
{
  "success": false,
  "message": "Category with this slug already exists"
}
```

```json
{
  "success": false,
  "message": "A category cannot be its own parent"
}
```

```json
{
  "success": false,
  "message": "Parent category not found"
}
```

### `DELETE /api/categories/:id`

Params:

```json
{
  "id": "categoryId"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

Response `400` nếu còn category con:

```json
{
  "success": false,
  "message": "Cannot delete category. It has 2 child category(ies)",
  "childCount": 2
}
```

Response `400` nếu đang có product dùng category:

```json
{
  "success": false,
  "message": "Cannot delete category. It is associated with 3 product(s)",
  "productCount": 3
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Category not found"
}
```

## Brands

Route file: [src/routes/brandRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/brandRoutes.js:1)

### `GET /api/brands`

Response `200`:

```json
{
  "success": true,
  "message": "Get all brands successfully",
  "data": [
    {
      "_id": "brandId",
      "name": "Nike",
      "slug": "nike",
      "logoUrl": "string",
      "description": "string"
    }
  ]
}
```

### `GET /api/brands/:id`

Response `200`:

```json
{
  "success": true,
  "message": "Get brand successfully",
  "data": {
    "_id": "brandId",
    "name": "Nike",
    "slug": "nike",
    "logoUrl": "string",
    "description": "string"
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Brand not found"
}
```

### `POST /api/brands`

Body:

```json
{
  "name": "Nike",
  "slug": "nike",
  "description": "string",
  "logoUrl": "string"
}
```

- bắt buộc: `name`, `slug`

Response `201`:

```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "brandId",
    "name": "Nike",
    "slug": "nike",
    "description": "string",
    "logoUrl": "string"
  }
}
```

Response `400`:

```json
{
  "success": false,
  "message": "Name and slug are required"
}
```

hoặc:

```json
{
  "success": false,
  "message": "Brand with this name or slug already exists"
}
```

### `PUT /api/brands/:id`

Body:

```json
{
  "name": "Adidas",
  "slug": "adidas",
  "description": "string",
  "logoUrl": "string"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {
    "_id": "brandId",
    "name": "Adidas",
    "slug": "adidas",
    "description": "string",
    "logoUrl": "string"
  }
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Brand not found"
}
```

### `DELETE /api/brands/:id`

Response `200`:

```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

Response `404`:

```json
{
  "success": false,
  "message": "Brand not found"
}
```

## Products

Route file: [src/routes/productRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/productRoutes.js:1)

### `GET /api/products`

Response `200`:

```json
[
  {
    "_id": "productId",
    "name": "Air Max",
    "slug": "air-max",
    "description": "string",
    "brand": {
      "_id": "brandId",
      "name": "Nike"
    },
    "category": {
      "_id": "categoryId",
      "name": "Sneakers"
    },
    "basePrice": 100,
    "salePrice": 90,
    "productImages": [],
    "status": "active",
    "variants": [
      {
        "_id": "variantId",
        "productId": "productId",
        "color": "Red",
        "size": "42",
        "sku": "SKU001",
        "stock": 10,
        "variantImages": []
      }
    ]
  }
]
```

Response `500`:

```json
{
  "message": "error message"
}
```

### `GET /api/products/:id`

Response `200`:

```json
{
  "_id": "productId",
  "name": "Air Max",
  "slug": "air-max",
  "description": "string",
  "brand": {
    "_id": "brandId",
    "name": "Nike"
  },
  "category": {
    "_id": "categoryId",
    "name": "Sneakers"
  },
  "basePrice": 100,
  "salePrice": 90,
  "productImages": [],
  "status": "active",
  "variants": [
    {
      "_id": "variantId",
      "productId": "productId",
      "color": "Red",
      "size": "42",
      "sku": "SKU001",
      "stock": 10,
      "variantImages": []
    }
  ]
}
```

Response `404`:

```json
{
  "message": "Sản phẩm không tồn tại"
}
```

### `POST /api/products`

Body hiện tại đi thẳng vào `new Product(req.body)`, nên các field theo model là:

```json
{
  "name": "Air Max",
  "slug": "air-max",
  "description": "string",
  "brand": "brandId",
  "category": "categoryId",
  "basePrice": 100,
  "salePrice": 90,
  "productImages": ["string"],
  "skuPrefix": "AM",
  "averageRating": 0,
  "numReviews": 0,
  "isFeatured": false,
  "status": "draft"
}
```

Response `201`:

```json
{
  "_id": "productId",
  "name": "Air Max",
  "slug": "air-max",
  "description": "string",
  "brand": "brandId",
  "category": "categoryId",
  "basePrice": 100,
  "salePrice": 90,
  "productImages": [],
  "skuPrefix": "AM",
  "averageRating": 0,
  "numReviews": 0,
  "isFeatured": false,
  "status": "draft"
}
```

Response `400`:

```json
{
  "message": "error message"
}
```

### `PUT /api/products/:id`

Body:

```json
{
  "name": "New name",
  "salePrice": 80,
  "status": "active"
}
```

- Controller dùng `Object.assign(product, req.body)`, nên nhận mọi field hợp lệ của model.

Response `200`:

```json
{
  "_id": "productId",
  "name": "New name",
  "slug": "air-max",
  "description": "string",
  "brand": "brandId",
  "category": "categoryId",
  "basePrice": 100,
  "salePrice": 80,
  "status": "active"
}
```

Response `404`:

```json
{
  "message": "Sản phẩm không tồn tại"
}
```

### `DELETE /api/products/:id`

Response `200`:

```json
{
  "message": "Sản phẩm đã được xóa cùng các biến thể liên quan"
}
```

Response `404`:

```json
{
  "message": "Sản phẩm không tồn tại"
}
```

## Cart

Route file: [src/routes/cartRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/cartRoutes.js:1)

Tất cả route cart đều cần auth.

Shape cart trả về:

```json
{
  "_id": "cartId",
  "userId": "userId",
  "items": [
    {
      "productId": "productId",
      "variantId": "variantId",
      "quantity": 2,
      "price": 90,
      "lineTotal": 180,
      "product": {
        "_id": "productId",
        "name": "Air Max",
        "slug": "air-max",
        "basePrice": 100,
        "salePrice": 90,
        "productImages": [],
        "status": "active",
        "category": "categoryId",
        "brand": "brandId"
      },
      "variant": {
        "_id": "variantId",
        "color": "Red",
        "size": "42",
        "sku": "SKU001",
        "stock": 10,
        "variantImages": []
      }
    }
  ],
  "couponCode": "SALE10",
  "discountAmount": 10,
  "subtotal": 180,
  "totalPrice": 170,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### `GET /api/cart`

Response `200` nếu chưa có cart:

```json
{
  "userId": "userId",
  "items": [],
  "couponCode": null,
  "discountAmount": 0,
  "subtotal": 0,
  "totalPrice": 0
}
```

Response `200` nếu đã có cart: trả về theo shape cart ở trên.

### `POST /api/cart/add`

Body:

```json
{
  "productId": "productId",
  "variantId": "variantId",
  "quantity": 2
}
```

Response `200`: trả về cart sau khi thêm.

Response `400` có thể là:

```json
{
  "message": "productId và variantId không hợp lệ"
}
```

```json
{
  "message": "quantity phải lớn hơn 0"
}
```

```json
{
  "message": "Biến thể không thuộc sản phẩm đã chọn"
}
```

```json
{
  "message": "Số lượng vượt quá tồn kho"
}
```

```json
{
  "message": "Số lượng trong giỏ vượt quá tồn kho"
}
```

Response `404` có thể là:

```json
{
  "message": "Sản phẩm không tồn tại"
}
```

```json
{
  "message": "Biến thể không tồn tại"
}
```

### `PUT /api/cart/update`

Body:

```json
{
  "productId": "productId",
  "variantId": "variantId",
  "quantity": 3
}
```

Response `200`: trả về cart sau cập nhật.

Response `404` có thể là:

```json
{
  "message": "Giỏ hàng không tồn tại"
}
```

```json
{
  "message": "Sản phẩm không có trong giỏ hàng"
}
```

```json
{
  "message": "Biến thể không tồn tại"
}
```

### `DELETE /api/cart/remove/:productId/:variantId`

Params:

```json
{
  "productId": "productId",
  "variantId": "variantId"
}
```

Response `200`: trả về cart sau khi xóa item.

Response `400`:

```json
{
  "message": "productId và variantId không hợp lệ"
}
```

Response `404`:

```json
{
  "message": "Giỏ hàng không tồn tại"
}
```

### `DELETE /api/cart/clear`

Response `200`:

```json
{
  "_id": "cartId",
  "userId": "userId",
  "items": [],
  "couponCode": null,
  "discountAmount": 0,
  "subtotal": 0,
  "totalPrice": 0
}
```

### `POST /api/cart/apply-coupon`

Body:

```json
{
  "couponCode": "SALE10"
}
```

Response `200`: trả về cart sau khi áp mã.

Response `400` có thể là:

```json
{
  "message": "couponCode là bắt buộc"
}
```

```json
{
  "message": "Giỏ hàng trống"
}
```

```json
{
  "message": "Mã giảm giá không còn hiệu lực"
}
```

```json
{
  "message": "Mã giảm giá đã hết lượt sử dụng"
}
```

```json
{
  "message": "Mã giảm giá không áp dụng cho giỏ hàng hiện tại"
}
```

Response `404`:

```json
{
  "message": "Mã giảm giá không tồn tại"
}
```

## Reviews

Route files:

- [src/routes/reviewRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/reviewRoutes.js:1)
- [src/routes/adminReviewRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/adminReviewRoutes.js:1)

### `GET /api/reviews/:productId`

Chỉ trả về review `approved`.

Response `200`:

```json
[
  {
    "_id": "reviewId",
    "userId": {
      "_id": "userId",
      "name": "User name"
    },
    "productId": "productId",
    "rating": 5,
    "comment": "Great",
    "status": "approved",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

Response `400`:

```json
{
  "message": "productId không hợp lệ"
}
```

### `POST /api/reviews/:productId`

Auth required.

Body:

```json
{
  "rating": 5,
  "comment": "Great"
}
```

Response `201`:

```json
{
  "_id": "reviewId",
  "userId": "userId",
  "productId": "productId",
  "rating": 5,
  "comment": "Great",
  "status": "pending"
}
```

Response `400/403/404/409` có thể là:

```json
{
  "message": "rating phải từ 1 đến 5"
}
```

```json
{
  "message": "Sản phẩm không tồn tại"
}
```

```json
{
  "message": "Chỉ người đã mua sản phẩm mới được đánh giá"
}
```

```json
{
  "message": "Bạn đã đánh giá sản phẩm này rồi"
}
```

### `PUT /api/reviews/:id`

Auth required, chỉ owner được sửa.

Body:

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

Response `200`:

```json
{
  "_id": "reviewId",
  "userId": "userId",
  "productId": "productId",
  "rating": 4,
  "comment": "Updated comment",
  "status": "pending"
}
```

Response lỗi có thể là:

```json
{
  "message": "review id không hợp lệ"
}
```

```json
{
  "message": "Review không tồn tại"
}
```

```json
{
  "message": "Bạn không có quyền sửa review này"
}
```

### `DELETE /api/reviews/:id`

Auth required, chỉ owner được xóa.

Response `200`:

```json
{
  "message": "Đã xóa review"
}
```

Response lỗi có thể là:

```json
{
  "message": "review id không hợp lệ"
}
```

```json
{
  "message": "Review không tồn tại"
}
```

```json
{
  "message": "Bạn không có quyền xóa review này"
}
```

### `GET /api/admin/reviews`

Admin auth required theo route, cụ thể đang dùng `authenticateUser + authorizeAdmin`.

Query:

```json
{
  "status": "pending",
  "productId": "productId"
}
```

Response `200`:

```json
[
  {
    "_id": "reviewId",
    "userId": {
      "_id": "userId",
      "name": "User name",
      "email": "user@example.com"
    },
    "productId": {
      "_id": "productId",
      "name": "Air Max",
      "slug": "air-max",
      "productImages": []
    },
    "rating": 5,
    "comment": "Great",
    "status": "pending"
  }
]
```

### `PUT /api/admin/reviews/:id/status`

Admin auth required theo route, cụ thể đang dùng `authenticateUser + authorizeAdmin`.

Body:

```json
{
  "status": "approved"
}
```

Giá trị hợp lệ: `pending`, `approved`, `rejected`

Response `200`:

```json
{
  "_id": "reviewId",
  "userId": "userId",
  "productId": "productId",
  "rating": 5,
  "comment": "Great",
  "status": "approved"
}
```

Response lỗi có thể là:

```json
{
  "message": "review id không hợp lệ"
}
```

```json
{
  "message": "status không hợp lệ"
}
```

```json
{
  "message": "Review không tồn tại"
}
```

## Users

Route file: [src/routes/userRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/userRoutes.js:1)
Controller: [src/controllers/userController.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/controllers/userController.js:1)

### `GET /api/users/profile`

Auth required.

Response `200`:

```json
{
  "_id": "userId",
  "name": "User name",
  "email": "user@example.com",
  "role": "user",
  "phone": "0123456789",
  "shippingAddresses": [],
  "wishlist": []
}
```

Response `400`:

```json
{
  "message": "User ID is missing"
}
```

Response `404`:

```json
{
  "message": "User not found"
}
```

### `PUT /api/users/profile`

Auth required.

Body:

```json
{
  "name": "Updated name",
  "email": "updated@example.com",
  "phone": "0987654321",
  "shippingAddresses": [
    {
      "street": "123 Street",
      "city": "HCM",
      "state": "string",
      "zipCode": "700000",
      "country": "VN",
      "isDefault": true
    }
  ]
}
```

Response `200`:

```json
{
  "_id": "userId",
  "name": "Updated name",
  "email": "updated@example.com",
  "phone": "0987654321",
  "role": "user",
  "shippingAddresses": [
    {
      "street": "123 Street",
      "city": "HCM",
      "state": "string",
      "zipCode": "700000",
      "country": "VN",
      "isDefault": true
    }
  ]
}
```

### `POST /api/users/wishlist`

Auth required. Thêm product vào wishlist.

Body:

```json
{
  "productId": "productId"
}
```

Response `200`:

```json
{
  "message": "Product added to wishlist",
  "wishlist": ["productId1", "productId2"]
}
```

Response `400`:

```json
{
  "message": "Product ID is required"
}
```

hoặc:

```json
{
  "message": "Product already in wishlist"
}
```

Response `404`:

```json
{
  "message": "Product not found"
}
```

### `DELETE /api/users/wishlist/:productId`

Auth required. Xóa product khỏi wishlist.

Params:

```json
{
  "productId": "productId"
}
```

Response `200`:

```json
{
  "message": "Product removed from wishlist",
  "wishlist": ["productId1"]
}
```

Response `404`:

```json
{
  "message": "Product not found in wishlist"
}
```

### `GET /api/users`

Admin auth required.

Query:

```json
{
  "page": 1,
  "limit": 10
}
```

Response `200`:

```json
{
  "users": [
    {
      "_id": "userId",
      "name": "User name",
      "email": "user@example.com",
      "role": "user"
    }
  ],
  "page": 1,
  "pages": 3,
  "total": 25
}
```

### `GET /api/users/:id`

Admin auth required.

Response `200`:

```json
{
  "_id": "userId",
  "name": "User name",
  "email": "user@example.com",
  "role": "user",
  "phone": "0123456789",
  "shippingAddresses": [],
  "wishlist": []
}
```

### `PUT /api/users/:id`

Admin auth required.

Body:

```json
{
  "role": "admin"
}
```

Response `200`:

```json
{
  "_id": "userId",
  "name": "User name",
  "email": "user@example.com",
  "role": "admin"
}
```

### `DELETE /api/users/:id`

Admin auth required.

Response `200`:

```json
{
  "message": "User removed"
}
```

## Orders

Route file: [src/routes/orderRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/orderRoutes.js:1)

### `POST /api/orders`

Auth required.

Body:

```json
{
  "shippingAddress": {
    "street": "123 Street",
    "city": "HCM",
    "state": "string",
    "zipCode": "700000",
    "country": "VN"
  },
  "paymentMethod": "COD",
  "shippingMethod": "standard"
}
```

- order được tạo từ cart hiện tại của user
- `totalPrice` lấy từ `cart.totalPrice`

Response `201`:

```json
{
  "_id": "orderId",
  "userId": "userId",
  "orderItems": [
    {
      "productId": "productId",
      "variantId": "variantId",
      "name": "Air Max",
      "price": 90,
      "quantity": 2,
      "imageUrl": "string"
    }
  ],
  "shippingAddress": {
    "street": "123 Street",
    "city": "HCM",
    "state": "string",
    "zipCode": "700000",
    "country": "VN"
  },
  "paymentMethod": "COD",
  "shippingMethod": "standard",
  "totalPrice": 170,
  "orderStatus": "Pending"
}
```

Response lỗi có thể là:

```json
{
  "message": "User ID is missing"
}
```

```json
{
  "message": "Cart is empty"
}
```

```json
{
  "message": "Variant not found for item Air Max"
}
```

```json
{
  "message": "Insufficient stock for Air Max (42, Red). Available: 1"
}
```

### `GET /api/orders`

Auth required.

Response `200`:

```json
[
  {
    "_id": "orderId",
    "userId": "userId",
    "orderItems": [],
    "shippingAddress": {},
    "paymentMethod": "COD",
    "shippingMethod": "standard",
    "totalPrice": 170,
    "orderStatus": "Pending",
    "createdAt": "date"
  }
]
```

### `GET /api/orders/:id`

Auth required.

Response `200`:

```json
{
  "_id": "orderId",
  "userId": {
    "_id": "userId",
    "name": "User name",
    "email": "user@example.com"
  },
  "orderItems": [],
  "shippingAddress": {},
  "paymentMethod": "COD",
  "shippingMethod": "standard",
  "totalPrice": 170,
  "orderStatus": "Pending"
}
```

Response `404`:

```json
{
  "message": "Order not found"
}
```

### `GET /api/orders/admin/all`

Admin auth required.

Query:

```json
{
  "status": "Pending",
  "page": 1,
  "limit": 10
}
```

Response `200`:

```json
{
  "orders": [
    {
      "_id": "orderId",
      "userId": {
        "_id": "userId",
        "name": "User name",
        "email": "user@example.com"
      },
      "orderStatus": "Pending",
      "totalPrice": 170
    }
  ],
  "page": 1,
  "pages": 2,
  "total": 15
}
```

### `PUT /api/orders/admin/:id/status`

Admin auth required.

Body:

```json
{
  "status": "Shipped"
}
```

Luồng trạng thái hợp lệ theo code:

- `Pending -> Shipped`
- `Pending -> Cancelled`
- `Shipped -> Delivered`

Response `200`:

```json
{
  "_id": "orderId",
  "orderStatus": "Shipped",
  "isDelivered": false
}
```

Response `400`:

```json
{
  "message": "Invalid status transition from Delivered to Pending"
}
```

Response `404`:

```json
{
  "message": "Order not found"
}
```

## Ghi chú quan trọng theo source hiện tại

### Authentication & Authorization

- **Firebase Authentication**: Backend dùng Firebase Admin SDK để verify ID tokens từ frontend.
- **JWT**: Sau khi verify Firebase token, backend tạo JWT token cho session management.
- Route `/api/auth/google` xác thực Firebase ID token và tạo/update user trong MongoDB.
- Middleware `authenticateUser` verify JWT token cho protected routes.
- Middleware `authenticateAdmin` + `authorizeAdmin` cho admin routes.

### Routes & Permissions

- Route `brands`, `categories`, `products` hiện chưa gắn auth admin thật, nên CRUD đang mở public ở mức router.
- Route `cart`, `reviews`, và `users/profile` dùng `authenticateUser`.
- Route `users` (admin endpoints) dùng `authenticateAdmin + authorizeAdmin`.
- Route `orders` (admin endpoints) dùng `authenticateUser + authorizeAdmin`.

### Features

- `products` chưa có route CRUD cho `variant`, nhưng response product/cart/order có dùng dữ liệu variant.
- `reviews` có cơ chế:
  - user chỉ review được khi đã mua hàng
  - review mới hoặc review sửa lại sẽ về `pending`
  - admin đổi trạng thái review sẽ recalculate rating cho product
- `users` có wishlist management (add/remove products)
- `cart` hỗ trợ coupon code và discount calculation

## File nguồn đã quét

### Core

- [src/server.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/server.js:1)
- [src/config/db.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/config/db.js:1)
- [src/config/firebase.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/config/firebase.js:1)

### Middleware

- [src/middleware/authMiddleware.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/middleware/authMiddleware.js:1)

### Routes

- [src/routes/authRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/authRoutes.js:1)
- [src/routes/categoryRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/categoryRoutes.js:1)
- [src/routes/brandRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/brandRoutes.js:1)
- [src/routes/productRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/productRoutes.js:1)
- [src/routes/cartRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/cartRoutes.js:1)
- [src/routes/reviewRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/reviewRoutes.js:1)
- [src/routes/adminReviewRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/adminReviewRoutes.js:1)
- [src/routes/userRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/userRoutes.js:1)
- [src/routes/orderRoutes.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/routes/orderRoutes.js:1)

### Controllers

- [src/controllers/authController.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/controllers/authController.js:1)
- [src/controllers/userController.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/controllers/userController.js:1)

### Utils

- [src/utils/authToken.js](/Users/mac/Documents/Shop-Sneaker/Backend/src/utils/authToken.js:1)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` file in `Backend/` directory:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 3. Firebase Setup

1. Download Service Account Key from Firebase Console
2. Add to `.env` as `FIREBASE_SERVICE_ACCOUNT` (one-line JSON string)
3. Or place `servicesAccountKey.json` in `Backend/` (gitignored)

### 4. Run Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```
