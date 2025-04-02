# **Starcade API - Backend**

## **📌 Project Overview**

Starcade API is a **NestJS-based backend** that provides authentication, database management using **Prisma ORM**, and validation using **class-validator**. The project is structured for scalability and follows best practices for RESTful API development.

---

## **🚀 Getting Started**

### **1️⃣ Prerequisites**

Before running this project, make sure you have installed the following:

- **Node.js** (Recommended: v18 or later)
- **NPM** (Comes with Node.js)
- **MySQL Database**

### **2️⃣ Clone the Repository**

```sh
  git clone <repository_url>
  cd starcade-api
```

### **3️⃣ Install Dependencies**

```sh
  npm install
```

### **4️⃣ Configure Environment Variables**

1. Copy the `.env.example` file and rename it to `.env`:
   ```sh
   cp .env.example .env
   ```
2. Edit the `.env` file and update database credentials:

   ```env
   DATABASE_TYPE=mysql
   DATABASE_HOST=
   DATABASE_PORT=
   DATABASE_NAME=
   DATABASE_USER=
   DATABASE_PASS=
   DATABASE_URL="${DATABASE_TYPE}://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"

   JWT_SECRET=your-secret-key
   NODE_ENV=
   PORT=your-api-application-port-number
   NX_API_BASE_URL=your-api-application-base-url
   NX_FRONTEND_URL=your-frontend-application-base-url
   PHOTOS_BASE_PATH=add-your-file-saving-path

   EMAIL_HOST=
   EMAIL_PORT=
   EMAIL_USER=
   EMAIL_PASS=
   EMAIL_SECURE=false
   ```

### **5️⃣ Set Up Database & Prisma**

1. Run the following Prisma commands to set up the database:

   ```sh
   npx prisma generate
   npx prisma migrate dev --name init
   ```

2. Verify that Prisma has successfully generated the client:

   ```sh
   npx prisma studio
   ```

   This opens a web interface to view your database.

3. seeding mock data:
   ```sh
   npx prisma db seed
   ```

### **6️⃣ Start the API Server**

Run the server in development mode:

```sh
  npm run api
```

The server will be running at **`http://localhost:3333`**.

### **7️⃣ API Documentation (Swagger UI)**

After starting the server, visit:

```sh
http://localhost:3333/api/docs
```

This will open the Swagger API documentation for testing and reference.

---

## **📌 Available Commands**

| Command                              | Description                                              |
| ------------------------------------ | -------------------------------------------------------- |
| `npm run api`                        | Starts the API in **development mode** with auto-restart |
| `npm run start:prod`                 | Starts the API in **production mode**                    |
| `npm run lint`                       | Runs ESLint and fixes code issues                        |
| `npm run test`                       | Runs unit tests using Jest                               |
| `npm run test:e2e`                   | Runs end-to-end tests                                    |
| `npx prisma migrate dev --name init` | Runs database migrations                                 |
| `npx prisma studio`                  | Opens Prisma Studio (Database GUI)                       |

---

## **🛠️ Project Structure**

```
starcade-api/
│── prisma/               # Prisma schema & migrations
│── src/
│   ├── main.ts           # Entry point of the application
│   ├── app.module.ts     # Main module for the app
│── .env                  # Environment variables (ignored in Git)
│── package.json          # Project dependencies & scripts
│── README.md             # Documentation
```

---

## **📌 Troubleshooting**

### ❗ **Prisma Error: `@prisma/client did not initialize yet`**

✅ Run:

```sh
npx prisma generate
```

### ❗ **Missing `class-validator` Error**

✅ Install missing dependencies:

```sh
npm install class-validator class-transformer
```

### ❗ **MySQL Connection Issues**

✅ Check that MySQL is running and credentials in `.env` are correct.

---

**🚀 Happy Coding!**
