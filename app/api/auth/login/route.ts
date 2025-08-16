import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database integration
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    role: "user",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Find user in mock database
    const user = mockUsers.find((u) => u.email === email && u.password === password && u.role === role)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // TODO: Generate actual JWT token
    const token = `mock_token_${user.id}_${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
