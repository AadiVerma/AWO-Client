# @adaptive-workload/awo-client 🚀

[![NPM Version](https://img.shields.io/npm/v/@adaptive-workload/awo-client.svg)](https://www.npmjs.com/package/@adaptive-workload/awo-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build: Pure JS](https://img.shields.io/badge/Environment-Vanilla%20JS-orange.svg)]()

**AWO Client** is a professional, zero-dependency JavaScript SDK designed to handle "Adaptive Ingestion." It transforms standard synchronous API calls into resilient asynchronous workflows when your backend signals high load.

## 💡 Why AWO Client?

Traditional applications crash when traffic spikes. **AWO Client** works with the **AWO Ruby Gem** to protect your infrastructure. Instead of failing with a 5xx error, the server returns a `202 Accepted`. This SDK intercepts that response and handles the "waiting" logic automatically, providing a seamless experience for the user.

## ✨ Key Features

- **Transparent Interception:** Works exactly like native `fetch`.
- **Sequential Polling:** Prevents request stacking and "hammering" the server.
- **Enterprise-Grade Backoff:** Implements **Exponential Backoff + Jitter** to smear server load.
- **Zombie Prevention:** Full `AbortSignal` support to stop polling when users navigate away.
- **Signature Rehydration:** Reconstructs results into a native `Response` object (status, headers, and body).
- **Hardened Error Handling:** Resilient against network timeouts, 500s, and non-JSON responses.

## 📦 Installation

```bash
npm install @ark/awo-client
```

## 🚀 Usage

### 1. Basic Fetch Replacement

Replace your native `fetch` with `awoFetch`. If the system is healthy, it behaves normally. If the system is busy, it intercepts the `202 Accepted` and polls until the data is ready.

```javascript
import { awoFetch } from "@your-org/awo-client";

async function submitOrder() {
  try {
    const response = await awoFetch("/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: 42 }),
    });

    // Even if the request was queued/polled for 20 seconds,
    // .json() works exactly like a native fetch response.
    const data = await response.json();
    console.log("Order complete:", data);
  } catch (err) {
    console.error("Task failed:", err.message);
  }
}
```

## 2. Handling Cancellation (Recommended)

Use `AbortController` to ensure polling stops if the component unmounts (e.g., in React useEffect).JavaScript

```javascript
const controller = new AbortController();
awoFetch("/api/video-process", {
  method: "POST",
  signal: controller.signal,
}).catch((err) => {
  if (err.message.includes("ABORTED")) console.warn("Polling stopped.");
});

// To stop the polling loop manually:
controller.abort();
```

## 🛠 Project Architecture

This package is built with a modular "separation of concerns" structure

1. index.js: The Public API entry point.
2. interceptor.js: Logic to distinguish between immediate results and orchestrated tasks.
3. poller.js: The core engine managing the sequential retry loop and backoff math.
4. constants.js: Centralized configuration for intervals, retries, and error strings.

## ⚙️ Professional Defaults

| Feature           | Value               | Reason                                          |
| :---------------- | :------------------ | :---------------------------------------------- |
| **Base Interval** | `2000ms`            | Balanced responsiveness and server load.        |
| **Backoff**       | Exponential ($2^n$) | Gives the server time to recover.               |
| **Jitter**        | `20%` Randomized    | Prevents synchronized "Thundering Herds."       |
| **Max Retries**   | `30` Attempts       | Prevents infinite loops (~60-90s total).        |
| **Req Timeout**   | `10000ms`           | Prevents individual poll requests from hanging. |

---

## 📄 License

MIT ©**ARK-AWO**
