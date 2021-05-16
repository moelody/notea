import { TextField, Button } from '@material-ui/core'
import { SSRContext, ssr } from 'libs/server/connect'
import { applyCsrf } from 'libs/server/middlewares/csrf'
import { useSession } from 'libs/server/middlewares/session'
import useFetcher from 'libs/web/api/fetcher'
import router from 'next/router'
import { FormEvent, useCallback, useEffect } from 'react'
import { useToast } from 'libs/web/hooks/use-toast'

const LoginPage = () => {
  const { request, error, loading } = useFetcher()
  const toast = useToast()
  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const data = await request<{ password: string }, { isLoggedIn: boolean }>(
        {
          url: '/api/auth/login',
          method: 'POST',
        },
        {
          password: e.currentTarget.password.value,
        }
      )
      if (data?.isLoggedIn) {
        location.href = (router.query.redirect as string) || '/'
      }
    },
    [request]
  )

  useEffect(() => {
    if (!loading && !!error) {
      toast('Incorrect password', 'error')
    }
  }, [loading, error, toast])

  return (
    <main className="pt-48">
      <img className="w-40 h-40 m-auto" src="/logo.svg" alt="Logo" />
      <form
        className="w-80 m-auto"
        action="post"
        noValidate
        onSubmit={onSubmit}
      >
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        ></TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="primary"
        >
          Login
        </Button>
      </form>
    </main>
  )
}

export default LoginPage

export const getServerSideProps = async (ctx: SSRContext) => {
  await ssr().use(useSession).use(applyCsrf).run(ctx.req, ctx.res)

  return {
    props: ctx.req.props,
  }
}
