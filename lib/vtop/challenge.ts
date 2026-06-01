import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function secret() {
  return process.env.VTOP_BRIDGE_SECRET ?? "campusly-local-development-only";
}

export function createCaptchaCode(length = 5) {
  return Array.from({ length }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
}

export function signCaptcha(code: string) {
  const normalized = code.toUpperCase();
  const signature = createHmac("sha256", secret()).update(normalized).digest("hex");
  return `${normalized}.${signature}`;
}

export function verifyCaptcha(token: string | undefined, answer: string) {
  if (!token) return false;

  const [expectedCode, expectedSignature] = token.split(".");
  if (!expectedCode || !expectedSignature) return false;

  const normalizedAnswer = answer.trim().toUpperCase();
  const actualSignature = createHmac("sha256", secret()).update(expectedCode).digest("hex");
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(actualSignature);

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual) &&
    normalizedAnswer === expectedCode
  );
}

export function renderCaptchaSvg(code: string) {
  const letters = [...code]
    .map(
      (letter, index) =>
        `<text x="${28 + index * 34}" y="${50 + (index % 2 === 0 ? -4 : 5)}" transform="rotate(${index % 2 === 0 ? -9 : 8} ${28 + index * 34} 46)">${letter}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="74" viewBox="0 0 210 74">
    <rect width="210" height="74" rx="16" fill="#eef5f1"/>
    <path d="M8 20 C54 62 115 4 202 48 M5 54 C72 3 132 66 205 25" fill="none" stroke="#77a79d" stroke-width="2" opacity=".5"/>
    <g fill="#174d45" font-family="Arial, sans-serif" font-size="31" font-weight="700" letter-spacing="4">${letters}</g>
  </svg>`;
}
