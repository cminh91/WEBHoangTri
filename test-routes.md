# Routing Structure

## Dịch Vụ
- `/dich-vu` - Main services page
- `/dich-vu/[param]` - Dynamic route for both service categories and individual services

## Sản Phẩm
- `/san-pham` - Main products page
- `/san-pham/[param]` - Dynamic route for both product categories and individual products

## Tin Tức
- `/tin-tuc` - Main news page
- `/tin-tuc/[param]` - Dynamic route for both news categories and individual articles

The `[param]` directory in each section now handles both the category and individual item use cases that were previously split between `[category]` and `[slug]` directories. 