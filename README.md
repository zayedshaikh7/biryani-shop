# Biryani Shop Order Management System

A complete web-based Order Management System built to replace the manual notebook system for a Biryani Shop.

## Tech Stack

- Frontend: React 18 with TypeScript (Vite)
- Backend: Supabase (PostgreSQL Database)
- Styling: Tailwind CSS
- Icons: lucide-react

## Features

### 1. Order Management
- Create new orders with auto-generated Order ID
- Customer Name and Mobile Number capture
- Biryani type dropdown selection
- Quantity and automatic price calculation
- Order Type: Dine-in / Takeaway / Delivery
- Order Status: Pending, Cooking, Ready, Completed

### 2. Search & History
- Search orders by Order ID, Mobile Number, or Customer Name
- Filter orders by status
- Filter orders by date

### 3. Payment System
- Payment Modes: Cash / UPI / Card
- Advance payment input
- Automatic remaining amount calculation
- Payment status: Paid, Partially Paid, Unpaid

### 4. Call Assistant
- Click-to-call button using customer mobile number
- Phone icon visible in order details

### 5. Dashboard
- Total orders today
- Total revenue today
- Pending payments
- Most sold biryani item

### 6. User Experience
- Mobile-first responsive design
- Large buttons for shop staff
- Fast order entry UI

## Folder Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── NewOrder.tsx
│   │   ├── OrderList.tsx
│   │   └── OrderDetails.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── order.ts
│   ├── utils/
│   │   └── orderUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       └── [timestamp]_create_orders_table.sql
├── .env
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env` file

3. Database is already set up with the orders table

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Preview production build:
```bash
npm run preview
```

## Database Schema

### Orders Table
- `id` (UUID) - Primary key
- `order_number` (TEXT) - Auto-generated unique order ID
- `customer_name` (TEXT) - Customer name
- `mobile_number` (TEXT) - Customer mobile number
- `biryani_type` (TEXT) - Type of biryani
- `quantity` (INTEGER) - Quantity ordered
- `price` (NUMERIC) - Total price
- `order_type` (TEXT) - Dine-in / Takeaway / Delivery
- `order_status` (TEXT) - Pending / Cooking / Ready / Completed
- `payment_mode` (TEXT) - Cash / UPI / Card
- `advance_payment` (NUMERIC) - Advance amount paid
- `remaining_amount` (NUMERIC) - Remaining amount
- `payment_status` (TEXT) - Paid / Partially Paid / Unpaid
- `created_at` (TIMESTAMPTZ) - Order creation time
- `updated_at` (TIMESTAMPTZ) - Last update time

## Biryani Menu

1. Chicken Biryani - ₹180
2. Mutton Biryani - ₹250
3. Veg Biryani - ₹150
4. Egg Biryani - ₹130
5. Prawns Biryani - ₹280
6. Fish Biryani - ₹200

## Usage

### Creating a New Order
1. Click "New Order" in the navigation
2. Fill in customer details
3. Select biryani type and quantity
4. Choose order type and status
5. Select payment mode and enter advance payment
6. Click "Create Order"

### Viewing Orders
1. Click "Orders" in the navigation
2. Use search to find specific orders
3. Filter by status or date
4. Click "View Details" to see full order information

### Updating an Order
1. Open order details
2. Click "Edit" button
3. Update order status, payment mode, or advance payment
4. Click "Save Changes"

### Calling a Customer
1. Open order details
2. Click the phone icon next to the mobile number
3. Your device will initiate the call

## Development Notes

- The application uses Supabase for the database (PostgreSQL)
- All data is stored securely with Row Level Security (RLS) enabled
- The UI is optimized for both mobile and desktop devices
- Order numbers are auto-generated using timestamp and random numbers
