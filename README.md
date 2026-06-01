# DriveX — PostgreSQL Version

## What changed from MySQL

| MySQL | PostgreSQL |
|-------|-----------|
| `mysql2` package | `pg` package |
| `?` placeholders | `$1, $2, $3` placeholders |
| `AUTO_INCREMENT` | `SERIAL` |
| `LIKE` | `ILIKE` (case-insensitive) |
| `result[0]` rows | `result.rows` |
| `result.insertId` | `RETURNING id` → `result.rows[0].id` |

## Setup

### 1. Install PostgreSQL
Download from https://www.postgresql.org/download/

During install, set a password for the `postgres` user — you'll need it in `.env`.

### 2. Create the database and tables

```bash
psql -U postgres -f schema.sql
```

Or open pgAdmin, open the Query Tool, paste the contents of `schema.sql` and run it.

### 3. Update .env

```
DB_PASSWORD=your_postgres_password
```

### 4. Install and run

```bash
npm install
npm start
```

Open **http://localhost:3000**

## Admin Login
- Email: `admin@carrental.com`
- Password: `admin123`

## Project Structure

```
cars-project-pg/
├── server.js
├── db.js              ← pg Pool connection
├── schema.sql         ← PostgreSQL schema + seed data
├── .env
├── package.json       ← uses "pg" not "mysql2"
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── cars.js
│   ├── bookings.js
│   └── admin.js
└── public/            ← copy from previous project (unchanged)
    ├── index.html
    ├── css/style.css
    ├── js/app.js
    └── pages/
        ├── cars.html
        ├── login.html
        ├── register.html
        ├── bookings.html
        └── admin.html
```

> The `public/` folder (all HTML/CSS/JS files) is identical to the MySQL version — no changes needed there.