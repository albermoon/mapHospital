# Hospital Map Application

A React application built with Vite that displays an interactive map using Leaflet and OpenStreetMap, it retrieves hospitals and associations from a Google Data Sheet.

## Features

- **Interactive Map**: Leaflet-based map with OpenStreetMap tiles
- **Hospital & Association Markers**: Custom icons with popup information
- **Google Sheets Integration**: Real-time data from Google Sheets via Apps Script
- **Multi-language Support**: English, Spanish, and French (ARB format)
- **Search & Filtering**: Filter organizations by type and search functionality
- **Add Organizations**: Form to add new hospitals and associations
- **Responsive Design**: Mobile-first approach with responsive layout
- **Real-time Status**: Connection status indicator for Google Sheets
- **Location Selection**: Click-to-select location for new organizations

## Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **OpenStreetMap** - Map tiles

### Backend/API
- **Express.js** - Server framework
- **Google APIs** - Google Sheets integration
- **Google Apps Script** - Serverless backend

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation for tests

### Deployment
- **Vercel** - Hosting and deployment platform

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Google Sheets API**: For data integration (optional for development)

### Environment Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/siscareCocoapp/mapHospital.git
cd mapHospital
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Configuration

Create environment files based on your needs:

**For Development** (`.env.development`):
```env
VITE_GOOGLE_SHEETS_ENABLED=true
VITE_TEST_MODE=false
```

**For Testing** (`.env.test`):
```env
VITE_TEST_MODE=true
VITE_GOOGLE_SHEETS_ENABLED=false
```

**For Production** (`.env.production`):
```env
VITE_GOOGLE_SHEETS_ENABLED=true
VITE_TEST_MODE=false
```

**Server Environment Variables** (for Vercel deployment):
```env
GOOGLE_SCRIPT_URL=your_google_apps_script_url_here
```

#### 4. Google Sheets Setup

The application uses Google Apps Script as the backend to interact with Google Sheets:

1. **Create a Google Sheet**:
   - Create a new Google Sheet with the following structure:
     - Sheet names: "Hospitales", "Asociaciones", "Organizaciones"
     - Columns: ID, Name, Type, Address, Phone, Website, Email, Latitude, Longitude, Country, City, Specialty, Status

2. **Create Google Apps Script**:
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Write a script to handle GET/POST requests from your app
   - Deploy as a web app with appropriate permissions

3. **Configure Vercel Environment**:
   - Add `GOOGLE_SCRIPT_URL` environment variable in Vercel dashboard
   - Set it to your deployed Google Apps Script URL

#### 5. Development Server

```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Start with host binding
npm run dev -- --host
```

The application will be available at `http://localhost:5173` (or your specified port).

#### 6. Verify Installation

1. **Check Dependencies**: `npm list` should show all packages installed
2. **Run Tests**: `npm run test` should pass all tests
3. **Build Check**: `npm run build` should complete without errors
4. **Development Server**: Application loads without console errors

### IDE Setup (Recommended)

#### VS Code Extensions

Install these recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code Settings

