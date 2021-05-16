import { getEnv } from 'libs/shared/env'
import { PageMode } from 'libs/shared/page'
import { ApiRequest, ApiResponse, ApiNext, SSRMiddeware } from '../connect'

export async function useAuth(
  req: ApiRequest,
  res: ApiResponse,
  next: ApiNext
) {
  if (!isLoggedIn(req)) {
    return res.APIError.NEED_LOGIN.throw()
  }

  return next()
}

export function isLoggedIn(req: ApiRequest) {
  if (getEnv('IS_DEMO') || getEnv('DISABLE_PASSWORD', false)) {
    return true
  }

  return !!req.session.get('user')?.isLoggedIn
}

export const applyAuth: SSRMiddeware = async (req, _res, next) => {
  req.props = {
    ...req.props,
    isLoggedIn: isLoggedIn(req),
    disablePassword: getEnv('IS_DEMO') || getEnv('DISABLE_PASSWORD', false),
  }

  next()
}

export const applyRedirectLogin: (resolvedUrl: string) => SSRMiddeware = (
  resolvedUrl: string
) => async (req, _res, next) => {
  const redirect = {
    destination: `/login?redirect=${resolvedUrl}`,
    permanent: false,
  }

  // note 存在的情况
  if (req.props.pageMode) {
    if (req.props.pageMode !== PageMode.PUBLIC && !req.props.isLoggedIn) {
      req.redirect = redirect
    }
    // 访问首页没有 note，则判断是否登录
  } else if (!req.props.isLoggedIn) {
    req.redirect = redirect
  }

  next()
}
