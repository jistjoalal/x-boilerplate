import { Service, Inject, ContainerInstance } from "@kaviar/core";
import { PasswordService } from "@kaviar/password-bundle";
import {
  PermissionService,
  PERMISSION_DEFAULT_DOMAIN,
  SecurityService,
} from "@kaviar/security-bundle";
import { UsersCollection } from "../collections/Users/Users.collection";
import { APP_DOMAIN } from "../constants";
import { Roles } from "../collections/Users/enums/Roles.enum";

const COUNT = 5;
const PASSWORD = "123456";

@Service()
export class UsersFixture {
  @Inject()
  container: ContainerInstance;

  async init() {
    if (!(await this.shouldRun())) {
      return;
    }

    const securityService = this.container.get(SecurityService);
    const passwordService = this.container.get(PasswordService);
    const permissionsService = this.container.get(PermissionService);

    console.log(`Running users fixtures.`);

    for (let i = 0; i < COUNT; i++) {
      const userId = await securityService.createUser({
        profile: {
          firstName: `User ${i}`,
          lastName: `Smith`,
        },
      });

      await passwordService.attach(userId, {
        email: `user-${i}@app.com`,
        username: `user-${i}@app.com`,
        isEmailVerified: true,
        password: PASSWORD,
      });

      console.log(`Created user-${i}@app.com : ${PASSWORD}`);
    }

    const userId = await securityService.createUser({
      profile: {
        firstName: `Admin`,
        lastName: `Smith`,
      },
    });

    await passwordService.attach(userId, {
      email: `admin@app.com`,
      username: `admin@app.com`,
      isEmailVerified: true,
      password: PASSWORD,
    });

    await permissionsService.add({
      domain: APP_DOMAIN,
      userId,
      permission: Roles.ADMIN,
    });

    console.log(
      `Created admin@app.com : ${PASSWORD} with role: ${Roles.ADMIN}`
    );

    console.log(`Completed users fixtures.`);
  }

  getCollection(): UsersCollection {
    return this.container.get(UsersCollection);
  }

  async shouldRun() {
    // await this.getCollection().deleteMany({});
    return (await this.getCollection().find().count()) === 0;
  }
}
