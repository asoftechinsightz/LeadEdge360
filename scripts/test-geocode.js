import dotenv from 'dotenv'
dotenv.config()

import {
  geocodeLocation
} from '../lib/scanner/geocode.js'

const result =
  await geocodeLocation(
    'Lucknow',
    'Uttar Pradesh'
  )

console.log(result)
