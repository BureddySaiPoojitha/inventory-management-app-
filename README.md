# 🚀 Inventory Management System

A complete full-stack Inventory Management System built using **React (Frontend)** and **Node.js + Express + SQLite (Backend)**. This project supports product management, CSV import/export, inventory history tracking, and live deployment.

---

## 🌐 Live Project Links

**Frontend (Netlify):**  
https://inventorymanagementsystem-assignment.netlify.app/

**Backend (Render):**  
https://inventory-management-app-i0ah.onrender.com

---

## 📦 Repository Structure

```
inventory-management-app/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── inventory.db
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- React  
- Axios  
- CSS  

### Backend
- Node.js  
- Express  
- Multer  
- CSV-Parser  
- Better-SQLite3  
- CORS  

### Database
- SQLite

---

## ✨ Features

- Add, edit, delete products  
- Real-time search  
- CSV import  
- CSV export  
- Stock status indicator  
- Inventory change history  
- Fully deployed frontend + backend  

---

## 🧑‍💻 Local Setup Instructions

### 1️⃣ Clone Repo
```
git clone <your_repo_link>
cd inventory-management-app
```

---

## ▶ Backend Setup
```
cd backend
npm install
npm run dev
```

Backend runs at:
```
http://localhost:4000
```

---

## ▶ Frontend Setup
```
cd frontend
npm install
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

## 🔌 Production API Connection

The deployed frontend uses:
```
https://inventory-management-app-i0ah.onrender.com/api
```

---

## 📡 Deployment Details

### Backend (Render)
```
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

### Frontend (Netlify)
1. Run `npm run build`  
2. Upload the **build** folder to Netlify Drop:  
   https://app.netlify.com/drop

---

## 📝 API Endpoints

- **GET /api/products**  
- **GET /api/products/search?name=abc**  
- **POST /api/products/import**  
- **GET /api/products/export**  
- **PUT /api/products/:id**  
- **GET /api/products/:id/history**

---

## 📄 Sample CSV

```
name,unit,category,brand,stock,status,image
Sugar,Kg,Groceries,Fortune,20,In Stock,
Rice,Kg,Groceries,India Gate,50,In Stock,
Milk,Litre,Dairy,Amul,10,In Stock,
```

---

## 📷 Live Output

Frontend live:  
https://inventorymanagementsystem-assignment.netlify.app/

---

## ✅ Conclusion

This project delivers a complete Inventory Management System including search, CSV import/export, editing, and inventory history. Both frontend and backend are deployed successfully and meet all Skillwise assignment requirements.

