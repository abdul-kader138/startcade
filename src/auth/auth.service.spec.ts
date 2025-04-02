import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClient, User } from "@prisma/client";
import { Response } from "express";
import { AuthService } from "./auth.service";

const prismaMock = {
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(null),
  },
} as unknown as PrismaClient;

const jwtMock = {
  sign: jest.fn().mockReturnValue("mocked-jwt-token"),
} as unknown as JwtService;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn().mockImplementation(() => "hashed_password"),
  compareSync: jest
    .fn()
    .mockImplementation((input, hash) => hash === "hashed_password"),
}));

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaClient, useValue: prismaMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  /**
   * ✅ Test Validate User - Correct Credentials
   */
  it("should validate user with correct credentials", async () => {
    prismaMock.user.findUnique = jest.fn().mockResolvedValueOnce({
      id: 1,
      email: "user@example.com",
      password: "hashed_password",
      first_name: "John",
      last_name: "Doe",
    } as User);

    const user = await authService.validateUser(
      "user@example.com",
      "password123"
    );

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
    expect(user).toBeDefined();
    expect(user.email).toBe("user@example.com");
  });

  /**
   * Test Validate User - Invalid Credentials
   */
  it("should throw an error for invalid credentials", async () => {
    prismaMock.user.findUnique = jest.fn().mockResolvedValueOnce(null);

    await expect(
      authService.validateUser("user@example.com", "wrongpassword")
    ).rejects.toThrow(UnauthorizedException);
  });

  /**
   * Test Login - Sets HTTP-Only Cookie
   */
  it("should login and set JWT cookie", async () => {
    const res = mockResponse();
    const user = {
      id: 1,
      email: "user@example.com",
      first_name: "John",
      last_name: "Doe",
    };

    await authService.login(user, res);

    expect(jwtMock.sign).toHaveBeenCalledWith(
      { userId: user.id, email: user.email },
      { expiresIn: "1h" }
    );

    expect(res.cookie).toHaveBeenCalledWith("jwt", "mocked-jwt-token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      user,
    });
  });

  /**
   * Test Register - Creates User
   */
  it("should register a new user", async () => {
    const response = await authService.register(
      "Jane",
      "Doe",
      "newuser@example.com",
      "securepassword"
    );

    expect(response).toEqual({
      message: "User registered successfully",
      user: {
        id: response.user.id,
        email: "newuser@example.com",
        first_name: "Jane",
        last_name: "Doe",
      },
    });
  });

  /**
   * Test Logout - Clears JWT Cookie
   */
  it("should logout and clear JWT cookie", async () => {
    const res = mockResponse();
    await authService.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith("jwt");
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });
});
