import { createServer } from "http"
import { Handler } from "./app"

const server = createServer((req, res) => {
  const chunks: Buffer[] = []
  req.on("data", (chunk) => chunks.push(chunk))
  req.on("end", async () => {
    const body = Buffer.concat(chunks).toString()
    const urlListParams = req.url?.split("?")
    const queryStringParameters: Record<string, string> = {}
    urlListParams![1] &&
      urlListParams![1].split("&").forEach((qs) => {
        const splittedQS = qs.split("=")
        queryStringParameters[splittedQS[0]] = splittedQS[1]
      })

    const event = {
      httpMethod: req.method!,
      path: urlListParams![0],
      queryStringParameters,
      body,
    }

    const app = new Handler()
    const result = await app.run(event)
    res.writeHead(result.statusCode, { "Content-Type": "application/json" })
    res.end(result.body)
  })
})

const PORT = 3000
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
)
