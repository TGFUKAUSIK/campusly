import * as cheerio from "cheerio";
import { joinCookies, vtopClient } from "@/lib/vtop/client";
import type { VtopLoginResult, VtopPrelogin } from "@/lib/vtop/types";

export async function loginToVtop(
  username: string,
  password: string,
  captcha: string,
  prelogin: VtopPrelogin
): Promise<VtopLoginResult> {
  const client = vtopClient();
  const cookieHeader = joinCookies(prelogin.cookies);

  try {
    const loginRes = await client.post(
      "/vtop/login",
      new URLSearchParams({
        _csrf: prelogin.csrf,
        username,
        password,
        captchaStr: captcha.trim().toUpperCase()
      }).toString(),
      {
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400 || status === 302
      }
    );

    const loginCookies = loginRes.headers["set-cookie"] ?? [];
    const allCookies = [...prelogin.cookies, ...loginCookies].join("; ");

    let dashboardRes;
    if (loginRes.status === 302 && loginRes.headers.location) {
      const location = loginRes.headers.location.startsWith("http")
        ? loginRes.headers.location.replace(/^https?:\/\/[^/]+/, "")
        : loginRes.headers.location;
      dashboardRes = await client.get(location, {
        headers: { Cookie: allCookies }
      });
    } else {
      dashboardRes = await client.get("/vtop/open/page", {
        headers: { Cookie: allCookies }
      });
    }

    const dashboardHtml = String(dashboardRes.data);

    if (/invalid\s*captcha/i.test(dashboardHtml)) {
      return { error: "Invalid Captcha", status: 401 };
    }
    if (/invalid\s*(user\s*name|login\s*id|user\s*id)\s*\/\s*password/i.test(dashboardHtml)) {
      return { error: "Invalid Username / Password", status: 401 };
    }
    if (/months/i.test(dashboardHtml)) {
      return {
        error: "Please visit VTOP and change your password. It has expired after the usual 3 month period.",
        status: 401
      };
    }
    if (!/authorizedidx/i.test(dashboardHtml)) {
      return { error: "Login failed for an unknown reason.", status: 500 };
    }

    const $ = cheerio.load(dashboardHtml);
    const newCsrf = $('input[name="_csrf"]').val();
    const authorizedID =
      $("#authorizedID").val() || $('input[name="authorizedid"]').val() || username;

    const csrf = Array.isArray(newCsrf) ? newCsrf[0] : newCsrf;
    if (!csrf || typeof authorizedID !== "string") {
      return { error: "Could not read the VTOP session tokens.", status: 500 };
    }

    return {
      session: {
        cookies: allCookies,
        csrf,
        authorizedID
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "VTOP login failed.";
    return { error: message, status: 500 };
  }
}
