import { Request, Response } from "../types"

export class RouterClass {
  request: Request
  callback:
    | null
    | ((request: Request, response: Response) => Response | Promise<Response>)
  validRequest: boolean

  constructor(request: Request) {
    this.request = request
    this.callback = null
    this.validRequest = false
    this.PATCH = this.PATCH.bind(this)
    this.PUT = this.PUT.bind(this)
    this.DELETE = this.DELETE.bind(this)
    this.GET = this.GET.bind(this)
    this.POST = this.POST.bind(this)
    this.use = this.use.bind(this)
  }

  private handleRequest(
    methodType: string | RegExp,
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    const { method, path } = this.request
    if (method === methodType) {
      if (path === pathCalled) {
        this.validRequest = true
        this.callback = callback
      } else {
        const routeParmsMatchPathCalled = pathCalled.match(/:\w{1,}/g)
        if (routeParmsMatchPathCalled) {
          const routes = pathCalled.split("/")
          const routeParamsPath = path.split("/")
          if (routes.length === routeParamsPath.length) {
            const routeParamsData = routes
              .map((value, index) => {
                const result = routeParmsMatchPathCalled.find(
                  (params) => params === value
                )
                return result
                  ? {
                      key: result.replace(":", ""),
                      index,
                    }
                  : undefined
              })
              .filter((data) => !!data)

            const routeParamsResult: Record<string, string> = {}
            routeParamsData.forEach((params) => {
              const currenParamPath = routeParamsPath[params.index]
              routeParamsResult[params.key] = currenParamPath
            })
            this.request.routeParams = routeParamsResult
            this.validRequest = true
            this.callback = callback
          }
        }
      }
    }
  }

  PATCH(
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    this.handleRequest("PATCH", pathCalled, callback)
  }

  PUT(
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    this.handleRequest("PUT", pathCalled, callback)
  }

  DELETE(
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    this.handleRequest("DELETE", pathCalled, callback)
  }

  POST(
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    this.handleRequest("POST", pathCalled, callback)
  }

  GET(
    pathCalled: string,
    callback: (
      request: Request,
      response: Response
    ) => Response | Promise<Response>
  ) {
    this.handleRequest("GET", pathCalled, callback)
  }

  use() {
    if (!this.callback || !this.validRequest) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request" }),
      }
    }

    return this.callback(this.request, { statusCode: 0 })
  }
}
