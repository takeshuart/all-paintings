import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prismaDB.js";
import validator from 'validator';
import { AppError } from "../error/AppError.js";
import { ERROR_CODES } from "../error/errorCodes.js";

class UserService {

  /**
  * Generates an 8-digit pure number string for a User ID.
  * Structure: [Last 4 digits of timestamp] + [4-digit random number]
  * Note: This method does not guarantee absolute uniqueness and requires
  * external mechanisms (like database UNIQUE constraint + retry) to ensure
  * global uniqueness upon insertion.
  *
  * @returns {string} An 8-digit number string (e.g., "12345678").
  */
  generateUserCode(): string {
    const timestamp = Date.now().toString();
    const timestampPart = timestamp.slice(-4);
    const minRandom = 1000;
    const maxRandom = 9999;
    const randomPart = Math.floor(Math.random() * (maxRandom - minRandom + 1) + minRandom).toString();
    return timestampPart + randomPart;
  }

  async findUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId: userId } })
    if (!user) { return null }
    return {
      userId: user.userId,
      nickname: user.nickName,
      email: user.email,
      phone: user.phone,
    };
  }

  async login(identifier: string, password: string) {
    let whereClause: any = {};

    if (!validator.isEmail(identifier)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid login ID format", 400);
    }

    const user = await prisma.user.findFirst({ where: { email: identifier } });

    
    const isMatch = user && await bcrypt.compare(password, user.passwordHash);

    if (!user || !isMatch) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 'Invalid credentials (ID or password mismatch)', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      userId: user.userId,
      nickname: user.nickName,
      email: user.email,
      phone: user.phone,
    };
  }


  async register(plainPassword: string, email?: string, phone?: string) {

    //find user by email or phone
    const existing = await prisma.user.findFirst({
      where: email ? { email } : { phone },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, "This email has already been registered", 400);
    }

    const userId = this.generateUserCode();
    const pwdHash = await bcrypt.hash(plainPassword, 10);

    //TODO retry when userID unique conflict
    const newUser = await prisma.user.create({
      data: {
        userId,
        nickName: userId,
        passwordHash: pwdHash,
        email,
        phone,
      },
    });

    return newUser;
  }



  async modifyUser(nickName: string) {
    //2-20 characters, Only letters, numbers, underscores, or Chinese are allowed.
    const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
    if (nickName && !nicknameRegex.test(nickName)) {
      throw new Error("Nickname must be 2–20 characters (letters, numbers, underscores, or Chinese)");
    }
  }

  validatePassword(password: string): boolean {
    // 8-16 characters
    if (password.length < 8 || password.length > 16) return false;

    // 2. Spaces are not allowed.
    if (/\s/.test(password)) return false;

    // 3. Identical characters are not allowed
    if (/^(.)\1+$/.test(password)) return false;

    // 4. continuously increasing or decreasing numbers or letters are not allowed.
    // example: 123456 / abcdefg
    const chars = password.split('');
    let allAlpha = /^[A-Za-z]+$/.test(password);
    let allDigit = /^[0-9]+$/.test(password);

    if (allAlpha || allDigit) {
      for (let i = 0; i < chars.length - 2; i++) {
        const c1 = chars[i].charCodeAt(0);
        const c2 = chars[i + 1].charCodeAt(0);
        const c3 = chars[i + 2].charCodeAt(0);
        //increasing
        if (c2 === c1 + 1 && c3 === c2 + 1) return false;
        //decreasing
        if (c2 === c1 - 1 && c3 === c2 - 1) return false;
      }
    }

    return true;
  }


  async getUserFavorites(userId: number) {
    const favorites = await prisma.userFavorites.findMany({
      where: { userId },
      include: { artwork: true },
      orderBy: { createdAt: "desc" },
    });
    return favorites;
  }

  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { id: "asc" },
    });
  }


  async addFavorite(userId: number, artworkId: number) {
    const existing = await prisma.userFavorites.findUnique({
      where: { userId_artworkId: { userId, artworkId } },
    });

    if (existing) {
      if (existing.deletedAt) {
        return prisma.userFavorites.update({
          where: { userId_artworkId: { userId, artworkId } },
          data: { deletedAt: null },
        });
      } else {
        throw new Error("The Artwork has favorited!");
      }
    }

    return prisma.userFavorites.create({
      data: { userId, artworkId },
    });
  }

  async removeFavorite(userId: number, artworkId: number) {
    const existing = await prisma.userFavorites.findUnique({
      where: { userId_artworkId: { userId, artworkId } },
    });
    if (!existing || existing.deletedAt) throw new Error("Has Canceled favorite!");

    await prisma.userFavorites.update({
      where: { userId_artworkId: { userId, artworkId } },
      data: { deletedAt: new Date() },
    });
    return true;
  }


}

export default new UserService();
