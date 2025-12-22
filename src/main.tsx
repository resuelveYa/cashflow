import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ClerkProvider } from '@clerk/clerk-react';
import { ENV } from './config/env';

// Validar que existe la publishable key
const clerkPubKey = ENV.CLERK.PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl={ENV.CLERK.AFTER_SIGN_IN_URL}
      signInUrl={ENV.CLERK.SIGN_IN_URL}
      signUpUrl={ENV.CLERK.SIGN_UP_URL}
    >
      <ThemeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
);