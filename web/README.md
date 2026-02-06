# Financy - Web

Frontend application for the Financy personal finance manager.

## Overview

A modern React application built with TypeScript and Vite that helps users manage their personal finances through:
- Category management with custom colors
- Transaction tracking and visualization
- Savings goals management
- Financial flow overview and analytics

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Context API** - State management
- **CSS Modules** - Component styling

## Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:3333`

3. Build for production:
```bash
npm run build
```

## Project Structure

- **pages/** - Main page components (Dashboard, Transactions, Categories, Goals, Flow)
- **components/** - Reusable UI components
- **contexts/** - React context for state management (Finance, Theme)
- **services/** - API client and data fetching
- **constants.ts** - Application constants
- **types.ts** - TypeScript type definitions

## Features

### Dashboard
- Overview of financial summary
- Quick access to main features

### Transactions
- View all transactions
- Create new transactions
- Categorize and filter transactions
- Edit/delete transactions

### Categories
- Manage income and expense categories
- Custom color coding
- Track spending by category

### Savings Goals
- Create and track savings goals
- Monitor progress towards goals
- Update goal amounts

### Financial Flow
- Visualize income vs expenses
- View financial trends and analytics

## Configuration

The app connects to the backend API at `http://localhost:3000`. Ensure the backend is running before starting the frontend.

## Development

All API calls go through the centralized service in `services/api.ts` which handles communication with the backend endpoints.
