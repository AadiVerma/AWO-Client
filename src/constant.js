export const CONFIG = {
  POLL_INTERVAL: 2000, // 2 seconds
  MAX_RETRIES: 30, // Total 60 seconds timeout
  STATUS: {
    QUEUED: 202,
    COMPLETED: "completed",
    FAILED: "failed",
  },
};

export const ERRORS = {
  // Logic Errors
  FAILED: "AWO_JOB_FAILED: The background task encountered an error on the server.",
  TIMEOUT: "AWO_TIMEOUT: The task took too long and exceeded the maximum retry limit.",
  
  // Network Errors
  NETWORK_ERROR: "AWO_NETWORK_ERROR: Unable to reach the server. Retrying...",
  PARSE_ERROR: "AWO_PARSE_ERROR: Received an invalid response format from the server.",
  
  // Control Errors
  ABORTED: "AWO_ABORTED: The request was cancelled by the user/component.",
  INVALID_TASK: "AWO_INVALID_TASK: The server did not return a valid task_id."
};