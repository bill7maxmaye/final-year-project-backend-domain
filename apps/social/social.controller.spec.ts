import { Test, TestingModule } from '@nestjs/testing';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

describe('SocialController', () => {
  let socialController: SocialController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [SocialService],
    }).compile();

    socialController = app.get<SocialController>(SocialController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(socialController.getHello()).toBe('Hello World!');
    });
  });
});
