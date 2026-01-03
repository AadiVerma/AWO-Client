import { CONFIG, ERRORS } from "./constants.js";

export async function startPolling(taskId, signal) {
  let attempts = 0;
  let timeoutId = null;

  return new Promise((resolve, reject) => {
    // Cleanup and Reject on Abort
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new Error(ERRORS.ABORTED));
    };

    // Initialize Abort Listener
    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort);

    const poll = async () => {
      if (signal?.aborted) return;

      // Internal controller for the 10s request timeout
      const internalController = new AbortController();
      const perRequestTimeout = setTimeout(
        () => internalController.abort(),
        CONFIG.REQUEST_TIMEOUT_MS
      );

      try {
        const response = await fetch(`/awo/status/${taskId}`, {
          signal: internalController.signal,
        });
        clearTimeout(perRequestTimeout);

        if (!response.ok) return scheduleNext();

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          return scheduleNext(); // Handle non-JSON responses
        }

        if (data.status === CONFIG.STATUS.COMPLETED) {
          signal?.removeEventListener("abort", onAbort);
          const { data: body, status, headers } = data.result;

          const processedBody =
            typeof body === "object" ? JSON.stringify(body) : body;
          return resolve(
            new Response(processedBody, {
              status: status || 200,
              headers: new Headers(headers),
            })
          );
        }

        if (data.status === CONFIG.STATUS.FAILED) {
          signal?.removeEventListener("abort", onAbort);
          return reject(new Error(ERRORS.FAILED));
        }

        attempts++;
        attempts >= CONFIG.MAX_RETRIES
          ? reject(new Error(ERRORS.TIMEOUT))
          : scheduleNext();
      } catch (err) {
        clearTimeout(perRequestTimeout);

        // Handle the 10s timeout abort vs the user's manual abort
        if (err.name === "AbortError" && !signal?.aborted) {
          console.warn("[AWO] Single poll attempt timed out. Retrying...");
          return scheduleNext();
        }

        if (signal?.aborted) return;
        attempts >= CONFIG.MAX_RETRIES ? reject(err) : scheduleNext();
      }
    };

    const scheduleNext = () => {
      if (signal?.aborted) return;

      // Exponential Backoff + Jitter
      const baseDelay =
        CONFIG.POLL_INTERVAL * Math.pow(2, Math.min(attempts, 5));
      const jitter = baseDelay * 0.2 * Math.random();
      const finalDelay = Math.min(baseDelay + jitter, 15000);

      timeoutId = setTimeout(poll, finalDelay);
    };

    poll();
  });
}