Add to your workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.arb": "json"
  }
}
```


### Building for Production

```bash
npm run build
```
###  Or use Vercel for Production
 
vercel --prod

### Preview Production Build

```bash
npm run preview
```

### Or use Vercel for preview

vercel

## Testing Strategy

The project implements a comprehensive testing strategy using modern tools and best practices.

### Testing Stack

- **Test Runner**: Vitest (fast, Vite-native testing framework)
- **Test Environment**: jsdom (simulates browser environment)
- **Component Testing**: React Testing Library (@testing-library/react)
- **Mocking**: Vitest built-in mocking capabilities
- **Coverage**: Vitest coverage reporting
- **Custom Reporter**: `vitest.checklist-reporter.js` for test summary with feature coverage tracking

### Test Types & Coverage

#### 1. Unit Tests
**Location**: `src/utils/` and pure functions
**Purpose**: Test individual functions in isolation
**Examples**:
- `src/utils/filter.js` - Data filtering logic
- `src/utils/mapIcons.js` - Icon creation utilities
- `src/utils/i18n.jsx` - Internationalization helpers

**Coverage Target**: 90%+ for utility functions

#### 2. Integration Tests
**Location**: `src/components/` and `src/hooks/`
**Purpose**: Test component behavior and interactions
**Examples**:
- `SearchControl.test.jsx` - Search functionality and user interactions
- `useGoogleSheets.test.js` - Data fetching and state management
- Component rendering with different props and states

**Coverage Target**: 80%+ for critical user flows

#### 3. End-to-End Tests (Planned)
**Purpose**: Full browser testing of critical user journeys
**Test Scenarios**:
- Map loads and displays correctly
- Search functionality works end-to-end
- Hospital/association markers display with correct information
- Responsive design works across devices
- Language switching functions properly

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (development)
npm run test:watch

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
npm run vercel-build
```

### Test Environment Configuration

Create a `.env.test` file for test-specific environment variables:

```env
VITE_TEST_MODE=true
VITE_GOOGLE_SHEETS_ENABLED=false
VITE_API_BASE_URL=http://localhost:3000
```

**Key Test Environment Features**:
- `VITE_TEST_MODE=true`: Enables test mode, disabling external API calls
- Network calls are mocked via `ENV_CONFIG.isTest`
- Google Sheets integration is disabled for faster, reliable tests
- Custom test data can be loaded instead of live data

### Automated Test Execution

#### Local Development
- Tests run automatically on file changes (watch mode)
- Pre-commit hooks validate tests pass before commits
- IDE integration provides inline test results

#### CI/CD Pipeline
Tests run automatically on:
- Every push to feature branches
- Every pull request
- Before merging to main branch

**CI Test Steps**:
1. Install dependencies: `npm ci`
2. Run linting: `npm run lint`
3. Run unit tests: `npm run test`
4. Run type checking: `npm run type-check` (if TypeScript)
5. Build verification: `npm run build`

### Test Data Management

- **Mock Data**: Use consistent mock data in `src/tests/mocks/`
- **Fixtures**: Store test fixtures for Google Sheets data
- **Test Utilities**: Shared test helpers in `src/tests/utils/`

### Setting Up E2E Tests (Optional)

E2E testing can be added in the future if needed. Consider tools like Playwright or Cypress when the application grows in complexity.

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Descriptive Names**: Use clear, descriptive test names that explain the scenario
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mock External Dependencies**: Mock API calls, timers, and browser APIs
5. **Test User Behavior**: Focus on what users do, not implementation details
6. **Maintain Test Data**: Keep test data realistic and up-to-date
7. **Regular Review**: Review and update tests as the application evolves

## Development Workflow

### Branch Strategy

- **`main`**: Production-ready branch
  - Always deployable and stable
  - Protected with required reviews and passing CI checks
  - Only accepts PRs from feature/fix branches
  - Direct commits are not allowed

- **`feature/<description>`**: New features and enhancements
  - Created from `main`
  - Descriptive naming (e.g., `feature/search-filters`, `feature/mobile-responsive`)
  - Should be small and focused on single features
  - Must be up-to-date with `main` before merging

- **`fix/<description>`**: Bug fixes
  - Created from `main` or relevant feature branch
  - Naming convention: `fix/map-rendering-issue`, `fix/search-performance`
  - Include issue number in PR description

