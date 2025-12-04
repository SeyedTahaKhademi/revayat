## Remote JSON API for cPanel

این فولدر نمونه‌ای از API سبک‌وزن را نشان می‌دهد که باید روی هاست cPanel آپلود شود تا ورسل بتواند داده‌ها را در فایل‌های JSON ذخیره کند.

### ساختار پیشنهادی روی هاست

```
public_html/
└── revayat-api/
    ├── bootstrap.php
    ├── read.php
    ├── store.php
    ├── explore-read.php
    ├── explore-store.php
    ├── upload-image.php
    ├── storage/
    │   ├── accounts.json
    │   └── explore-posts.json
    └── uploads/
```

- `storage/` برای فایل‌های JSON استفاده می‌شود (اگر وجود نداشته باشد، اسکریپت‌ها خودشان می‌سازند). محتویات اولیه می‌تواند `[]` باشد.
- `uploads/` محل نگهداری تصاویر کاربران است. مجوز 775 یا 755 لازم است.

### مراحل استقرار

1. در File Manager هاست، فولدر `public_html/revayat-api` را ایجاد کنید.
2. همه فایل‌های این دایرکتوری را در همان مسیر آپلود کنید (به همراه پوشه‌های `storage` و `uploads`).
3. اگر `storage/accounts.json` یا `storage/explore-posts.json` وجود ندارند، یک فایل خالی با محتوای `[]` بسازید.
4. در ورسل مقدار Environment زیر را تنظیم کنید:
   - Key: `NEXT_PUBLIC_REVAYAT_API_BASE_URL`
   - Value: `https://YOUR-DOMAIN/revayat-api`
5. پس از deploy جدید، برنامه به‌صورت خودکار از این API برای خواندن/نوشتن کاربران، پست‌ها و آپلود تصویر استفاده می‌کند.

> توجه: فایل‌ها CORS را باز می‌گذارند تا از هر دامنه‌ای قابل دسترسی باشند. در صورت نیاز، می‌توانید در `bootstrap.php` دامنه‌ را محدود کنید.
