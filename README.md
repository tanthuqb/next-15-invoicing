# 🚀 Next.js 15 Invoicing Application

A professional, full-stack invoicing application built with the latest **Next.js 15** and **React 19**. This project features a robust dashboard, invoice management, secure authentication, and seamless Stripe payment integration.

---

## ✨ Features

- **📊 Dashboard:** Overview of your invoices and recent activity.
- **📄 Invoice Management:** Create and manage invoices with ease.
- **💳 Stripe Payments:** Secure payment processing with Stripe Checkout.
- **🔐 Authentication:** User authentication and management powered by [Clerk](https://clerk.com/).
- **🗄️ Database:** Type-safe database interactions with [Drizzle ORM](https://orm.drizzle.team/) and PostgreSQL.
- **🎨 Modern UI:** A beautiful and responsive interface built with [Tailwind CSS 4](https://tailwindcss.com/) and [Radix UI](https://www.radix-ui.com/).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [Shadcn/UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Xata](https://xata.io/))
- **Payments:** [Stripe](https://stripe.com/)

---

## 🚦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/my-invoicing-app.git
   cd my-invoicing-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your credentials (see [.env.example](.env.example) for reference):

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   XATA_DATABASE_URL=...
   STRIPE_API_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   ```

4. **Initialize the Database:**
   ```bash
   npm run generate
   npm run migrate
   ```

### 🚀 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality.
- `npm run generate`: Generates Drizzle migrations.
- `npm run migrate`: Applies Drizzle migrations.

---

## 🌐 Deployment

The easiest way to deploy your app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.
