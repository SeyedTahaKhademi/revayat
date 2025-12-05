// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
import { NextRequest, NextResponse } from 'next/server';

const REMOTE_API_BASE =
  process.env.REMOTE_API_BASE_URL ??
  process.env.NEXT_PUBLIC_REVAYAT_API_BASE_URL ??
  '';

const buildTargetUrl = (slug: string[]) => {
  const trimmedBase = REMOTE_API_BASE.replace(/\/+$/, '');
  const path = slug.length ? slug.join('/') : '';
  return `${trimmedBase}/${path}`;
};

const filterHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  return headers;
};

const proxy = async (request: NextRequest, slug: string[]) => {
  if (!REMOTE_API_BASE) {
    return NextResponse.json(
      { error: 'Remote API base URL is not configured.' },
      { status: 500 }
    );
  }

  const target = buildTargetUrl(slug);
  const init: RequestInit = {
    method: request.method,
    headers: filterHeaders(request),
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.arrayBuffer();
    init.body = body;
  }

  try {
    const response = await fetch(target, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Cache-Control', 'no-store');
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error', error);
    return NextResponse.json(
      { error: 'Failed to reach remote API.' },
      { status: 502 }
    );
  }
};

type ParamContext = { params: Promise<{ slug: string[] }> };

export async function GET(request: NextRequest, context: ParamContext) {
  const params = await context.params;
  return proxy(request, params.slug || []);
}

export async function POST(request: NextRequest, context: ParamContext) {
  const params = await context.params;
  return proxy(request, params.slug || []);
}

export async function PUT(request: NextRequest, context: ParamContext) {
  const params = await context.params;
  return proxy(request, params.slug || []);
}

export async function DELETE(request: NextRequest, context: ParamContext) {
  const params = await context.params;
  return proxy(request, params.slug || []);
}

export const dynamic = 'force-dynamic';
