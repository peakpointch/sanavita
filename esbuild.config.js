const esbuild = require("esbuild")
const chokidar = require("chokidar")
const http = require('http')
const path = require("path")
const build = require('./builder');

// const isProduction = process.env.RAILS_ENV === "production"
// const watchMode =
//     process.argv.includes("--watch") || process.argv.includes("--reload")
// const reloadMode = process.argv.includes("--reload")
const port = 3001

// Start the esbuild build process
build()

// Set up a simple HTTP server for live reload with CORS headers
const clients = []
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  })

  clients.push(res)

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1)
  })
})

server.listen(port)

// Watch for file changes 
chokidar
  .watch([
    "assets/**/*",
    "assets"
  ])
  .on("all", () => {
    build()
    clients.forEach((client) => client.write("data: reload\n\n"))
    console.log("CHANGE")
  })

console.log(`Live reload server running on http://localhost:${port}`)