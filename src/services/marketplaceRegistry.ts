import { emitAgentEvent } from './agentBus';

// Marketplace Registry Contract - Decentralized registry for services and assets
export interface MarketplaceService {
  id: string;
  name: string;
  description: string;
  category: 'ai_agent' | 'defi_protocol' | 'oracle' | 'storage' | 'compute' | 'other';
  provider: string;
  endpoint: string;
  pricing: {
    model: 'subscription' | 'pay_per_use' | 'free';
    amount?: number;
    currency?: string;
  };
  reputation: number;
  availability: number;
  lastHeartbeat: number;
  metadata: Record<string, any>;
  isVerified: boolean;
}

export interface ServiceRegistration {
  serviceId: string;
  registrant: string;
  timestamp: number;
  transactionHash: string;
  status: 'pending' | 'active' | 'suspended' | 'removed';
}

export interface ServiceDiscovery {
  query: string;
  category?: string;
  minReputation?: number;
  maxPrice?: number;
  results: MarketplaceService[];
  timestamp: number;
}

export class MarketplaceRegistryContract {
  private services: Map<string, MarketplaceService> = new Map();
  private registrations: ServiceRegistration[] = [];
  private serviceCategories = ['ai_agent', 'defi_protocol', 'oracle', 'storage', 'compute', 'other'];

  constructor() {
    this.initializeDefaultServices();
  }

  async registerService(
    name: string,
    description: string,
    category: MarketplaceService['category'],
    provider: string,
    endpoint: string,
    pricing: MarketplaceService['pricing'],
    metadata: Record<string, any> = {}
  ): Promise<MarketplaceService> {
    emitAgentEvent({
      type: 'marketplace_service_registering',
      message: `Registering new service: ${name}`,
      timestamp: Date.now(),
      data: { name, category, provider }
    });

    const service: MarketplaceService = {
      id: this.generateServiceId(),
      name,
      description,
      category,
      provider,
      endpoint,
      pricing,
      reputation: 0,
      availability: 100,
      lastHeartbeat: Date.now(),
      metadata,
      isVerified: false
    };

    const registration: ServiceRegistration = {
      serviceId: service.id,
      registrant: provider,
      timestamp: Date.now(),
      transactionHash: this.generateTransactionHash(),
      status: 'pending'
    };

    this.services.set(service.id, service);
    this.registrations.push(registration);

    // Simulate verification process
    setTimeout(() => {
      service.isVerified = true;
      registration.status = 'active';
      
      emitAgentEvent({
        type: 'marketplace_service_verified',
        message: `Service verified and activated: ${name}`,
        timestamp: Date.now(),
        data: service
      });
    }, 2000);

    emitAgentEvent({
      type: 'marketplace_service_registered',
      message: `Service registered successfully: ${name}`,
      timestamp: Date.now(),
      data: service
    });

    return service;
  }

  async discoverServices(
    query: string,
    filters: {
      category?: string;
      minReputation?: number;
      maxPrice?: number;
      onlyVerified?: boolean;
    } = {}
  ): Promise<ServiceDiscovery> {
    emitAgentEvent({
      type: 'marketplace_discovery_start',
      message: `Discovering services for query: ${query}`,
      timestamp: Date.now(),
      data: { query, filters }
    });

    const allServices = Array.from(this.services.values());
    
    let results = allServices.filter(service => {
      // Text search
      const matchesQuery = service.name.toLowerCase().includes(query.toLowerCase()) ||
                          service.description.toLowerCase().includes(query.toLowerCase());
      
      // Category filter
      const matchesCategory = !filters.category || service.category === filters.category;
      
      // Reputation filter
      const matchesReputation = !filters.minReputation || service.reputation >= filters.minReputation;
      
      // Price filter
      const matchesPrice = !filters.maxPrice || 
                          !service.pricing.amount || 
                          service.pricing.amount <= filters.maxPrice;
      
      // Verification filter
      const matchesVerification = !filters.onlyVerified || service.isVerified;

      return matchesQuery && matchesCategory && matchesReputation && matchesPrice && matchesVerification;
    });

    // Sort by reputation and availability
    results = results.sort((a, b) => {
      const scoreA = (a.reputation * 0.6) + (a.availability * 0.4);
      const scoreB = (b.reputation * 0.6) + (b.availability * 0.4);
      return scoreB - scoreA;
    });

    const discovery: ServiceDiscovery = {
      query,
      category: filters.category,
      minReputation: filters.minReputation,
      maxPrice: filters.maxPrice,
      results,
      timestamp: Date.now()
    };

    emitAgentEvent({
      type: 'marketplace_discovery_complete',
      message: `Found ${results.length} services matching query`,
      timestamp: Date.now(),
      data: discovery
    });

    return discovery;
  }

