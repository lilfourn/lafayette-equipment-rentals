import { LAFAYETTE_LOCATION } from '@/lib/location-config';
import {
    searchByCatalogClass,
    searchMachines,
    searchSingleMachine,
    type MachineSearchCriteria
} from '@/lib/rubbl-machine-search';
import { NextResponse } from 'next/server';

/**
 * GET /api/machine/search
 * Search for machines using various criteria
 * 
 * Query Parameters:
 * - type: Primary equipment type
 * - make: Equipment manufacturer
 * - model: Equipment model
 * - keywords: Comma-separated keywords
 * - catClass: Catalog class number
 * - lat: Latitude for location search
 * - lon: Longitude for location search
 * - radius: Search radius in miles
 * - minCapacity: Minimum capacity
 * - maxCapacity: Maximum capacity
 * - limit: Maximum results (default 10)
 * - single: Return single best match (true/false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const type = searchParams.get('type') || undefined;
    const make = searchParams.get('make') || undefined;
    const model = searchParams.get('model') || undefined;
    const keywords = searchParams.get('keywords')?.split(',').filter(k => k.trim()) || undefined;
    const catClass = searchParams.get('catClass') || undefined;
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined;
    const minCapacity = searchParams.get('minCapacity') ? parseFloat(searchParams.get('minCapacity')!) : undefined;
    const maxCapacity = searchParams.get('maxCapacity') ? parseFloat(searchParams.get('maxCapacity')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const returnSingle = searchParams.get('single') === 'true';
    
    // Get API key from environment
    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }
    
    // If searching by catalog class, use specialized function
    if (catClass && !type && !make && !model && !keywords) {
      console.log('API Route - Searching by catalog class:', catClass);
      const machine = await searchByCatalogClass(catClass, {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 300 // 5 minutes
      });
      
      if (machine) {
        return NextResponse.json(machine);
      } else {
        return NextResponse.json(
          { error: `No machine found with catalog class ${catClass}` },
          { status: 404 }
        );
      }
    }
    
    // Build search criteria
    const criteria: MachineSearchCriteria = {
      primaryType: type,
      make,
      model,
      keywords,
      catClass,
      minCapacity,
      maxCapacity,
      maxResults: limit
    };
    
    // Add location if provided, otherwise use Lafayette as default
    if (lat !== undefined && lon !== undefined) {
      criteria.location = {
        lat,
        lon,
        radiusMiles: radius || 50
      };
    } else {
      // Default to Lafayette location
      criteria.location = {
        lat: LAFAYETTE_LOCATION.latitude,
        lon: LAFAYETTE_LOCATION.longitude,
        radiusMiles: radius || LAFAYETTE_LOCATION.serviceRadiusMiles
      };
    }
    
    console.log('API Route - Search criteria:', criteria);
    
    // Search for machines
    if (returnSingle) {
      const machine = await searchSingleMachine(criteria, {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 300 // 5 minutes
      });
      
      if (machine) {
        return NextResponse.json(machine);
      } else {
        return NextResponse.json(
          { error: 'No machine found matching criteria' },
          { status: 404 }
        );
      }
    } else {
      const result = await searchMachines(criteria, {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 300 // 5 minutes
      });
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        machines: result.machines,
        totalCount: result.totalCount
      });
    }
    
  } catch (error) {
    console.error('API Route - Search error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/machine/search
 * Search for machines using a JSON body for complex criteria
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get API key from environment
    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }
    
    // Validate required fields
    if (!body.criteria) {
      return NextResponse.json(
        { error: 'Search criteria is required in request body' },
        { status: 400 }
      );
    }
    
    const criteria: MachineSearchCriteria = body.criteria;
    const returnSingle = body.single === true;
    
    // Add default location if not provided
    if (!criteria.location) {
      criteria.location = {
        lat: LAFAYETTE_LOCATION.latitude,
        lon: LAFAYETTE_LOCATION.longitude,
        radiusMiles: LAFAYETTE_LOCATION.serviceRadiusMiles
      };
    }
    
    console.log('API Route - POST search criteria:', criteria);
    
    // Search for machines
    if (returnSingle) {
      const machine = await searchSingleMachine(criteria, {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 300 // 5 minutes
      });
      
      if (machine) {
        return NextResponse.json(machine);
      } else {
        return NextResponse.json(
          { error: 'No machine found matching criteria' },
          { status: 404 }
        );
      }
    } else {
      const result = await searchMachines(criteria, {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 300 // 5 minutes
      });
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        machines: result.machines,
        totalCount: result.totalCount
      });
    }
    
  } catch (error) {
    console.error('API Route - POST search error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}