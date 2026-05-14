# React Feature-Based Architecture Guide

## Recommended Folder Structure

```txt
src/
│
├── app/
│   ├── store.js
│   ├── router.jsx
│   └── providers/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   │
│   └── layout/
│       ├── Header/
│       ├── Sidebar/
│       └── Navbar/
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── authSlice.js
│   │   └── authSelectors.js
│   │
│   ├── portfolio/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── portfolioSlice.js
│   │   └── portfolioSelectors.js
│   │
│   └── transactions/
│
├── hooks/
│   ├── useDebounce.js
│   ├── useModal.js
│   └── useLocalStorage.js
│
├── services/
│   ├── axios.js
│   ├── interceptors.js
│   └── tokenService.js
│
├── utils/
│   ├── formatCurrency.js
│   ├── dateFormatter.js
│   └── validators.js
│
├── constants/
│   ├── routes.js
│   ├── apiEndpoints.js
│   └── appConstants.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── themes/
│
└── main.jsx
```

---

# Folder Responsibilities

## 1. components/

Reusable UI components.

Examples:

- Button
- Modal
- Input
- Card

These should:

- Avoid business logic
- Avoid Redux logic
- Avoid direct API calls

### Bad Example

```jsx
<Button fetchPortfolioData />
```

### Good Example

```jsx
<Button onClick={handleFetch} />
```

---

## 2. features/

This is the actual application layer.

Each feature owns:

- Redux slice
- Hooks
- API logic
- Components
- Pages
- Utilities related to that feature

### Example

```txt
features/
  auth/
  portfolio/
  transactions/
```

This prevents:

- Giant global folders
- Spaghetti imports
- Random utilities everywhere

Feature-first architecture scales far better than type-first architecture.

### Bad Structure

```txt
components/
hooks/
pages/
services/
```

for the entire app globally.

Eventually this becomes hard to maintain.

---

## 3. hooks/

Global reusable custom hooks.

### Examples

```js
useDebounce
useLocalStorage
usePrevious
```

Feature-specific hooks should stay inside the feature folder.

### Example

```txt
features/auth/hooks/useLogin.js
```

---

## 4. utils/

Pure functions only.

No hooks.
No React.
No Redux.

### Good Example

```js
export const calculateProfit = () => {};
```

### Bad Example

```js
export const useProfit = () => {};
```

That belongs inside hooks.

---

## 5. services/

Infrastructure layer.

Used for:

- Axios instances
- Token handling
- Interceptors
- Shared API configuration

### Example

```js
api.get("/portfolio");
```

---

## 6. api/ Inside Features

Actual feature API calls.

### Example

```js
export const getPortfolio = () => {
  return api.get("/portfolio");
};
```

---

## 7. Redux Selectors

Avoid accessing Redux state directly everywhere.

### Bad Example

```js
const user = useSelector((state) => state.auth.user);
```

### Good Example

```js
export const selectUser = (state) => state.auth.user;
```

Then:

```js
const user = useSelector(selectUser);
```

Benefits:

- Centralized state access
- Easier refactoring
- Better maintainability
- Cleaner components

---

# Recommended Custom Hook Pattern

## Example

```js
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { headerToggleActions } from "../store/headerSlice";

export const useHeaderActions = () => {
  const dispatch = useDispatch();

  const toggleUser = useCallback(() => {
    dispatch(
      headerToggleActions.TOGGLE({
        key: "userToggle",
      })
    );
  }, [dispatch]);

  const closeUser = useCallback(() => {
    dispatch(
      headerToggleActions.CLOSE({
        key: "userToggle",
      })
    );
  }, [dispatch]);

  return {
    toggleUser,
    closeUser,
  };
};
```

Usage:

```jsx
const { toggleUser, closeUser } = useHeaderActions();
```

---

# Separation of Concerns Rules

## Use Utility Functions When:

- Logic is pure
- No React hooks are needed
- No component lifecycle is needed
- Reusable outside React

### Example

```js
export const formatCurrency = (amount) => {
  return `$${amount}`;
};
```

---

## Use Custom Hooks When:

You need:

- useState
- useEffect
- useDispatch
- useSelector
- useMemo
- useCallback
- React lifecycle behavior

### Example

```js
export const useAuth = () => {
  const dispatch = useDispatch();

  const login = useCallback(() => {
    // login logic
  }, [dispatch]);

  return { login };
};
```

---

# Major Mistakes Beginners Make

## 1. Giant Utility Files

Bad:

```txt
helpers.js
utils.js
common.js
misc.js
```

These become garbage dump files.

---

## 2. Over-Abstraction

Avoid:

- Generic repositories
- Service factories
- Abstract controllers
- Enterprise boilerplate
- Deep nesting for simple logic

Most frontend apps do not need this complexity.

---

## 3. Premature Optimization

Developers often over-optimize:

- useCallback
- useMemo
- Tiny function recreations

while ignoring real performance problems:

- Large rerenders
- Bad state management
- Huge component trees
- Expensive calculations
- Poor context usage
- Unvirtualized lists

---

# Final Rule

Keep logic:

- Close to the feature
- Close to usage
- Extracted only when reusable or large

This is the balance most developers fail to maintain.