  async updateServiceHeartbeat(serviceId: string, availability: number): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    service.lastHeartbeat = Date.now();
    service.availability = availability;

    emitAgentEvent({
      type: 'marketplace_heartbeat',
      message: `Service heartbeat updated: ${service.name}`,
      timestamp: Date.now(),
      data: { serviceId, availability }
    });
  }

  async updateServiceReputation(serviceId: string, rating: number): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Simple reputation update (in real implementation, this would be more sophisticated)
    service.reputation = Math.max(0, Math.min(100, service.reputation + rating));

    emitAgentEvent({
      type: 'marketplace_reputation_updated',
      message: `Service reputation updated: ${service.name} (${service.reputation})`,
      timestamp: Date.now(),
      data: { serviceId, newReputation: service.reputation }
    });
  }

  getServiceById(serviceId: string): MarketplaceService | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): MarketplaceService[] {
    return Array.from(this.services.values());
  }

  getServicesByCategory(category: string): MarketplaceService[] {
    return Array.from(this.services.values()).filter(s => s.category === category);
  }

  getRegistrations(): ServiceRegistration[] {
    return this.registrations;
  }

  private initializeDefaultServices(): void {
    // Initialize some default services for demonstration
    const defaultServices = [
      {
        name: 'Aegis AI Financial Agent',
        description: 'AI-powered financial analysis and portfolio management',
        category: 'ai_agent' as const,
        provider: 'AegisDAO',
        endpoint: '/api/aegis',
        pricing: { model: 'subscription' as const, amount: 50, currency: 'USDC' },
        metadata: { specialization: 'treasury_management', ai_model: 'gemini-2.0-flash' }
      },
      {
        name: 'ChainLink Price Oracle',
        description: 'Decentralized price feeds for DeFi applications',
        category: 'oracle' as const,
        provider: 'ChainLink',
        endpoint: '/api/chainlink',
        pricing: { model: 'pay_per_use' as const, amount: 0.01, currency: 'LINK' },
        metadata: { asset_coverage: 'crypto,forex,commodities' }
      },
      {
        name: 'Midnight Privacy Protocol',
        description: 'Zero-knowledge transaction privacy service',
        category: 'defi_protocol' as const,
        provider: 'MidnightNetwork',
        endpoint: '/api/midnight',
        pricing: { model: 'free' as const },
        metadata: { privacy_level: 'zero_knowledge', supported_assets: ['DUST', 'ETH', 'USDC'] }
      }
    ];

    defaultServices.forEach((serviceData, index) => {
      const service: MarketplaceService = {
        id: `default_service_${index + 1}`,
        ...serviceData,
        reputation: 85 + Math.random() * 15, // 85-100
        availability: 95 + Math.random() * 5, // 95-100
        lastHeartbeat: Date.now(),
        isVerified: true
      };

      this.services.set(service.id, service);
    });
  }

  private generateServiceId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateTransactionHash(): string {
    return `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
  }
}

export const marketplaceRegistry = new MarketplaceRegistryContract();