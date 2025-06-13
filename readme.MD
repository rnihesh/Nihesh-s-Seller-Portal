<p align="center">
  <img src="./client/src/assets/image2.png" width="80" alt="Logo" />
</p>

# Nihesh's Seller Portal 

A comprehensive inventory management web application that enables sellers to efficiently track, manage, and analyze their product inventory.


## 🚀 Features

- **Secure Authentication**: User registration and login powered by Clerk
- **Product Management**: Add, edit, delete, and track product inventory
- **Inventory Analytics**: Visualize product data with interactive charts and reports
- **PDF Export**: Generate detailed inventory reports for download
- **AI-Powered Descriptions**: Auto-generate product descriptions using Gemini AI
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes based on preference

## 💻 Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Bootstrap & CSS for styling
- Clerk for authentication
- Chart.js for data visualization
- Framer Motion for animations
- PrimeReact components
- ReactBit Components
- jsPDF & html2canvas for PDF generation

### Backend
- Express.js
- MongoDB with Mongoose
- Google oAuth for mailing
- Clerk for security of routes
- Cloudinary for image storage
- Google Gemini AI for product descriptions
- Email verification system

## 🔧 Project Structure

The project follows a client-server architecture:

```
inmin_seller_portal/
├── client/               # React frontend app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts
│   │   ├── utils/        # Utility functions
│   │   └── ...
├── server/               # Express backend
│   ├── APIs/             # API routes
│   ├── models/           # MongoDB models
│   ├── utils/            # Helper functions
│   └── ...
```

## 🔑 Key Components

- **UserContext**: Manages user state throughout the application
- **ThemeContext**: Controls app-wide theme settings
- **Analytics Dashboard**: Visualizes inventory data
- **Product Form**: Add and edit product details
- **Email Verification**: OTP-based email verification system

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Cloudinary account
- Clerk account
- Google Gemini API key

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnihesh/Nihesh-s-seller-portal
   cd Nihesh-s-seller-portal
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**

   Create `.env` files for both client and server:

   **Server .env**:
   ```
   MONGO_URI=your_mongo_connection_string
   GMAIL_ADDRESS= your_mailing_address
   GOOGLE_CLIENT_ID= you_client_id_for_gmail_api
   GOOGLE_CLIENT_SECRET= your_secret_for_gmail_api
   GOOGLE_REFRESH_TOKEN= yor_refresh_token_for_gmail_api
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

   **Client .env**:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_RENDER_URL=your_backend_url_in_production
   ```

4. **Start the development servers**
   ```bash
   # Start server (from server directory)
   npm start

   # Start client (from client directory)
   npm run dev
   ```

## 🎨 Features Showcase

### AI-Powered Descriptions
Auto-generate product descriptions using Gemini AI

### Theme Switching
The application supports both light and dark themes that can be toggled from the header.

### Inventory Analysis
Interactive charts display product distribution by category, price ranges, and quantity.

### Email Verification
Secure OTP-based verification system sends styled HTML emails to new users.

### Report Exporting as PDF
 Generate detailed inventory reports for download

## 📄 License

Created by [Nihesh Rachakonda](https://github.com/rnihesh)

---

**Made with ❤️ by Nihesh**