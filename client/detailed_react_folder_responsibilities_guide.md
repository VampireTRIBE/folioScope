# Detailed React Folder Responsibilities Guide

# `src/`

Root of the frontend application.

Everything inside `src` should belong to the application itself.

Do not place:

- Random scripts
- Backup files
- Temporary experiments
- Unused components

inside `src`.

---

# `app/`

Application-level configuration.

This folder controls how the whole app works.

Not business features.
Not reusable UI.

Global application setup only.

---

## `store.js`

Redux store configuration.

### Responsibilities

- Combine reducers
- Configure middleware
- Setup Redux Toolkit
- Enable Redux DevTools

### Example

```js
configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
  },
});
```

### Why This File Exists

The Redux store belongs to the entire application, not a single feature.

---

## `router.jsx`

Central routing configuration.

### Responsibilities

- Define routes
- Define layouts
- Route nesting
- Protected routes
- Route guards

### Example

```jsx
createBrowserRouter([
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);
```

### Why This File Exists

Routing is application-level infrastructure.

---

## `providers/`

Global React providers.

### Examples

- Redux Provider
- Theme Provider
- Query Client Provider
- Auth Provider

### Example

```jsx
<Provider store={store}>
  <App />
</Provider>
```

### Why This Folder Exists

Provider nesting becomes messy very quickly.

Separating providers keeps `main.jsx` clean.

---

# `assets/`

Static assets only.

No logic.

---

## `images/`

Static image files.

### Examples

- Logos
- Backgrounds
- Illustrations
- Hero images

---

## `icons/`

Custom SVG icons.

### Important

Do not mix:

- Reusable SVG components
- Random PNG icon files

---

## `fonts/`

Custom local fonts.

### Examples

- Inter
- Poppins
- Roboto

---

# `components/`

Reusable presentation layer.

These should be:

- Reusable
- Generic
- UI-focused

Minimal business logic.

---

# `components/ui/`

Primitive reusable components.

This becomes your design system.

### Examples

- Button
- Input
- Card
- Modal
- Badge
- Tooltip

### Main Question

Can this component be reused anywhere?

If yes, it belongs in `ui/`.

---

## `Button/`

### Example

```jsx
<Button variant="primary" />
```

### Should NOT

- Fetch data
- Know Redux
- Know portfolio logic
- Know authentication logic

### Bad Example

```jsx
<Button buyStock />
```

Now the Button is business-aware.
Architecture becomes tightly coupled.

---

# `components/layout/`

Application structure components.

### Examples

- Header
- Sidebar
- Navbar
- Footer

These define application layout.

Not feature business logic.

---

# `features/`

Most important folder.

This is the actual application.

Every business domain becomes a feature.

### Examples

- auth
- portfolio
- transactions
- dashboard
- analytics

Each feature owns:

- API logic
- Hooks
- Components
- Pages
- Redux slice
- Utilities
- Selectors

This prevents spaghetti architecture.

---

# `features/auth/`

Authentication feature.

Everything related to authentication stays here.

---

## `api/`

Feature-specific API calls.

### Example

```js
export const loginUser = (data) => {
  return api.post("/login", data);
};
```

### Why Separate This

API logic should not live inside components.

### Bad Example

```jsx
useEffect(() => {
  axios.post(...)
}, []);
```

The component becomes messy and hard to maintain.

---

## `hooks/`

Feature-specific custom hooks.

### Examples

```js
useLogin()
useAuth()
useRefreshToken()
```

### Why This Folder Exists

Hooks contain React lifecycle logic.

They should stay close to the feature they belong to.

---

## `components/`

Feature-specific UI.

### Examples

```txt
LoginForm
RegisterForm
AuthCard
```

These components belong only to authentication.

They are not globally reusable.

---

## `pages/`

Route-level components.

### Examples

```txt
LoginPage.jsx
RegisterPage.jsx
```

Usually mapped directly to routes.

---

## `utils/`

Pure helper functions related only to this feature.

### Examples

```js
validatePassword()
formatAuthError()
```

### Important Rule

If logic becomes reusable across the app, move it to global `utils/`.

---

## `authSlice.js`

Redux slice.

Contains:

- Reducers
- Actions
- State
- Async reducers

### Example

```js
createSlice({
  name: "auth",
});
```

---

## `authSelectors.js`

Centralized Redux selectors.

### Example

```js
export const selectUser = (state) => state.auth.user;
```

### Why This Exists

Direct state access everywhere creates chaos.

Selectors centralize state access.

---

# `portfolio/`

Same architecture pattern.

This feature owns:

- Holdings
- Portfolio stats
- Charts
- Asset allocation
- Performance tracking

Feature isolation is critical for scalability.

---

# `transactions/`

Transaction-related business logic.

### Examples

- Buy/sell actions
- Order processing
- Transaction history
- Order APIs
- Trade validation

Each feature becomes independently scalable.

---

# `hooks/`

Global reusable custom hooks.

These are NOT feature-specific.

### Examples

```js
useDebounce
useLocalStorage
useModal
```

Used across multiple features.

---

## `useDebounce.js`

Reusable debouncing logic.

### Common Usage

- Search optimization
- Delayed API calls

---

## `useModal.js`

Reusable modal state management.

---

## `useLocalStorage.js`

Reusable localStorage synchronization.

---

# `services/`

Infrastructure layer.

Critical distinction:

This is NOT business logic.

This is application infrastructure.

---

## `axios.js`

Configured Axios instance.

### Example

```js
const api = axios.create({
  baseURL: ENV.API_URL,
});
```

### Why This Exists

Single source of HTTP configuration.

---

## `interceptors.js`

Axios interceptors.

### Responsibilities

- Attach auth token
- Refresh tokens
- Handle global errors
- Request logging

---

## `tokenService.js`

Token storage logic.

### Examples

- Save token
- Remove token
- Get token
- Clear token

### Why Separate This

Authentication infrastructure should not spread across the app.

---

# `utils/`

Global pure functions.

No hooks.
No React.
No Redux.

Pure logic only.

---

## `formatCurrency.js`

### Example

```js
formatCurrency(1000);
```

---

## `dateFormatter.js`

Date formatting utilities.

---

## `validators.js`

Validation utilities.

### Examples

- Email validation
- Number validation
- Password validation

---

# `constants/`

Immutable application values.

No business logic.

---

## `routes.js`

Centralized route constants.

### Example

```js
export const ROUTES = {
  LOGIN: "/login",
};
```

### Why This Exists

Avoid hardcoded route strings everywhere.

---

## `apiEndpoints.js`

Centralized API endpoints.

### Example

```js
export const API = {
  LOGIN: "/auth/login",
};
```

---

## `appConstants.js`

Global application constants.

### Examples

- Pagination limits
- User roles
- Theme names
- App limits

---

# `styles/`

Global styling system.

---

## `globals.css`

Global resets and base styles.

### Examples

- Body styles
- Typography reset
- Global element styling

---

## `variables.css`

CSS variables.

### Example

```css
--color-primary
--space-4
```

Centralized design tokens.

---

## `themes/`

Theme-specific styles.

### Examples

- Dark theme
- Light theme
- High contrast theme

---

# `main.jsx`

Application entry point.

Usually responsible for:

- ReactDOM rendering
- Provider mounting
- Router mounting
- Application startup

### Example

```jsx
ReactDOM.createRoot(root).render(<App />);
```

---

# Most Important Architecture Rule

Folder structure is NOT the goal.

Ownership boundaries are the goal.

Bad developers memorize:

- Folder names
- Boilerplate structures

Good developers understand:

- What owns what
- What depends on what
- What should stay isolated

That is actual software architecture.

