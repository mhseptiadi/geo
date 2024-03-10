import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  private readonly users = [
    {
      username: 'test',
      password: 'test',
      roles: [
        'user',
      ]
    },
    {
      username: 'admin',
      password: 'admin',
      roles: [
        'user',
        'admin'
      ]
    },
  ];

  async findOne(username: string): Promise<any | undefined> {
    // todo: use db
    return this.users.find(user => user.username === username);
  }
}