export type Work = {
  id: string;
  slug: string;
  title: string;
  description: string;
  media: { type: 'image' | 'video' | '3d'; url: string; cover?: string }[];
  creator: {
    address: string;
    displayName: string;
    avatarUrl: string;
  };
  editions: {
    editionId: number;
    supply: number;
    price: number;
    currency: string;
  }[];
  chain: {
    type: 'evm' | 'sui';
    chainId?: number;
    contractAddress?: string;
  };
  status: 'draft' | 'listed' | 'unlisted';
  type: 'standard' | 'blindbox';
  tags: string[];
  physicalOptions: string[];
  stats: {
    favorites: number;
    sales: number;
  };
  createdAt: string;
  blindboxStyles?: {
    name: string;
    mediaUrl: string;
    rarity: string;
    probability: number;
  }[];
};

export const mockWorks: Work[] = [
  {
    id: '1',
    slug: 'ethereal-dreams',
    title: 'Ethereal Dreams',
    description: 'A journey through the clouds of a digital sky.',
    media: [{ type: 'image', url: '/art/1742821706278.png' }],
    creator: {
      address: '0x123...abc',
      displayName: 'Studio Glimmer',
      avatarUrl: '/art/github头像.jpeg',
    },
    editions: [{ editionId: 1, supply: 10, price: 0.5, currency: 'ETH' }],
    chain: { type: 'evm', chainId: 1 },
    status: 'listed',
    type: 'standard',
    tags: ['abstract', 'dream', 'sky', 'digital'],
    physicalOptions: ['canvas_print', 'metal_print'],
    stats: { favorites: 120, sales: 15 },
    createdAt: '2025-08-18T10:00:00Z',
  },
  {
    id: '2',
    slug: 'concrete-jungle-box',
    title: 'Concrete Jungle (Blind Box)',
    description: 'Unbox a unique perspective of the city. What will you get?',
    media: [{ type: 'image', url: '/art/WechatIMG104.jpg' }],
    creator: {
      address: '0x456...def',
      displayName: 'Urban Lens',
      avatarUrl: '/art/github头像.jpeg',
    },
    editions: [{ editionId: 1, supply: 100, price: 0.1, currency: 'ETH' }],
    chain: { type: 'evm', chainId: 137 },
    status: 'listed',
    type: 'blindbox',
    tags: ['cityscape', 'urban', 'light', 'blindbox'],
    physicalOptions: ['framed_print'],
    stats: { favorites: 350, sales: 50 },
    createdAt: '2025-08-19T11:00:00Z',
    blindboxStyles: [
      { name: 'Daylight Commute', mediaUrl: '/art/Weixin Image_2025-08-15_144407_153.jpg', rarity: 'Common', probability: 60 },
      { name: 'Midnight Neon', mediaUrl: '/art/Weixin Image_2025-08-15_144412_013.jpg', rarity: 'Rare', probability: 30 },
      { name: 'Golden Hour Gridlock', mediaUrl: '/art/Weixin Image_2025-08-15_144415_881.jpg', rarity: 'Super Rare', probability: 9.9 },
      { name: 'The Glitch', mediaUrl: '/art/Weixin Image_2025-08-15_144419_094.jpg', rarity: 'Legendary', probability: 0.1 },
    ]
  },
  {
    id: '3',
    slug: 'oceanic-whispers',
    title: 'Oceanic Whispers',
    description: 'Secrets of the deep, whispered in waves of color.',
    media: [{ type: 'image', url: '/art/Weixin Image_2025-08-12_205739_329.jpg' }],
    creator: {
      address: '0x789...ghi',
      displayName: 'Aqua Chroma',
      avatarUrl: '/art/github头像.jpeg',
    },
    editions: [{ editionId: 1, supply: 0, price: 1.2, currency: 'ETH' }], // Sold out
    chain: { type: 'evm', chainId: 1 },
    status: 'listed',
    type: 'standard',
    tags: ['ocean', 'abstract', 'color', 'underwater'],
    physicalOptions: ['canvas_print', 'acrylic_print'],
    stats: { favorites: 300, sales: 5 },
    createdAt: '2025-08-15T11:00:00Z',
  },
  {
    id: '4',
    slug: 'forest-spirit',
    title: 'Forest Spirit',
    description: 'A guardian of the ancient woods, rendered in digital light.',
    media: [{ type: 'image', url: '/art/Weixin Image_2025-08-15_144401_363.jpg' }],
    creator: {
      address: '0xabc...123',
      displayName: 'Sylva Digital',
      avatarUrl: '/art/github头像.jpeg',
    },
    editions: [{ editionId: 1, supply: 50, price: 0.1, currency: 'SUI' }],
    chain: { type: 'sui' },
    status: 'listed',
    type: 'standard',
    tags: ['forest', 'fantasy', 'spirit', 'nature'],
    physicalOptions: ['wood_print'],
    stats: { favorites: 80, sales: 45 },
    createdAt: '2025-08-12T09:00:00Z',
  },
];

