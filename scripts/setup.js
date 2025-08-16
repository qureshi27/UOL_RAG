#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Setting up RAG Application...\n")

// Check if .env file exists
if (!fs.existsSync(".env")) {
  console.log("📝 Creating .env file from template...")
  fs.copyFileSync(".env.example", ".env")
  console.log("✅ .env file created. Please update it with your configuration.\n")
} else {
  console.log("✅ .env file already exists.\n")
}

// Create necessary directories
const directories = ["uploads", "logs", "ssl"]
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
})

console.log("\n🔧 Installation complete!")
console.log("\nNext steps:")
console.log("1. Update your .env file with the correct values")
console.log("2. Run: docker-compose up -d")
console.log("3. Visit: http://localhost:3000")
console.log("\nFor production deployment, see README.md")