- **`hotfix/<description>`**: Critical production fixes
  - Created directly from `main`
  - For urgent fixes that can't wait for normal release cycle
  - Must be merged back to `main` and relevant feature branches

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add search functionality to map component
fix: resolve memory leak in marker cleanup
docs: update API documentation
style: format code with prettier
refactor: extract map utilities to separate module
test: add unit tests for filter functions
chore: update dependencies
```

### Pull Request Process

1. **Before Creating PR**:
   - Ensure your branch is up-to-date with `main`
   - Run tests locally: `npm run test`
   - Run linting: `npm run lint`
   - Test the application: `npm run dev`

2. **PR Requirements**:
   - Clear, descriptive title and description
   - Link to related issues using `Fixes #123` or `Closes #456`
   - Include screenshots/GIFs for UI changes
   - Keep PRs small and focused (ideally < 400 lines of changes)
   - At least one code review approval required

3. **Review Checklist**:
   - [ ] Code follows project conventions
   - [ ] Tests pass and coverage is maintained
   - [ ] No console errors or warnings
   - [ ] UI changes are responsive and accessible
   - [ ] Documentation is updated if needed

4. **After Approval**:
   - Squash and merge to `main`
   - Delete feature branch after merge
   - Verify deployment on staging/preview environment

## CI/CD and Environments

- **Build**: `npm run build` via Vite. Configured for Vercel (`vercel.json`).
- **Preview deploys**: Vercel creates preview URLs for PRs.
- **Production deploy**: Merge to `main` triggers production deployment on Vercel.
- **CI tests (suggested)**: Add GitHub Actions to run lint and tests on push/PR:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

## App Architecture & Folder Structure

The application follows a modular, component-based architecture with clear separation of concerns.

### Project Structure

```
mapHospital/
├── api/                           # Backend API endpoints
│   └── google-sheets.js          # Serverless function for Google Sheets integration
├── dist/                          # Production build output (auto-generated)
│   ├── assets/                    # Bundled CSS and JS files
│   └── index.html                 # Production HTML
├── docs/                          # Project documentation
├── src/                           # Source code
│   ├── components/                # React UI components
│   │   ├── AddOrganizationForm.jsx # Form for adding new organizations
│   │   ├── AddOrganizationForm.css # Component-specific styles
│   │   ├── GoogleSheetsStatus.jsx  # Connection status indicator
│   │   ├── GoogleSheetsStatus.css  # Status component styles
│   │   ├── LanguageSelector.jsx    # Multi-language support
│   │   ├── MapComponent.jsx        # Main map display component
│   │   ├── MapSelector.css         # Map control styles
│   │   ├── MapSelector.jsx         # Map type/style selector
│   │   └── SearchControl.jsx       # Search and filter controls
│   ├── config/                    # Configuration management
│   │   └── environment.js         # Environment variables and settings
│   ├── hooks/                     # Custom React hooks
│   │   └── useGoogleSheets.js     # Data fetching and state management
│   ├── locales/                   # Internationalization resources
│   │   ├── app_en.arb            # English translations
│   │   ├── app_es.arb            # Spanish translations
│   │   └── app_fr.arb            # French translations
│   ├── tests/                     # Test files
│   │   ├── filter.test.js         # Unit tests for filtering logic
│   │   ├── SearchControl.test.jsx # Component integration tests
│   │   └── useGoogleSheets.test.js # Hook testing
│   ├── utils/                     # Utility functions
│   │   ├── filter.js             # Data filtering and search logic
│   │   ├── i18n.jsx              # Internationalization setup
│   │   └── mapIcons.js           # Leaflet map icon configurations
│   ├── App.jsx                   # Main application component
│   ├── App.css                   # Application-level styles
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global CSS styles
├── vitest.checklist-reporter.js  # Custom test reporter
├── vitest.setup.js               # Test environment setup
├── vite.config.js                # Vite build configuration
├── vercel.json                   # Vercel deployment settings
├── package.json                  # Dependencies and scripts
└── README.md                     # This documentation
```

### Component Architecture

#### Core Components

**MapComponent.jsx**
- Main map display using Leaflet
- Handles map initialization, marker placement, and user interactions
- Integrates with Google Sheets data via `useGoogleSheets` hook

