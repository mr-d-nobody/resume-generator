<div align="center">

# ✨ ResumeBuilder

### AI-Powered Resume Generator with 6 Professional Templates

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-resume--generator--8m6r.vercel.app-blue?style=for-the-badge)](https://resume-generator-8m6r.vercel.app)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

*Build stunning, ATS-friendly resumes in minutes — not hours.*

---

</div>

## 🎯 What is ResumeBuilder?

ResumeBuilder is a full-stack web application that helps you create professional, job-ready resumes effortlessly. Upload an existing PDF and let our **Gemini AI** intelligently parse your data, or manually enter your details — then choose from **15 beautifully crafted templates** and download a pixel-perfect PDF.

<div align="center">

### ⚡ [Try it Live →](https://resume-generator-8m6r.vercel.app)

</div>

---

## ✨ Features

### 🤖 Magic Upload (AI-Powered)
- Upload any existing PDF resume
- **Google Gemini AI** extracts and structures your data automatically
- Supports both **Fresher** and **Experienced** profiles
- AI condenses content to fit single-page layouts for entry-level resumes

### 🎨 6 Professional Templates
- Modern, minimal, creative, and classic designs
- All templates are **ATS-friendly** and recruiter-approved
- Live preview with your actual data before downloading
- Filter templates by style category

### ✏️ Manual Entry / Edit
- Comprehensive form with sections for:
  - Personal Info & Contact Details
  - Work Experience
  - Education
  - Skills (categorized)
  - Projects
  - Certifications
- Drag-and-drop section reordering
- Real-time preview alongside the editor

### 📥 One-Click PDF Download
- High-quality PDF generation
- Pixel-perfect A4 formatting
- Works flawlessly on both desktop and mobile

### 📱 Fully Mobile Responsive
- Optimized for phones, tablets, and desktops
- Mobile-friendly edit/preview toggle in the resume builder
- Touch-friendly navigation and interactions

### 👤 Profile Page
- Save and manage your personal details
- Data persists across sessions via local storage

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4 |
| **Backend** | Django 4.2, Django REST Framework |
| **AI** | Google Gemini AI (gemini-flash-latest) |
| **PDF Parsing** | PDF.js (Legacy v3 for max compatibility) |
| **PDF Export** | html2pdf.js, jsPDF, html2canvas |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Frontend + Python Serverless Functions) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.9+ and **pip**
- A [Google Gemini API Key](https://aistudio.google.com/apikey) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/mr-d-nobody/resume-generator.git
cd resume-generator
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up the Backend

```bash
cd backend
pip install -r ../requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_direct_neon_postgresql_connection_string
DJANGO_SECRET_KEY=replace_with_a_long_random_secret
```

Use a direct (non-pooled) Neon connection while running migrations:

```bash
cd backend
python manage.py migrate
```

Django stores users in PostgreSQL's `auth_user` table and sessions in
`django_session`. Passwords are salted, one-way hashes and are never stored as
readable text.

### 4. Run the Development Servers

**Terminal 1 — Django Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 — React Frontend:**
```bash
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:5173` and start building your resume!

> **Note:** For local development, create a `.env` file in the project root with `VITE_API_URL=http://localhost:8000` so the frontend knows where to find the backend.

---

## 📁 Project Structure

```
resume-generator/
├── api/                        # Vercel serverless function (Django WSGI entry)
│   ├── parse-resume.py         # Auto-detected as /api/parse-resume
│   └── requirements.txt        # Python dependencies for Vercel
├── backend/                    # Django project
│   ├── api/                    # Django REST API app
│   │   ├── views.py            # Resume parsing endpoint
│   │   └── urls.py             # API URL routing
│   └── resume_backend/         # Django settings & config
│       ├── settings.py
│       ├── urls.py
│       └── wsgi.py
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # Navbar, Footer
│   │   ├── forms/              # Resume input forms
│   │   └── preview/            # Live resume preview
│   ├── pages/                  # Route pages
│   │   ├── Home.jsx            # Landing page
│   │   ├── MagicUpload.jsx     # AI-powered PDF upload
│   │   ├── ResumeBuilder.jsx   # Manual entry / edit
│   │   ├── Templates.jsx       # Template gallery (6 templates)
│   │   ├── Download.jsx        # PDF export page
│   │   └── Profile.jsx         # User profile
│   ├── templates/              # 6 resume template components
│   │   ├── Template11.jsx      # Campus Standard
│   │   ├── Template12.jsx      # Internship Modern
│   │   └── Template13-16.jsx   # Remaining active designs
│   ├── contexts/               # React Context (global state)
│   ├── utils/                  # PDF parsing & AI utilities
│   └── App.jsx                 # Root app with routing
├── vercel.json                 # Vercel deployment config
├── package.json                # Node.js dependencies
└── requirements.txt            # Python dependencies
```

---

## 🌐 Deployment on Vercel

This project is deployed on [Vercel](https://vercel.com) with a hybrid architecture:

- **Frontend:** Built with Vite and served as static files
- **Backend:** Django runs as a Python serverless function via `api/parse-resume.py`

### Environment Variables (Vercel Dashboard)

| Variable | Value | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | `your_key` | Google Gemini API key |
| `DATABASE_URL` | Neon PostgreSQL URL | Persistent users and sessions |
| `DJANGO_SECRET_KEY` | Long random value | Session and signing security |
| `DJANGO_DEBUG` | `False` | Production security mode |
| `CORS_ALLOWED_ORIGINS` | Deployment URL | Allowed browser origin |
| `CSRF_TRUSTED_ORIGINS` | Deployment URL | Trusted form origin |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID | Enables the Google button in the frontend |
| `GOOGLE_CLIENT_ID` | Same Google OAuth web client ID | Verifies Google ID tokens on the backend |

### Deploy Your Own

1. Fork this repository
2. Import the project on [Vercel](https://vercel.com/new)
3. Add the environment variables above
4. Deploy! 🚀

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [MrDnobody](https://github.com/mr-d-nobody)**

⭐ Star this repo if you found it helpful!

</div>
