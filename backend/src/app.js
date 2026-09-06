'use strict'

/**
 * app.js
 * Express application factory.
 * Wires middleware, routes, and error handlers together.
 * Kept separate from server.js so the app can be imported by tests
 * without binding to a port.
 */

const express = require('express')
const cors = require('cors')
const apiRoutes = require('./routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── Global middleware ────────────────────────────────────────────────────────

// CORS — allow the local Vite dev server and any future origins
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite default dev port
      'http://localhost:4173', // Vite preview port
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
)

// Parse incoming JSON bodies
app.use(express.json())

// ── API routes ───────────────────────────────────────────────────────────────

app.use('/api', apiRoutes)

// ── Error handling ───────────────────────────────────────────────────────────

// 404 for any route that did not match above
app.use(notFound)

// Centralized error handler (must be last, with 4 parameters)
app.use(errorHandler)

module.exports = app
