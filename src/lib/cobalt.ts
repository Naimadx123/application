export interface CobaltPicker {
  type: 'photo' | 'video' | 'gif';
  url: string;
  thumb?: string;
}

export interface CobaltResponse {
  status: 'error' | 'tunnel' | 'redirect' | 'picker';
  picker?: CobaltPicker[];
  url?: string;
  filename?: string;
  error?: {
    code: string;
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
