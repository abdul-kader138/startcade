import { PrismaService } from "./prisma.service";


const prisma = new PrismaService();

async function main() {
  console.log('🌱 Seeding database with mock articles...');

  // Check if photos already exist
  const existingPhotos = await prisma.photos.findMany();
  if (existingPhotos.length === 0) {
    console.log('📷 Creating default photos...');
    await prisma.photos.createMany({
      data: [
        {
          serial_id: 'default-article',
          original: '/images/default-article.png',
          large: '/images/default-article-large.png',
          medium: '/images/default-article-medium.png',
          small: '/images/default-article-small.png',
        },
        {
          serial_id: 'default-article1',
          original: '/images/default-article1.png',
          large: '/images/default-article1-large.png',
          medium: '/images/default-article1-medium.png',
          small: '/images/default-article1-small.png',
        },
        {
          serial_id: 'default-article2',
          original: '/images/default-article2.png',
          large: '/images/default-article2-large.png',
          medium: '/images/default-article2-medium.png',
          small: '/images/default-article2-small.png',
        },
        {
          serial_id: 'default-article3',
          original: '/images/default-article3.png',
          large: '/images/default-article3-large.png',
          medium: '/images/default-article3-medium.png',
          small: '/images/default-article3-small.png',
        },
        {
          serial_id: 'default-article4',
          original: '/images/default-article4.png',
          large: '/images/default-article4-large.png',
          medium: '/images/default-article4-medium.png',
          small: '/images/default-article4-small.png',
        },
      ],
    });
    console.log('✅ Photos seeded successfully!');
  } else {
    console.log('⚡ Photos already exist, skipping creation.');
  }

  // Retrieve the inserted photos
  const photos = await prisma.photos.findMany();
  const photoIds = photos.map((photo) => photo.photo_id);

  function getRandomDate(start: Date, end: Date) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
  }

  // Mock Articles Data (10 Entries)
  const articlesData = [
    {
      title: 'Understanding Forex Market Trends',
      description:
        'A comprehensive guide to understanding the key factors influencing Forex market trends, covering fundamental and technical analysis, economic indicators, and trader psychology.',
      content:
        'The Forex market operates 24 hours a day, providing traders with numerous opportunities to trade currency pairs. Understanding market trends is essential for successful trading. This guide will explore key factors such as price action, moving averages, support and resistance levels, and news-based trading. Additionally, we will discuss risk management strategies to help traders maximize their profits while minimizing losses.',
      photo_id: photoIds[1],
      video_url: 'https://vimeo.com/76979871',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'How to Improve Your Trading Strategy',
      description:
        'Advanced techniques and strategies for traders looking to refine their approach to Forex and stock trading, including risk assessment, market sentiment analysis, and algorithmic trading.',
      content:
        'Trading requires patience, discipline, and a solid strategy. In this article, we explore several key strategies to enhance your trading performance. Topics include setting realistic goals, understanding leverage, diversifying your portfolio, and utilizing backtesting to improve your decision-making. We also delve into technical indicators such as Bollinger Bands, RSI, and Fibonacci retracements, helping traders identify optimal entry and exit points.',
      photo_id: null,
      video_url: 'https://vimeo.com/12345678',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'The Future of Cryptocurrency',
      description:
        'An in-depth look at the evolution of cryptocurrency, including the impact of blockchain technology, regulatory challenges, and predictions for the future of digital assets.',
      content:
        'Cryptocurrency has transformed the way people think about money and investments. As blockchain technology continues to evolve, new opportunities and challenges arise. This article examines the rise of decentralized finance (DeFi), the adoption of stablecoins, and the increasing role of governments in regulating digital currencies. We also discuss Bitcoin’s potential as a store of value and the future of Ethereum’s smart contracts.',
      photo_id: photoIds[0],
      video_url: null,
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'Stock Market Investment Guide',
      description:
        'A beginner-friendly guide to investing in the stock market, including how to analyze stocks, build a diversified portfolio, and understand key financial metrics.',
      content:
        'Stock investing is one of the most effective ways to build wealth over time. This guide covers fundamental and technical analysis, portfolio allocation strategies, and tips for long-term investing success. We discuss key financial metrics such as P/E ratios, earnings reports, and dividend yields, helping new investors make informed decisions. Additionally, we explore the impact of economic cycles on stock performance and how to navigate bear and bull markets.',
      photo_id: null,
      video_url: 'https://vimeo.com/23456789',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'Introduction to Blockchain Technology',
      description:
        'Exploring the fundamental principles of blockchain technology, including its applications beyond cryptocurrencies in industries such as healthcare, supply chain, and digital identity.',
      content:
        'Blockchain technology has revolutionized industries beyond just cryptocurrencies. It offers decentralized, transparent, and secure ways to conduct transactions. In this article, we discuss real-world applications of blockchain, including its use in smart contracts, digital identity verification, and supply chain management. We also analyze the potential for blockchain to disrupt traditional banking and legal systems.',
      photo_id: null,
      video_url: 'https://vimeo.com/34567890',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'Real Estate Investment Tips',
      description:
        'Expert insights into the real estate market, including property valuation techniques, rental income strategies, and the benefits of real estate investment trusts (REITs).',
      content:
        'Real estate investments provide long-term financial stability and passive income opportunities. This guide explains key aspects of real estate investing, including property location analysis, financing options, and the importance of market timing. We also explore different investment strategies such as house flipping, buy-and-hold, and commercial real estate investments, helping investors make informed decisions.',
      photo_id: photoIds[2],
      video_url: null,
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'Artificial Intelligence in Finance',
      description:
        'A look at how AI is transforming financial markets, including the use of machine learning in predictive analytics, fraud detection, and algorithmic trading.',
      content:
        'AI-powered trading bots and data analytics are revolutionizing investment decisions. This article explores how financial institutions use machine learning models to predict market trends, detect fraudulent transactions, and optimize risk management. We also discuss the ethical concerns of AI in finance, such as bias in algorithms and data privacy issues.',
      photo_id: null,
      video_url: 'https://vimeo.com/45678901',
    },
    {
      title: 'Understanding Interest Rates',
      description:
        'A deep dive into the impact of interest rates on global economies, including how central banks use monetary policy to control inflation and economic growth.',
      content:
        'Interest rates play a crucial role in shaping economic conditions worldwide. This article explains how central banks, such as the Federal Reserve, use interest rates to manage inflation and employment levels. We also discuss the effects of interest rate changes on mortgage rates, business loans, and personal savings, helping individuals and businesses make informed financial decisions.',
      photo_id: photoIds[3],
      video_url: 'https://vimeo.com/45678901',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'Personal Finance Tips for Beginners',
      description:
        'A practical guide to managing personal finances, covering budgeting, debt reduction, saving strategies, and smart investing for long-term financial health.',
      content:
        'Personal finance is about budgeting, saving, and investing for the future. This guide provides practical advice on creating a budget, setting financial goals, and reducing debt. We also discuss the importance of emergency funds, retirement savings plans, and strategies for investing in stocks, bonds, and mutual funds to grow wealth over time.',
      photo_id: photoIds[4],
      video_url: 'https://vimeo.com/56789012',
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      title: 'The Role of Hedge Funds',
      description:
        'An inside look at how hedge funds operate, including common investment strategies, risk management techniques, and their impact on financial markets.',
      content:
        'Hedge funds use various investment strategies to maximize returns while managing risk. This article explores different hedge fund strategies, including long-short equity, global macro, and event-driven investing. We also discuss the role of hedge funds in market liquidity, their regulatory challenges, and how they differ from mutual funds and private equity firms.',
      photo_id: null,
      video_url: null,
      created_at: getRandomDate(new Date(2023, 0, 1), new Date()),
    },
  ];

  // Insert Mock Articles
  for (const article of articlesData) {
    await prisma.article.create({ data: article });
  }

  console.log('✅ Mock articles added successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
