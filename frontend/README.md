# Frontend - Dental Clinic Management System

React-based user interface for dental clinic management.

## Technology Stack

- **React:** 18
- **Vite:** 5
- **Axios:** 1.6+
- **CSS:** Custom styling with Material Design

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open browser to `http://localhost:5173`

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Project Structure

```
src/
├── components/        # React components
│   ├── AppointmentTable.jsx
│   ├── SearchBar.jsx
│   ├── TreatmentFilter.jsx
│   ├── Modal.jsx
│   ├── PatientForm.jsx
│   └── AppointmentForm.jsx
├── services/          # API integration
│   └── api.js
├── App.jsx            # Main component
├── App.css            # Styles
└── main.jsx           # Entry point
```

## Building for Production

```bash
npm run build
```

Build output will be in `dist/` directory.

## Deployment

```bash
# Using serve
npx serve -s dist -p 5173

# Or any static file server
```

## Features

- Responsive design (mobile-friendly)
- Real-time search with debouncing
- Multi-criteria filtering
- Form validation
- Modal-based forms
- Success/error notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## License

MIT License - See LICENSE file