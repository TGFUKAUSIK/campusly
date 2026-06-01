import * as cheerio from "cheerio";
import { joinCookies, vtopClient } from "@/lib/vtop/client";
import type { VtopCaptchaResult } from "@/lib/vtop/types";

const MAX_RETRIES = 10;

export async function fetchVtopCaptcha(): Promise<VtopCaptchaResult> {
  const client = vtopClient();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const setupRes = await client.get("/vtop/prelogin/setup");
      const setupCookies = setupRes.headers["set-cookie"];
      if (!setupCookies?.length) {
        throw new Error("VTOP did not return pre-login cookies.");
      }

      const $ = cheerio.load(setupRes.data);
      const csrfValue = $("#stdForm input[name=_csrf]").val();
      const csrf = Array.isArray(csrfValue) ? csrfValue[0] : csrfValue;
      if (!csrf) {
        await sleep(1000);
        continue;
      }

      await client.post(
        "/vtop/prelogin/setup",
        new URLSearchParams({ _csrf: csrf, flag: "VTOP" }).toString(),
        {
          headers: {
            Cookie: joinCookies(setupCookies),
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      const loginPage = await client.get("/vtop/login", {
        headers: { Cookie: joinCookies(setupCookies) }
      });

      const $$ = cheerio.load(loginPage.data);
      const isRecaptcha = $$("input#gResponse").length === 1;

      if (isRecaptcha) {
        await sleep(1000);
        continue;
      }

      const imgSrc = $$("#captchaBlock img").attr("src");
      if (!imgSrc) {
        throw new Error("Captcha image source not found on the VTOP login page.");
      }

      let image: Buffer;
      let contentType = "image/jpeg";

      if (imgSrc.startsWith("data:image")) {
        const match = imgSrc.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!match?.[2]) {
          throw new Error("Invalid inline captcha image.");
        }
        contentType = match[1] ?? contentType;
        image = Buffer.from(match[2], "base64");
      } else {
        const imgPath = imgSrc.startsWith("http") ? imgSrc.replace(/^https?:\/\/[^/]+/, "") : imgSrc;
        const imgRes = await client.get(imgPath, {
          responseType: "arraybuffer",
          headers: { Cookie: joinCookies(setupCookies) }
        });
        image = Buffer.from(imgRes.data);
        contentType = (imgRes.headers["content-type"] as string) ?? contentType;
      }

      return {
        image,
        contentType,
        prelogin: { cookies: setupCookies, csrf }
      };
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        const message = error instanceof Error ? error.message : "Unknown captcha error.";
        return { error: `Failed after ${MAX_RETRIES} attempts. ${message}` };
      }
      await sleep(1000);
    }
  }

  return { error: `Failed to load a text captcha after ${MAX_RETRIES} attempts.` };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
