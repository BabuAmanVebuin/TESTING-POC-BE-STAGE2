// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { pipe } from "fp-ts/lib/function.js"
import * as t from "io-ts/lib/Decoder.js"

export type registerDeviceTokenRequest = {
  "user-id": string
  "installation-id"?: string
  "device-token": string
}

const registerDeviceTokenRequiredDecoder = t.struct({
  "user-id": t.string,
  "device-token": t.string,
})

const registerDeviceTokenPartialDecoder = t.partial({
  "installation-id": t.string,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type registerDeviceTokenDecodeType = t.Decoder<any, registerDeviceTokenRequest>

export const registerDeviceTokenRequestDecoder: registerDeviceTokenDecodeType = pipe(
  registerDeviceTokenRequiredDecoder,
  t.intersect(registerDeviceTokenPartialDecoder),
)

export type registerDeviceTokenAPIResponse =
  | { code: 200; body: { "installation-id": string } }
  | { code: 400; body: "Bad Request" }
  | { code: 401; body: "Unauthorized" }
  | {
      code: 403
      body: "Quota exceeded or registration operation rate too high"
    }
