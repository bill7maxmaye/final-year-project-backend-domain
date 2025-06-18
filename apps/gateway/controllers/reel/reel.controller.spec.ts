import { Test, TestingModule } from '@nestjs/testing';
import { ReelController } from './reel.controller';
import { ReelService } from './reel.service';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { NetworkingService } from '@pp/networking';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { ReelGatewayRto } from '@app/common//rto/gateway/reel/reel-gateway.rto';
import { User } from '@app/common//entities/user/user-entity';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';

describe('ReelController', () => {
  let controller: ReelController;
  let reelService: ReelService;
  let networkingService: NetworkingService;

  const mockReelService = {
    populateReelList: jest.fn(),
  };

  const mockStorageService = {
    downloadFile: jest.fn(),
  };

  const mockNetworkingService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReelController],
      providers: [
        {
          provide: ReelService,
          useValue: mockReelService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: NetworkingService,
          useValue: mockNetworkingService,
        },
      ],
    }).compile();

    controller = module.get<ReelController>(ReelController);
    reelService = module.get<ReelService>(ReelService);
    networkingService = module.get<NetworkingService>(NetworkingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReelsByUserId', () => {
    it('should return reels for a specific user', async () => {
      // Mock data
      const mockUser = { id: 'user123' } as User;
      const mockReels: ReelRto[] = [
        {
          id: 'reel1',
          ownerId: 'user123',
          videoURL: 'http://example.com/video1.mp4',
          description: 'Test reel 1',
          isPremiumContent: false,
          duration: 30,
          hashtags: ['test'],
          mentionedUserIds: [],
          privacy: 'PUBLIC',
          allowComments: true,
          allowSaveToDevice: true,
          saveWithWatermark: true,
          audienceControlUnder18: false,
          likes: 0,
          comments: 0,
          favoriteCount: 0,
          shareCount: 0,
          createdAt: '2024-03-20T00:00:00.000Z',
          updatedAt: '2024-03-20T00:00:00.000Z',
          isLiked: false,
        },
      ];

      const mockPopulatedReels: ReelGatewayRto[] = [
        {
          id: 'reel1',
          profile: {
            id: 'user123',
            username: 'testuser',
            fullName: 'Test User',
            avatar: 'http://example.com/avatar.jpg',
            isVerified: false,
            isFollowing: false,
          },
          videoURL: 'http://example.com/video1.mp4',
          description: 'Test reel 1',
          isPremiumContent: false,
          duration: 30,
          hashtags: ['test'],
          mentionedUsers: [],
          allowComments: true,
          allowSaveToDevice: true,
          saveWithWatermark: true,
          audienceControlUnder18: false,
          likes: 0,
          comments: 0,
          favoriteCount: 0,
          shareCount: 0,
          createdAt: '2024-03-20T00:00:00.000Z',
          updatedAt: '2024-03-20T00:00:00.000Z',
          privacy: 'PUBLIC',
          isLikedByUser: false,
        },
      ];

      // Mock the networking service response
      mockNetworkingService.send.mockResolvedValue(mockReels);

      // Mock the reel service population
      mockReelService.populateReelList.mockResolvedValue(mockPopulatedReels);

      // Call the controller method
      const result = await controller.getReelsByUserId(
        mockUser,
        'user123',
        '1',
        '10',
      );

      // Verify the result
      expect(result).toEqual(mockPopulatedReels);
      expect(mockNetworkingService.send).toHaveBeenCalledWith(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_BY_USER_ID}`,
        {
          userId: 'user123',
          paginationOptions: {
            page: 1,
            limit: 10,
          },
          userid: 'user123',
        },
      );
      expect(mockReelService.populateReelList).toHaveBeenCalledWith(mockReels);
    });

    it('should handle invalid pagination parameters', async () => {
      const mockUser = { id: 'user123' } as User;

      // Test with invalid page
      await expect(
        controller.getReelsByUserId(mockUser, 'user123', '0', '10'),
      ).rejects.toThrow(
        'Invalid pagination parameters. Page and limit must be positive integers.',
      );

      // Test with invalid limit
      await expect(
        controller.getReelsByUserId(mockUser, 'user123', '1', '0'),
      ).rejects.toThrow(
        'Invalid pagination parameters. Page and limit must be positive integers.',
      );
    });
  });
});
