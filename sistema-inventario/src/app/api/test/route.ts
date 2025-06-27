import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'API Test funcionando',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'API Test POST funcionando',
      timestamp: new Date().toISOString(),
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json({
      message: 'API Test POST funcionando (sin body)',
      timestamp: new Date().toISOString(),
      error: 'No JSON body provided'
    });
  }
}
