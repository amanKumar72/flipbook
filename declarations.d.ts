declare module "next" {
  export type NextConfig = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module "next/types.js" {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module "next/dynamic" {
  const dynamic: any;
  export default dynamic;
}

declare module "next/font/google" {
  export function Geist(options?: any): any;
  export function Geist_Mono(options?: any): any;
  export function Inter(options?: any): any;
}

declare module "react-pageflip";

declare module "next/server" {
  export const NextRequest: any;
  export const NextResponse: any;
  export type NextRequest = any;
  export type NextResponse = any;
}

declare module "next/server.js" {
  export const NextRequest: any;
  export const NextResponse: any;
  export type NextRequest = any;
  export type NextResponse = any;
}
