import { Router } from "./routers/router"
import { APIGatewayEvent } from "./types"

export class Handler {
  async run(event: APIGatewayEvent) {
    try {
      const { httpMethod, path, body, headers, queryStringParameters } = event

      const request = {
        headers: headers || {},
        method: httpMethod || "",
        path: path || "",
        body,
        params: queryStringParameters || {},
      }

      const router = new Router(request)
      const response = await router.run()

      return {
        statusCode: response.statusCode || 200,
        headers: {
          "Content-Type": "application/json",
          ...(response.headers || {}),
        },
        body:
          response.body && typeof response.body !== "string"
            ? JSON.stringify(response.body)
            : response.body,
      }
    } catch (error) {
      console.error(error)
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorMessage: "Internal Error" }),
      }
    }
  }
}

const instance = new Handler()
export const init = instance.run.bind(instance)
