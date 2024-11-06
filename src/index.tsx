import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {RouterProvider} from "@tanstack/react-router";
import {router} from "./router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import ReactGA from "react-ga4";

Sentry.init({
  dsn: "https://fe8e094758ef6fca139ce96a2d404e57@o4508167457603584.ingest.de.sentry.io/4508167481786448",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/schedule\.arsgreg\.com\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
const queryClient = new QueryClient()

const TRACKING_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
}

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    </React.StrictMode>
);


reportWebVitals(console.log);
