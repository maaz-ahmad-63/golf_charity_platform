import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Path to mock users storage file
const mockUsersFile = path.join(process.cwd(), '.mock-users.json');

// Load users from file or initialize
function loadUsers() {
  try {
    if (fs.existsSync(mockUsersFile)) {
      const data = fs.readFileSync(mockUsersFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Creating new mock users file');
  }

  // Default test user
  return {
    'test@example.com': {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
  };
}

// Save users to file
function saveUsers(users: any) {
  try {
    fs.writeFileSync(mockUsersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, action } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const mockUsers = loadUsers();

    if (action === 'signup') {
      if (!fullName) {
        return NextResponse.json(
          { success: false, error: 'Full name is required for signup' },
          { status: 400 }
        );
      }

      // Check if user already exists
      if (mockUsers[email]) {
        return NextResponse.json(
          { success: false, error: 'User already exists with this email' },
          { status: 409 }
        );
      }

      // Create new user
      const userId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      mockUsers[email] = {
        email,
        password,
        fullName,
        id: userId,
      };

      // Save to file
      saveUsers(mockUsers);

      // Generate JWT token
      const token = generateToken({
        userId,
        email,
        role: 'user',
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: userId,
            email,
            fullName,
            role: 'user',
          },
          token,
        },
        message: 'Account created successfully',
      });
    }

    if (action === 'login') {
      // Find user in mock database
      const user = mockUsers[email];

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found. Please check your email.' },
          { status: 401 }
        );
      }

      if (user.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: 'user',
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: 'user',
          },
          token,
        },
        message: 'Login successful',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
