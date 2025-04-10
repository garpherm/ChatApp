import { Request, Response } from 'express'
import { prisma } from '../app'
import { comparePasswords, hashPassword } from '../utils/authUtils';

export async function getAllUser(req: Request, res: Response) {
  const { search } = req.query
  let users;
  try {
    if (!search) {
      users = await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true
        }
      })
    }

    users = await prisma.users.findMany({
      where: {
        OR: [
          {
            username: {
              contains: search as string
            }
          },
          {
            email: {
              contains: search as string
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params
  const { username, email } = req.body
  try {
    const user = await prisma.users.update({
      where: {
        id: Number(id)
      },
      data: {
        username,
        email
      }
    })
    const updatedUser = await prisma.users.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })
    res.status(200).json(updatedUser)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export async function updatePassword(req: Request, res: Response) {
  const { id } = req.params
  const { password, newPassword } = req.body
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id)
      }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const isValid = comparePasswords(password, user.hashed_password);
    if (!isValid) return res.status(400).json({ message: 'Invalid password' })
    const hashedPassword = await hashPassword(newPassword)
    const updatedUser = await prisma.users.update({
      where: {
        id: Number(id)
      },
      data: {
        hashed_password: hashedPassword
      }
    })
    if (!updatedUser) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: "Password updated successfully"})
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}