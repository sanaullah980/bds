import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Redirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/customers-new.html')
  }, [router])
  return null
}
