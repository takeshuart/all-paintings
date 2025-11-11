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
})
