# Ecommerce MVP API

Đây là dự án RESTful API thương mại điện tử được xây dựng theo kiến trúc Monolithic.

Toàn bộ chức năng của hệ thống nằm trong một project duy nhất và chạy bằng một backend duy nhất.

Các module chính:

- Auth: đăng ký, đăng nhập và JWT.
- Product: quản lý sản phẩm.
- Order: tạo đơn hàng và chi tiết đơn hàng.
- Shipment: quản lý thông tin giao hàng.
- Database: kết nối PostgreSQL thông qua Prisma ORM.

Cấu trúc project được tổ chức theo module nhưng không tách thành nhiều service riêng.