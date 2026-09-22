import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from './providers/database/index.js';
import { KAFKA_SERVICE, KAFKA_TOPICS } from './providers/kafka/index.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}
  async onModuleInit() {
    await this.kafkaClient.connect();
  }
  async getProfile(userId: string) {
    const profile = await this.dbService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('User not found');
    }
    return profile;
  }
  async register(email: string, password: string, name: string) {
    const existingUser = await this.dbService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(`The user already exists`);
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.dbService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // pub
    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      userId: user.id,
      name: user.name,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return {
      message: `User successfully registered`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  async login(email: string, password: string) {
    const user = await this.dbService.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const pswOk = await bcrypt.compare(password, user.password);

    if (!pswOk) {
      throw new UnauthorizedException('Wrong credentials');
    }

    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        name: user.name,
      }),
      id: user.id,
      email: user.email,
    };
  }
}