// Types for Profile Page
export type CollectionItem = {
  tokenId: string;
  work: Work;
  ownerAddress: string;
  purchaseDate: string;
  status: 'owned' | 'listed' | 'physicalizing' | 'locked';
};

export type Order = {
  orderId: string;
  work: Work;
  edition: Work['editions'][0];
  buyerAddress: string;
  price: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
};

export type Physicalization = {
  physicalizationId: string;
  orderId: string;
  work: Work;
  status: 'requested' | 'in_progress' | 'shipped' | 'delivered';
  requestDate: string;
  shippingInfo?: {
    address: string;
    trackingNumber: string;
    carrier: string;
  };
};

// Mock Data for Profile Page
export const mockCollection: CollectionItem[] = [
  {
    tokenId: '101',
    work: mockWorks[0],
    ownerAddress: '0xdef...456',
    purchaseDate: '2025-08-15T14:30:00Z',
    status: 'listed',
  },
  {
    tokenId: '201',
    work: mockWorks[2],
    ownerAddress: '0xdef...456',
    purchaseDate: '2025-08-10T11:00:00Z',
    status: 'owned',
  },
  {
    tokenId: '401',
    work: mockWorks[3],
    ownerAddress: '0xdef...456',
    purchaseDate: '2025-08-05T18:00:00Z',
    status: 'physicalizing',
  }
];

export const mockOrders: Order[] = [
  {
    orderId: 'ord-001',
    work: mockWorks[0],
    edition: mockWorks[0].editions[0],
    buyerAddress: '0xdef...456',
    price: 0.5,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2025-08-15T14:30:00Z',
  },
  {
    orderId: 'ord-002',
    work: mockWorks[2],
    edition: mockWorks[2].editions[0],
    buyerAddress: '0xdef...456',
    price: 1.2,
    currency: 'ETH',
    status: 'completed',
    timestamp: '2025-08-10T11:00:00Z',
  },
  {
    orderId: 'ord-003',
    work: mockWorks[1],
    edition: mockWorks[1].editions[0],
    buyerAddress: '0xdef...456',
    price: 0.2,
    currency: 'ETH',
    status: 'pending',
    timestamp: '2025-08-19T10:00:00Z',
  },
];

export const mockPhysicalizations: Physicalization[] = [
  {
    physicalizationId: 'phy-001',
    orderId: 'ord-001',
    work: mockWorks[0],
    status: 'shipped',
    requestDate: '2025-08-16T09:00:00Z',
    shippingInfo: {
      address: '123 Art Lane, Collector City, 12345',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
    },
  },
  {
    physicalizationId: 'phy-002',
    orderId: 'ord-002',
    work: mockWorks[2],
    status: 'requested',
    requestDate: '2025-08-18T18:00:00Z',
  },
];

