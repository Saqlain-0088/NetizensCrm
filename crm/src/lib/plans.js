/**
 * Plan limits and feature flags for freemium SaaS
 */
export const PLANS = {
    free: {
        name: 'Free',
        leads: 50,
        contacts: 100,
        users: 1,
        features: ['leads', 'contacts', 'notes', 'basic_tasks'],
        storage: '100MB',
    },
    pro: {
        name: 'Pro',
        leads: -1, // unlimited
        contacts: -1,
        users: 10,
        features: ['leads', 'contacts', 'notes', 'basic_tasks', 'pipeline', 'automation', 'reports', 'integrations'],
        storage: '10GB',
    },
    enterprise: {
        name: 'Enterprise',
        leads: -1,
        contacts: -1,
        users: -1,
        features: ['leads', 'contacts', 'notes', 'basic_tasks', 'pipeline', 'automation', 'reports', 'integrations', 'analytics', 'api', 'team_permissions', 'custom_workflows'],
        storage: 'Unlimited',
    },
};

export function getPlanLimits(plan = 'free') {
    return PLANS[plan] || PLANS.free;
}

export function hasFeature(plan, feature) {
    const p = getPlanLimits(plan);
    return p.features?.includes(feature) ?? false;
}

export function canAddLead(plan, currentCount) {
    const limit = getPlanLimits(plan).leads;
    return limit < 0 || currentCount < limit;
}

export function canAddContact(plan, currentCount) {
    const limit = getPlanLimits(plan).contacts;
    return limit < 0 || currentCount < limit;
}
