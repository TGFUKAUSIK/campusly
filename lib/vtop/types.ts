export type VtopSession = {
  cookies: string;
  csrf: string;
  authorizedID: string;
};

export type VtopPrelogin = {
  cookies: string[];
  csrf: string;
};

export type VtopCaptchaResult =
  | {
      image: Buffer;
      contentType: string;
      prelogin: VtopPrelogin;
    }
  | { error: string };

export type VtopLoginResult =
  | { session: VtopSession }
  | { error: string; status?: number };
