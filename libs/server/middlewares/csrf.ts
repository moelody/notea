import Tokens from 'csrf'
import { CRSF_HEADER_KEY } from 'libs/shared/const'
import { getEnv } from 'libs/shared/env'
import md5 from 'md5'
import { ApiNext, ApiRequest, ApiResponse, SSRMiddeware } from '../connect'

const tokens = new Tokens()

// generate CSRF secret
const csrfSecret = md5('CSRF' + getEnv('PASSWORD'))

export const getCsrfToken = () => tokens.create(csrfSecret)

export const verifyCsrfToken = (token: string) =>
  tokens.verify(csrfSecret, token)

export const applyCsrf: SSRMiddeware = async (req, _res, next) => {
  req.props = {
    ...req.props,
    csrfToken: getCsrfToken(),
  }
  req.session.set(CRSF_HEADER_KEY, req.props.csrfToken)
  await req.session.save()
  next()
}

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS']

export function useCsrf(req: ApiRequest, res: ApiResponse, next: ApiNext) {
  const token = req.headers[CRSF_HEADER_KEY] as string
  const sessionToken = req.session.get(CRSF_HEADER_KEY)

  if (ignoredMethods.includes(req.method?.toLocaleUpperCase() as string)) {
    return next()
  }

  if (
    token &&
    sessionToken &&
    // TODO: sometimes not equal
    // token === sessionToken &&
    verifyCsrfToken(token) &&
    verifyCsrfToken(sessionToken)
  ) {
    next()
  } else {
    return res.APIError.INVALID_CSRF_TOKEN.throw()
  }
}
