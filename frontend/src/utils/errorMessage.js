// Extracts a human-readable message from an Axios error, handling the backend's
// RFC 7807 ProblemDetail responses ({ type, title, status, detail, instance }),
// legacy { message } shapes, and plain-string bodies. Never returns an object.
export function getErrorMessage(err, fallback = "An error occurred") {
  const data = err?.response?.data;
  return (
    data?.detail ||
    data?.message ||
    (typeof data === "string" ? data : null) ||
    err?.message ||
    fallback
  );
}
