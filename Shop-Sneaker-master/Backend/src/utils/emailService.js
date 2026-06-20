import nodemailer from "nodemailer";

let transporter;

// Initialize email transporter
const initializeMailer = () => {
  if (transporter) return transporter;

  const emailUser = process.env.MAIL_USER || process.env.EMAIL_USER;
  const emailPassword = process.env.MAIL_PASS || process.env.EMAIL_PASSWORD;
  const mailHost = process.env.MAIL_HOST;
  const mailPort = Number(process.env.MAIL_PORT || 587);

  if (!emailUser || !emailPassword) {
    console.warn("Email credentials not configured in .env");
    return null;
  }

  transporter = mailHost
    ? nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

  return transporter;
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (
  userEmail,
  userName,
  orderData,
) => {
  try {
    const mailer = initializeMailer();
    if (!mailer) {
      console.error("Email service not configured");
      return false;
    }

    const orderItemsHtml = orderData.orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `,
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #ddd;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              background-color: #f9f9f9;
            }
            .shipping-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .order-number {
              background-color: #e8f5e9;
              padding: 10px;
              border-radius: 5px;
              font-size: 14px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Thanh Toán Thành Công!</h1>
              <p>Cảm ơn bạn đã mua sắm tại Shop Sneaker</p>
            </div>

            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              
              <p>Chúng tôi vui mừng thông báo rằng thanh toán của bạn đã được xác nhận thành công!</p>

              <div class="order-number">
                <strong>Mã đơn hàng:</strong> ${orderData._id}<br>
                <strong>Ngày đặt hàng:</strong> ${new Date(orderData.createdAt).toLocaleDateString("vi-VN")}<br>
                <strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod}
              </div>

              <div class="section">
                <div class="section-title">Chi Tiết Sản Phẩm</div>
                <table>
                  <thead>
                    <tr>
                      <th>Sản Phẩm</th>
                      <th style="text-align: center;">Số Lượng</th>
                      <th style="text-align: right;">Giá</th>
                      <th style="text-align: right;">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right; padding: 15px;">Tổng Tiền:</td>
                      <td style="text-align: right; padding: 15px;">$${orderData.totalPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="section">
                <div class="section-title">Địa Chỉ Giao Hàng</div>
                <div class="shipping-info">
                  ${orderData.shippingAddress.street}<br>
                  ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}<br>
                  ${orderData.shippingAddress.country}
                </div>
              </div>

              <div class="section">
                <div class="section-title">Phương Thức Vận Chuyển</div>
                <p>${orderData.shippingMethod || "Standard Shipping"}</p>
              </div>

              <div class="section">
                <p><strong>Tiếp theo:</strong> Đơn hàng của bạn đang được chuẩn bị. Bạn sẽ nhận được thông báo vận chuyển trong vòng 24 giờ.</p>
              </div>

              <div class="section">
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
              </div>
            </div>

            <div class="footer">
              <p>&copy; 2024 Shop Sneaker. Tất cả quyền được bảo lưu.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_USER || process.env.EMAIL_USER,
      to: userEmail,
      subject: `✓ Thanh Toán Thành Công - Đơn Hàng #${orderData._id}`,
      html: htmlContent,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log("Payment confirmation email sent:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return false;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  userEmail,
  userName,
  orderData,
) => {
  try {
    const mailer = initializeMailer();
    if (!mailer) {
      console.error("Email service not configured");
      return false;
    }

    const orderItemsHtml = orderData.orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `,
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #2196F3;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Xác Nhận Đơn Hàng</h1>
            </div>

            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              
              <p>Cảm ơn bạn đã đặt hàng! Chúng tôi đã nhận được đơn hàng của bạn.</p>

              <p><strong>Mã đơn hàng:</strong> ${orderData._id}</p>

              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Sản Phẩm</th>
                    <th style="text-align: center; padding: 10px; border-bottom: 2px solid #ddd;">Số Lượng</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>

              <p style="text-align: right; margin-top: 10px;"><strong>Tổng cộng: $${orderData.totalPrice.toFixed(2)}</strong></p>

              <p>Bạn sẽ nhận được email tiếp theo về trạng thái đơn hàng của bạn.</p>
            </div>

            <div class="footer">
              <p>&copy; 2024 Shop Sneaker.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_USER || process.env.EMAIL_USER,
      to: userEmail,
      subject: `Xác Nhận Đơn Hàng - #${orderData._id}`,
      html: htmlContent,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log("Order confirmation email sent:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

// Send shipping notification email
export const sendShippingNotificationEmail = async (
  userEmail,
  userName,
  orderData,
  trackingNumber,
) => {
  try {
    const mailer = initializeMailer();
    if (!mailer) {
      console.error("Email service not configured");
      return false;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #FF9800;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .tracking-box {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Đơn Hàng Đã Vận Chuyển!</h1>
            </div>

            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              
              <p>Đơn hàng của bạn đã được vận chuyển!</p>

              <div class="tracking-box">
                <p><strong>Mã đơn hàng:</strong> ${orderData._id}</p>
                <p><strong>Mã vận chuyển:</strong> ${trackingNumber || "Sẽ cập nhật sớm"}</p>
              </div>

              <p>Bạn có thể theo dõi gói hàng của mình bằng mã vận chuyển ở trên.</p>

              <p>Vận chuyển thường mất 3-5 ngày làm việc.</p>
            </div>

            <div class="footer">
              <p>&copy; 2024 Shop Sneaker.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_USER || process.env.EMAIL_USER,
      to: userEmail,
      subject: `Đơn Hàng #${orderData._id} Đã Vận Chuyển!`,
      html: htmlContent,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log("Shipping notification email sent:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending shipping notification email:", error);
    return false;
  }
};

// Send thank you email
export const sendThankYouEmail = async (userEmail, userName, orderData) => {
  try {
    const mailer = initializeMailer();
    if (!mailer) {
      console.error("Email service not configured");
      return false;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #9C27B0;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .highlight {
              background-color: #f3e5f5;
              padding: 15px;
              border-left: 4px solid #9C27B0;
              margin: 15px 0;
              border-radius: 3px;
            }
            .features {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .features ul {
              list-style: none;
              padding: 0;
            }
            .features li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .features li:before {
              content: "✓ ";
              color: #9C27B0;
              font-weight: bold;
              margin-right: 10px;
            }
            .features li:last-child {
              border-bottom: none;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .button {
              display: inline-block;
              background-color: #9C27B0;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💜 Cảm Ơn Bạn!</h1>
              <p>Chúng tôi rất trân trọng sự tin tưởng của bạn</p>
            </div>

            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              
              <p>Chúng tôi muốn gửi lời cảm ơn chân thành vì bạn đã lựa chọn Shop Sneaker cho lần mua sắm này.</p>

              <div class="highlight">
                <strong>Đơn hàng #${orderData._id}</strong><br>
                Tổng giá trị: <strong>$${orderData.totalPrice.toFixed(2)}</strong><br>
                Ngày đặt: ${new Date(orderData.createdAt).toLocaleDateString("vi-VN")}
              </div>

              <p>Chúng tôi đã chuẩn bị đơn hàng của bạn với sự chăm sóc tối đa. Sản phẩm sẽ được vận chuyển sớm nhất.</p>

              <div class="features">
                <p><strong>Tại sao bạn nên mua sắm tại Shop Sneaker:</strong></p>
                <ul>
                  <li>Sản phẩm chính hãng 100%</li>
                  <li>Giá cả cạnh tranh và chính sách đổi trả linh hoạt</li>
                  <li>Giao hàng nhanh chóng và an toàn</li>
                  <li>Hỗ trợ khách hàng 24/7</li>
                  <li>Chương trình khuyến mãi và ưu đãi đặc biệt dành cho khách hàng thân thiết</li>
                </ul>
              </div>

              <p><strong>Bạn có thể làm gì tiếp theo:</strong></p>
              <ul style="line-height: 1.8;">
                <li>📱 Theo dõi đơn hàng của bạn trên ứng dụng hoặc website</li>
                <li>⭐ Để lại đánh giá và chia sẻ trải nghiệm của bạn</li>
                <li>🎁 Tham gia chương trình khách hàng thân thiết của chúng tôi</li>
                <li>👥 Giới thiệu bạn bè và nhận phần thưởng</li>
              </ul>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://your-shop-url.com" class="button">Xem Thêm Sản Phẩm</a>
              </p>

              <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng giúp đỡ!</p>

              <p style="margin-top: 20px;">
                <strong>Trân trọng,</strong><br>
                Đội ngũ Shop Sneaker 👟
              </p>
            </div>

            <div class="footer">
              <p>&copy; 2024 Shop Sneaker. Tất cả quyền được bảo lưu.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>
                📧 support@shopSneaker.com | 📱 0123-456-789<br>
                🌐 www.shopSneaker.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_USER || process.env.EMAIL_USER,
      to: userEmail,
      subject: `💜 Cảm ơn bạn đã mua sắm tại Shop Sneaker - Đơn Hàng #${orderData._id}`,
      html: htmlContent,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log("Thank you email sent:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error sending thank you email:", error);
    return false;
  }
};

export default {
  sendPaymentConfirmationEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendThankYouEmail,
};
