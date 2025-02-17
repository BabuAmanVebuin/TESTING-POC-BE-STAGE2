// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
//Notification api response
export type notificationAPIResponse =
  | { code: 200; body: "OK" }
  | { code: 400; body: "Bad Request" }
  | { code: 404; body: "Not Found - Data" }
