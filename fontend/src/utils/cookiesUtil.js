export const setCookie = (name, value, days = 365) => {
  try {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/`
    return true
  } catch (error) {
    console.error(`setCookie: Failed to set cookie: ${error}`)
    return false
  }
}

export const getCookie = (name) => {
  if (typeof name !== 'string' || !name) {
    console.error('getCookie: Invalid cookie name')
    return null
  }
  try {
    const cookies = document.cookie.split('; ')
    const cookie = cookies.find((c) => c.startsWith(`${name}=`))
    if (cookie) {
      return cookie.split('=')[1]
    }
    return null
  } catch (error) {
    console.error(`getCookie: Failed to get cookie: ${error}`)
    return null
  }
}
