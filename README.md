
# Ecommercely

Ecommercely is a straightforward e-commerce project that illustrates the creation of a user-friendly online shopping platform. It encompasses features such as user authentication, product listing, cart functionality, and Stripe payment integration.

## Tech Stack

**Client Server:** NextJs 13, Typescript, Tailwind CSS, ShadCN

**Database:** PostGreSQL (Supabase), Prisma (ORM)

**Hosting:** Vercel And Database Supabase
## Features


🔐 User Authentication: Users can securely sign up and log in. Passwords are encrypted for data protection.

🔑 Password Management: The project includes both password reset functionality and email notifications, ensuring users can easily reset forgotten passwords.

⚡ Efficient UI: Prioritizing a minimalistic design, the project offers a clean and engaging user interface. Fast loading times enhance the user experience.

🛒 Product Showcase and Cart: Users can explore a range of products, add items to their cart, and review their selections before proceeding to checkout.

💳 Stripe Integration: Secure Stripe payment integration allows users to make seamless online transactions.


Admin Panel Github: https://github.com/krish-7104/ecommercely-admin

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
`NEXT_PUBLIC_ADMIN_API_BASE`

## Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** or **yarn** package manager
- **Git**
- **PostgreSQL database** (or Supabase account)
- **Stripe account** (for payment integration)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/krish-7104/ecommercely-website
   cd ecommercely-website
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   
   Copy the `.env.sample` file and create a `.env.local` file:
   ```bash
   cp .env.sample .env.local
   ```
   
   Then update the values in `.env.local` with your actual credentials:
   ```env
   DATABASE_URL=your_database_connection_string
   SECRET_KEY=your_secret_key_for_jwt_tokens
   NODEMAILER_USER=your_email@gmail.com
   NODEMAILER_PASS=your_email_app_password
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_ADMIN_API_BASE=your_admin_api_base_url
   ```

4. **Database Setup**
   - Set up your PostgreSQL database (or use Supabase)
   - Update the `DATABASE_URL` in your `.env.local` file
   - If using Prisma, run migrations:
     ```bash
     npx prisma migrate dev
     ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Related Repositories

- **Admin Panel**: https://github.com/krish-7104/ecommercely-admin
