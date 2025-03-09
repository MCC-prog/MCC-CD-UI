export default function authHeader() {
  const obj = JSON.parse(localStorage.getItem("authUser") as any)

  if (obj && obj.accessToken) {
    return { Authorization: obj.accessToken }
  } else {
    return {}
  }
}