**SearchControl.jsx**
- Provides search and filtering functionality
- Includes text input and category filters
- Uses `filter.js` utilities for data processing

**MapSelector.jsx**
- Allows users to switch between different map styles
- Manages map tile layer selection
- Integrates with Leaflet layer control

**LanguageSelector.jsx**
- Provides multi-language support
- Uses ARB (Application Resource Bundle) format
- Integrates with `i18n.jsx` for translation management

**GoogleSheetsStatus.jsx**
- Displays connection status to Google Sheets
- Shows loading states and error messages
- Provides user feedback for data fetching operations

**AddOrganizationForm.jsx**
- Form component for adding new hospitals/associations
- Handles form validation and submission
- Integrates with Google Sheets API

#### Data Layer

**useGoogleSheets.js**
- Custom hook for Google Sheets integration
- Manages data fetching, caching, and error handling
- Provides loading states and data to components

**filter.js**
- Pure utility functions for data filtering
- Implements search algorithms and category filtering
- Unit tested for reliability

**mapIcons.js**
- Configuration for Leaflet map markers
- Defines different icon styles for hospitals vs associations
- Centralized icon management

### Configuration Management

**environment.js**
- Centralized environment configuration
- Handles different environments (development, test, production)
- Manages Google Sheets integration settings
- Provides environment validation and debugging utilities

**vite.config.js**
- Build configuration for Vite
- Test setup with Vitest and jsdom
- Custom ARB loader for internationalization files
- Development server configuration

### API Integration

**google-sheets.js** (Serverless Function)
- Handles GET/POST requests to Google Apps Script
- Processes hospital and association data
- Manages error handling and response formatting
- Supports multiple sheet types (Hospitales, Asociaciones, Organizaciones)

### Styling Architecture

- **Global Styles**: `index.css` - Base styles, CSS reset, global variables
- **App Styles**: `App.css` - Application-level layout and themes
- **Component Styles**: Individual CSS files for each component
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

### Internationalization

- **ARB Format**: Uses Application Resource Bundle for translations
- **Supported Languages**: English (en), Spanish (es), French (fr)
- **Dynamic Loading**: Translations loaded based on user selection
- **Fallback**: Defaults to English if translation missing

### Data Flow

1. **Initialization**: App loads, `useGoogleSheets` hook fetches data
2. **Data Processing**: Raw Google Sheets data processed through `filter.js`
3. **Component Rendering**: Components receive filtered data as props
4. **User Interactions**: Search/filter changes trigger re-processing
5. **State Updates**: React state updates trigger component re-renders

### Key Design Patterns

- **Custom Hooks**: Encapsulate complex logic and state management
- **Pure Functions**: Utility functions are side-effect free and testable
- **Component Composition**: Reusable components with clear interfaces
- **Separation of Concerns**: Clear boundaries between UI, logic, and data
- **Error Boundaries**: Graceful error handling and user feedback

## Troubleshooting

### Common Issues and Solutions

#### Development Server Issues

**Problem**: Development server won't start
```bash
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
```bash
# Kill process using port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

**Problem**: Hot reload not working
- Check if file watchers are enabled
- Restart the development server
- Clear browser cache

#### Google Sheets Integration Issues

**Problem**: "Failed to fetch data from Google Sheets"
- Verify API key is correct in environment variables
- Check if Google Sheets API is enabled in Google Cloud Console
- Ensure the sheet is publicly readable or properly shared
- Check network connectivity and CORS settings

**Problem**: Sheet data not loading
- Verify sheet ID is correct
- Check sheet structure matches expected format
- Ensure sheet has proper headers in the first row
- Check browser console for specific error messages

#### Build Issues

**Problem**: Build fails with memory errors
```bash
Error: JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or use Vite's chunk splitting
# Add to vite.config.js:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet']
        }
      }
    }
  }
})
```

