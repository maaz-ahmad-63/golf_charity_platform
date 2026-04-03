import { NextRequest, NextResponse } from 'next/server';

// Mock charities data for local testing
const mockCharities = [
  {
    id: '1',
    name: 'World Wildlife Fund',
    description: 'Protecting endangered species and habitats worldwide',
    website: 'www.wwf.org',
    featured: true,
  },
  {
    id: '2',
    name: 'Doctors Without Borders',
    description: 'Providing medical aid in crisis zones globally',
    website: 'www.msf.org',
    featured: true,
  },
  {
    id: '3',
    name: 'Save the Children',
    description: 'Supporting children in developing countries',
    website: 'www.savethechildren.org',
    featured: true,
  },
  {
    id: '4',
    name: 'The Nature Conservancy',
    description: 'Conserving land and waters for future generations',
    website: 'www.nature.org',
    featured: false,
  },
  {
    id: '5',
    name: 'Oxfam International',
    description: 'Fighting poverty and inequality worldwide',
    website: 'www.oxfam.org',
    featured: false,
  },
  {
    id: '6',
    name: 'Cancer Research UK',
    description: 'Funding cancer research and patient support',
    website: 'www.cancerresearchuk.org',
    featured: false,
  },
  {
    id: '7',
    name: 'UNICEF',
    description: 'Providing humanitarian aid to children and mothers',
    website: 'www.unicef.org',
    featured: true,
  },
  {
    id: '8',
    name: 'Red Cross',
    description: 'Emergency response and disaster relief',
    website: 'www.redcross.org',
    featured: false,
  },
];

// GET /api/charities - Get all charities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    let charities = mockCharities;

    if (featured === 'true') {
      charities = charities.filter((c) => c.featured);
    }

    return NextResponse.json({
      success: true,
      charities: charities,
      data: charities,
    });
  } catch (error) {
    console.error('Error fetching charities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch charities' },
      { status: 500 }
    );
  }
}
