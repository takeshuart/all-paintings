import { Prisma } from "@prisma/client";

//Prisma select fields
export const userSelect = {
    userId: true,
    nickName: true,
    email: true,
    phone: true,
    registeredAt: true,
    updateAt: true,
};

export type SafeUser = Prisma.UserGetPayload<{
    select: typeof userSelect;
}>;