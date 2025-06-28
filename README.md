# SLxAI Summit Website

## About SLxAI

SLxAI (Sign Language x AI) is an initiative to unite industry leaders in establishing the future of sign language x AI technologies. The project brings together the world's leading companies to form a cooperative nonprofit where each company will have a board seat, ensuring collaborative decision-making and ethical development of sign language x AI technologies.

## Project Overview

This website serves as the official platform for the inaugural SLxAI Summit, where industry leaders will:

- Establish a cooperative nonprofit structure
- Create industry-wide ethical standards
- Foster collaborative innovation
- Ensure equal company representation
- Develop standardized benchmarks for avatar quality and SLR performance grading
- Establish technical specifications and interoperability standards

## Technologies Used

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd slxai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Navigation.tsx  # Main navigation component
├── pages/              # Page components
│   └── Index.tsx       # Main landing page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── App.tsx             # Main app component
```

## Key Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Built with accessibility in mind using shadcn/ui
- **Form Integration**: Google Forms integration for founding member applications
- **Modern UI**: Clean, professional design with smooth animations
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## Deployment

The project is configured for easy deployment on Vercel:

1. Connect your repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Deploy with a single click

## Contributing

This is a collaborative project for the SLxAI initiative. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Contact

For questions about the SLxAI Summit or this website, please use the contact information provided on the website or reach out through the founding member application form.

## License

This project is part of the SLxAI initiative and is subject to the project's licensing terms.