**Problem**: Build succeeds but app doesn't work in production
- Check if all environment variables are set correctly
- Verify API endpoints are accessible from production domain
- Check browser console for runtime errors
- Ensure all static assets are being served correctly

#### Testing Issues

**Problem**: Tests fail with "Cannot find module" errors
```bash
Error: Cannot find module '@/components/MapComponent'
```

**Solution**:
- Check if path aliases are configured correctly in `vite.config.js`
- Verify import paths are using correct aliases
- Ensure test files are in the correct directory structure

**Problem**: Tests fail in CI but pass locally
- Check Node.js version compatibility
- Verify environment variables are set in CI
- Check if all dependencies are properly installed with `npm ci`
- Look for differences in test environment configuration

#### Map Display Issues

**Problem**: Map tiles not loading
- Check internet connectivity
- Verify OpenStreetMap tiles are accessible
- Try different tile providers in MapSelector
- Check for ad blockers or network restrictions

**Problem**: Markers not appearing on map
- Verify data is being fetched correctly
- Check marker coordinates are valid (lat/lng format)
- Ensure map is fully loaded before adding markers
- Check for JavaScript errors in console

#### Performance Issues

**Problem**: App loads slowly
- Check network tab for slow API calls
- Optimize image assets and use appropriate formats
- Implement lazy loading for components
- Consider code splitting for large bundles

**Problem**: Map interactions are laggy
- Reduce number of markers displayed simultaneously
- Implement marker clustering for dense areas
- Optimize marker rendering with virtualization
- Check for memory leaks in map event handlers

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

This will provide:
- Detailed API request/response logs
- Component lifecycle information
- Performance metrics
- Error stack traces

### Getting Help

1. **Check Existing Issues**: Search the repository's issue tracker
2. **Review Documentation**: Ensure you've followed all setup steps
3. **Check Console Logs**: Browser developer tools often provide helpful error messages
4. **Test in Isolation**: Try reproducing the issue in a minimal setup
5. **Community Support**: Create a detailed issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, browser)
   - Console logs and error messages
   - Screenshots if applicable

### Environment-Specific Issues

#### Windows Development
- Use PowerShell or Git Bash instead of Command Prompt
- Ensure line endings are set to LF in Git configuration
- Check Windows Defender isn't blocking Node.js processes

#### macOS Development
- May need to install Xcode command line tools: `xcode-select --install`
- Check for permission issues with file watchers
- Ensure proper Node.js installation via nvm or official installer

#### Linux Development
- Install build essentials: `sudo apt-get install build-essential`
- Check for proper file permissions
- Ensure proper Node.js installation via package manager or nvm

## Customization

### Map Configuration

**Change Default Map Center**:
```javascript
// In src/config/environment.js
export const MAP_CONFIG = {
  center: [40.7128, -74.0060], // [latitude, longitude]
  zoom: 10,
  maxZoom: 18,
  minZoom: 3
};
```

**Add Custom Map Styles**:
```javascript
// In MapSelector.jsx
const customTiles = {
  'Custom Style': L.tileLayer('https://your-tile-server/{z}/{x}/{y}.png', {
    attribution: 'Your Attribution'
  })
};
```

**Customize Map Icons**:
```javascript
// In src/utils/mapIcons.js
export const createCustomIcon = (type, color = 'blue') => {
  return L.divIcon({
    html: `<div class="custom-marker ${type}" style="background-color: ${color}"></div>`,
    className: 'custom-icon',
    iconSize: [25, 25]
  });
};
```

### Adding New Features

1. **New Component**: Create in `src/components/` with corresponding CSS file
2. **New Utility**: Add to `src/utils/` with unit tests
3. **New Hook**: Create in `src/hooks/` with integration tests
4. **New Language**: Add ARB file in `src/locales/` and update language selector

### Styling Customization

**Theme Variables** (in `src/index.css`):
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}
```

**Responsive Breakpoints**:
```css
/* Mobile first approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

## License

This project is licensed under the ISC License.
