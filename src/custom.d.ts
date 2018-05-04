// TODO(dli): Figure out better way to integrate middleware.
// https://stackoverflow.com/questions/35252941/typescript-property-decoded-does-not-exists-on-type-request
declare namespace Express {
  export interface Request {
    decoded: {
      id: string,
    },
    body: any
  }
}

declare module '*.json' {
  const value: any
  export default value
}

interface Error {
  status?: number
}
