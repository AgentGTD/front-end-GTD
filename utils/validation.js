export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePassword(password) { // other constarints can imposed on password
  return password.length >= 8;
}
