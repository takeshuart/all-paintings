import { z } from "zod";


export const RegisterSchema = z.object({
    email: z.string().email("Invalid Email fomat.").optional(),
    //ToDo use libphonenumber.js
    // phone: z.string().regex(/^1[3-9]\d{9}$/, "Invalid phone fomat.").optional(),
    password: z.string().min(8).max(16).refine((password) => {

        //Spaces are not allowed.

        if (/\s/.test(password)) return false;
        //Identical characters are not allowed
        if (/^(.)\1+$/.test(password)) return false;

        // continuously increasing or decreasing numbers or letters are not allowed.
        // example: 123456 / abcdefg
        const chars = password.split('');
        const allAlpha = /^[A-Za-z]+$/.test(password);
        const allDigit = /^[0-9]+$/.test(password);

        if (allAlpha || allDigit) {
            for (let i = 0; i < chars.length - 2; i++) {
                const c1 = chars[i].charCodeAt(0);
                const c2 = chars[i + 1].charCodeAt(0);
                const c3 = chars[i + 2].charCodeAt(0);
                if (c2 === c1 + 1 && c3 === c2 + 1) return false;
                if (c2 === c1 - 1 && c3 === c2 - 1) return false;
            }
        }
        return true;
    }, {
        message: "Password invalid: 8-16 chars, no spaces, no identical chars, no sequential letters/numbers",
    }),
});

//basic format validation for updating user info
export const UpdateUserSchema = z.object({
  nickname: z
    .string().min(2).max(20)
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/, "昵称只能包含中文、字母、数字或下划线")
    .optional(),

  email: z.string().email().optional(),
  password: z.string().min(8).max(16).optional(),
  currentPassword: z.string().min(1).optional(),
}).refine(
  (data) => {
    if ((data.password || data.email) && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "修改密码或邮箱需要输入当前密码",
    path: ["currentPassword"],
  }
);
