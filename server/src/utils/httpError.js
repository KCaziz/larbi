export class HttpError extends Error {
  // `details` is optional structured info safe to show the client
  // (e.g. the list of unmet publication requirements).
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
