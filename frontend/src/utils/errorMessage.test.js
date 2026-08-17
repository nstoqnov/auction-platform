import { getErrorMessage } from "./errorMessage";

// Unit tests for the error extractor that turns Axios/backend errors into a
// human string. The backend speaks RFC 7807 ProblemDetail ({ detail, title, ... }).
describe("getErrorMessage", () => {
  test("prefers the RFC 7807 `detail` field", () => {
    const err = {
      response: { data: { title: "Conflict", status: 409, detail: "Modified concurrently; please retry." } },
    };
    expect(getErrorMessage(err)).toBe("Modified concurrently; please retry.");
  });

  test("falls back to a legacy `message` field", () => {
    const err = { response: { data: { message: "Bid must be higher" } } };
    expect(getErrorMessage(err)).toBe("Bid must be higher");
  });

  test("handles a plain-string response body", () => {
    const err = { response: { data: "Service unavailable" } };
    expect(getErrorMessage(err)).toBe("Service unavailable");
  });

  test("falls back to the Axios error's own message", () => {
    const err = { message: "Network Error" };
    expect(getErrorMessage(err)).toBe("Network Error");
  });

  test("uses the provided fallback when nothing else is present", () => {
    expect(getErrorMessage({}, "Custom fallback")).toBe("Custom fallback");
  });

  test("never returns an object for a body without detail/message", () => {
    const err = { response: { data: { unexpected: "shape" } } };
    const result = getErrorMessage(err);
    expect(typeof result).toBe("string");
    expect(result).toBe("An error occurred");
  });
});
