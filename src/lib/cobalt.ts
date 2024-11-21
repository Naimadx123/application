export interface CobaltPicker {
  type: 'photo' | 'video' | 'gif';
  url: string;
  thumb?: string;
}

export type CobaltErrorCode =
  | 'auth.key.invalid'
  | 'auth.jwt.missing'
  | 'auth.jwt.invalid'
  | 'auth.turnstile.missing'
  | 'auth.turnstile.invalid'
  | 'rate_exceeded'
  | 'capacity'
  | 'generic'
  | 'unknown_response'
  | 'service_unsupported'
  | 'service_disabled'
  | 'link_invalid'
  | 'link_unsupported'
  | 'fetch_fail'
  | 'fetch_critical'
  | 'fetch_empty'
  | 'fetch_rate'
  | 'content_too_long'
  | 'content_video_unavailable'
  | 'content_video_live'
  | 'content_video_age'
  | 'content_video_private'
  | 'content_video_region'
  | 'youtube_codec'
  | 'youtube_decipher'
  | 'youtube_login'
  | 'youtube_token_expired'
  | 'youtube_no_hls_streams';

export interface CobaltResponse {
  status: 'error' | 'tunnel' | 'redirect' | 'picker';
  picker?: CobaltPicker[];
  url?: string;
  filename?: string;
  error?: {
    code: CobaltErrorCode;
  };
}

export class Cobalt {
  private instance = 'https://cobalt.meteors.cc/';

  public async fetch(url: string): Promise<CobaltResponse> {
    const res = await fetch(this.instance, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
      }),
    });
    return await res.json();
  }

  public async download(url: string): Promise<Buffer> {
    const res = await fetch(url).catch(err => err);
    if (res instanceof Error) {
      throw res;
    }
    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    return buffer;
  }
}
