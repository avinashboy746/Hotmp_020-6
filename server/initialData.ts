import { Anime, Profile } from '../src/types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof-1',
    name: 'Avinash',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isKids: false,
    autoPlay: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    name: 'Otaku_San',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isKids: false,
    autoPlay: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prof-3',
    name: 'Anime Kids',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    isKids: true,
    autoPlay: true,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_ANIMES: Anime[] = [
  {
    id: 'anime-solo-leveling',
    title: 'Solo Leveling',
    japaneseTitle: '俺だけレベルアップな件',
    synopsis: 'In a world where hunters, humans who possess magical abilities, battle deadly monsters, a weak hunter named Sung Jinwoo finds himself in a mysterious double dungeon that leads him to embark on a quest to become the strongest hunter in the world.',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    releaseYear: 2024,
    language: 'Sub & Dub',
    rating: 9.3,
    ageRating: 'TV-MA',
    status: 'Ongoing',
    studio: 'A-1 Pictures',
    featured: true,
    trending: true,
    episodes: [
      {
        id: 'sl-ep-1',
        episodeNumber: 1,
        title: 'I\'m Used to It',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Sung Jinwoo enters a low-ranking D-Rank dungeon with his party, but stumbles upon a lethal hidden temple with god-like stone statues.',
        servers: [
          {
            id: 'srv-1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '1080p'
          },
          {
            id: 'srv-2',
            name: 'Server 2 (VidStream Fast)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            quality: '720p'
          },
          {
            id: 'srv-3',
            name: 'Server 3 (Cloud Mirror Embed)',
            type: 'embed',
            url: 'https://www.youtube-nocookie.com/embed/9GgX1oE_m2g?autoplay=1',
            quality: 'Auto'
          }
        ]
      },
      {
        id: 'sl-ep-2',
        episodeNumber: 2,
        title: 'If I Had One More Chance',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        duration: '23m',
        description: 'Trapped inside the Cartenon Temple, Jinwoo figures out the commandments of the temple worship as statues begin executing hunters.',
        servers: [
          {
            id: 'srv-4',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            quality: '1080p'
          },
          {
            id: 'srv-5',
            name: 'Server 2 (VidStream Fast)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            quality: '1080p'
          }
        ]
      },
      {
        id: 'sl-ep-3',
        episodeNumber: 3,
        title: 'It\'s Like a Game',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Jinwoo wakes up alive in a modern hospital room and realizes only he can see floating quest screens that grant daily workout points.',
        servers: [
          {
            id: 'srv-6',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    japaneseTitle: '呪術廻戦',
    synopsis: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the demon\'s other body parts and thus exorcise himself.',
    posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Supernatural', 'Shounen', 'Fantasy'],
    releaseYear: 2023,
    language: 'Sub & Dub',
    rating: 9.1,
    ageRating: 'TV-MA',
    status: 'Ongoing',
    studio: 'MAPPA',
    featured: true,
    trending: true,
    episodes: [
      {
        id: 'jjk-ep-1',
        episodeNumber: 1,
        title: 'Ryomen Sukuna',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Yuji Itadori is a high school student with athletic abilities who visits his grandfather in the hospital before life takes a demonic turn.',
        servers: [
          {
            id: 'jjk-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            quality: '1080p'
          },
          {
            id: 'jjk-s2',
            name: 'Server 2 (Tokyo High Speed)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '720p'
          }
        ]
      },
      {
        id: 'jjk-ep-2',
        episodeNumber: 2,
        title: 'For Myself',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Itadori wakes up restrained in a room filled with protective talismans and meets Satoru Gojo.',
        servers: [
          {
            id: 'jjk-s3',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-frieren',
    title: 'Frieren: Beyond Journey\'s End',
    japaneseTitle: '葬送のフリーレン',
    synopsis: 'An elf mage and her fellow adventurers have defeated the Demon King and brought peace to the land. After decades pass and her human allies age, Frieren embarks on a new voyage to understand the brevity and warmth of human emotion.',
    posterUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    releaseYear: 2024,
    language: 'Sub & Dub',
    rating: 9.4,
    ageRating: 'TV-14',
    status: 'Ongoing',
    studio: 'Madhouse',
    featured: true,
    trending: true,
    episodes: [
      {
        id: 'fr-ep-1',
        episodeNumber: 1,
        title: 'The Journey\'s End',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
        duration: '25m',
        description: 'The hero party returns triumphant after a ten-year quest, watching the Era Meteors together before parting ways.',
        servers: [
          {
            id: 'fr-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            quality: '1080p'
          },
          {
            id: 'fr-s2',
            name: 'Server 2 (VidStream 720p)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            quality: '720p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    synopsis: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.',
    posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Fantasy', 'Historical', 'Shounen'],
    releaseYear: 2024,
    language: 'Sub & Dub',
    rating: 8.9,
    ageRating: 'TV-14',
    status: 'Ongoing',
    studio: 'ufotable',
    featured: false,
    trending: true,
    episodes: [
      {
        id: 'ds-ep-1',
        episodeNumber: 1,
        title: 'Cruelty',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
        duration: '23m',
        description: 'Tanjiro Kamado lives a peaceful life selling charcoal until he finds his family slaughtered in the snow.',
        servers: [
          {
            id: 'ds-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-cyberpunk',
    title: 'Cyberpunk: Edgerunners',
    japaneseTitle: 'サイバーパンク エッジランナーズ',
    synopsis: 'A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner: a mercenary outlaw also known as a cyberpunk.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk', 'Drama'],
    releaseYear: 2022,
    language: 'Sub & Dub',
    rating: 8.8,
    ageRating: 'TV-MA',
    status: 'Completed',
    studio: 'Studio Trigger',
    featured: false,
    trending: false,
    episodes: [
      {
        id: 'cb-ep-1',
        episodeNumber: 1,
        title: 'Let You Down',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'David Martinez struggles to pay tuition at Arasaka Academy, leading to a tragic incident on the Santo Domingo freeway.',
        servers: [
          {
            id: 'cb-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    synopsis: 'Following a betrayal, Denji is left for dead. With the help of his devil pet Pochita, he merges to become Chainsaw Man, slicing through devils for the Public Safety Devil Hunters.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Supernatural', 'Horror'],
    releaseYear: 2022,
    language: 'Sub & Dub',
    rating: 8.7,
    ageRating: 'TV-MA',
    status: 'Completed',
    studio: 'MAPPA',
    featured: false,
    trending: true,
    episodes: [
      {
        id: 'csm-ep-1',
        episodeNumber: 1,
        title: 'Dog & Chainsaw',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Denji pays off his deceased father\'s massive debts to the yakuza by harvesting devil corpses with Pochita.',
        servers: [
          {
            id: 'csm-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  },
  {
    id: 'anime-spy-family',
    title: 'SPY x FAMILY',
    japaneseTitle: 'スパイファミリー',
    synopsis: 'A master spy under the codename "Twilight" constructs a false family consisting of an assassin wife and a telepathic orphan girl to infiltrate an elite political school.',
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=80',
    genres: ['Comedy', 'Action', 'Slice of Life'],
    releaseYear: 2023,
    language: 'Sub & Dub',
    rating: 8.6,
    ageRating: 'PG-13',
    status: 'Ongoing',
    studio: 'Wit Studio & CloverWorks',
    featured: false,
    trending: false,
    episodes: [
      {
        id: 'sxf-ep-1',
        episodeNumber: 1,
        title: 'Operation Strix',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
        duration: '24m',
        description: 'Agent Twilight is tasked with Operation Strix and adopts Anya from an underground orphanage.',
        servers: [
          {
            id: 'sxf-s1',
            name: 'Server 1 (HOTMP Ultra CDN)',
            type: 'mp4',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            quality: '1080p'
          }
        ]
      }
    ]
  }
];
