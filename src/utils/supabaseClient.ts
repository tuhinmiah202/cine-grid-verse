
// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yuqxwhfzuhxvukcnmdgk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cXh3aGZ6dWh4dnVrY25tZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Mjc0MzIsImV4cCI6MjA2NDUwMzQzMn0.Pv7Fxy5_18tjFfF5sFAyrVq2YfLmPT6DPhA6vQthkfU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
