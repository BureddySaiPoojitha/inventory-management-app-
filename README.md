# 📦 Inventory Management System

A complete full-stack **Inventory Management System** built using:

- **React** (Frontend)
- **Node.js + Express** (Backend)
- **SQLite** (Database)
- **Multer** (File Upload)
- **CSV Parser** (Import products)
- **Axios** (API communication)

This project was built as part of the **Skillwise Full-Stack Assignment**.

---

# 🚀 Features

### 🛒 Product Management
- Add new products  
- Edit product details inline  
- Delete products  
- Image preview support (via URL)

### 🧮 Inventory Stock Tracking
- Update stock  
- Automatically logs stock changes  
- History panel for each product  
- Shows old quantity, new quantity, date & time

### 📁 CSV Import
- Upload a CSV file to bulk-add products  
- Automatically skips duplicates  
- Inserts only new products  
- CSV Format:

```
name,unit,category,brand,stock,status,image
Milk,Litre,Dairy,Amul,30,In Stock,https://example.com/milk.jpg
Shampoo,Bottle,Personal Care,Dove,20,In Stock,https://example.com/shampoo.jpg
```

### 📤 CSV Export
- Exports all products in the system as `products.csv`
- Downloadable directly from the frontend

### 🔎 Search & Filtering
- Search by product name  
- Filter by category  
- Status tagging (In Stock / Out of Stock)

### 📊 Sorting & Pagination
- Sort by ID, name, category, brand, stock  
- ASC / DESC sorting  
- Pagination with next/previous buttons

### 📱 Responsive UI
- Clean and modern design  
- Works on mobile, tablet, and desktop

---

# 🛠️ Tech Stack

## Frontend
- React
- Axios
- React Hooks
- CSS / Flexbox

## Backend
- Node.js
- Express.js
- Multer (File Upload)
- CSV-Parser (Import CSV)
- Better-Sqlite3 (Database)
- CORS

## Database
- SQLite Database File: `inventory.db` (auto-created)

---

# 📂 Project Structure

```
inventory-management-app/
│
├── backend/
│   ├── server.js
│   ├── inventory.db
│   ├── package.json
│   └── uploads/
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── api.js
    │   ├── components/
    │   └── pages/
    ├── package.json
```

---

# ⚙️ Installation & Setup

## 1️⃣ Backend Setup

```
cd backend
npm install
npm run dev
```

The backend runs on:

```
http://localhost:4000
```

---

## 2️⃣ Frontend Setup

```
cd frontend
npm install
npm start
```

The frontend runs on:

```
http://localhost:3000
```

---

# 🔌 API Base URL

Defined in:

```
frontend/src/api.js
```

Default:

```
http://localhost:4000/api
```

For deployment, replace with:

```
https://your-backend-url.onrender.com/api
```

---

# 📥 Importing CSV (How to Use)

1. Open the frontend  
2. Click **Import**  
3. Choose your `products.csv` file  
4. Upload → Products added  
5. Duplicate names are automatically skipped  
6. Shows count of added + skipped items

---

# 📤 Exporting Products

Click **Export** → Download `products.csv`

CSV includes:

```
id,name,unit,category,brand,stock,status,image
```

---

# 🧾 Inventory History

Every time stock changes:

- Old stock  
- New stock  
- Timestamp  
- User (default: admin)

Stored in table:

```
inventory_history
```

Viewed via the **History Panel** in the app.

---

# 🌐 Deployment Guide

## 🚀 Backend Deployment (Render)

1. Go to https://render.com  
2. Create new **Web Service**  
3. Root Directory → `backend`  
4. Build Command → `npm install`  
5. Start Command → `node server.js`  
6. Add PORT env (Render auto sets it)  
7. Deploy

---

## 🚀 Frontend Deployment (Netlify / Vercel)

For **Netlify**:

1. Go to https://netlify.com  
2. New site → Import from GitHub  
3. Set:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. Deploy

⚠️ *Important:*  
Update `api.js` to your deployed backend URL before building.

---

# 📝 Submission Requirements (Skillwise)

You must submit:

### ✔ GitHub Repository Link
Full project with frontend + backend folders

### ✔ Live Backend URL (Render)
Example:
```
https://inventory-api.onrender.com
```

### ✔ Live Frontend URL (Netlify)
Example:
```
https://inventory-management.netlify.app
```

### ✔ Working:
- CSV import  
- CSV export  
- Add/Edit/Delete  
- Sorting  
- History  
- Images  

---

# 🏁 Final Notes

This project demonstrates:

- Full-stack development  
- API design  
- File handling and CSV parsing  
- Database integration  
- UI/UX design  
- Real-world inventory logic  

Perfectly suitable for Skillwise evaluation and portfolio showcase.

---

# 👨‍💻 Developed By

**Saipoojitha Bureddy**
