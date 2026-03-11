// Dominican Republic phone formats: 809-XXX-XXXX, 829-XXX-XXXX, 849-XXX-XXXX
const DR_PHONE_REGEX = /^(1)?(809|829|849)\d{7}$/;

function normalizePhone(phone) {
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '');
  // Remove leading 1 if present (country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return DR_PHONE_REGEX.test(normalized);
}

function isValidBirthday(birthday) {
  if (!birthday) return true;
  const match = birthday.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

function generateVipCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BELLA${num}`;
}

module.exports = { normalizePhone, isValidPhone, isValidBirthday, generateVipCode };
