export function getNonce(): string {
    // Generate a random nonce. Nonce is a number that is only used once.
    // Here, we use a simple method to generate a unique string by combining
    // current date and time with a random number, ensuring uniqueness for practical purposes.
    const datePart = new Date().getTime(); // Get current time in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 15); // Generate a random string
    return `nonce_${datePart}_${randomPart}`;
  }